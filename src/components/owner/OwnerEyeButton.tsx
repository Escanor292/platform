"use client";

import { Eye, EyeOff } from "lucide-react";
import { useOwnerView } from "./OwnerViewContext";

export function OwnerEyeButton() {
  const { isOwner, guestPreview, toggleGuestPreview } = useOwnerView();
  if (!isOwner) return null;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-3 z-[61] flex flex-col items-start gap-2 md:bottom-6 md:left-6">
      {guestPreview && (
        <div className="rounded-2xl border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-dblue shadow-soft">
          Đang xem như khách
        </div>
      )}
      <button
        type="button"
        onClick={toggleGuestPreview}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pgreen to-fgreen text-white shadow-lg transition hover:scale-105"
        title={guestPreview ? "Quay lại giao diện chủ" : "Xem giao diện khách"}
        aria-label={guestPreview ? "Quay lại giao diện chủ" : "Xem giao diện khách"}
      >
        {guestPreview ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
