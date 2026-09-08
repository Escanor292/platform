"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditNoteDialog } from "@/components/chat/EditNoteDialog";
import { cn } from "@/lib/utils";

export function ProfileNoteBubble({
  userId,
  userName,
  initialNote,
  canEdit,
}: {
  userId: string;
  userName: string;
  initialNote?: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const note = (initialNote || "").trim();
  if (!canEdit && !note) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (canEdit) setOpen(true);
        }}
        className={cn(
          "absolute -top-4 left-1/2 z-20 w-max max-w-[148px] -translate-x-1/2 rounded-2xl border border-white/80 bg-white px-2.5 py-1.5 text-center text-[11px] leading-tight shadow-md line-clamp-2",
          note ? "text-gray-800" : "text-gray-400",
          canEdit ? "cursor-pointer hover:shadow-lg" : "cursor-default",
        )}
        title={note || "Thêm ghi chú 24 giờ"}
      >
        {note || "Ghi chú..."}
      </button>
      {canEdit && (
        <EditNoteDialog
          open={open}
          onOpenChange={setOpen}
          targetUserId={userId}
          targetUserName={userName}
          existingNote={note}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  );
}
