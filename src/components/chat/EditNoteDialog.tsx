"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserName: string;
  existingNote?: string;
  noteId?: string;
}

export function EditNoteDialog({
  open,
  onOpenChange,
  targetUserId,
  targetUserName,
  existingNote = "",
  noteId,
}: EditNoteDialogProps) {
  const [note, setNote] = useState(existingNote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset note when dialog opens
  useEffect(() => {
    if (open) {
      setNote(existingNote);
      setError("");
    }
  }, [open, existingNote]);

  // Save note
  const handleSave = async () => {
    if (!note.trim()) {
      setError("Ghi chú không được để trống");
      return;
    }

    if (note.trim().length > 500) {
      setError("Ghi chú không được quá 500 ký tự");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          note: note.trim(),
        }),
      });

      if (response.ok) {
        onOpenChange(false);
        // Reload notes in parent component
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Không thể lưu ghi chú");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu ghi chú");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi chú cho {targetUserName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Ghi chú này sẽ tự động hết hạn sau 24 giờ.
          </div>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú..."
            className="min-h-[100px] resize-none"
            maxLength={500}
          />

          <div className="text-xs text-gray-400 text-right">
            {note.length}/500
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu ghi chú"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
