"use client";

import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ShareProfileThemeButton({ defaultTitle }: { defaultTitle: string }) {
  const [busy, setBusy] = useState(false);

  const share = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/profile/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: defaultTitle || "Giao diện của tôi",
          visibility: "UNLISTED",
          fromPublished: true,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Không tạo được link");
      const url = `${window.location.origin}/t/${body.template.slug}`;
      await navigator.clipboard.writeText(url);
      toast.success("Đã copy link chia sẻ giao diện");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      disabled={busy}
      className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-60"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
      Chia sẻ giao diện
    </button>
  );
}
