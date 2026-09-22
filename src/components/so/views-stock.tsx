import { useState } from "react";
import { useSo } from "./store";
import { Btn, Field, Panel, Pill } from "./ui";
import * as eng from "@/lib/so/engine";
import { daysLeft, vnd } from "@/lib/so/money";

export function KhoView() {
  const { state, run } = useSo();
  const [pid, setPid] = useState(state.products[0]?.id || "");
  const [qty, setQty] = useState("2");
  const [counted, setCounted] = useState("10");
  return (
    <div className="space-y-4">
      <Panel title="Tồn theo kho" hint="Nhiều kho, lô/HSD xuất FEFO khi bán, cảnh báo dưới tồn tối thiểu. Phiếu chuyển là xuất kho nội bộ.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2">Hàng</th>
                {state.warehouses.map((w) => (
                  <th key={w.id}>{w.name}</th>
                ))}
                <th>Tổng</th>
                <th>Ngày phủ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((p) => {
                const cols = state.warehouses.map((w) => eng.stockOf(state, p.id, w.id));
                const total = cols.reduce((a, n) => a + n, 0);
                return (
                  <tr key={p.id} className="border-t border-line">
                    <td className="py-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-muted">{p.sku} · {p.track === "lot" ? "theo lô" : p.track === "serial" ? "serial" : "thường"}</div>
                    </td>
                    {cols.map((n, i) => (
                      <td key={state.warehouses[i].id}>{n}</td>
                    ))}
                    <td className="font-semibold">{total}</td>
                    <td>{eng.coverDays(state, p.id) ?? "—"}</td>
                    <td>{total <= p.minQty ? <Pill tone="brown">Sắp hết</Pill> : <Pill tone="green">Đủ</Pill>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Lô và hạn dùng">
          <ul className="space-y-2 text-sm">
            {state.lots.map((l) => {
              const p = state.products.find((x) => x.id === l.productId);
              const left = daysLeft(l.expiry);
              return (
                <li key={l.id} className="flex items-center justify-between rounded-2xl bg-cream px-3 py-2">
                  <span>
                    {p?.name} · {l.lot} · {l.qty}
                  </span>
                  <Pill tone={left !== null && left < 30 ? "danger" : "navy"}>{left === null ? "Không HSD" : `còn ${left} ngày`}</Pill>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Chuyển kho và kiểm kê">
          <div className="grid gap-3">
            <label className="text-sm font-semibold">
              Hàng
              <select className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" value={pid} onChange={(e) => setPid(e.target.value)}>
                {state.products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <Field label="Số lượng chuyển quầy → online" value={qty} onChange={setQty} type="number" />
            <Btn onClick={() => run(eng.transfer(state, pid, "w1", "w2", Number(qty) || 0))}>Lập phiếu chuyển</Btn>
            <Field label="Số đếm thực tế tại quầy" value={counted} onChange={setCounted} type="number" />
            <Btn kind="navy" onClick={() => run(eng.stocktake(state, pid, "w1", Number(counted) || 0))}>Ghi kiểm kê</Btn>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function MuaView() {
  const { state, run } = useSo();
  return (
    <Panel title="Mua hàng" hint="Đơn đặt nhà cung cấp, nhận kho, gắn với hóa đơn đầu vào để khớp ba bước.">
      <div className="space-y-3">
        {state.pos.map((po) => {
          const sup = state.parties.find((p) => p.id === po.supplierId);
          const money = po.lines.reduce((a, l) => a + l.qty * l.price, 0);
          return (
            <article key={po.id} className="rounded-3xl border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg">{po.no}</h3>
                  <p className="text-sm text-muted">{sup?.name} · {vnd(money)}</p>
                </div>
                <Pill tone={po.status === "received" ? "green" : po.status === "partial" ? "brown" : "navy"}>{po.status}</Pill>
              </div>
              <ul className="mt-2 text-sm">
                {po.lines.map((l) => {
                  const p = state.products.find((x) => x.id === l.productId);
                  return (
                    <li key={l.productId}>
                      {p?.name}: đặt {l.qty}, đã nhận {l.received}, giá {vnd(l.price)}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3">
                <Btn onClick={() => run(eng.receivePo(state, po.id))}>Nhận phần còn lại vào kho</Btn>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

export function MasterView() {
  const { state, run, seeCost } = useSo();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("99000");
  const [cname, setCname] = useState("");
  const [mst, setMst] = useState("");
  const [csv, setCsv] = useState("Túi vải Tử Tế,79000,8931001\nNến thơm,129000,8931002");
  return (
    <div className="space-y-4">
      <Panel title="Danh mục hàng" hint="SKU, đơn vị quy đổi, giá vốn, giá bán, thuế suất. Giá trên đơn có thể giảm theo dòng khi bán.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2">Mã</th>
                <th>Tên</th>
                <th>ĐVT</th>
                <th>Giá bán</th>
                <th>Giá vốn</th>
                <th>Thuế</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-2">{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.altUom ? `${p.uom} / ${p.altUom}×${p.altFactor}` : p.uom}</td>
                  <td>{vnd(p.price)}</td>
                  <td>{seeCost ? vnd(p.cost) : "Ẩn"}</td>
                  <td>{Math.round(p.taxRate * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
          <Field label="Hàng mới" value={name} onChange={setName} />
          <Field label="Giá" value={price} onChange={setPrice} type="number" />
          <Btn onClick={() => run(eng.addProduct(state, name, Number(price) || 0))}>Thêm</Btn>
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Nhập bảng (Tên, Giá, Mã vạch)
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={3} className="mt-1 w-full rounded-2xl border border-line bg-cream px-3 py-2" />
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <Btn kind="navy" onClick={() => run(eng.importProducts(state, csv))}>Nhập danh mục</Btn>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-2xl border border-line px-3 text-sm font-semibold">
            Chọn file CSV
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                file.text().then((text) => run(eng.importProducts(state, text)));
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </Panel>
      <Panel title="Khách và nhà cung cấp" hint="MST, hạng điểm, hạn mức công nợ.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {state.parties.filter((p) => p.id !== "c1").map((p) => (
            <li key={p.id} className="rounded-2xl border border-line px-3 py-3 text-sm">
              <div className="font-semibold">{p.name}</div>
              <div className="text-muted">{p.kind === "customer" ? "Khách" : "NCC"} · MST {p.mst || "—"} · nợ {vnd(p.debt)}</div>
              {p.kind === "customer" ? <div>Hạng {p.tier} · {p.points} điểm · hạn mức {vnd(p.limit)}</div> : null}
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Tên mới" value={cname} onChange={setCname} />
          <Field label="MST" value={mst} onChange={setMst} />
        </div>
        <div className="mt-3 flex gap-2">
          <Btn onClick={() => run(eng.addParty(state, "customer", cname, mst))}>Thêm khách</Btn>
          <Btn kind="navy" onClick={() => run(eng.addParty(state, "supplier", cname, mst))}>Thêm NCC</Btn>
        </div>
      </Panel>
    </div>
  );
}
