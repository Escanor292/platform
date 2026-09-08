"use client";

import { Fragment, useMemo, useState } from "react";
import { Check, KeyRound, Loader2, Lock, RotateCcw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AccountType, PermissionKey } from "@/lib/permissions-catalog";
import { hasBit, isLocked, setBit } from "@/lib/permissions-catalog";

type AccountMeta = { key: AccountType; label: string; hint: string; color: string };
type PermMeta = { key: PermissionKey; bit: number; group: string; label: string; description: string };
type GroupMeta = { key: string; label: string };

const COLOR: Record<string, { chip: string; on: string; head: string }> = {
  slate: { chip: "bg-slate-100 text-slate-700", on: "bg-slate-700", head: "text-slate-600" },
  sky: { chip: "bg-sky-100 text-sky-800", on: "bg-sky-500", head: "text-sky-700" },
  amber: { chip: "bg-amber-100 text-amber-800", on: "bg-amber-500", head: "text-amber-700" },
  emerald: { chip: "bg-emerald-100 text-emerald-800", on: "bg-emerald-500", head: "text-emerald-700" },
  violet: { chip: "bg-violet-100 text-violet-800", on: "bg-violet-500", head: "text-violet-700" },
  rose: { chip: "bg-rose-100 text-rose-800", on: "bg-rose-500", head: "text-rose-700" },
};

function countOn(mask: number, permissions: PermMeta[]) {
  return permissions.filter((p) => hasBit(mask, p.key)).length;
}

function mapsEqual(a: Record<AccountType, number>, b: Record<AccountType, number>) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function PermissionsMatrix({
  accountTypes,
  groups,
  permissions,
  initialMap,
  defaults,
}: {
  accountTypes: AccountMeta[];
  groups: GroupMeta[];
  permissions: PermMeta[];
  initialMap: Record<AccountType, number>;
  defaults: Record<AccountType, number>;
}) {
  const [saved, setSaved] = useState(initialMap);
  const [draft, setDraft] = useState(initialMap);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dirty = !mapsEqual(draft, saved);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter(
      (p) => p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.key.includes(q),
    );
  }, [permissions, query]);

  const toggle = (accountType: AccountType, permission: PermissionKey, enabled: boolean) => {
    if (isLocked(accountType, permission) && !enabled) {
      toast.error("Không tắt được quyền bắt buộc của Admin");
      return;
    }
    setDraft((cur) => ({ ...cur, [accountType]: setBit(cur[accountType], permission, enabled) }));
  };

  const persist = async (payload: Record<string, unknown>, success: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được");
      setSaved(data.map);
      setDraft(data.map);
      toast.success(success);
      setConfirmOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <KeyRound size={12} /> Bitfield
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Phân quyền tài khoản</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Bật/tắt trên lưới chỉ là bản nháp. Quyền chỉ áp dụng sau khi bấm lưu và xác nhận.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm quyền..."
              className="h-11 w-64 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-gray-900"
            />
          </div>
          <button
            type="button"
            onClick={() => setDraft(defaults)}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Mặc định
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {accountTypes.map((type) => {
          const on = countOn(draft[type.key], permissions);
          const tone = COLOR[type.color] || COLOR.slate;
          return (
            <div key={type.key} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider", tone.chip)}>
                {type.label}
              </div>
              <div className="mt-3 text-3xl font-black text-gray-900">
                {on}
                <span className="text-base font-bold text-gray-300">/{permissions.length}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">{type.hint}</div>
              <div className="mt-2 font-mono text-[10px] text-gray-400">0x{draft[type.key].toString(16).toUpperCase()}</div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-white px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Quyền
                </th>
                {accountTypes.map((type) => {
                  const tone = COLOR[type.color] || COLOR.slate;
                  return (
                    <th key={type.key} className={cn("px-3 py-4 text-center text-[11px] font-black uppercase tracking-widest", tone.head)}>
                      {type.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => {
                const rows = filtered.filter((p) => p.group === group.key);
                if (rows.length === 0) return null;
                return (
                  <Fragment key={group.key}>
                    <tr>
                      <td colSpan={accountTypes.length + 1} className="bg-slate-50 px-6 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                        {group.label}
                      </td>
                    </tr>
                    {rows.map((perm) => (
                      <tr key={perm.key} className="group hover:bg-slate-50/80">
                        <td className="sticky left-0 z-10 border-t border-gray-100 bg-white px-6 py-4 group-hover:bg-slate-50/80">
                          <div className="font-bold text-gray-900">{perm.label}</div>
                          <div className="mt-0.5 text-xs text-gray-400">{perm.description}</div>
                          <div className="mt-1 font-mono text-[10px] text-gray-300">bit {perm.bit} · {perm.key}</div>
                        </td>
                        {accountTypes.map((type) => {
                          const on = hasBit(draft[type.key], perm.key);
                          const locked = isLocked(type.key, perm.key);
                          const tone = COLOR[type.color] || COLOR.slate;
                          const changed = hasBit(draft[type.key], perm.key) !== hasBit(defaults[type.key], perm.key);
                          return (
                            <td key={type.key} className="border-t border-gray-100 px-3 py-4 text-center">
                              <button
                                type="button"
                                disabled={locked}
                                onClick={() => toggle(type.key, perm.key, !on)}
                                title={locked ? "Bắt buộc với Admin" : on ? "Bản nháp: đang bật" : "Bản nháp: đang tắt"}
                                className={cn(
                                  "relative mx-auto flex h-8 w-14 items-center rounded-full transition",
                                  on ? tone.on : "bg-gray-200",
                                  locked && "opacity-80",
                                )}
                              >
                                <span
                                  className={cn(
                                    "absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition",
                                    on && "translate-x-6",
                                  )}
                                >
                                  {locked ? <Lock size={11} className="text-gray-400" /> : null}
                                </span>
                              </button>
                              {changed && <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-amber-500">khác mặc định</div>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-gray-900 bg-gray-900 px-4 py-3 text-white shadow-2xl">
            <p className="text-sm font-semibold">Có thay đổi chưa lưu. Quyền chưa áp dụng cho người dùng.</p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setDraft(saved)}
                className="inline-flex h-10 items-center gap-1 rounded-xl bg-white/10 px-3 text-sm font-bold hover:bg-white/20"
              >
                <X size={14} /> Hủy
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex h-10 items-center gap-1 rounded-xl bg-white px-4 text-sm font-black text-gray-900"
              >
                <Check size={14} /> Lưu phân quyền
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black text-gray-900">Xác nhận lưu phân quyền?</h2>
            <p className="mt-2 text-sm text-gray-500">
              Thay đổi sẽ áp dụng ngay cho mọi tài khoản theo loại. Admin không thể bị tắt quyền vào trang quản trị.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={saving}
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => persist({ map: draft }, "Đã lưu phân quyền")}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-black text-white disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
