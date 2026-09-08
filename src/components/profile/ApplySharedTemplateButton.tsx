"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ApplySharedTemplateButton({ templateId }: { templateId: string }) {
  const { data } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const userId = (data?.user as { id?: string } | undefined)?.id;

  const apply = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/profile/templates/${templateId}/apply`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Không áp dụng được");
      toast.success("Đã đưa mẫu vào bản nháp");
      if (userId) router.push(`/profile/${userId}/customize`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={apply}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl bg-pgreen px-4 py-3 text-sm font-black text-white disabled:opacity-60"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      Dùng mẫu này
    </button>
  );
}
