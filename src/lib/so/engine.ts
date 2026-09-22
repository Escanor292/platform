import type { CartLine, Channel, CheckoutReceipt, EInvoice, Journal, PayMethod, Payment, Sale, SoState, ViewId } from "./types";
import { nowIso, uid, vatOfInclusive } from "./money";

export type Result = { state: SoState; message: string; receipt?: CheckoutReceipt };

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function sealOf(raw: string) {
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function stampInvoice(s: SoState, inv: EInvoice) {
  inv.seal = sealOf(`${s.settings.mst}|${inv.no}|${inv.total}|${inv.buyerMst}|${inv.at}`);
  inv.status = "coded";
  inv.cqtCode = undefined;
}

function audit(s: SoState, action: string, detail: string) {
  s.seq += 1;
  s.audits.unshift({
    id: uid("au", s.seq),
    at: nowIso(),
    actor: "Bạn",
    action,
    detail,
  });
}

function onHand(s: SoState, productId: string, warehouseId?: string) {
  const p = s.products.find((x) => x.id === productId);
  if (!p) return 0;
  if (p.track === "lot") {
    return s.lots
      .filter((l) => l.productId === productId && (!warehouseId || l.warehouseId === warehouseId))
      .reduce((a, l) => a + l.qty, 0);
  }
  return s.moves.reduce((a, m) => {
    if (m.productId !== productId) return a;
    if (!warehouseId) {
      if (m.type === "transfer") return a;
      if (m.type === "out") return a - m.qty;
      return a + m.qty;
    }
    if (m.type === "transfer") {
      if (m.warehouseId === warehouseId) return a - m.qty;
      if (m.toWarehouseId === warehouseId) return a + m.qty;
      return a;
    }
    if (m.warehouseId !== warehouseId) return a;
    if (m.type === "out") return a - m.qty;
    return a + m.qty;
  }, 0);
}

export function stockOf(s: SoState, productId: string, warehouseId?: string) {
  return onHand(s, productId, warehouseId);
}

function takeLots(s: SoState, productId: string, warehouseId: string, qty: number) {
  const lots = s.lots
    .filter((l) => l.productId === productId && l.warehouseId === warehouseId && l.qty > 0)
    .sort((a, b) => (a.expiry || "9999").localeCompare(b.expiry || "9999"));
  let left = qty;
  const used: string[] = [];
  for (const lot of lots) {
    if (left <= 0) break;
    const take = Math.min(lot.qty, left);
    lot.qty -= take;
    left -= take;
    used.push(`${lot.lot}×${take}`);
  }
  return { left, used: used.join(", ") };
}

function pushJournal(s: SoState, memo: string, source: string, lines: Journal["lines"]) {
  s.seq += 1;
  s.journals.unshift({ id: uid("j", s.seq), at: nowIso(), memo, source, lines });
}

function lineMoney(lines: { qty: number; price: number; discount: number; taxRate: number }[]) {
  let total = 0;
  let vat = 0;
  for (const l of lines) {
    const gross = l.qty * l.price - l.discount;
    total += gross;
    vat += vatOfInclusive(gross, l.taxRate);
  }
  return { total, vat, subtotal: total - vat };
}

export function addCart(s0: SoState, productId: string, qty = 1): Result {
  const s = clone(s0);
  const p = s.products.find((x) => x.id === productId);
  if (!p || !p.active) return { state: s0, message: "Không thấy hàng." };
  const hit = s.cart.find((l) => l.productId === productId && !l.serial);
  if (hit) hit.qty += qty;
  else {
    s.seq += 1;
    s.cart.push({ key: uid("cl", s.seq), productId, qty, price: p.price, discount: 0 });
  }
  return { state: s, message: `Đã thêm ${p.name}.` };
}

export function setCart(s0: SoState, key: string, patch: Partial<CartLine>): Result {
  const s = clone(s0);
  s.cart = s.cart
    .map((l) => (l.key === key ? { ...l, ...patch } : l))
    .filter((l) => l.qty > 0);
  return { state: s, message: "Đã cập nhật dòng." };
}

export function clearCart(s0: SoState): Result {
  const s = clone(s0);
  s.cart = [];
  s.cartCustomerId = undefined;
  return { state: s, message: "Đã xóa giỏ." };
}

export function holdCart(s0: SoState): Result {
  const s = clone(s0);
  if (!s.cart.length) return { state: s0, message: "Giỏ đang trống." };
  s.seq += 1;
  s.holds.unshift({
    id: uid("hd", s.seq),
    label: `Giữ ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
    lines: s.cart,
    customerId: s.cartCustomerId,
  });
  s.cart = [];
  return { state: s, message: "Đã giữ đơn." };
}

export function recall(s0: SoState, id: string): Result {
  const s = clone(s0);
  const h = s.holds.find((x) => x.id === id);
  if (!h) return { state: s0, message: "Không thấy đơn giữ." };
  s.cart = h.lines;
  s.cartCustomerId = h.customerId;
  s.holds = s.holds.filter((x) => x.id !== id);
  return { state: s, message: "Đã gọi lại đơn." };
}

export function pickCustomer(s0: SoState, id?: string): Result {
  const s = clone(s0);
  s.cartCustomerId = id;
  return { state: s, message: "Đã chọn khách." };
}

function warehouseFor(s: SoState) {
  if (s.settings.branch.includes("online")) return "w2";
  return "w1";
}

export function checkout(
  s0: SoState,
  method: PayMethod,
  channel: Channel = "quay",
  opts?: { autoInvoice?: boolean; tendered?: number; offline?: boolean; splitQr?: number; warehouseId?: string; status?: Sale["status"]; ship?: string },
): Result {
  const s = clone(s0);
  if (s.settings.periodLocked) return { state: s0, message: "Kỳ đã khóa sổ." };
  if (!s.cart.length) return { state: s0, message: "Chưa có hàng." };
  const wh = opts?.warehouseId || warehouseFor(s);
  const priced = s.cart.map((l) => {
    const p = s.products.find((x) => x.id === l.productId)!;
    return { productId: p.id, name: p.name, qty: l.qty, price: l.price, discount: l.discount, taxRate: p.taxRate, cost: p.cost };
  });
  const money = lineMoney(priced);
  if (method === "debt") {
    if (!s.cartCustomerId) return { state: s0, message: "Ghi nợ cần chọn khách có hạn mức." };
    const c = s.parties.find((p) => p.id === s.cartCustomerId);
    if (!c) return { state: s0, message: "Không thấy khách." };
    if (c.debt + money.total > c.limit) {
      return {
        state: s0,
        message: `Vượt hạn mức ${c.limit.toLocaleString("vi-VN")} ₫. Nợ hiện tại ${c.debt.toLocaleString("vi-VN")} ₫.`,
      };
    }
  }
  if (method === "point") {
    if (!s.cartCustomerId) return { state: s0, message: "Đổi điểm cần chọn khách." };
    const c = s.parties.find((p) => p.id === s.cartCustomerId);
    const need = Math.ceil(money.total / 1000);
    if (!c || c.points < need) return { state: s0, message: `Cần ${need} điểm. Khách đang có ${c?.points || 0}.` };
    c.points -= need;
    c.tier = c.points >= 800 ? "Vàng" : c.points >= 200 ? "Bạc" : "Đồng";
  }
  for (const line of s.cart) {
    const p = s.products.find((x) => x.id === line.productId)!;
    if (p.track === "serial" && !line.serial) return { state: s0, message: `${p.name} cần số serial.` };
    if (p.recipe?.length) {
      for (const part of p.recipe) {
        const ing = s.products.find((x) => x.id === part.productId);
        const left = stockOf(s, part.productId, wh);
        if (left < part.qty * line.qty) return { state: s0, message: `${ing?.name || "Nguyên liệu"} chỉ còn ${left}.` };
      }
    } else if (stockOf(s, p.id, wh) < line.qty) {
      return { state: s0, message: `${p.name} chỉ còn ${stockOf(s, p.id, wh)} tại kho.` };
    }
  }
  for (const line of s.cart) {
    const p = s.products.find((x) => x.id === line.productId)!;
    if (p.recipe?.length) {
      for (const part of p.recipe) {
        s.seq += 1;
        s.moves.unshift({
          id: uid("mv", s.seq),
          at: nowIso(),
          type: "out",
          productId: part.productId,
          warehouseId: wh,
          qty: part.qty * line.qty,
          ref: "BOM",
          note: `Pha ${p.name}`,
        });
      }
    } else {
      if (p.track === "lot") takeLots(s, p.id, wh, line.qty);
      s.seq += 1;
      s.moves.unshift({
        id: uid("mv", s.seq),
        at: nowIso(),
        type: "out",
        productId: p.id,
        warehouseId: wh,
        qty: line.qty,
        ref: "POS",
        note: line.serial ? `Serial ${line.serial}` : "Xuất bán",
      });
    }
  }
  s.seq += 1;
  const saleId = uid("sa", s.seq);
  const no = `BH-${1042 + s.sales.length + 1}`;
  const qrPart = method === "cash" ? Math.max(0, Math.min(opts?.splitQr || 0, money.total)) : 0;
  const payments: Payment[] =
    qrPart > 0
      ? [
          ...(money.total - qrPart > 0 ? [{ method: "cash" as const, amount: money.total - qrPart }] : []),
          { method: "qr", amount: qrPart },
        ]
      : [{ method, amount: money.total }];
  const sale: Sale = {
    id: saleId,
    no,
    at: nowIso(),
    channel,
    warehouseId: wh,
    customerId: s.cartCustomerId,
    lines: priced,
    payments,
    ...money,
    status: opts?.status ?? (method === "debt" || payments.some((p) => p.method === "qr" || p.method === "card") ? "debt" : "paid"),
    shiftId: s.shifts.find((sh) => sh.status === "open")?.id,
    ship: opts?.ship,
    note: payments.some((p) => p.method === "qr" || p.method === "card") ? `Chờ sao kê khớp ${no}` : undefined,
  };
  if (method === "debt" && s.cartCustomerId) {
    const c = s.parties.find((p) => p.id === s.cartCustomerId);
    if (c) c.debt += money.total;
  }
  if (s.cartCustomerId && method !== "point") {
    const c = s.parties.find((p) => p.id === s.cartCustomerId);
    if (c && c.id !== "c1") {
      c.points += Math.floor(money.total / 10000);
      c.tier = c.points >= 800 ? "Vàng" : c.points >= 200 ? "Bạc" : "Đồng";
    }
  }
  const open = s.shifts.find((sh) => sh.status === "open");
  if (open && (channel === "quay" || channel === "fnb")) {
    open.sales += payments.filter((p) => p.method === "cash").reduce((a, p) => a + p.amount, 0);
  }
  s.sales.unshift(sale);
  const cost = priced.reduce((a, l) => a + l.cost * l.qty, 0);
  const payName = (m: PayMethod) => (m === "cash" ? "Tiền mặt" : m === "point" ? "Đổi điểm" : m === "qr" ? "Phải thu QR" : m === "card" ? "Phải thu thẻ" : "Phải thu");
  const payAcc = (m: PayMethod) => (m === "cash" ? "111" : m === "point" ? "641" : "131");
  pushJournal(s, `Bán ${no}`, no, [
    ...payments.map((p) => ({ account: payAcc(p.method), name: payName(p.method), debit: p.amount, credit: 0 })),
    { account: "511", name: "Doanh thu", debit: 0, credit: money.subtotal },
    { account: "3331", name: "Thuế GTGT", debit: 0, credit: money.vat },
    { account: "632", name: "Giá vốn", debit: cost, credit: 0 },
    { account: "156", name: "Hàng tồn kho", debit: 0, credit: cost },
  ]);
  let invoiceNo: string | undefined;
  let seal: string | undefined;
  let queued = false;
  if (opts?.autoInvoice) {
    const buyer = s.parties.find((p) => p.id === s.cartCustomerId);
    const bad = buyer?.mst === "000" || buyer?.mst === "9999999999";
    queued = Boolean(opts.offline) && !bad;
    const branch = s.branches?.find((b) => b.name === s.settings.branch);
    invoiceNo = branch ? `${branch.symbol}${String(branch.next).padStart(5, "0")}` : `HD-${String(90 + s.invoices.filter((i) => i.direction === "out").length).padStart(5, "0")}`;
    if (branch) branch.next += 1;
    s.seq += 1;
    const inv: EInvoice = {
      id: uid("iv", s.seq),
      no: invoiceNo,
      kind: channel === "quay" || channel === "fnb" ? "MTT" : "GTGT",
      status: bad ? "error" : queued ? "waiting" : "draft",
      direction: "out",
      at: nowIso(),
      buyerName: buyer?.name || "Khách lẻ",
      buyerMst: buyer?.mst || "",
      subtotal: money.subtotal,
      vat: money.vat,
      total: money.total,
      saleId,
      note: bad ? "MST không hợp lệ — không đóng dấu" : queued ? "Xếp hàng — đóng dấu khi có mạng" : undefined,
    };
    if (!bad && !queued) {
      stampInvoice(s, inv);
      seal = inv.seal;
    }
    s.invoices.unshift(inv);
    sale.invoiceId = inv.id;
    audit(s, "Hóa đơn tại quầy", `${invoiceNo} · ${seal ? `dấu ${seal}` : queued ? "chờ mạng" : "từ chối MST"}`);
  }
  const cashDue = payments.find((p) => p.method === "cash")?.amount ?? (method === "cash" ? money.total : 0);
  const tendered = method === "cash" && opts?.tendered && opts.tendered >= cashDue ? opts.tendered : cashDue || money.total;
  const waitingPay = sale.status === "debt" && payments.some((p) => p.method === "qr" || p.method === "card");
  s.cart = [];
  s.cartCustomerId = undefined;
  audit(s, "Bán hàng", `${no} · ${money.total.toLocaleString("vi-VN")} ₫ · ${payments.map((p) => p.method).join("+")}`);
  return {
    state: s,
    message: waitingPay
      ? `Đã giữ ${no}. Tiền chưa về — nội dung chuyển khoản phải là ${no}.`
      : queued
        ? `Đã thu ${no}. ${invoiceNo} nằm hàng đợi.`
        : invoiceNo
          ? `Đã thu ${no}. ${invoiceNo} ${seal ? "đã đóng dấu nội bộ." : "bị từ chối."}`
          : `Đã thu ${no}.`,
    receipt: {
      no,
      total: money.total,
      tendered,
      change: Math.max(0, tendered - (cashDue || money.total)),
      method,
      invoiceNo,
      cqt: seal,
      queued,
      waitingPay,
      lines: priced.map((l) => ({ name: l.name, qty: l.qty, amount: l.qty * l.price - l.discount })),
    },
  };
}

export function refundSale(s0: SoState, saleId: string): Result {
  const s = clone(s0);
  if (s.settings.periodLocked) return { state: s0, message: "Kỳ đã khóa sổ." };
  const sale = s.sales.find((x) => x.id === saleId);
  if (!sale || sale.status === "held") return { state: s0, message: "Không hoàn được đơn này." };
  for (const l of sale.lines) {
    s.seq += 1;
    s.moves.unshift({
      id: uid("mv", s.seq),
      at: nowIso(),
      type: "in",
      productId: l.productId,
      warehouseId: sale.warehouseId,
      qty: l.qty,
      ref: sale.no,
      note: "Khách trả hàng",
    });
  }
  sale.status = "held";
  sale.note = "Đã hoàn hàng";
  if (sale.invoiceId) {
    const inv = s.invoices.find((i) => i.id === sale.invoiceId);
    if (inv && inv.status === "coded") inv.note = "Cần lập hóa đơn điều chỉnh sau hoàn hàng";
  }
  pushJournal(s, `Trả hàng ${sale.no}`, sale.no, [
    { account: "511", name: "Doanh thu", debit: sale.subtotal, credit: 0 },
    { account: "3331", name: "Thuế GTGT", debit: sale.vat, credit: 0 },
    { account: "111", name: "Tiền mặt", debit: 0, credit: sale.total },
  ]);
  audit(s, "Trả hàng", sale.no);
  return { state: s, message: `Đã nhập lại kho cho ${sale.no}. Hóa đơn gốc không tự sửa — lập điều chỉnh nếu đã có mã.` };
}

export function issueInvoice(s0: SoState, saleId: string, kind: EInvoice["kind"]): Result {
  const s = clone(s0);
  const sale = s.sales.find((x) => x.id === saleId);
  if (!sale) return { state: s0, message: "Không thấy đơn." };
  if (sale.invoiceId && kind === "GTGT") return { state: s0, message: "Đơn đã có hóa đơn. Dùng điều chỉnh hoặc thay thế." };
  if (sale.invoiceId && kind === "MTT") return { state: s0, message: "Đơn đã có hóa đơn." };
  const buyer = s.parties.find((p) => p.id === sale.customerId);
  s.seq += 1;
  const inv: EInvoice = {
    id: uid("iv", s.seq),
    no: `HD-${String(90 + s.invoices.filter((i) => i.direction === "out").length).padStart(5, "0")}`,
    kind: kind === "DIEU_CHINH" || kind === "THAY_THE" ? "MTT" : kind,
    status: "waiting",
    direction: "out",
    at: nowIso(),
    buyerName: buyer?.name || "Khách lẻ",
    buyerMst: buyer?.mst || "",
    subtotal: sale.subtotal,
    vat: sale.vat,
    total: sale.total,
    saleId: sale.id,
  };
  s.invoices.unshift(inv);
  sale.invoiceId = inv.id;
  audit(s, "Lập hóa đơn", `${inv.no} chờ đóng dấu`);
  return { state: s, message: `${inv.no} đã lập. Bấm đóng dấu để khóa nội dung.` };
}

export function grantCode(s0: SoState, invoiceId: string): Result {
  const s = clone(s0);
  const inv = s.invoices.find((i) => i.id === invoiceId);
  if (!inv) return { state: s0, message: "Không thấy hóa đơn." };
  if (inv.buyerMst === "000" || inv.buyerMst === "9999999999") {
    inv.status = "error";
    return { state: s, message: "Không đóng dấu: MST không hợp lệ." };
  }
  stampInvoice(s, inv);
  audit(s, "Đóng dấu nội bộ", `${inv.no} · ${inv.seal}`);
  return { state: s, message: `${inv.no} đã đóng dấu ${inv.seal}. Đây không phải mã cơ quan thuế.` };
}

export function batchGrant(s0: SoState): Result {
  let s = clone(s0);
  let n = 0;
  for (const inv of s.invoices) {
    if (inv.direction === "out" && (inv.status === "waiting" || inv.status === "draft")) {
      const r = grantCode(s, inv.id);
      s = r.state;
      n += 1;
    }
  }
  return { state: s, message: n ? `Đã xử lý ${n} hóa đơn chờ.` : "Không còn hóa đơn chờ." };
}

export function adjustInvoice(s0: SoState, invoiceId: string, mode: "DIEU_CHINH" | "THAY_THE" | "HUY"): Result {
  const s = clone(s0);
  const inv = s.invoices.find((i) => i.id === invoiceId);
  if (!inv || inv.direction !== "out") return { state: s0, message: "Chỉ xử lý hóa đơn đầu ra." };
  if (inv.status !== "coded") return { state: s0, message: "Chỉ điều chỉnh hóa đơn đã đóng dấu." };
  if (mode === "HUY") {
    inv.status = "cancelled";
    inv.note = "Hủy trên sổ. File XML hủy nằm trong gói lưu trữ — chưa gửi cơ quan thuế.";
    audit(s, "Hủy hóa đơn", inv.no);
    return { state: s, message: `${inv.no} đã hủy trên sổ. Tồn kho không tự đổi.` };
  }
  s.seq += 1;
  const neu: EInvoice = {
    ...inv,
    id: uid("iv", s.seq),
    no: `DC-${String(s.seq).padStart(5, "0")}`,
    kind: mode,
    status: "draft",
    at: nowIso(),
    originalId: inv.id,
    cqtCode: undefined,
    seal: undefined,
    note: mode === "DIEU_CHINH" ? "Điều chỉnh, không tự sửa tồn" : "Thay thế hóa đơn gốc",
  };
  stampInvoice(s, neu);
  inv.status = "replaced";
  s.invoices.unshift(neu);
  audit(s, mode === "DIEU_CHINH" ? "Điều chỉnh HĐ" : "Thay thế HĐ", `${inv.no} → ${neu.no}`);
  return { state: s, message: `Đã lập ${neu.no}, dấu ${neu.seal}.` };
}

export function sendInvoice(s0: SoState, invoiceId: string): Result {
  const s = clone(s0);
  const inv = s.invoices.find((i) => i.id === invoiceId);
  if (!inv || inv.status !== "coded") return { state: s0, message: "Chỉ gửi hóa đơn đã đóng dấu." };
  const buyer = s.parties.find((p) => p.name === inv.buyerName && p.email);
  if (!buyer?.email) return { state: s0, message: `${inv.buyerName} chưa có email — thêm email ở danh mục rồi gửi.` };
  inv.note = `Đã mở thư tới ${buyer.email}`;
  audit(s, "Gửi email hóa đơn", `${inv.no} → ${buyer.email}`);
  return { state: s, message: `Mở thư gửi ${buyer.email}.` };
}

export function receivePo(s0: SoState, poId: string): Result {
  const s = clone(s0);
  if (s.settings.periodLocked) return { state: s0, message: "Kỳ đã khóa sổ." };
  const po = s.pos.find((p) => p.id === poId);
  if (!po) return { state: s0, message: "Không thấy đơn mua." };
  let got = 0;
  for (const line of po.lines) {
    const left = line.qty - line.received;
    if (left <= 0) continue;
    line.received += left;
    got += left;
    const p = s.products.find((x) => x.id === line.productId);
    s.seq += 1;
    s.moves.unshift({
      id: uid("mv", s.seq),
      at: nowIso(),
      type: "in",
      productId: line.productId,
      warehouseId: "w1",
      qty: left,
      ref: po.no,
      note: "Nhận hàng mua",
    });
    if (p?.track === "lot") {
      s.seq += 1;
      s.lots.push({
        id: uid("lt", s.seq),
        productId: p.id,
        warehouseId: "w1",
        lot: `Nhap-${s.seq}`,
        expiry: new Date(Date.now() + 1000 * 86400 * 90).toISOString(),
        qty: left,
      });
    }
  }
  po.status = po.lines.every((l) => l.received >= l.qty) ? "received" : "partial";
  const ap = s.invoices.find((i) => i.poId === po.id);
  if (ap) ap.match = "matched";
  audit(s, "Nhận hàng", `${po.no} · ${got} đơn vị`);
  return { state: s, message: got ? `Đã nhập kho ${po.no}.` : "Đơn đã nhận đủ." };
}

export function transfer(s0: SoState, productId: string, from: string, to: string, qty: number): Result {
  const s = clone(s0);
  if (qty <= 0) return { state: s0, message: "Số lượng không hợp lệ." };
  if (stockOf(s, productId, from) < qty) return { state: s0, message: "Không đủ tồn kho nguồn." };
  const p = s.products.find((x) => x.id === productId);
  if (p?.track === "lot") {
    const r = takeLots(s, productId, from, qty);
    if (r.left > 0) return { state: s0, message: "Lô không đủ để chuyển." };
    s.seq += 1;
    s.lots.push({ id: uid("lt", s.seq), productId, warehouseId: to, lot: "CK", qty, expiry: undefined });
  }
  s.seq += 1;
  s.moves.unshift({
    id: uid("mv", s.seq),
    at: nowIso(),
    type: "transfer",
    productId,
    warehouseId: from,
    toWarehouseId: to,
    qty,
    ref: `CK-${s.seq}`,
    note: "Phiếu xuất kho kiêm vận chuyển nội bộ",
  });
  audit(s, "Chuyển kho", `${p?.name} · ${qty}`);
  return { state: s, message: "Đã lập phiếu chuyển kho." };
}

export function stocktake(s0: SoState, productId: string, warehouseId: string, counted: number): Result {
  const s = clone(s0);
  const book = stockOf(s, productId, warehouseId);
  const diff = counted - book;
  const p = s.products.find((x) => x.id === productId);
  if (p?.track === "lot") {
    const lot = s.lots.find((l) => l.productId === productId && l.warehouseId === warehouseId);
    if (lot) lot.qty = Math.max(0, lot.qty + diff);
  }
  s.seq += 1;
  s.moves.unshift({
    id: uid("mv", s.seq),
    at: nowIso(),
    type: "count",
    productId,
    warehouseId,
    qty: diff,
    ref: `KK-${s.seq}`,
    note: `Sổ ${book} · đếm ${counted}`,
  });
  audit(s, "Kiểm kê", `Lệch ${diff}`);
  return { state: s, message: diff === 0 ? "Khớp sổ." : `Đã ghi lệch ${diff}.` };
}

export function matchBank(s0: SoState, bankId: string, saleId: string): Result {
  const s = clone(s0);
  const b = s.bank.find((x) => x.id === bankId);
  const sale = s.sales.find((x) => x.id === saleId);
  if (!b || !sale) return { state: s0, message: "Không khớp được." };
  b.matchedSaleId = sale.id;
  if (sale.status === "cod" || sale.status === "debt") sale.status = "paid";
  sale.note = `Đã khớp sao kê ${b.desc}`;
  pushJournal(s, `Thu ${sale.no}`, sale.no, [
    { account: "112", name: "Tiền gửi", debit: b.amount, credit: 0 },
    { account: "131", name: "Phải thu", debit: 0, credit: b.amount },
  ]);
  audit(s, "Đối soát ngân hàng", `${b.desc} ↔ ${sale.no}`);
  return { state: s, message: `Đã thu ${sale.no} vào tiền gửi.` };
}

export function seat(s0: SoState, tableId: string, covers: number): Result {
  const s = clone(s0);
  const t = s.tables.find((x) => x.id === tableId);
  if (!t) return { state: s0, message: "Không thấy bàn." };
  t.status = "seated";
  t.covers = covers;
  if (t.name.includes("karaoke") || t.name.includes("Phòng")) {
    t.lines = [{ key: "gio", productId: "p8", qty: covers, price: 80000, discount: 0 }];
  }
  return { state: s, message: `${t.name} đã nhận khách.` };
}

export function addTableItem(s0: SoState, tableId: string, productId: string): Result {
  const s = clone(s0);
  const t = s.tables.find((x) => x.id === tableId);
  const p = s.products.find((x) => x.id === productId);
  if (!t || !p) return { state: s0, message: "Thiếu bàn hoặc món." };
  if (t.status === "empty") t.status = "seated";
  const hit = t.lines.find((l) => l.productId === productId);
  if (hit) hit.qty += 1;
  else {
    s.seq += 1;
    t.lines.push({ key: uid("tl", s.seq), productId, qty: 1, price: p.price, discount: 0 });
  }
  return { state: s, message: `Đã gọi ${p.name}.` };
}

export function sendKitchen(s0: SoState, tableId: string): Result {
  const s = clone(s0);
  const t = s.tables.find((x) => x.id === tableId);
  if (!t || !t.lines.length) return { state: s0, message: "Bàn chưa có món." };
  t.lines.forEach((l) => { l.sent = true; });
  t.status = "kitchen";
  audit(s, "Gửi bếp", t.name);
  return { state: s, message: `${t.name} đã sang bếp.` };
}

export function bumpKitchen(s0: SoState, tableId: string): Result {
  const s = clone(s0);
  const t = s.tables.find((x) => x.id === tableId);
  if (!t) return { state: s0, message: "Không thấy bàn." };
  t.status = "bill";
  return { state: s, message: `${t.name} sẵn sàng tính tiền.` };
}

export function payTable(s0: SoState, tableId: string): Result {
  const s = clone(s0);
  const t = s.tables.find((x) => x.id === tableId);
  if (!t || !t.lines.length) return { state: s0, message: "Bàn trống." };
  s.cart = t.lines.map((l) => ({ ...l }));
  const r = checkout(s, "cash", "fnb", { autoInvoice: true });
  if (!r.receipt) return { state: s0, message: r.message };
  const next = r.state;
  const table = next.tables.find((x) => x.id === tableId);
  if (table) {
    table.lines = [];
    table.status = "empty";
    table.covers = 0;
  }
  const sale = next.sales[0];
  if (sale) sale.tableId = tableId;
  return { state: next, message: r.message, receipt: r.receipt };
}

export function importLivestream(s0: SoState): Result {
  const s = clone(s0);
  if (stockOf(s, "p5", "w2") < 1) return { state: s0, message: "Kho online hết ly sứ." };
  s.seq += 1;
  s.moves.unshift({
    id: uid("mv", s.seq),
    at: nowIso(),
    type: "out",
    productId: "p5",
    warehouseId: "w2",
    qty: 1,
    ref: "LIVE",
    note: "Đơn comment livestream",
  });
  const p = s.products.find((x) => x.id === "p5")!;
  const money = lineMoney([{ qty: 1, price: p.price, discount: 0, taxRate: p.taxRate }]);
  s.seq += 1;
  s.sales.unshift({
    id: uid("sa", s.seq),
    no: `BH-LV-${s.seq}`,
    at: nowIso(),
    channel: "tiktok",
    warehouseId: "w2",
    customerId: "c1",
    lines: [{ productId: p.id, name: p.name, qty: 1, price: p.price, discount: 0, taxRate: p.taxRate, cost: p.cost }],
    payments: [{ method: "qr", amount: money.total }],
    ...money,
    status: "paid",
    ship: "Chưa đẩy vận đơn",
    note: "Từ livestream",
  });
  audit(s, "Đơn livestream", "TikTok comment → đơn");
  return { state: s, message: "Đã ghi một đơn livestream vào sổ." };
}

export function codDelivered(s0: SoState, saleId: string): Result {
  const s = clone(s0);
  const sale = s.sales.find((x) => x.id === saleId);
  if (!sale) return { state: s0, message: "Không thấy đơn." };
  sale.ship = sale.ship?.includes("Đã giao") ? sale.ship : `Đã giao · ${sale.ship || "chờ hãng chuyển tiền"}`;
  audit(s, "Giao hàng", sale.no);
  return { state: s, message: `${sale.no} đã giao. Khi tiền về, ghi sao kê với nội dung ${sale.no}.` };
}

export function closeShift(s0: SoState, counted: number): Result {
  const s = clone(s0);
  const sh = s.shifts.find((x) => x.status === "open");
  if (!sh) return { state: s0, message: "Không có ca mở." };
  sh.status = "closed";
  sh.closedAt = nowIso();
  sh.closeCash = counted;
  s.seq += 1;
  s.shifts.unshift({
    id: uid("sh", s.seq),
    user: sh.user,
    openedAt: nowIso(),
    openCash: counted,
    sales: 0,
    status: "open",
  });
  const gap = counted - (sh.openCash + sh.sales);
  audit(s, "Giao ca", `Đếm ${counted.toLocaleString("vi-VN")} · lệch ${gap.toLocaleString("vi-VN")}`);
  return { state: s, message: gap === 0 ? "Ca khớp quỹ." : `Lệch quỹ ${gap.toLocaleString("vi-VN")} ₫.` };
}

export function addProduct(s0: SoState, name: string, price: number): Result {
  const s = clone(s0);
  if (!name.trim() || price <= 0) return { state: s0, message: "Thiếu tên hoặc giá." };
  s.seq += 1;
  s.products.push({
    id: uid("p", s.seq),
    sku: `TT-${s.seq}`,
    name: name.trim(),
    category: "Khác",
    barcode: `893${s.seq}000`,
    uom: "cái",
    price,
    cost: Math.round(price * 0.5),
    taxRate: s.settings.vatReduced ? 0.08 : 0.1,
    track: "none",
    minQty: 2,
    active: true,
  });
  audit(s, "Thêm hàng", name);
  return { state: s, message: "Đã thêm hàng." };
}

export function addParty(s0: SoState, kind: "customer" | "supplier", name: string, mst: string): Result {
  const s = clone(s0);
  if (!name.trim()) return { state: s0, message: "Thiếu tên." };
  s.seq += 1;
  s.parties.push({
    id: uid(kind === "customer" ? "c" : "s", s.seq),
    kind,
    name: name.trim(),
    mst,
    phone: "",
    email: "",
    points: 0,
    tier: "Đồng",
    debt: 0,
    limit: kind === "customer" ? 2000000 : 0,
  });
  return { state: s, message: "Đã lưu danh bạ." };
}

export function flushInvoices(s0: SoState): Result {
  const s = clone(s0);
  let n = 0;
  for (const inv of s.invoices) {
    if (inv.direction !== "out" || inv.status !== "waiting") continue;
    if (!inv.note?.includes("Xếp hàng")) continue;
    if (inv.buyerMst === "000" || inv.buyerMst === "9999999999") continue;
    stampInvoice(s, inv);
    inv.note = "Đã đóng dấu khi có mạng";
    n += 1;
    audit(s, "Đóng dấu hàng đợi", `${inv.no} · ${inv.seal}`);
  }
  return { state: s, message: n ? `Đã đóng dấu ${n} hóa đơn chờ.` : "Không có hóa đơn trong hàng đợi." };
}

export function invoiceXml(s: SoState, invoiceId: string): string | null {
  const inv = s.invoices.find((i) => i.id === invoiceId);
  if (!inv) return null;
  const esc = (v: string) => v.replace(/&/g, "&").replace(/</g, "<");
  return `<?xml version="1.0" encoding="UTF-8"?>
<HDon>
  <DLHDon>
    <TTChung>
      <THDon>${esc(inv.kind)}</THDon>
      <SHDon>${esc(inv.no)}</SHDon>
      <NLap>${esc(inv.at.slice(0, 10))}</NLap>
      <MSTTCGP>${esc(s.settings.mst)}</MSTTCGP>
      <MCCQT>${esc(inv.cqtCode || "")}</MCCQT>
      <DauNoiBo>${esc(inv.seal || "")}</DauNoiBo>
    </TTChung>
    <NDHDon>
      <NBan><Ten>${esc(s.settings.tradeName)}</Ten><MST>${esc(s.settings.mst)}</MST></NBan>
      <NMua><Ten>${esc(inv.buyerName)}</Ten><MST>${esc(inv.buyerMst)}</MST></NMua>
      <TToan>
        <TgTCThue>${inv.subtotal}</TgTCThue>
        <TgTThue>${inv.vat}</TgTThue>
        <TgTTTBSo>${inv.total}</TgTTTBSo>
      </TToan>
    </NDHDon>
  </DLHDon>
</HDon>`;
}

export function importProducts(s0: SoState, csv: string): Result {
  const s = clone(s0);
  const rows = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let n = 0;
  for (const row of rows) {
    if (/^tên|^name/i.test(row)) continue;
    const [name, priceRaw, barcode] = row.split(/[,;\t]/).map((x) => x.trim());
    const price = Number(priceRaw);
    if (!name || !price) continue;
    s.seq += 1;
    s.products.push({
      id: uid("p", s.seq),
      sku: `NK-${s.seq}`,
      name,
      category: "Nhập",
      barcode: barcode || String(8930000000000 + s.seq),
      uom: "cái",
      price,
      cost: Math.round(price * 0.6),
      taxRate: 0.08,
      track: "none",
      minQty: 2,
      active: true,
    });
    n += 1;
  }
  if (!n) return { state: s0, message: "Không đọc được dòng. Dùng: Tên, Giá, Mã vạch." };
  audit(s, "Nhập danh mục", `${n} mặt hàng từ bảng`);
  return { state: s, message: `Đã nhập ${n} mặt hàng.` };
}

export function toggleLock(s0: SoState): Result {
  const s = clone(s0);
  s.settings.periodLocked = !s.settings.periodLocked;
  audit(s, s.settings.periodLocked ? "Khóa sổ" : "Mở sổ", s.settings.branch);
  return { state: s, message: s.settings.periodLocked ? "Đã khóa kỳ. Không bán/nhập mới." : "Đã mở khóa kỳ." };
}

export function setBranch(s0: SoState, branch: string): Result {
  const s = clone(s0);
  const found = s.branches?.find((b) => b.name === branch);
  if (!found) return { state: s0, message: "Không có chi nhánh này." };
  s.settings.branch = found.name;
  s.settings.mst = found.mst;
  s.settings.address = found.address;
  audit(s, "Đổi chi nhánh", `${found.name} · MST ${found.mst}`);
  return { state: s, message: `Đang bán tại ${found.name}. Ký hiệu hóa đơn ${found.symbol}.` };
}

export function setRegime(s0: SoState, regime: "HKD" | "DN"): Result {
  const s = clone(s0);
  s.settings.regime = regime;
  return { state: s, message: regime === "HKD" ? "Đang theo hộ kinh doanh." : "Đang theo doanh nghiệp." };
}

export function toggleVat(s0: SoState): Result {
  const s = clone(s0);
  s.settings.vatReduced = !s.settings.vatReduced;
  return { state: s, message: s.settings.vatReduced ? "Đang áp giảm GTGT 8%." : "Đã tắt cờ giảm thuế." };
}

export function reviewAp(s0: SoState, invoiceId: string): Result {
  const s = clone(s0);
  const inv = s.invoices.find((i) => i.id === invoiceId);
  if (!inv) return { state: s0, message: "Không thấy hóa đơn." };
  if (inv.buyerMst === "9999999999") {
    inv.match = "missing";
    return { state: s, message: "MST người bán rủi ro — không đưa vào khấu trừ." };
  }
  const po = s.pos.find((p) => p.id === inv.poId);
  if (!po) {
    inv.match = "missing";
    return { state: s, message: "Không có đơn mua để khớp 3 bước." };
  }
  const received = po.lines.reduce((a, l) => a + l.received, 0);
  const ordered = po.lines.reduce((a, l) => a + l.qty, 0);
  inv.match = received >= ordered ? "matched" : received === 0 ? "missing" : "qty";
  return { state: s, message: inv.match === "matched" ? "Khớp đơn mua, nhập kho và hóa đơn." : "Lệch số lượng nhận so với hóa đơn." };
}

export function payTableLines(s0: SoState, tableId: string, keys: string[]): Result {
  const s = clone(s0);
  const t = s.tables.find((x) => x.id === tableId);
  if (!t) return { state: s0, message: "Không thấy bàn." };
  const chosen = t.lines.filter((l) => keys.includes(l.key));
  if (!chosen.length) return { state: s0, message: "Chọn món cần tách." };
  s.cart = chosen.map((l) => ({ ...l }));
  const r = checkout(s, "cash", "fnb", { autoInvoice: true });
  if (!r.receipt) return { state: s0, message: r.message };
  const table = r.state.tables.find((x) => x.id === tableId);
  if (table) {
    table.lines = table.lines.filter((l) => !keys.includes(l.key));
    if (!table.lines.length) {
      table.status = "empty";
      table.covers = 0;
    }
  }
  const sale = r.state.sales[0];
  if (sale) sale.tableId = tableId;
  return { state: r.state, message: r.message, receipt: r.receipt };
}

export function bookChannel(
  s0: SoState,
  input: { channel: Channel; productId: string; qty: number; ship: string; cod: boolean; buyer: string },
): Result {
  const base = clone(s0);
  const p = base.products.find((x) => x.id === input.productId);
  if (!p || p.sell === false) return { state: s0, message: "Không bán mặt hàng này." };
  if (!input.qty || input.qty < 1) return { state: s0, message: "Thiếu số lượng." };
  if (!input.ship.trim()) return { state: s0, message: "Thiếu mã vận đơn." };
  base.cart = [{ key: "ch", productId: p.id, qty: input.qty, price: p.price, discount: 0 }];
  const r = checkout(base, input.cod ? "debt" : "qr", input.channel, {
    autoInvoice: false,
    warehouseId: "w2",
    status: input.cod ? "cod" : undefined,
    ship: input.ship.trim(),
  });
  if (!r.receipt) return r;
  const sale = r.state.sales[0];
  if (sale) {
    sale.ship = input.ship.trim();
    if (input.buyer.trim()) sale.note = `${input.buyer.trim()} · ${sale.note || ""}`.trim();
  }
  return r;
}

export function addBankLine(s0: SoState, amount: number, desc: string): Result {
  const s = clone(s0);
  if (!desc.trim() || !Number.isFinite(amount) || amount === 0) return { state: s0, message: "Thiếu số tiền hoặc nội dung." };
  s.seq += 1;
  const id = uid("bk", s.seq);
  s.bank.unshift({ id, at: nowIso(), desc: desc.trim(), amount });
  const hit = s.sales.find((sale) => {
    if (sale.status === "paid" || sale.status === "held") return false;
    const blob = `${desc} ${sale.ship || ""}`.toLowerCase();
    return blob.includes(sale.no.toLowerCase()) || Boolean(sale.ship && desc.toLowerCase().includes(sale.ship.toLowerCase()));
  });
  if (hit && amount > 0) {
    const due = hit.payments.filter((p) => p.method !== "cash").reduce((a, p) => a + p.amount, 0) || hit.total;
    if (amount !== due && amount !== hit.total) {
      audit(s, "Sao kê", `${desc.trim()} lệch tiền ${hit.no}`);
      return { state: s, message: `Đã ghi sao kê. ${hit.no} lệch tiền nên chưa khớp.` };
    }
    return matchBank(s, id, hit.id);
  }
  if (amount < 0) {
    pushJournal(s, desc.trim(), "NH", [
      { account: "641", name: "Chi phí bán hàng", debit: -amount, credit: 0 },
      { account: "112", name: "Tiền gửi", debit: 0, credit: -amount },
    ]);
  }
  audit(s, "Sao kê", desc.trim());
  return { state: s, message: amount < 0 ? "Đã ghi chi ra ngân hàng." : "Đã ghi tiền vào. Nội dung chưa chứa số đơn." };
}

export function setBank(s0: SoState, bankName: string, bankAccount: string, bankOwner: string): Result {
  const s = clone(s0);
  if (!bankName.trim() || !bankAccount.trim()) return { state: s0, message: "Thiếu ngân hàng hoặc số tài khoản." };
  s.settings.bankName = bankName.trim();
  s.settings.bankAccount = bankAccount.replace(/\s/g, "");
  s.settings.bankOwner = bankOwner.trim() || s.settings.bankOwner;
  audit(s, "Tài khoản thu", `${s.settings.bankName} ${s.settings.bankAccount}`);
  return { state: s, message: "Đã lưu tài khoản. VietQR trên bill dùng số này." };
}

export function setStaffPerms(s0: SoState, staffId: string, perms: ViewId[]): Result {
  const s = clone(s0);
  const e = s.staff.find((x) => x.id === staffId);
  if (!e) return { state: s0, message: "Không thấy người." };
  if (e.role === "owner") return { state: s0, message: "Chủ hộ giữ đủ quyền." };
  e.perms = perms;
  audit(s, "Phân quyền", `${e.name}: ${perms.length} việc`);
  return { state: s, message: `${e.name} chỉ còn các việc đã tick.` };
}

export function importChannelCsv(s0: SoState, csv: string): Result {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { state: s0, message: "File trống." };
  const header = /sku|mã|barcode|sl|số lượng/i.test(lines[0]);
  let s = clone(s0);
  let n = 0;
  const errors: string[] = [];
  for (const line of lines.slice(header ? 1 : 0)) {
    const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 4) {
      errors.push(line);
      continue;
    }
    const [ch, code, qtyS, ship, buyer = "", codS = "1"] = cols;
    const channel: Channel = /tik/i.test(ch) ? "tiktok" : /web/i.test(ch) ? "web" : "shopee";
    const p = s.products.find(
      (x) => x.sku.toLowerCase() === code.toLowerCase() || x.barcode === code || x.name.toLowerCase() === code.toLowerCase(),
    );
    if (!p || p.sell === false) {
      errors.push(`Không thấy ${code}`);
      continue;
    }
    const qty = Number(qtyS.replace(/\D/g, "")) || 0;
    if (!ship || qty < 1) {
      errors.push(`Thiếu vận đơn hoặc số lượng: ${code}`);
      continue;
    }
    const base = clone(s);
    base.cart = [{ key: "ch", productId: p.id, qty, price: p.price, discount: 0 }];
    const cod = !/^(0|không|khong|no|false)$/i.test(codS);
    const r = checkout(base, cod ? "debt" : "qr", channel, {
      autoInvoice: false,
      warehouseId: "w2",
      status: cod ? "cod" : undefined,
      ship,
    });
    if (!r.receipt) {
      errors.push(r.message);
      continue;
    }
    s = r.state;
    const sale = s.sales[0];
    if (sale && buyer) sale.note = `${buyer} · ${sale.note || ""}`.replace(/\s+·\s+$/, "").trim();
    n += 1;
  }
  if (!n) return { state: s0, message: errors[0] || "Không ghi được đơn nào." };
  return { state: s, message: `Đã ghi ${n} đơn sàn.${errors.length ? ` Bỏ ${errors.length} dòng.` : ""}` };
}

export function coverDays(s: SoState, productId: string): number | null {
  const sold = s.sales
    .filter((x) => x.status !== "held")
    .reduce((a, sale) => a + sale.lines.filter((l) => l.productId === productId).reduce((x, l) => x + l.qty, 0), 0);
  if (sold <= 0) return null;
  return Math.round(stockOf(s, productId) / (sold / 7));
}

export function clock(s0: SoState, staffId: string, dir: "in" | "out"): Result {
  const s = clone(s0);
  const e = s.staff.find((x) => x.id === staffId);
  if (!e) return { state: s0, message: "Không thấy người." };
  e.punches = e.punches || [];
  const last = e.punches[e.punches.length - 1];
  if (dir === "in" && last?.dir === "in") return { state: s0, message: `${e.name} đang trong ca.` };
  if (dir === "out" && last?.dir !== "in") return { state: s0, message: `${e.name} chưa vào ca.` };
  e.punches.push({ at: nowIso(), dir });
  audit(s, dir === "in" ? "Vào ca chấm công" : "Tan ca", e.name);
  return { state: s, message: dir === "in" ? `${e.name} đã vào ca.` : `${e.name} đã tan ca.` };
}

export function payrollPreview(s: SoState) {
  return s.staff.flatMap((e) => {
    if (!e.wage) return [];
    const punches = e.punches || [];
    let minutes = 0;
    for (let i = 0; i < punches.length; i++) {
      if (punches[i].dir !== "in") continue;
      const out = punches[i + 1];
      if (out?.dir !== "out") continue;
      const span = (new Date(out.at).getTime() - new Date(punches[i].at).getTime()) / 60000;
      minutes += Math.max(1, span);
    }
    const hours = Math.round((minutes / 60) * 100) / 100;
    if (hours <= 0) return [];
    const pay = Math.round(hours * e.wage);
    return [{ id: e.id, name: e.name, hours, pay, nv: Math.round(pay * 0.105), employer: Math.round(pay * 0.215) }];
  });
}

export function accruePayroll(s0: SoState): Result {
  const s = clone(s0);
  const rows = payrollPreview(s);
  if (!rows.length) return { state: s0, message: "Chưa có ca đã tan. Vào ca rồi tan ca trước khi chốt." };
  const gross = rows.reduce((a, r) => a + r.pay, 0);
  const nv = rows.reduce((a, r) => a + r.nv, 0);
  const employer = rows.reduce((a, r) => a + r.employer, 0);
  pushJournal(s, "Chốt lương", "LUONG", [
    { account: "642", name: "Chi phí lương", debit: gross + employer, credit: 0 },
    { account: "334", name: "Phải trả người lao động", debit: 0, credit: gross - nv },
    { account: "338", name: "BHXH phải nộp", debit: 0, credit: nv + employer },
  ]);
  for (const e of s.staff) e.punches = [];
  audit(s, "Chốt lương", rows.map((r) => r.name).join(", "));
  return { state: s, message: `Đã hạch toán ${gross.toLocaleString("vi-VN")} ₫. BHXH người lao động 10,5%, hộ 21,5%.` };
}

export function invoiceMailto(s: SoState, invoiceId: string): string | null {
  const inv = s.invoices.find((i) => i.id === invoiceId);
  if (!inv) return null;
  const buyer = s.parties.find((p) => p.name === inv.buyerName && p.email);
  if (!buyer?.email) return null;
  const body = `${inv.no}\nTổng ${inv.total}\nDấu ${inv.seal || inv.cqtCode || "chưa có"}`;
  return `mailto:${buyer.email}?subject=${encodeURIComponent(inv.no)}&body=${encodeURIComponent(body)}`;
}

export function archiveXml(s: SoState): string {
  return s.invoices.map((i) => invoiceXml(s, i.id) || "").filter(Boolean).join("\n\n");
}

export { stockOf as qty };
