"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Report {
    id: string;
    campaignId: string;
    campaign: { title: string; slug: string };
    user: { name: string; email: string };
    reason: string;
    description: string;
    status: string;
    createdAt: string;
    resolvedAt?: string;
    resolution?: string;
}

const REPORT_REASONS: Record<string, string> = {
    FRAUD: "Gian lận",
    INAPPROPRIATE: "Nội dung không phù hợp",
    MISLEADING: "Thông tin sai lệch",
    SCAM: "Lừa đảo",
    INTELLECTUAL_PROPERTY: "Vi phạm bản quyền",
    OTHER: "Khác"
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    PENDING: { icon: Clock, color: "text-yellow-600", label: "Chờ xử lý" },
    REVIEWING: { icon: AlertCircle, color: "text-blue-600", label: "Đang xem xét" },
    RESOLVED: { icon: CheckCircle, color: "text-green-600", label: "Đã giải quyết" },
    DISMISSED: { icon: XCircle, color: "text-gray-600", label: "Bị bác bỏ" }
};

export default function ReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("PENDING");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }

        if (status === "authenticated" && !(session?.user as any)?.isAdmin) {
            router.push("/");
            return;
        }
    }, [status, session, router]);

    useEffect(() => {
        if (status === "authenticated" && (session?.user as any)?.isAdmin) {
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

            setReports(data);
        } catch (err: any) {
            setError(err.message || "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => r.status === filter);

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-soft">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Báo cáo chiến dịch</h1>
                    <p className="text-gray-600 mb-8">Quản lý báo cáo từ người dùng</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-[1.2rem] p-4 mb-6 flex gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-200">
                        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                            const count = reports.filter(r => r.status === status).length;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${filter === status
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    {config.label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Reports List */}
                    {filteredReports.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Không có báo cáo nào</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredReports.map((report) => {
                                const statusConfig = STATUS_CONFIG[report.status];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={report.id}
                                        className="border border-gray-200 rounded-[1.2rem] p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {report.campaign.title}
                                                    </h3>
                                                    <span className={`flex items-center gap-1 text-sm font-semibold ${statusConfig.color}`}>
                                                        <StatusIcon size={16} />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Báo cáo bởi: <strong>{report.user.name}</strong> ({report.user.email})
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-[1rem] p-4 mb-4">
                                            <p className="text-sm font-semibold text-gray-900 mb-2">
                                                Lý do: {REPORT_REASONS[report.reason] || report.reason}
                                            </p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {report.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                Gửi lúc: {new Date(report.createdAt).toLocaleString("vi-VN")}
                                            </span>
                                            <a
                                                href={`/campaigns/${report.campaign.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline font-semibold"
                                            >
                                                Xem chiến dịch →
                                            </a>
                                        </div>

                                        {report.resolution && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-sm font-semibold text-gray-900 mb-2">Kết luận:</p>
                                                <p className="text-sm text-gray-700">{report.resolution}</p>
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
