"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "./UserAvatar";
import { useEffect, useState } from "react";
import { X, Loader2, Search, Flag, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReportEvidenceFields from "@/components/report/ReportEvidenceFields";

interface ChatInfoPanelProps {
  conversationId: string;
  otherUserId?: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  otherUserRole?: string;
  /** Tài khoản đối phương đã bị xóa khỏi hệ thống */
  otherUserDeleted?: boolean;
  campaign?: {
    campaignId: string;
    title: string;
    coverImage?: string;
    currentAmount: number;
    goalAmount: number;
  };
  onClose?: () => void;
}

const INFO_REPORT_REASONS = [
  { value: "spam", label: "Spam / Quảng cáo" },
  { value: "harassment", label: "Quấy rối / Bắt nạt" },
  { value: "inappropriate", label: "Nội dung không phù hợp" },
  { value: "scam", label: "Lừa đảo" },
  { value: "other", label: "Lý do khác" },
];

export function ChatInfoPanel({
  conversationId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  otherUserRole,
  otherUserDeleted = false,
  campaign,
  onClose,
}: ChatInfoPanelProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [sharedMedia, setSharedMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Report dialog state
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDescription, setReportDescription] = useState("");
  const [reportOccurredAt, setReportOccurredAt] = useState("");
  const [reportImages, setReportImages] = useState<string[]>([]);
  const [reporting, setReporting] = useState(false);

  // Block state
  const [blocking, setBlocking] = useState(false);

  // Load shared media from messages with attachments
  useEffect(() => {
    let cancelled = false;
    const loadSharedMedia = async () => {
      try {
        const response = await fetch(
          `/api/chat/conversations/${conversationId}/messages?limit=100`
        );
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        const mediaItems: any[] = [];
        (data.messages || []).forEach((msg: any) => {
          if (msg.attachments) {
            msg.attachments.forEach((att: any) => {
              if (att.type === "image" || att.type === "file") {
                mediaItems.push({
                  url: att.url,
                  type: att.type,
                  filename: att.filename,
                  senderName: msg.senderName,
                });
              }
            });
          }
        });
        setSharedMedia(mediaItems);
      } catch (err) {
        console.error("Load shared media error:", err);
      }
    };
    if (conversationId) {
      setLoading(true);
      loadSharedMedia().finally(() => {
        if (!cancelled) setLoading(false);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const handleReport = async () => {
    if (!reportDescription.trim()) {
      alert("Vui lòng mô tả lý do báo cáo");
      return;
    }
    try {
      setReporting(true);
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: reportReason,
            description: reportDescription.trim(),
            imageUrls: reportImages,
            occurredAt: reportOccurredAt || null,
          }),
        }
      );
      if (response.ok) {
        setShowReportDialog(false);
        setReportDescription("");
        setReportOccurredAt("");
        setReportImages([]);
        alert(
          "Cảm ơn bạn đã báo cáo. Đội ngũ quản trị sẽ xem xét trong thời gian sớm nhất."
        );
      } else {
        const data = await response.json();
        alert(data.error || "Không thể gửi báo cáo");
      }
    } catch (err: any) {
      console.error("Report error:", err);
      alert(err.message || "Không thể gửi báo cáo");
    } finally {
      setReporting(false);
    }
  };

  const handleBlockUser = async () => {
    if (!confirm(`Bạn có chắc chắn muốn chặn ${otherUserName || "người dùng này"}?`)) {
      return;
    }
    try {
      setBlocking(true);
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/block`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        alert("Người dùng đã bị chặn. Cuộc trò chuyện này sẽ bị ẩn.");
        router.push("/chat");
      } else {
        const data = await response.json();
        alert(data.error || "Không thể chặn người dùng");
      }
    } catch (err: any) {
      console.error("Block error:", err);
      alert(err.message || "Không thể chặn người dùng");
    } finally {
      setBlocking(false);
    }
  };

  const handleSearchInConversation = () => {
    // Dispatch a custom event so ChatWindow can open its search dialog.
    // ChatWindow also has its own "Tìm kiếm" menu, so this is a convenience.
    window.dispatchEvent(
      new CustomEvent("chat:open-search", { detail: { conversationId } })
    );
    alert(
      "Sử dụng nút 🔍 Tìm kiếm trên thanh công cụ của khung chat để tìm trong cuộc trò chuyện này."
    );
  };

  if (!otherUserId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Chọn cuộc trò chuyện để xem thông tin</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Thông tin</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Đóng thông tin"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* User info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col items-center text-center">
            <UserAvatar
              src={otherUserAvatar}
              name={otherUserName || "Người dùng"}
              size="lg"
              userId={otherUserId}
              clickable={true}
              deleted={otherUserDeleted}
            />
            <h3 className={`mt-3 font-semibold ${otherUserDeleted ? "text-gray-400 italic" : "text-gray-900"}`}>
              {otherUserDeleted ? "Người dùng đã xóa" : otherUserName}
            </h3>
            <p className="text-sm text-gray-500">
              {otherUserDeleted ? "Tài khoản đã xóa" : otherUserRole || "Người dùng"}
            </p>
          </div>
        </div>

        {/* Campaign info */}
        {campaign && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Chiến dịch
            </h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm truncate">
                {campaign.title}
              </p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${(campaign.currentAmount / campaign.goalAmount) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((campaign.currentAmount / campaign.goalAmount) * 100).toFixed(0)}% đạt được
              </p>
            </div>
          </div>
        )}

        {/* Shared media */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Media chia sẻ
          </h4>
          {loading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : sharedMedia.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có media nào</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((media, index) => (
                <a
                  key={index}
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={media.filename}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden block"
                >
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt={media.filename || "Media"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <span className="text-[10px] text-gray-500 text-center truncate">
                        {media.filename}
                      </span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Tùy chọn
          </h4>
          <div className="space-y-2">
            <button
              onClick={handleSearchInConversation}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm trong cuộc trò chuyện
            </button>
            <button
              onClick={() => setShowReportDialog(true)}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Flag className="h-4 w-4" />
              Báo cáo cuộc trò chuyện
            </button>
            <button
              onClick={handleBlockUser}
              disabled={blocking}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {blocking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Chặn người dùng
            </button>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              Báo cáo cuộc trò chuyện
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Lý do báo cáo
              </label>
              {INFO_REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="info-report-reason"
                    value={reason.value}
                    checked={reportReason === reason.value}
                    onChange={() => setReportReason(reason.value)}
                    className="accent-red-500"
                  />
                  <span className="text-sm text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="min-h-24"
              />
            </div>
            <ReportEvidenceFields
              occurredAt={reportOccurredAt}
              onOccurredAtChange={setReportOccurredAt}
              imageUrls={reportImages}
              onImageUrlsChange={setReportImages}
              disabled={reporting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleReport}
              disabled={reporting || !reportDescription.trim()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {reporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi báo cáo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
