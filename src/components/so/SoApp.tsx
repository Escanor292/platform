"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChefHat,
  ClipboardList,
  FileSpreadsheet,
  Landmark,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Receipt,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import type { Role, ViewId } from "@/lib/so/types";
import { vnd } from "@/lib/so/money";
import * as eng from "@/lib/so/engine";
import { SoProvider, useSo } from "./store";
import { HomeView, OutInvoiceView, InInvoiceView, LedgerView, TaxView, ReportView, BankView, PeopleView, CrmView, SystemView, MapView } from "./views-books";
import { PosView, FnbView, OmniView } from "./views-sell";
import { KhoView, MuaView, MasterView } from "./views-stock";

const ROLE_LABEL: Record<Role, string> = {
  owner: "Chủ hộ",
  cashier: "Thu ngân",
  stock: "Thủ kho",
  accountant: "Kế toán",
  kitchen: "Bếp",
};

const NAV: { id: ViewId; label: string; icon: typeof Store; group: string }[] = [
  { id: "pos", label: "Bán quầy", icon: Store, group: "Bán" },
  { id: "fnb", label: "Bàn & bếp", icon: ChefHat, group: "Bán" },
  { id: "omni", label: "Đa kênh", icon: ShoppingBag, group: "Bán" },
  { id: "crm", label: "Khách", icon: Users, group: "Bán" },
  { id: "kho", label: "Kho", icon: Package, group: "Kho" },
  { id: "mua", label: "Mua hàng", icon: ClipboardList, group: "Kho" },
  { id: "dm", label: "Danh mục", icon: ClipboardList, group: "Kho" },
  { id: "hdra", label: "Hóa đơn ra", icon: Receipt, group: "Kế toán" },
  { id: "hdvao", label: "Hóa đơn vào", icon: FileSpreadsheet, group: "Kế toán" },
  { id: "so", label: "Sổ kế toán", icon: BookOpen, group: "Kế toán" },
  { id: "thue", label: "Thuế", icon: Landmark, group: "Kế toán" },
  { id: "bc", label: "Báo cáo", icon: Wallet, group: "Kế toán" },
  { id: "nh", label: "Ngân hàng", icon: Landmark, group: "Kế toán" },
  { id: "home", label: "Tổng quan", icon: LayoutDashboard, group: "Quản trị" },
  { id: "ns", label: "Nhân sự", icon: Users, group: "Quản trị" },
  { id: "ht", label: "Hệ thống", icon: BookOpen, group: "Quản trị" },
  { id: "map", label: "Đủ nghiệp vụ", icon: LayoutDashboard, group: "Quản trị" },
];

const ALLOW: Record<Role, ViewId[] | "all"> = {
  owner: "all",
  cashier: ["pos", "fnb", "omni", "crm", "hdra"],
  stock: ["kho", "mua", "dm", "hdvao"],
  accountant: ["hdra", "hdvao", "so", "thue", "bc", "nh", "home", "map"],
  kitchen: ["fnb"],
};

const PRIMARY: Record<Role, ViewId[]> = {
  owner: ["pos", "home", "kho", "hdra", "so", "ns"],
  cashier: ["pos", "fnb", "omni", "crm"],
  stock: ["kho", "mua", "hdvao", "dm"],
  accountant: ["hdra", "so", "thue", "bc", "nh"],
  kitchen: ["fnb"],
};

function allowed(role: Role, id: ViewId) {
  const list = ALLOW[role];
  return list === "all" || list.includes(id);
}

const PAY_LABEL = { cash: "Tiền mặt", qr: "VietQR", card: "Thẻ", point: "Điểm", debt: "Ghi nợ" };

function Screen() {
  const { view } = useSo();
  if (view === "home") return <HomeView />;
  if (view === "pos") return <PosView />;
  if (view === "fnb") return <FnbView />;
  if (view === "omni") return <OmniView />;
  if (view === "kho") return <KhoView />;
  if (view === "mua") return <MuaView />;
  if (view === "hdra") return <OutInvoiceView />;
  if (view === "hdvao") return <InInvoiceView />;
  if (view === "so") return <LedgerView />;
  if (view === "thue") return <TaxView />;
  if (view === "bc") return <ReportView />;
  if (view === "dm") return <MasterView />;
  if (view === "ns") return <PeopleView />;
  if (view === "crm") return <CrmView />;
  if (view === "nh") return <BankView />;
  if (view === "ht") return <SystemView />;
  return <MapView />;
}

function NavButton({ id, on }: { id: ViewId; on: boolean }) {
  const item = NAV.find((n) => n.id === id)!;
  const { setView } = useSo();
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => setView(id)}
      className={`flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-semibold ${on ? "bg-pgreen/10 text-pgreen" : "text-ink"}`}
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </button>
  );
}

function MorePanel({ onClose }: { onClose: () => void }) {
  const { role, view, setView, reset } = useSo();
  const groups = ["Bán", "Kho", "Kế toán", "Quản trị"];
  return (
    <div className="fixed inset-0 z-30 bg-ink/40" onClick={onClose}>
      <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-surface p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-xl">Việc của {ROLE_LABEL[role]}</p>
          <button type="button" className="min-h-11 px-3 text-sm font-semibold" onClick={onClose}>
            Đóng
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {groups.map((g) => {
            const items = NAV.filter((n) => n.group === g && allowed(role, n.id));
            if (!items.length) return null;
            return (
              <div key={g}>
                <p className="px-2 text-xs font-semibold tracking-wide text-muted uppercase">{g}</p>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setView(item.id);
                      onClose();
                    }}
                    className={`flex min-h-11 w-full items-center rounded-2xl px-2 text-left text-sm font-semibold ${view === item.id ? "text-pgreen" : "text-ink"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <button type="button" className="mt-3 min-h-11 rounded-2xl border border-line text-sm font-semibold" onClick={reset}>
          Trả dữ liệu mẫu
        </button>
      </div>
    </div>
  );
}

function Frame() {
  const { view, setView, role, who, setRole, logout, toast, state, receipt, dismissReceipt, askBox, closeAsk, run, online } = useSo();
  const [more, setMore] = useState(false);
  const open = state.shifts.find((s) => s.status === "open");
  const primary = PRIMARY[role];

  useEffect(() => {
    if (!allowed(role, view)) setView(primary[0]);
  }, [role, view, primary, setView]);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-surface p-3 md:flex">
          <div className="px-2 pb-3">
            <p className="font-display text-2xl">
              Tử Tế <span className="text-pgreen">Sổ</span>
            </p>
            <p className="text-xs text-muted">{ROLE_LABEL[role]}</p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {primary.map((id) => (
              <NavButton key={id} id={id} on={view === id} />
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setMore(true)}
            className="mt-2 flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold text-ink"
          >
            <MoreHorizontal className="size-4" />
            Tất cả việc
          </button>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-cream/95 px-4 py-2 backdrop-blur md:px-5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {state.settings.branch}
                <span className="font-normal text-muted"> · {open ? `Ca ${open.user}` : "Chưa mở ca"}</span>
              </p>
              <p className="truncate text-xs text-muted">
                {open ? `Quỹ ca ${vnd(open.sales)}` : "Mở ca trước khi giao két"} · MST {state.settings.mst}
              </p>
            </div>
            <Link href="/dashboard/admin" className="hidden min-h-11 items-center rounded-2xl px-2 text-sm font-semibold text-navy sm:inline-flex">
              Về quản trị
            </Link>
            <label className="shrink-0 text-sm font-semibold">
              <span className="sr-only">Vai trò</span>
              {who?.role === "owner" ? (
                <select
                  className="min-h-11 rounded-2xl border border-line bg-surface px-3"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-2xl border border-line bg-surface px-3">
                  {who?.name}
                </span>
              )}
            </label>
            <button type="button" className="min-h-11 rounded-2xl border border-line bg-surface px-3 text-sm font-semibold" onClick={logout}>
              Ra ca
            </button>
          </header>
          <main className="px-3 py-3 pb-24 md:px-5 md:pb-8">
            {!online ? (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-ebrown/10 px-3 py-2 text-sm">
                <span>Mất mạng. Vẫn bán được. Hóa đơn xếp hàng, chưa gửi cơ quan thuế.</span>
                <button
                  type="button"
                  className="min-h-11 rounded-2xl bg-navy px-3 font-semibold text-surface"
                  onClick={() => run({ state, message: "Vẫn mất mạng. Hóa đơn nằm trong máy cho đến khi có sóng." })}
                >
                  Chưa gửi được
                </button>
              </div>
            ) : state.invoices.some((i) => i.note?.includes("Xếp hàng")) ? (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-pgreen/10 px-3 py-2 text-sm">
                <span>Có hóa đơn chờ mạng.</span>
                <button type="button" className="min-h-11 rounded-2xl bg-pgreen px-3 font-semibold text-surface" onClick={() => run(eng.flushInvoices(state))}>
                  Đóng dấu hóa đơn chờ
                </button>
              </div>
            ) : null}
            <Screen />
          </main>
        </div>
      </div>
      <nav className={`fixed inset-x-0 bottom-0 z-20 grid border-t border-line bg-surface md:hidden ${primary.length <= 1 ? "grid-cols-2" : primary.length === 2 ? "grid-cols-3" : primary.length === 3 ? "grid-cols-4" : "grid-cols-5"}`}>
        {primary.slice(0, 4).map((id) => {
          const item = NAV.find((n) => n.id === id)!;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`min-h-14 px-1 text-xs font-semibold ${view === id ? "text-pgreen" : "text-muted"}`}
            >
              {item.label}
            </button>
          );
        })}
        <button type="button" onClick={() => setMore(true)} className="min-h-14 text-xs font-semibold text-muted">
          Thêm
        </button>
      </nav>
      {more ? <MorePanel onClose={() => setMore(false)} /> : null}
      {receipt ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-surface p-5">
            <p className="text-sm font-semibold text-pgreen">Đã thu</p>
            <h2 className="font-display text-3xl">{receipt.no}</h2>
            <p className="mt-1 font-display text-2xl">{vnd(receipt.total)}</p>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Cách thu</dt><dd>{PAY_LABEL[receipt.method]}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Khách đưa</dt><dd>{vnd(receipt.tendered)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tiền thừa</dt><dd className="font-semibold">{vnd(receipt.change)}</dd></div>
              <div className="flex justify-between">
                <dt className="text-muted">Hóa đơn</dt>
                <dd>{receipt.invoiceNo ? `${receipt.invoiceNo}${receipt.cqt ? ` · dấu ${receipt.cqt}` : receipt.queued ? " · chờ mạng" : " · từ chối"}` : "Chưa xuất"}</dd>
              </div>
              {receipt.waitingPay ? <p className="text-sm text-navy">Tiền chưa về. Nội dung chuyển khoản phải đúng số đơn {receipt.no}.</p> : null}
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className="min-h-11 rounded-2xl bg-pgreen font-semibold text-surface" onClick={dismissReceipt}>
                Đơn mới
              </button>
              <button
                type="button"
                className="min-h-11 rounded-2xl border border-line font-semibold"
                onClick={() => printBill(state, receipt)}
              >
                In bill
              </button>
              {receipt.invoiceNo && allowed(role, "hdra") ? (
                <button
                  type="button"
                  className="col-span-2 min-h-11 rounded-2xl bg-navy font-semibold text-surface"
                  onClick={() => {
                    dismissReceipt();
                    setView("hdra");
                  }}
                >
                  Xem hóa đơn
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {askBox ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-surface p-5">
            <h2 className="font-display text-2xl">{askBox.title}</h2>
            <p className="mt-2 text-sm text-muted">{askBox.body}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className="min-h-11 rounded-2xl border border-line font-semibold" onClick={closeAsk}>
                Để đó
              </button>
              <button
                type="button"
                className="min-h-11 rounded-2xl bg-danger font-semibold text-surface"
                onClick={() => {
                  const fn = askBox.run;
                  closeAsk();
                  fn();
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="fixed bottom-20 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-sm text-cream md:bottom-6">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function printBill(state: { settings: { tradeName: string; mst: string; address: string } }, receipt: { no: string; total: number; tendered: number; change: number; invoiceNo?: string; cqt?: string; lines: { name: string; qty: number; amount: number }[] }) {
  const rows = receipt.lines.map((l) => `<tr><td>${l.name}</td><td>${l.qty}</td><td style="text-align:right">${l.amount.toLocaleString("vi-VN")}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${receipt.no}</title>
<style>@page{size:80mm auto;margin:4mm}body{font-family:ui-monospace,monospace;font-size:12px;width:72mm;margin:0}h1{font-size:14px;margin:0}table{width:100%;border-collapse:collapse}td{padding:2px 0}</style></head>
<body><h1>${state.settings.tradeName}</h1><p>MST ${state.settings.mst}<br>${state.settings.address}</p><p>${receipt.no}</p><table>${rows}</table>
<p>Tổng ${receipt.total.toLocaleString("vi-VN")} đ<br>Khách đưa ${receipt.tendered.toLocaleString("vi-VN")} đ<br>Thừa ${receipt.change.toLocaleString("vi-VN")} đ</p>
<p>${receipt.invoiceNo ? `${receipt.invoiceNo} ${receipt.cqt || "chờ mã"}` : ""}</p>
<script>window.print()<\/script></body></html>`;
  const w = window.open("", "bill", "width=360,height=640");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

function Login() {
  const { state, login, toast } = useSo();
  const [id, setId] = useState(state.staff[1]?.id || state.staff[0]?.id || "");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 text-ink">
      <form
        className="w-full max-w-md rounded-3xl border border-line bg-surface p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!login(id, pin)) setErr("Sai mã ca.");
        }}
      >
        <p className="font-display text-3xl">
          Tử Tế <span className="text-pgreen">Sổ</span>
        </p>
        <p className="mt-1 text-sm text-muted">Mỗi người một mã ca. Thu ngân không thấy giá vốn.</p>
        <label className="mt-4 block text-sm font-semibold">
          Người làm
          <select className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3" value={id} onChange={(e) => setId(e.target.value)}>
            {state.staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Mã ca
          <input
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-cream px-3 tracking-widest"
            placeholder="4 số"
          />
        </label>
        <details className="mt-3 text-sm text-muted">
          <summary className="cursor-pointer font-semibold">Mã ca bản thử</summary>
          <ul className="mt-2 space-y-1">
            {state.staff.map((s) => (
              <li key={s.id}>{s.name}: {s.pin}</li>
            ))}
          </ul>
        </details>
        {err ? <p className="mt-2 text-sm text-danger">{err}</p> : null}
        <button type="submit" className="mt-4 min-h-12 w-full rounded-2xl bg-pgreen font-semibold text-surface">
          Vào ca
        </button>
        {toast ? <p className="mt-2 text-sm text-muted">{toast}</p> : null}
      </form>
    </div>
  );
}

export function SoApp() {
  return (
    <SoProvider>
      <Gate />
    </SoProvider>
  );
}

function Gate() {
  const { who } = useSo();
  if (!who) return <Login />;
  return <Frame />;
}
