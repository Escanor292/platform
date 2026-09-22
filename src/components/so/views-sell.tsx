import { useEffect, useMemo, useRef, useState } from "react";
import { useSo } from "./store";
import { Btn, Panel, Pill } from "./ui";
import * as eng from "@/lib/so/engine";
import { stamp, vnd } from "@/lib/so/money";
import type { Channel, PayMethod } from "@/lib/so/types";

const PAYS: { id: PayMethod; label: string }[] = [
  { id: "cash", label: "Tiền mặt" },
  { id: "qr", label: "VietQR" },
  { id: "card", label: "Thẻ" },
  { id: "point", label: "Điểm" },
  { id: "debt", label: "Ghi nợ" },
];

function tenders(total: number) {
  const steps = [10000, 20000, 50000, 100000, 200000, 500000];
  const set = new Set<number>([total]);
  for (const step of steps) {
    const up = Math.ceil(total / step) * step;
    if (up > total && up - total <= 500000) set.add(up);
  }
  return [...set].sort((a, b) => a - b).slice(0, 5);
}

export function PosView() {
  const { state, run, ask, online } = useSo();
  const [q, setQ] = useState("");
  const [method, setMethod] = useState<PayMethod>("cash");
  const [tender, setTender] = useState("");
  const [split, setSplit] = useState("");
  const [autoInv, setAutoInv] = useState(true);
  const [counted, setCounted] = useState("");
  const scan = useRef<HTMLInputElement>(null);
  const open = state.shifts.find((s) => s.status === "open");
  const wh = state.settings.branch.includes("online") ? "w2" : "w1";

  useEffect(() => {
    scan.current?.focus();
  }, [state.cart.length, state.sales[0]?.id]);

  const found = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = state.products.filter((p) => p.active && p.sell !== false);
    if (!s) return list;
    return list.filter((p) => p.name.toLowerCase().includes(s) || p.barcode.includes(s) || p.sku.toLowerCase().includes(s));
  }, [q, state.products]);

  const cards = useMemo(() => {
    const map = new Map<string, typeof found>();
    for (const p of found) {
      const key = p.group || p.id;
      map.set(key, [...(map.get(key) || []), p]);
    }
    return [...map.values()];
  }, [found]);

  const gross = state.cart.reduce((a, l) => a + l.qty * l.price - l.discount, 0);
  const given = Number(tender.replace(/\D/g, "")) || 0;
  const qrPart = method === "cash" ? Number(split || 0) : 0;
  const cashDue = Math.max(0, gross - qrPart);
  const change = method === "cash" && given >= cashDue ? given - cashDue : 0;
  const customer = state.parties.find((p) => p.id === state.cartCustomerId);

  const add = (id: string) => {
    run(eng.addCart(state, id));
    setQ("");
    scan.current?.focus();
  };

  const pay = () => {
    const qr = method === "cash" ? Number(split || 0) : 0;
    if (qr > gross) {
      run({ state, message: "Phần QR lớn hơn tổng đơn." });
      return;
    }
    const cashDue = gross - qr;
    if (method === "cash" && given > 0 && given < cashDue) {
      run({ state, message: "Khách đưa chưa đủ phần tiền mặt." });
      return;
    }
    run(eng.checkout(state, method, "quay", { autoInvoice: autoInv, tendered: given || cashDue, offline: !online, splitQr: qr }));
    setTender("");
    setSplit("");
  };

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-3xl border border-line bg-surface p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const needle = q.trim().toLowerCase();
            const exact = state.products.find(
              (p) => p.active && p.sell !== false && (p.barcode.toLowerCase() === needle || p.sku.toLowerCase() === needle),
            );
            const hit = exact || found[0];
            if (hit) add(hit.id);
          }}
        >
          <label className="block text-sm font-semibold">
            Quét mã hoặc tìm hàng
            <input
              ref={scan}
              value={q}
              autoFocus
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mã vạch, SKU, tên"
              className="mt-1 min-h-12 w-full rounded-2xl border border-line bg-cream px-3 text-base outline-none focus:border-pgreen"
            />
          </label>
        </form>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cards.slice(0, 9).map((group) => {
            const head = group[0];
            return (
              <div key={head.group || head.id} className="rounded-2xl border border-line bg-cream px-3 py-3 text-left">
                <span className="block font-semibold leading-snug">{head.group || head.name}</span>
                {group.length === 1 ? (
                  <button type="button" onClick={() => add(head.id)} className="mt-2 min-h-11 w-full rounded-2xl bg-surface text-sm font-semibold">
                    {head.recipe?.length ? `${vnd(head.price)} · pha tại quán` : `${vnd(head.price)} · ${eng.stockOf(state, head.id, wh)} ${head.uom}`}
                  </button>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {group.map((p) => (
                      <button key={p.id} type="button" onClick={() => add(p.id)} className="min-h-11 rounded-2xl bg-surface px-2 text-sm font-semibold">
                        {p.size} · {eng.stockOf(state, p.id, wh)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {state.holds.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {state.holds.map((h) => (
              <Btn key={h.id} kind="ghost" onClick={() => run(eng.recall(state, h.id))}>
                Gọi {h.label}
              </Btn>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-line bg-surface p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl">Phiếu</h2>
          <button type="button" className="min-h-11 px-2 text-sm font-semibold text-navy" onClick={() => run(eng.holdCart(state))}>
            Giữ đơn
          </button>
        </div>
        <select
          className="mb-3 min-h-11 w-full rounded-2xl border border-line bg-cream px-3 text-sm"
          value={state.cartCustomerId || ""}
          onChange={(e) => run(eng.pickCustomer(state, e.target.value || undefined))}
        >
          <option value="">Khách lẻ — không lấy MST</option>
          {state.parties
            .filter((p) => p.kind === "customer" && p.id !== "c1")
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · nợ {vnd(p.debt)} / {vnd(p.limit)}
              </option>
            ))}
        </select>
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {state.cart.length === 0 ? <li className="rounded-2xl bg-cream px-3 py-4 text-sm text-muted">Quét hàng để lập phiếu.</li> : null}
          {state.cart.map((l) => {
            const p = state.products.find((x) => x.id === l.productId);
            return (
              <li key={l.key} className="rounded-2xl border border-line px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{p?.name}</span>
                  <span className="shrink-0">{vnd(l.qty * l.price - l.discount)}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <Btn kind="ghost" onClick={() => run(eng.setCart(state, l.key, { qty: l.qty - 1 }))}>−</Btn>
                  <span className="inline-flex min-h-11 min-w-8 items-center justify-center">{l.qty}</span>
                  <Btn kind="ghost" onClick={() => run(eng.setCart(state, l.key, { qty: l.qty + 1 }))}>+</Btn>
                  <Btn kind="ghost" onClick={() => run(eng.setCart(state, l.key, { discount: l.discount ? 0 : Math.round(l.price * 0.1) }))}>
                    {l.discount ? "Bỏ CK" : "CK 10%"}
                  </Btn>
                </div>
                {p?.track === "serial" ? (
                  <input
                    value={l.serial || ""}
                    placeholder="Serial / IMEI"
                    onChange={(e) => run(eng.setCart(state, l.key, { serial: e.target.value }))}
                    className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3 text-sm"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>

        <p className="mt-3 font-display text-3xl">{vnd(gross)}</p>
        {customer ? <p className="text-sm text-muted">MST {customer.mst || "không có"} · hạng {customer.tier}</p> : null}

        <div className="mt-3 grid grid-cols-3 gap-1 sm:grid-cols-5">
          {PAYS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setMethod(p.id)}
              className={`min-h-11 rounded-2xl px-1 text-xs font-semibold ${method === p.id ? "bg-navy text-surface" : "border border-line bg-surface text-ink"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {method === "cash" ? (
          <div className="mt-3">
            <label className="block text-sm font-semibold">
              Khách đưa
              <input
                inputMode="numeric"
                value={tender}
                onChange={(e) => setTender(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="Để trống nếu khách đưa đủ"
                className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tenders(gross || 0).map((n) => (
                <button key={n} type="button" className="min-h-11 rounded-2xl border border-line px-3 text-sm font-semibold" onClick={() => setTender(String(n))}>
                  {n === gross ? "Đủ" : vnd(n)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm">Tiền thừa <span className="font-semibold">{vnd(change)}</span></p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-semibold">Tách một phần sang VietQR</summary>
              <input
                inputMode="numeric"
                value={split}
                onChange={(e) => setSplit(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="Số tiền khách quét"
                className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-cream px-3"
              />
            </details>
          </div>
        ) : null}

        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={autoInv} onChange={(e) => setAutoInv(e.target.checked)} className="size-4" />
          Xuất hóa đơn máy tính tiền ngay khi thu{online ? "" : " (sẽ chờ mạng)"}
        </label>

        <button
          type="button"
          disabled={!state.cart.length}
          onClick={pay}
          className="sticky bottom-16 z-10 mt-3 min-h-12 w-full rounded-2xl bg-pgreen text-base font-semibold text-surface disabled:opacity-40 md:static"
        >
          Thanh toán {gross ? vnd(gross) : ""}
        </button>
        <div className="mt-2 flex flex-wrap gap-2">
          <Btn kind="ghost" onClick={() => run(eng.clearCart(state))}>Xóa phiếu</Btn>
        </div>
        <details className="mt-3 rounded-2xl bg-cream p-3">
          <summary className="cursor-pointer text-sm font-semibold">{open ? `Ca ${open.user} · quỹ ${vnd(open.sales)}` : "Chưa có ca mở"}</summary>
          <div className="mt-2 flex gap-2">
            <input
              inputMode="numeric"
              value={counted}
              onChange={(e) => setCounted(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Tiền đếm trong két"
              className="min-h-11 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-3 text-sm"
            />
            <Btn
              kind="ghost"
              onClick={() =>
                ask("Giao ca?", "Ca đóng lại. Đơn sau không cộng vào quỹ ca này.", () => {
                  run(eng.closeShift(state, Number(counted || open?.openCash || 0)));
                  setCounted("");
                })
              }
            >
              Giao ca
            </Btn>
          </div>
        </details>
      </section>
    </div>
  );
}

export function FnbView() {
  const { state, run, seeCost } = useSo();
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [openId, setOpenId] = useState(state.tables[0]?.id || "");
  const menu = state.products.filter((p) => (p.category === "F&B" || p.category === "Nhà cửa") && p.sell !== false);
  const tickets = state.tables.filter((t) => t.status === "kitchen");
  const toggle = (tableId: string, key: string) => {
    setPicked((cur) => {
      const list = cur[tableId] || [];
      return { ...cur, [tableId]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key] };
    });
  };
  return (
    <div className="space-y-4">
      <Panel title="Bếp" hint="Phiếu đã gửi. Bếp bấm xong khi món ra.">
        {tickets.length === 0 ? <p className="text-sm text-muted">Không có phiếu.</p> : (
          <ul className="space-y-2">
            {tickets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream px-3 py-3 text-sm">
                <span>
                  <span className="font-semibold">{t.name}</span>
                  <span className="block text-muted">{t.lines.filter((l) => l.sent).map((l) => `${l.qty} ${state.products.find((p) => p.id === l.productId)?.name}`).join(", ")}</span>
                </span>
                <Btn onClick={() => run(eng.bumpKitchen(state, t.id))}>Xong</Btn>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Sơ đồ bàn" hint="Chọn một bàn. Gọi món ở bàn đó, rồi gửi bếp hoặc thu.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {state.tables.map((t) => {
            const total = t.lines.reduce((a, l) => a + l.qty * l.price, 0);
            const on = t.id === openId;
            const tone = t.status === "empty" ? "border-line bg-cream" : t.status === "kitchen" ? "border-ebrown bg-ebrown/10" : t.status === "bill" ? "border-navy bg-navy/10" : "border-pgreen bg-pgreen/10";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setOpenId(t.id)}
                className={`min-h-20 rounded-2xl border px-3 py-2 text-left ${tone} ${on ? "ring-2 ring-pgreen" : ""}`}
              >
                <span className="block font-semibold">{t.name}</span>
                <span className="block text-xs text-muted">{t.zone} · {t.status === "empty" ? "Trống" : t.status === "kitchen" ? "Bếp" : t.status === "bill" ? "Tính tiền" : "Có khách"}</span>
                <span className="block text-sm">{total ? vnd(total) : "—"}</span>
              </button>
            );
          })}
        </div>
        {(() => {
          const t = state.tables.find((x) => x.id === openId) || state.tables[0];
          if (!t) return null;
          const total = t.lines.reduce((a, l) => a + l.qty * l.price, 0);
          return (
            <div className="mt-4 rounded-3xl border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-2xl">{t.name}</h3>
                <p className="text-sm text-muted">{t.covers || 0} khách · {vnd(total)}</p>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {t.lines.length === 0 ? <li className="text-muted">Bàn chưa có món.</li> : null}
                {t.lines.map((l) => {
                  const p = state.products.find((x) => x.id === l.productId);
                  const on = (picked[t.id] || []).includes(l.key);
                  return (
                    <li key={l.key}>
                      <label className="flex min-h-11 items-center gap-2">
                        <input type="checkbox" checked={on} onChange={() => toggle(t.id, l.key)} />
                        <span>{l.qty} × {p?.name}{l.sent ? " · đã gửi bếp" : ""}{seeCost ? ` · vốn ${vnd((p?.cost || 0) * l.qty)}` : ""}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {menu.map((p) => (
                  <Btn key={p.id} kind="ghost" onClick={() => run(eng.addTableItem(state, t.id, p.id))}>
                    + {p.name}
                  </Btn>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.status === "empty" ? (
                  <Btn onClick={() => run(eng.seat(state, t.id, t.name.includes("Phòng") ? 4 : 2))}>Nhận bàn</Btn>
                ) : null}
                <Btn kind="navy" onClick={() => run(eng.sendKitchen(state, t.id))}>Gửi bếp</Btn>
                <Btn kind="ghost" onClick={() => run(eng.payTableLines(state, t.id, picked[t.id] || []))}>Tách món đã tick</Btn>
                <Btn onClick={() => run(eng.payTable(state, t.id))}>Thu cả bàn</Btn>
              </div>
            </div>
          );
        })()}
      </Panel>
    </div>
  );
}

function printShip(settings: { tradeName: string; address: string }, sale: { no: string; ship?: string; note?: string; total: number; lines: { name: string; qty: number }[] }) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${sale.no}</title>
<style>@page{size:A6;margin:8mm}body{font-family:sans-serif;font-size:14px}h1{font-size:18px}</style></head>
<body><h1>${settings.tradeName}</h1><p>${settings.address}</p><p><strong>${sale.no}</strong><br>${sale.ship || ""}</p>
<p>${sale.lines.map((l) => `${l.qty} × ${l.name}`).join("<br>")}</p><p>COD / thu ${sale.total.toLocaleString("vi-VN")} đ</p>
<p>${sale.note || ""}</p><script>window.print()<\/script></body></html>`;
  const w = window.open("", "ship", "width=420,height=640");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export function OmniView() {
  const { state, run, setView } = useSo();
  const [channel, setChannel] = useState<Channel>("shopee");
  const [productId, setProductId] = useState(state.products.find((p) => p.sell !== false)?.id || "");
  const [qty, setQty] = useState("1");
  const [ship, setShip] = useState("");
  const [buyer, setBuyer] = useState("");
  const [cod, setCod] = useState(true);
  const goods = state.products.filter((p) => p.sell !== false);
  return (
    <Panel
      title="Đơn đa kênh"
      hint="Ghi đơn đã có trên sàn vào sổ. Kho online bị trừ ngay. Tiền vào khi bạn dán sao kê chứa số đơn."
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Kênh
          <select className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
            <option value="shopee">Shopee</option>
            <option value="tiktok">TikTok</option>
            <option value="web">Web</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Hàng
          <select className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" value={productId} onChange={(e) => setProductId(e.target.value)}>
            {goods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Số lượng
          <input value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" />
        </label>
        <label className="text-sm font-semibold">
          Mã vận đơn
          <input value={ship} onChange={(e) => setShip(e.target.value)} placeholder="GHN · SPX…" className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" />
        </label>
        <label className="text-sm font-semibold">
          Người mua
          <input value={buyer} onChange={(e) => setBuyer(e.target.value)} className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" />
        </label>
        <label className="flex min-h-11 items-end gap-2 text-sm font-semibold">
          <input type="checkbox" checked={cod} onChange={(e) => setCod(e.target.checked)} />
          Thu hộ COD
        </label>
      </div>
      <Btn
        kind="navy"
        onClick={() => run(eng.bookChannel(state, { channel, productId, qty: Number(qty) || 0, ship, cod, buyer }))}
      >
        Ghi đơn
      </Btn>
      <label className="mt-3 block text-sm font-semibold">
        Nhập file xuất từ sàn
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-1 block w-full text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            file.text().then((text) => run(eng.importChannelCsv(state, text)));
          }}
        />
      </label>
      <p className="mt-1 text-xs text-muted">Cột: kênh, SKU hoặc mã vạch, số lượng, mã vận đơn, người mua, COD (1 hoặc 0). Kho online bị trừ ngay.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2">Đơn</th>
              <th>Kênh</th>
              <th>Tiền</th>
              <th>Vận chuyển</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.sales
              .filter((s) => s.channel !== "quay")
              .map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="py-3 font-semibold">
                    {s.no}
                    <div className="font-normal text-muted">{stamp(new Date(s.at))}</div>
                  </td>
                  <td>{s.channel}</td>
                  <td>{vnd(s.total)}</td>
                  <td className="max-w-xs">{s.ship || s.note || "—"}</td>
                  <td className="space-x-2 text-right">
                    <Btn kind="ghost" onClick={() => printShip(state.settings, s)}>In vận đơn</Btn>
                    {s.status === "cod" ? (
                      <Btn kind="ghost" onClick={() => run(eng.codDelivered(state, s.id))}>
                        Đã giao COD
                      </Btn>
                    ) : null}
                    {!s.invoiceId && s.status !== "held" ? (
                      <Btn kind="navy" onClick={() => { run(eng.issueInvoice(state, s.id, "GTGT")); setView("hdra"); }}>
                        Xuất HĐ
                      </Btn>
                    ) : (
                      <Pill tone="green">{s.status}</Pill>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
