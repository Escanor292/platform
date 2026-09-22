import { useMemo, useState } from "react";
import { useSo } from "./store";
import { Btn, Kpi, Panel, Pill } from "./ui";
import * as eng from "@/lib/so/engine";
import { COVERAGE } from "@/lib/so/coverage";
import { downloadText, stamp, vnd } from "@/lib/so/money";
import type { EInvoice } from "@/lib/so/types";

const statusTone = (s: EInvoice["status"]) =>
  s === "coded" ? "green" : s === "error" || s === "cancelled" ? "danger" : s === "replaced" ? "mute" : "brown";

export function HomeView() {
  const { state, go } = useSo();
  const sales = state.sales.filter((s) => s.status !== "held");
  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const vat = sales.reduce((a, s) => a + s.vat, 0);
  const low = state.products.filter((p) => eng.stockOf(state, p.id) <= p.minQty).length;
  const waiting = state.invoices.filter((i) => i.direction === "out" && (i.status === "waiting" || i.status === "error")).length;
  const cash = state.journals.reduce((a, j) => a + j.lines.filter((l) => l.account === "111").reduce((x, l) => x + l.debit - l.credit, 0), 0);
  const bank = state.journals.reduce((a, j) => a + j.lines.filter((l) => l.account === "112").reduce((x, l) => x + l.debit - l.credit, 0), 0) +
    state.bank.filter((b) => !b.matchedSaleId).reduce((a, b) => a + b.amount, 0);
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <p className="text-sm font-semibold text-pgreen">Tử Tế Fund · sổ vận hành</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{state.settings.tradeName}</h1>
        <p className="mt-2 text-sm text-muted">{state.settings.regime === "HKD" ? "Hộ kinh doanh" : "Doanh nghiệp"} · {state.settings.branch}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={() => go("pos")}>Bán hàng</Btn>
          <Btn kind="navy" onClick={() => go("hdra")}>Hóa đơn chờ mã</Btn>
          <Btn kind="ghost" onClick={() => go("map")}>Xem đủ nghiệp vụ</Btn>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Doanh thu đơn" value={vnd(revenue)} hint={`${sales.length} đơn còn hiệu lực`} />
        <Kpi label="Thuế GTGT trong đơn" value={vnd(vat)} hint={state.settings.vatReduced ? "Đang gắn cờ giảm 8%" : "Thuế suất niêm yết"} />
        <Kpi label="Tiền mặt trên sổ" value={vnd(cash)} hint="Từ bút toán 111" />
        <Kpi label="Tiền gửi + chưa khớp" value={vnd(bank)} hint="112 và sao kê treo" />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <button type="button" onClick={() => go("kho")} className="rounded-3xl border border-line bg-surface p-4 text-left">
          <p className="text-sm text-muted">Tồn dưới mức</p>
          <p className="font-display text-3xl">{low}</p>
        </button>
        <button type="button" onClick={() => go("hdra")} className="rounded-3xl border border-line bg-surface p-4 text-left">
          <p className="text-sm text-muted">Hóa đơn cần xử lý</p>
          <p className="font-display text-3xl">{waiting}</p>
        </button>
        <button type="button" onClick={() => go("thue")} className="rounded-3xl border border-line bg-surface p-4 text-left">
          <p className="text-sm text-muted">Chế độ</p>
          <p className="font-display text-3xl">{state.settings.regime}</p>
        </button>
      </div>
    </div>
  );
}

export function OutInvoiceView() {
  const { state, run, ask } = useSo();
  const rows = state.invoices.filter((i) => i.direction === "out");
  const bare = state.sales.filter((s) => s.status !== "held" && !s.invoiceId);
  return (
    <div className="space-y-4">
      <Panel
        title="Hóa đơn đầu ra"
        hint="Đóng dấu nội bộ khóa nội dung hóa đơn trên sổ. Dấu này không phải mã của cơ quan thuế."
        action={<Btn onClick={() => run(eng.batchGrant(state))}>Đóng dấu hàng loạt</Btn>}
      >
        {bare.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {bare.map((s) => (
              <Btn key={s.id} kind="navy" onClick={() => run(eng.issueInvoice(state, s.id, s.channel === "quay" || s.channel === "fnb" ? "MTT" : "GTGT"))}>
                Lập HĐ {s.no}
              </Btn>
            ))}
          </div>
        ) : null}
        <div className="space-y-3">
          {rows.map((inv) => (
            <article key={inv.id} className="rounded-3xl border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{inv.no} · {inv.kind}</h3>
                  <p className="text-sm text-muted">{inv.buyerName} {inv.buyerMst ? `· MST ${inv.buyerMst}` : ""} · {vnd(inv.total)}</p>
                  <p className="text-sm text-navy">{inv.seal ? `Dấu ${inv.seal}` : inv.cqtCode || "Chưa đóng dấu"} {inv.note ? `· ${inv.note}` : ""}</p>
                </div>
                <Pill tone={statusTone(inv.status)}>{inv.status}</Pill>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {inv.status === "coded" || inv.status === "waiting" ? (
                  <Btn
                    kind="ghost"
                    onClick={() => {
                      const xml = eng.invoiceXml(state, inv.id);
                      if (!xml) return;
                      const blob = new Blob([xml], { type: "application/xml" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${inv.no}.xml`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Tải XML
                  </Btn>
                ) : null}
                {inv.status === "waiting" || inv.status === "draft" || inv.status === "error" ? (
                  <Btn onClick={() => run(eng.grantCode(state, inv.id))}>Đóng dấu</Btn>
                ) : null}
                {inv.status === "coded" ? (
                  <>
                    <Btn kind="ghost" onClick={() => {
                      const href = eng.invoiceMailto(state, inv.id);
                      const r = eng.sendInvoice(state, inv.id);
                      run(r);
                      if (href && r.message.startsWith("Mở thư")) window.location.href = href;
                    }}>Gửi email</Btn>
                    <Btn kind="navy" onClick={() => ask("Điều chỉnh hóa đơn?", `${inv.no} sẽ có hóa đơn điều chỉnh. Hóa đơn gốc giữ nguyên.`, () => run(eng.adjustInvoice(state, inv.id, "DIEU_CHINH")))}>Điều chỉnh</Btn>
                    <Btn kind="ghost" onClick={() => ask("Thay thế hóa đơn?", `${inv.no} bị thay bởi hóa đơn mới.`, () => run(eng.adjustInvoice(state, inv.id, "THAY_THE")))}>Thay thế</Btn>
                    <Btn kind="danger" onClick={() => ask("Hủy hóa đơn?", `${inv.no} chuyển sang hủy. Không hoàn tác trong kỳ đã khóa.`, () => run(eng.adjustInvoice(state, inv.id, "HUY")))}>Hủy</Btn>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function InInvoiceView() {
  const { state, run } = useSo();
  const rows = state.invoices.filter((i) => i.direction === "in");
  return (
    <Panel title="Hóa đơn đầu vào" hint="Khớp đơn mua, phiếu nhập và hóa đơn. MST rủi ro bị loại khỏi khấu trừ.">
      <div className="space-y-3">
        {rows.map((inv) => (
          <article key={inv.id} className="rounded-3xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{inv.no}</h3>
                <p className="text-sm text-muted">{inv.buyerName} · MST {inv.buyerMst} · {vnd(inv.total)}</p>
                <p className="text-sm">{inv.note || "Bóc tách: tiền hàng, thuế, MST người bán"}</p>
              </div>
              <Pill tone={inv.match === "matched" ? "green" : inv.match === "missing" ? "danger" : "brown"}>{inv.match || "pending"}</Pill>
            </div>
            <div className="mt-3">
              <Btn onClick={() => run(eng.reviewAp(state, inv.id))}>Khớp 3 bước</Btn>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function LedgerView() {
  const { state, run, ask } = useSo();
  const ar = state.parties.filter((p) => p.kind === "customer" && p.debt > 0);
  const ap = state.parties.filter((p) => p.kind === "supplier" && p.debt > 0);
  return (
    <div className="space-y-4">
      <Panel title="Nhật ký chung" hint={`Giá vốn ${state.settings.costMethod}. Ngoại tệ: hộ này hạch toán VND, chênh lệch tỷ giá không phát sinh.`}>
        <div className="space-y-3">
          {state.journals.slice(0, 8).map((j) => (
            <article key={j.id} className="rounded-2xl bg-cream p-3 text-sm">
              <div className="font-semibold">{j.memo}</div>
              <div className="text-muted">{stamp(new Date(j.at))} · {j.source}</div>
              <ul className="mt-2">
                {j.lines.map((l, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>{l.account} {l.name}</span>
                    <span>{l.debit ? `Nợ ${vnd(l.debit)}` : `Có ${vnd(l.credit)}`}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Sổ hộ kinh doanh" hint="Bốn sổ theo Thông tư 152: doanh thu, chi phí, vật liệu, tiền. Số lấy từ đơn và bút toán đang có.">
        {(() => {
          const live = state.sales.filter((s) => s.status !== "held");
          const revenue = live.reduce((a, s) => a + s.subtotal, 0);
          const vat = live.reduce((a, s) => a + s.vat, 0);
          const cogs = live.reduce((a, s) => a + s.lines.reduce((x, l) => x + l.cost * l.qty, 0), 0);
          const cash = state.journals.reduce((a, j) => a + j.lines.filter((l) => l.account === "111").reduce((x, l) => x + l.debit - l.credit, 0), 0);
          const bank = state.journals.reduce((a, j) => a + j.lines.filter((l) => l.account === "112").reduce((x, l) => x + l.debit - l.credit, 0), 0);
          const rows = [
            ["S1 Doanh thu", vnd(revenue)],
            ["S1 Thuế GTGT", vnd(vat)],
            ["S2 Chi phí giá vốn", vnd(cogs)],
            ["S3 Vật liệu / hàng", `${state.products.length} mặt hàng đang theo dõi`],
            ["S4 Tiền mặt", vnd(cash)],
            ["S4 Tiền gửi", vnd(bank)],
          ];
          return (
            <ul className="space-y-2 text-sm">
              {rows.map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3 border-b border-line py-2">
                  <span>{k}</span>
                  <span className="font-semibold">{v}</span>
                </li>
              ))}
            </ul>
          );
        })()}
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Phải thu">
          {ar.length === 0 ? <p className="text-sm text-muted">Không có nợ khách.</p> : ar.map((p) => <p key={p.id}>{p.name} · {vnd(p.debt)} · hạn mức {vnd(p.limit)}</p>)}
        </Panel>
        <Panel title="Phải trả">
          {ap.map((p) => <p key={p.id}>{p.name} · {vnd(p.debt)}</p>)}
        </Panel>
      </div>
      <Panel title="Tài sản và công cụ" hint="Một dòng mẫu để thấy khấu hao không trộn với hàng bán.">
        <p className="text-sm">Máy đọc mã · nguyên giá {vnd(1290000)} · phân bổ 36 tháng · kỳ này {vnd(35833)}. Kệ gỗ CCDC {vnd(2400000)} phân bổ 12 tháng.</p>
        <div className="mt-3">
          <Btn kind="ghost" onClick={() => ask("Hoàn đơn mới nhất?", "Hàng nhập lại kho. Nếu hóa đơn đã có mã, phải lập hóa đơn điều chỉnh — sổ không tự sửa mã CQT.", () => run(eng.refundSale(state, state.sales[0]?.id || "")))}>Hoàn đơn mới nhất</Btn>
        </div>
      </Panel>
    </div>
  );
}

export function TaxView() {
  const { state, run } = useSo();
  const sales = state.sales.filter((s) => s.status !== "held");
  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const vatOut = sales.reduce((a, s) => a + s.vat, 0);
  const vatIn = state.invoices.filter((i) => i.direction === "in" && i.match === "matched").reduce((a, i) => a + i.vat, 0);
  const cost = sales.reduce((a, s) => a + s.lines.reduce((x, l) => x + l.cost * l.qty, 0), 0);
  const profit = revenue - vatOut - cost;
  const cnkd = Math.round(revenue * 0.015);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<TKhai>
  <MST>${state.settings.mst}</MST>
  <Ten>${state.settings.tradeName}</Ten>
  <DoanhThu>${revenue}</DoanhThu>
  <GTGT>${vatOut}</GTGT>
  <ThueTamTinh>${state.settings.regime === "HKD" ? cnkd : Math.round(profit * 0.2)}</ThueTamTinh>
</TKhai>`;
  return (
    <div className="space-y-4">
      <Panel
        title={state.settings.regime === "HKD" ? "Tờ 01/CNKD — xem trước" : "Tờ GTGT doanh nghiệp — xem trước"}
        hint="Số lấy từ đơn trên sổ. Tải file để đưa vào HTKK. Sổ không nộp thay bạn."
        action={
          <div className="flex flex-wrap gap-2">
            <Btn kind="ghost" onClick={() => run(eng.setRegime(state, state.settings.regime === "HKD" ? "DN" : "HKD"))}>
              Đổi {state.settings.regime === "HKD" ? "DN" : "HKD"}
            </Btn>
            <Btn kind="ghost" onClick={() => run(eng.toggleVat(state))}>
              {state.settings.vatReduced ? "Tắt giảm 8%" : "Bật giảm 8%"}
            </Btn>
            <Btn kind="navy" onClick={() => downloadText(state.settings.regime === "HKD" ? "01-CNKD.xml" : "GTGT.xml", xml, "application/xml")}>Tải tờ khai</Btn>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi label="Doanh thu" value={vnd(revenue)} />
          <Kpi label="GTGT đầu ra" value={vnd(vatOut)} />
          <Kpi label={state.settings.regime === "HKD" ? "TNCN tạm tính 1,5%" : "TNDN tạm tính 20% LN"} value={vnd(state.settings.regime === "HKD" ? cnkd : Math.round(Math.max(profit, 0) * 0.2))} />
        </div>
        <p className="mt-4 text-sm text-muted">GTGT đầu vào được khớp: {vnd(vatIn)}. Bảng kê bán ra {sales.length} dòng, mua vào {state.invoices.filter((i) => i.direction === "in").length} hóa đơn.</p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-ink p-4 text-xs text-cream">{xml}</pre>
      </Panel>
    </div>
  );
}

export function ReportView() {
  const { state } = useSo();
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of state.sales) {
      if (s.status === "held") continue;
      map.set(s.channel, (map.get(s.channel) || 0) + s.total);
    }
    return [...map.entries()].map(([name, total]) => ({ name, total }));
  }, [state.sales]);
  const revenue = data.reduce((a, d) => a + d.total, 0);
  const cost = state.sales.filter((s) => s.status !== "held").reduce((a, s) => a + s.lines.reduce((x, l) => x + l.cost * l.qty, 0), 0);
  return (
    <Panel title="Báo cáo" hint="Doanh thu theo kênh và lãi gộp hàng bán. Không thay báo cáo kiểm toán.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Doanh thu" value={vnd(revenue)} />
        <Kpi label="Giá vốn" value={vnd(cost)} />
        <Kpi label="Lãi gộp" value={vnd(revenue - cost)} />
      </div>
      <div className="mt-4 space-y-3">
        {data.length === 0 ? <p className="text-sm text-muted">Chưa có doanh thu để vẽ.</p> : null}
        {data.map((d) => {
          const max = Math.max(...data.map((x) => x.total), 1);
          return (
            <div key={d.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">{d.name}</span>
                <span className="text-muted">{vnd(d.total)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-cream">
                <div className="h-full rounded-full bg-pgreen" style={{ width: `${Math.max(6, Math.round((d.total / max) * 100))}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function BankView() {
  const { state, run } = useSo();
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const openSales = state.sales.filter((s) => s.status === "cod" || s.status === "debt");
  return (
    <Panel title="Ngân hàng" hint={`${state.settings.bankName} ${state.settings.bankAccount} · ${state.settings.bankOwner}. Số này là mẫu, đừng chuyển tiền thật. Ghi đúng số đơn trong nội dung thì sổ tự khớp.`}>
      <div className="mb-4 grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold">
          Số tiền
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d-]/g, ""))} className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" />
        </label>
        <label className="text-sm font-semibold">
          Nội dung sao kê
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="VietQR BH-1048" className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" />
        </label>
        <Btn onClick={() => { run(eng.addBankLine(state, Number(amount), desc)); setAmount(""); setDesc(""); }}>Ghi sao kê</Btn>
      </div>
      <div className="space-y-3">
        {state.bank.map((b) => (
          <article key={b.id} className="rounded-2xl border border-line p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{b.desc}</p>
                <p className="text-sm text-muted">{stamp(new Date(b.at))}</p>
              </div>
              <span className={b.amount < 0 ? "text-danger" : "text-ink"}>{vnd(b.amount)}</span>
            </div>
            {b.matchedSaleId ? (
              <p className="mt-1 text-sm text-pgreen">Đã khớp {state.sales.find((s) => s.id === b.matchedSaleId)?.no}</p>
            ) : b.amount > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {openSales.slice(0, 4).map((s) => (
                  <Btn key={s.id} kind="ghost" onClick={() => run(eng.matchBank(state, b.id, s.id))}>
                    Gắn {s.no}
                  </Btn>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted">Chi phí nền tảng — hạch toán 641, không vào doanh thu.</p>
            )}
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function PeopleView() {
  const { state, role, setRole, seeCost, who, run } = useSo();
  const sales = state.sales.filter((s) => s.status !== "held").reduce((a, s) => a + s.total, 0);
  const rows = eng.payrollPreview(state);
  const label: Record<string, string> = {
    owner: "Chủ hộ — mọi sổ, khóa kỳ, nhân sự",
    cashier: "Thu ngân — bán, ca, hóa đơn tại quầy",
    stock: "Kho — nhập, chuyển, kiểm, hóa đơn vào",
    accountant: "Kế toán — hóa đơn, sổ, thuế, ngân hàng",
    kitchen: "Bếp — bàn và phiếu món",
  };
  return (
    <div className="space-y-4">
      <Panel title="Chấm công" hint="Giờ công nhân với lương giờ. BHXH người lao động 10,5%, hộ 21,5% khi chốt.">
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => who && run(eng.clock(state, who.id, "in"))}>Vào ca</Btn>
          <Btn kind="navy" onClick={() => who && run(eng.clock(state, who.id, "out"))}>Tan ca</Btn>
          {seeCost ? <Btn kind="ghost" onClick={() => run(eng.accruePayroll(state))}>Chốt lương</Btn> : null}
        </div>
        {rows.length ? (
          <ul className="mt-3 space-y-1 text-sm">
            {rows.map((r) => (
              <li key={r.id}>{r.name}: {r.hours} giờ · lương {vnd(r.pay)} · BHXH NLĐ {vnd(r.nv)} · hộ {vnd(r.employer)}</li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-muted">Chưa có ca đã tan.</p>}
      </Panel>
      <Panel title="Người làm" hint="Chủ hộ đổi vai để xem việc của từng người. Hoa hồng chỉ tính khi được xem giá.">
        <ul className="space-y-2">
          {state.staff.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream px-3 py-3 text-sm">
              <span>
                <span className="font-semibold">{e.name}</span>
                <span className="block text-muted">{label[e.role]} · {e.branch}</span>
              </span>
              <span className="flex items-center gap-2">
                <span>{e.commission && seeCost ? vnd(sales * e.commission) : e.commission ? "Hoa hồng ẩn" : "Không hoa hồng"}</span>
                {who?.role === "owner" ? (
                  <Btn kind={role === e.role ? "green" : "navy"} onClick={() => setRole(e.role)}>
                    {role === e.role ? "Đang dùng" : "Vào vai"}
                  </Btn>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export function CrmView() {
  const { state } = useSo();
  const customers = state.parties.filter((p) => p.kind === "customer" && p.id !== "c1");
  return (
    <Panel title="Khách quen" hint="Điểm, hạng, và đơn đã mua.">
      <div className="space-y-3">
        {customers.map((c) => {
          const orders = state.sales.filter((s) => s.customerId === c.id && s.status !== "held");
          return (
            <article key={c.id} className="rounded-3xl border border-line p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl">{c.name}</h3>
                <Pill tone={c.tier === "Vàng" ? "brown" : "navy"}>{c.tier} · {c.points} điểm</Pill>
              </div>
              <p className="text-sm text-muted">{c.phone || "Chưa có SĐT"} · nợ {vnd(c.debt)}</p>
              <ul className="mt-2 text-sm">
                {orders.length === 0 ? <li>Chưa có đơn.</li> : orders.map((o) => <li key={o.id}>{o.no} · {o.channel} · {vnd(o.total)}</li>)}
              </ul>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

export function SystemView() {
  const { state, run, ask } = useSo();
  return (
    <div className="space-y-4">
      <Panel title="Hồ sơ hộ" hint="Mỗi chi nhánh một MST và một ký hiệu hóa đơn. Gói lưu trữ là file XML tải về máy.">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Tên</dt><dd className="font-semibold">{state.settings.tradeName}</dd></div>
          <div><dt className="text-muted">MST đang bán</dt><dd className="font-semibold">{state.settings.mst}</dd></div>
          <div><dt className="text-muted">Địa chỉ</dt><dd>{state.settings.address}</dd></div>
          <div><dt className="text-muted">Chữ ký số</dt><dd>{state.settings.ca}</dd></div>
          <div><dt className="text-muted">Chi nhánh đang bán</dt><dd>{state.settings.branch}</dd></div>
          <div><dt className="text-muted">Kỳ sổ</dt><dd>{state.settings.periodLocked ? "Đã khóa" : "Đang mở"}</dd></div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={() => ask(state.settings.periodLocked ? "Mở khóa kỳ?" : "Khóa sổ kỳ?", state.settings.periodLocked ? "Bán và nhập hàng được phép trở lại." : "Sau khi khóa, không bán và không nhập hàng cho đến khi mở lại.", () => run(eng.toggleLock(state)))}>{state.settings.periodLocked ? "Mở khóa kỳ" : "Khóa sổ kỳ"}</Btn>
          {(state.branches || []).map((b) => (
            <Btn key={b.id} kind={state.settings.branch === b.name ? "green" : "navy"} onClick={() => run(eng.setBranch(state, b.name))}>
              {b.name} · {b.symbol}
            </Btn>
          ))}
          <Btn kind="danger" onClick={() => downloadText(`luu-tru-hoa-don-${state.settings.mst}.xml`, eng.archiveXml(state), "application/xml")}>
            Tải gói lưu trữ
          </Btn>
        </div>
      </Panel>
      <Panel title="Nhật ký thao tác">
        <ul className="space-y-2 text-sm">
          {state.audits.slice(0, 12).map((a) => (
            <li key={a.id} className="border-b border-line py-2">
              <span className="font-semibold">{a.action}</span> · {a.detail}
              <div className="text-muted">{a.actor} · {stamp(new Date(a.at))}</div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export function MapView() {
  const { go, focus } = useSo();
  const [q, setQ] = useState("");
  const rows = COVERAGE.filter((c) => (c.name + c.code + c.group).toLowerCase().includes(q.toLowerCase()));
  const groups = [...new Set(rows.map((r) => r.group))];
  return (
    <Panel title="Đủ nghiệp vụ" hint={`${COVERAGE.length} việc của sổ bán hàng, kho, hóa đơn và thuế. Bấm để mở màn làm việc đó.`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm: FEFO, 01/CNKD, COD..."
        className="mb-4 min-h-11 w-full rounded-2xl border border-line bg-cream px-3"
      />
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g}>
            <h3 className="font-display text-lg">{g}</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {rows.filter((r) => r.group === g).map((r) => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => go(r.view, r.code)}
                  className={`rounded-2xl border px-3 py-3 text-left ${focus === r.code ? "border-pgreen bg-pgreen/10" : "border-line bg-surface"}`}
                >
                  <span className="text-xs font-semibold text-navy">{r.code}</span>
                  <span className="mt-1 block font-semibold">{r.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
