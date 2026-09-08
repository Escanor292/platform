"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({
  title,
  text,
  path,
  className,
}: {
  title: string;
  text?: string;
  path?: string;
  className?: string;
}) {
  const share = async () => {
    const url = path
      ? `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`
      : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: text || title, url });
        return;
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã copy link chia sẻ");
    } catch {
      toast.error("Không copy được link");
    }
  };

  return (
    <button type="button" onClick={share} className={className} title="Chia sẻ">
      <Share2 className="h-5 w-5" />
    </button>
  );
}
