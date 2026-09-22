'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatVND, formatDate, extractTextFromDescription } from '@/lib/utils';
import {
    Calendar,
    Users,
    Target,
    Edit,
    BarChart3,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    TrendingUp,
    Gift,
    FolderKanban
} from 'lucide-react';
import { CampaignGrowthProgress } from '@/components/campaign/CampaignGrowthProgress';
import { toast } from 'sonner';
import CampaignSubmitBar from '@/components/campaign/CampaignSubmitBar';
import { campaignModerationLabel } from '@/lib/moderation/policy';

interface Campaign {
    id: string;
    slug: string;
    title: string;
    description: string;
    campaignCode: string;
    imageUrl: string | null;
    status: string;
    currentAmount: number;
    goalAmount: number;
    endDate: Date | null;
    createdAt: Date;
    projectId: string | null;
    _count: {
        pledges: number;
    };
    rejectionReason?: string | null;
}

interface ProjectOption {
    id: string;
    title: string;
}

interface CampaignListViewProps {
    campaigns: Campaign[];
    projects?: ProjectOption[];
}

export default function CampaignListView({ campaigns, projects = [] }: CampaignListViewProps) {
    const [assigningProject, setAssigningProject] = useState<string | null>(null);

    const handleAssignProject = async (campaignSlug: string, projectId: string | null) => {
        setAssigningProject(campaignSlug);
        try {
            const response = await fetch(`/api/campaigns/${campaignSlug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Không thể gán Project');
            }

            toast.success(projectId ? 'Đã gán vào Project' : 'Đã tách khỏi Project');
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lỗi gán Project');
        } finally {
            setAssigningProject(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
            DRAFT: {
                label: campaignModerationLabel('DRAFT'),
                color: 'bg-gray-100 text-gray-600',
                icon: FileText
            },
            PENDING_REVIEW: {
                label: campaignModerationLabel('PENDING_REVIEW'),
                color: 'bg-amber-100 text-amber-700',
                icon: Clock
            },
            ACTIVE: {
                label: campaignModerationLabel('ACTIVE'),
                color: 'bg-emerald-100 text-emerald-600',
                icon: TrendingUp
            },
            SUCCESS: {
                label: campaignModerationLabel('SUCCESS'),
                color: 'bg-blue-100 text-blue-600',
                icon: CheckCircle
            },
            FAILED: {
                label: campaignModerationLabel('FAILED'),
                color: 'bg-red-100 text-red-600',
                icon: XCircle
            },
            CANCELED: {
                label: campaignModerationLabel('CANCELED'),
                color: 'bg-red-100 text-red-600',
                icon: XCircle
            }
        };

        const config = statusConfig[status] || statusConfig.DRAFT;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getProgressPercentage = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const getDaysLeft = (endDate?: Date | null) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    if (campaigns.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy chiến dịch</h3>
                <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="hidden border-b border-gray-100 bg-gray-50 px-6 py-4 lg:block">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <div className="col-span-4">Chiến dịch</div>
                    <div className="col-span-2">Trạng thái</div>
                    <div className="col-span-2">Tiến độ</div>
                    <div className="col-span-2">Thống kê</div>
                    <div className="col-span-2">Thao tác</div>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {campaigns.map((campaign) => {
                    const progress = getProgressPercentage(campaign.currentAmount, campaign.goalAmount);
                    const daysLeft = getDaysLeft(campaign.endDate);
                    const thumb = (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            {campaign.imageUrl ? (
                                <img
                                    src={campaign.imageUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                                    <Target className="text-white" size={20} />
                                </div>
                            )}
                        </div>
                    );
                    const actions = (
                        <div className="flex flex-wrap items-center gap-1">
                            <Link
                                href={`/campaigns/${campaign.slug}`}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                title="Xem chiến dịch"
                            >
                                <Eye size={16} />
                            </Link>
                            <Link
                                href={`/dashboard/creator/edit/${campaign.slug}`}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="Chỉnh sửa"
                            >
                                <Edit size={16} />
                            </Link>
                            <Link
                                href={`/dashboard/creator/rewards/${campaign.slug}`}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
                                title="Quà tặng"
                            >
                                <Gift size={16} />
                            </Link>
                            <Link
                                href={`/dashboard/creator/statement/${campaign.id}`}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
                                title="Báo cáo"
                            >
                                <BarChart3 size={16} />
                            </Link>
                        </div>
                    );

                    return (
                        <div key={campaign.id} className="transition-colors hover:bg-gray-50">
                            <div className="space-y-3 p-4 lg:hidden">
                                <div className="flex gap-3">
                                    {thumb}
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/campaigns/${campaign.slug}`}
                                            className="block break-words font-semibold leading-snug text-gray-900 hover:text-emerald-600"
                                        >
                                            {campaign.title}
                                        </Link>
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                            {extractTextFromDescription(campaign.description)}
                                        </p>
                                        <p className="mt-1 break-all font-mono text-[11px] text-gray-400">
                                            #{campaign.campaignCode}
                                        </p>
                                        <p className="text-[11px] text-gray-400">{formatDate(campaign.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {getStatusBadge(campaign.status)}
                                    {daysLeft !== null && campaign.status === "ACTIVE" && (
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                            <Clock size={12} />
                                            {daysLeft > 0 ? `${daysLeft} ngày` : "Hết hạn"}
                                        </span>
                                    )}
                                </div>

                                <CampaignSubmitBar
                                    slug={campaign.slug}
                                    status={campaign.status}
                                    rejectionReason={campaign.rejectionReason}
                                    successPledgeCount={campaign._count.pledges}
                                />

                                <div>
                                    <CampaignGrowthProgress
                                        currentAmount={campaign.currentAmount}
                                        goalAmount={campaign.goalAmount}
                                        variant="compact"
                                        size="sm"
                                        showTree={false}
                                    />
                                    <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        Mục tiêu: {formatVND(campaign.goalAmount)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-sm">
                                    <Users size={14} className="text-gray-400" />
                                    <span className="font-semibold text-gray-900">{campaign._count.pledges}</span>
                                    <span className="text-xs text-gray-500">người ủng hộ</span>
                                    <span className="ml-auto text-xs font-bold text-gray-500">{Math.round(progress)}%</span>
                                </div>

                                {projects.length > 0 && (
                                    <select
                                        value={campaign.projectId || ""}
                                        onChange={(e) => handleAssignProject(campaign.slug, e.target.value || null)}
                                        disabled={assigningProject === campaign.slug}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                        title="Gán vào Project"
                                    >
                                        <option value="">Chưa có project</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.title}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {actions}
                            </div>

                            <div className="hidden grid-cols-12 items-center gap-4 px-6 py-4 lg:grid">
                                <div className="col-span-4 min-w-0">
                                    <div className="flex items-center gap-4">
                                        {thumb}
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/campaigns/${campaign.slug}`}
                                                className="block truncate font-semibold text-gray-900 transition-colors hover:text-emerald-600"
                                            >
                                                {campaign.title}
                                            </Link>
                                            <p className="mt-1 truncate text-sm text-gray-500">
                                                {extractTextFromDescription(campaign.description)}
                                            </p>
                                            <div className="mt-2 flex min-w-0 items-center gap-2">
                                                <span className="truncate font-mono text-xs text-gray-400">
                                                    #{campaign.campaignCode}
                                                </span>
                                                <span className="shrink-0 text-xs text-gray-300">•</span>
                                                <span className="shrink-0 text-xs text-gray-400">
                                                    {formatDate(campaign.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 min-w-0">
                                    {getStatusBadge(campaign.status)}
                                    {daysLeft !== null && campaign.status === "ACTIVE" && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                            <Clock size={12} />
                                            {daysLeft > 0 ? `${daysLeft} ngày` : "Hết hạn"}
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <CampaignSubmitBar
                                            slug={campaign.slug}
                                            status={campaign.status}
                                            rejectionReason={campaign.rejectionReason}
                                            successPledgeCount={campaign._count.pledges}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 min-w-0">
                                    <CampaignGrowthProgress
                                        currentAmount={campaign.currentAmount}
                                        goalAmount={campaign.goalAmount}
                                        variant="compact"
                                        size="sm"
                                        showTree={false}
                                    />
                                    <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        Mục tiêu: {formatVND(campaign.goalAmount)}
                                    </div>
                                </div>

                                <div className="col-span-2 min-w-0">
                                    <div className="flex items-center gap-1 text-sm">
                                        <Users size={14} className="shrink-0 text-gray-400" />
                                        <span className="font-semibold text-gray-900">{campaign._count.pledges}</span>
                                        <span className="text-xs text-gray-500">người ủng hộ</span>
                                    </div>
                                </div>

                                <div className="col-span-2 min-w-0">
                                    <div className="flex flex-col items-start gap-2">
                                        {projects.length > 0 && (
                                            <select
                                                value={campaign.projectId || ""}
                                                onChange={(e) => handleAssignProject(campaign.slug, e.target.value || null)}
                                                disabled={assigningProject === campaign.slug}
                                                className="w-full max-w-[9rem] truncate rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                                title="Gán vào Project"
                                            >
                                                <option value="">Chưa có project</option>
                                                {projects.map((project) => (
                                                    <option key={project.id} value={project.id}>
                                                        {project.title}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {actions}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}