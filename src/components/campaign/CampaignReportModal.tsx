"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, X, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface CampaignReportModalProps {
    campaignSlug: string;
    campaignTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

const REPORT_REASONS = [
    { value: "FRAUD", label: "Gian lận" },
    { value: "INAPPROPRIATE", label: "Nội dung không phù hợp" },
    { value: "MISLEADING", label: "Thông tin sai lệch" },
    { value: "SCAM", label: "Lừa đảo" },
    { value: "INTELLECTUAL_PROPERTY", label: "Vi phạm bản quyền" },
    { value: "OTHER", label: "Khác" }
];

const MAX_IMAGES = 5;

export default function CampaignReportModal({
    campaignSlug,
    campaignTitle,
    isOpen,
    onClose
}: CampaignReportModalProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [occurredAt, setOccurredAt] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    // If loading session, show loading state
    if (status === "loading") {
        const loadingContent = (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center"
                style={{ position: "fixed", zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0 }}
            >
                <div
                    className="bg-white rounded-[2.5rem] p-8 shadow-2xl"
                    style={{ position: "relative", zIndex: 10000 }}
                >
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            </div>
        );

        return createPortal(loadingContent, document.body);
    }

    // If not authenticated, show login prompt
    if (status === "unauthenticated") {
        const loginContent = (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                style={{ position: "fixed", zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0 }}
            >
                <div
                    className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl"
                    style={{ position: "relative", zIndex: 10000 }}
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3 flex-1">
                            <AlertCircle className="text-orange-500 flex-shrink-0" size={24} />
                            <h2 className="text-xl font-black text-gray-900">Yêu cầu đăng nhập</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm">
                        Bạn cần đăng nhập để báo cáo chiến dịch này. Điều này giúp chúng tôi xác minh báo cáo và bảo vệ cộng đồng.
                    </p>

                    <div className="space-y-3">
                        <Button
                            onClick={() => {
                                router.push(`/auth/login?callbackUrl=/campaigns/${campaignSlug}`);
                                onClose();
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-[1.2rem]"
                        >
                            Đăng nhập
                        </Button>
                        <Button
                            onClick={() => {
                                router.push(`/auth/register?callbackUrl=/campaigns/${campaignSlug}`);
                                onClose();
                            }}
                            variant="outline"
                            className="w-full border-2 border-gray-200 text-gray-900 font-semibold py-3 rounded-[1.2rem] hover:bg-gray-50"
                        >
                            Tạo tài khoản mới
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            className="w-full text-gray-600 font-semibold py-3 rounded-[1.2rem]"
                        >
                            Hủy
                        </Button>
                    </div>
                </div>
            </div>
        );

        return createPortal(loginContent, document.body);
    }

    const handleUpload = async (files: FileList | null) => {
        if (!files?.length) return;
        const remaining = MAX_IMAGES - imageUrls.length;
        if (remaining <= 0) {
            toast.error(`Tối đa ${MAX_IMAGES} ảnh`);
            return;
        }
        const picked = Array.from(files).slice(0, remaining);
        setUploading(true);
        try {
            for (const file of picked) {
                if (!file.type.startsWith("image/")) {
                    toast.error("Chỉ nhận file ảnh");
                    continue;
                }
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} vượt quá 5MB`);
                    continue;
                }
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
                const url = data.secure_url || data.url;
                if (url) setImageUrls((current) => [...current, url].slice(0, MAX_IMAGES));
            }
        } catch (err: any) {
            toast.error(err.message || "Tải ảnh thất bại");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!reason || !description.trim()) {
            setError("Vui lòng chọn lý do và nhập mô tả chi tiết");
            return;
        }

        if (description.trim().length < 20) {
            setError("Mô tả phải có ít nhất 20 ký tự");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/campaigns/${campaignSlug}/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reason,
                    description: description.trim(),
                    imageUrls,
                    occurredAt: occurredAt || null,
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Lỗi khi gửi báo cáo");
                return;
            }

            setSuccess(true);
            setReason("");
            setDescription("");
            setOccurredAt("");
            setImageUrls([]);

            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            style={{ position: "fixed", zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <div
                className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                style={{ position: "relative", zIndex: 10000 }}
            >
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-gray-900">Báo cáo chiến dịch</h2>
                        <p className="text-gray-600 text-sm mt-1 truncate">{campaignTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50 flex-shrink-0 ml-4"
                    >
                        <X size={24} />
                    </button>
                </div>

                {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-[1.2rem] p-6 text-center">
                        <p className="text-green-700 font-semibold">
                            ✓ Báo cáo của bạn đã được gửi thành công
                        </p>
                        <p className="text-green-600 text-sm mt-2">
                            Cảm ơn bạn đã giúp chúng tôi bảo vệ cộng đồng
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-[1.2rem] p-4 flex gap-3">
                                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Lý do báo cáo <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-200 rounded-[1.2rem] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                            >
                                <option value="">-- Chọn lý do --</option>
                                {REPORT_REASONS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Mô tả chi tiết <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                placeholder="Vui lòng cung cấp thông tin chi tiết về vấn đề bạn gặp phải..."
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-200 rounded-[1.2rem] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Tối thiểu 20 ký tự ({description.length}/20)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Thời gian vụ việc <span className="text-xs font-medium text-gray-400">(không bắt buộc)</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={occurredAt}
                                onChange={(e) => setOccurredAt(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-200 rounded-[1.2rem] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Hình ảnh minh chứng <span className="text-xs font-medium text-gray-400">(không bắt buộc, tối đa {MAX_IMAGES} ảnh)</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {imageUrls.map((url) => (
                                    <div key={url} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-gray-200">
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrls((current) => current.filter((item) => item !== url))}
                                            className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                {imageUrls.length < MAX_IMAGES && (
                                    <button
                                        type="button"
                                        disabled={loading || uploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                                        <span className="text-[10px] font-bold">Thêm ảnh</span>
                                    </button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                multiple
                                className="hidden"
                                onChange={(event) => handleUpload(event.target.files)}
                            />
                        </div>

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-[1.2rem] p-4">
                            <p className="text-sm text-blue-700">
                                <strong>Lưu ý:</strong> Báo cáo của bạn sẽ được gửi đến đội quản lý của chúng tôi để xem xét. Chúng tôi sẽ liên hệ với bạn nếu cần thêm thông tin.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={loading || uploading || !reason || description.trim().length < 20}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-[1.2rem] flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {loading ? "Đang gửi..." : "Gửi báo cáo"}
                            </Button>
                            <Button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                variant="outline"
                                className="flex-1 border-2 border-gray-200 text-gray-900 font-semibold py-3 rounded-[1.2rem] disabled:opacity-50"
                            >
                                Hủy
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

    return createPortal(formContent, document.body);
}
