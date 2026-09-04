"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Report {
    id: string;
    campaignId: string;
    campaign: { title: string; slug: string };
    user: { name: string; email: string };
    reason: string;
    description: string;
    imageUrls?: string[];
    occurredAt?: string | null;
    targetType?: string;
    targetTitle?: string;
    targetHref?: string | null;
    status: string;
    createdAt: string;
    resolvedAt?: string;
    resolution?: string;
}

const TARGET_LABELS: Record<string, string> = {
    CAMPAIGN: "Chiến dịch",
    PROJECT: "Dự án",
    PRODUCT: "Sản phẩm",
    BLOG: "Bài viết",
    PROFILE: "Trang cá nhân",
};

const REPORT_REASONS: Record<string, string> = {
    FRAUD: "Gian lận",
    INAPPROPRIATE: "Nội dung không phù hợp",
    MISLEADING: "Thông tin sai lệch",
    SCAM: "Lừa đảo",
    INTELLECTUAL_PROPERTY: "Vi phạm bản quyền",
    OTHER: "Khác",
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    PENDING: { icon: Clock, color: "text-yellow-600", label: "Chờ xử lý" },
    REVIEWING: { icon: AlertCircle, color: "text-blue-600", label: "Đang xem xét" },
    RESOLVED: { icon: CheckCircle, color: "text-green-600", label: "Đã giải quyết" },
    DISMISSED: { icon: XCircle, color: "text-gray-600", label: "Bị bác bỏ" },
};

function isAdminUser(user: any) {
    return user?.role === "ADMIN" || user?.isAdmin === true;
}

export default function ReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("PENDING");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }
        if (status === "authenticated" && !isAdminUser(session?.user)) {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (status === "authenticated" && isAdminUser(session?.user)) {
            fetchReports();
        }
    }, [status, session]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/reports");
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Lỗi khi tải báo cáo");
                return;
            }
            setReports(Array.isArray(data) ? data : []);
            setError("");
        } catch (err: any) {
            setError(err.message || "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, nextStatus: "REVIEWING" | "RESOLVED" | "DISMISSED") => {
        const resolution =
            nextStatus === "PENDING" || nextStatus === "REVIEWING"
                ? ""
                : window.prompt(nextStatus === "RESOLVED" ? "Ghi chú xử lý (không bắt buộc)" : "Lý do bác bỏ (không bắt buộc)") ?? "";
        setUpdatingId(id);
        try {
            const res = await fetch("/api/admin/reports", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: nextStatus, resolution }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Không thể cập nhật");
            setReports((current) => current.map((item) => (item.id === id ? { ...item, ...data } : item)));
            toast.success(nextStatus === "RESOLVED" ? "Đã giải quyết báo cáo" : nextStatus === "DISMISSED" ? "Đã bác bỏ báo cáo" : "Đã chuyển sang đang xem xét");
        } catch (err: any) {
            toast.error(err.message || "Không thể cập nhật báo cáo");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredReports = reports.filter((r) => r.status === filter);

    if (status === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 px-6 py-12">
            <div className="mx-auto max-w-7xl">
                <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
                    <h1 className="mb-2 text-3xl font-black text-gray-900">Báo cáo vi phạm</h1>
                    <p className="mb-8 text-gray-500">Xử lý báo cáo chiến dịch, dự án, sản phẩm, blog và trang cá nhân</p>

                    {error && (
                        <div className="mb-6 flex gap-3 rounded-[1.2rem] border border-red-200 bg-red-50 p-4">
                            <AlertCircle className="flex-shrink-0 text-red-600" size={20} />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="mb-6 flex gap-2 border-b border-gray-200">
                        {Object.entries(STATUS_CONFIG).map(([value, config]) => {
                            const count = reports.filter((r) => r.status === value).length;
                            return (
                                <button
                                    key={value}
                                    onClick={() => setFilter(value)}
                                    className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                                        filter === value
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {config.label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {filteredReports.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-gray-500">Không có báo cáo nào</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredReports.map((report) => {
                                const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
                                const StatusIcon = statusConfig.icon;
                                return (
                                    <div key={report.id} className="rounded-[1.2rem] border border-gray-200 p-6">
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                                    <h3 className="font-semibold text-gray-900">{report.targetTitle || report.campaign?.title || "Nội dung"}</h3>
                                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                        {TARGET_LABELS[report.targetType || "CAMPAIGN"] || report.targetType}
                                                    </span>
                                                    <span className={`flex items-center gap-1 text-sm font-semibold ${statusConfig.color}`}>
                                                        <StatusIcon size={16} />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Báo cáo bởi: <strong>{report.user?.name || "Ẩn danh"}</strong> ({report.user?.email})
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-4 rounded-[1rem] bg-gray-50 p-4">
                                            <p className="mb-2 text-sm font-semibold text-gray-900">
                                                Lý do: {REPORT_REASONS[report.reason] || report.reason}
                                            </p>
                                            <p className="whitespace-pre-wrap text-sm text-gray-700">{report.description}</p>
                                            {report.occurredAt && (
                                                <p className="mt-3 text-xs font-semibold text-gray-500">
                                                    Thời gian vụ việc: {new Date(report.occurredAt).toLocaleString("vi-VN")}
                                                </p>
                                            )}
                                            {!!report.imageUrls?.length && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {report.imageUrls.map((url) => (
                                                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                                                            <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover border border-gray-200" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                                            <span>Gửi lúc: {new Date(report.createdAt).toLocaleString("vi-VN")}</span>
                                            {(report.targetHref || report.campaign?.slug) && (
                                                <a
                                                    href={report.targetHref || `/campaigns/${report.campaign.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold text-blue-600 hover:underline"
                                                >
                                                    Xem nội dung →
                                                </a>
                                            )}
                                        </div>

                                        {report.resolution && (
                                            <div className="mt-4 border-t border-gray-200 pt-4">
                                                <p className="mb-2 text-sm font-semibold text-gray-900">Kết luận:</p>
                                                <p className="text-sm text-gray-700">{report.resolution}</p>
                                            </div>
                                        )}

                                        {(report.status === "PENDING" || report.status === "REVIEWING") && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {report.status === "PENDING" && (
                                                    <button
                                                        type="button"
                                                        disabled={updatingId === report.id}
                                                        onClick={() => updateStatus(report.id, "REVIEWING")}
                                                        className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                                    >
                                                        Đang xem xét
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    disabled={updatingId === report.id}
                                                    onClick={() => updateStatus(report.id, "RESOLVED")}
                                                    className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                                >
                                                    Đã giải quyết
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={updatingId === report.id}
                                                    onClick={() => updateStatus(report.id, "DISMISSED")}
                                                    className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                                                >
                                                    Bác bỏ
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
