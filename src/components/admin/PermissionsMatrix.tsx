"use client";

import { Fragment, useMemo, useState } from "react";
import { KeyRound, Loader2, Lock, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AccountType, PermissionKey } from "@/lib/permissions-catalog";
import { hasBit, isLocked } from "@/lib/permissions-catalog";

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
  const [map, setMap] = useState(initialMap);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter(
      (p) => p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.key.includes(q),
    );
  }, [permissions, query]);

  const patch = async (accountType: AccountType, permission: PermissionKey, enabled: boolean) => {
    if (isLocked(accountType, permission) && !enabled) {
      toast.error("Không tắt được quyền bắt buộc của Admin");
      return;
    }
    const token = `${accountType}:${permission}`;
    setPending(token);
    const previous = map;
    setMap((cur) => {
      const bit = 1 << permissions.find((p) => p.key === permission)!.bit;
      const nextMask = enabled ? cur[accountType] | bit : cur[accountType] & ~bit;
      return { ...cur, [accountType]: nextMask };
    });
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType, permission, enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được");
      setMap(data.map);
    } catch (error: any) {
      setMap(previous);
      toast.error(error.message);
    } finally {
      setPending(null);
    }
  };

  const reset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/permissions", { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không khôi phục được");
      setMap(data.map);
      toast.success("Đã về quyền mặc định");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <KeyRound size={12} /> Bitfield
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Phân quyền tài khoản</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Mỗi ô là một bit. Bật/tắt ngay trên lưới — loại tài khoản nào làm được việc gì hiện rõ một nhìn.
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
            onClick={reset}
            disabled={resetting}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {resetting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Mặc định
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {accountTypes.map((type) => {
          const on = countOn(map[type.key], permissions);
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
              <div className="mt-2 font-mono text-[10px] text-gray-400">0x{map[type.key].toString(16).toUpperCase()}</div>
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
                          const on = hasBit(map[type.key], perm.key);
                          const locked = isLocked(type.key, perm.key);
                          const token = `${type.key}:${perm.key}`;
                          const tone = COLOR[type.color] || COLOR.slate;
                          const changed = hasBit(map[type.key], perm.key) !== hasBit(defaults[type.key], perm.key);
                          return (
                            <td key={type.key} className="border-t border-gray-100 px-3 py-4 text-center">
                              <button
                                type="button"
                                disabled={locked || pending === token}
                                onClick={() => patch(type.key, perm.key, !on)}
                                title={locked ? "Bắt buộc với Admin" : on ? "Đang bật — bấm để tắt" : "Đang tắt — bấm để bật"}
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
                                  {pending === token ? (
                                    <Loader2 size={12} className="animate-spin text-gray-400" />
                                  ) : locked ? (
                                    <Lock size={11} className="text-gray-400" />
                                  ) : null}
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
    </div>
  );
}
