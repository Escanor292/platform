"use client";

import Link from "next/link";
import { formatVND, formatDate, extractTextFromDescription } from "@/lib/utils";
import { FileText, Settings, Gift, Tag, Layers } from "lucide-react";
import { CampaignGrowthProgress } from "@/components/campaign/CampaignGrowthProgress";
import { getCampaignTypeLabel } from "@/lib/campaign-helpers";

interface CreatorCampaignCardProps {
    campaign: {
        id: string;
        slug: string;
        title: string;
        description: string;
        campaignCode: string;
        imageUrl: string | null;
        category: string;
        type: string;
        status: string;
        currentAmount: number;
        goalAmount: number;
        endDate: Date | null;
        _count: {
            pledges: number;
        };
    };
}

export function CreatorCampaignCard({ campaign }: CreatorCampaignCardProps) {
    const progress = Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100));

    return (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-soft overflow-hidden group hover:shadow-premium transition-all relative">
            <Link href={`/campaigns/${campaign.slug}`} className="block">
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={campaign.imageUrl || "/placeholder.jpg"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt="Campaign"
                    />
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 bg-white/90 backdrop-blur text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/20 ${campaign.status === "ACTIVE" ? "text-blue-600" : "text-gray-400"
                            }`}>
                            {campaign.status}
                        </span>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                <Tag size={10} />
                                {campaign.category}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${campaign.type === 'REWARD'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                <Layers size={10} />
                                {getCampaignTypeLabel(campaign.type as any)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-black text-gray-900 leading-tight truncate group-hover:text-blue-600 transition">
                                {campaign.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                {campaign.campaignCode}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium line-clamp-2">{extractTextFromDescription(campaign.description)}</p>
                    </div>

                    <div className="space-y-4">
                        <CampaignGrowthProgress
                            currentAmount={campaign.currentAmount}
                            goalAmount={campaign.goalAmount}
                            variant="compact"
                            size="sm"
                            showTree={false}
                        />
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>{campaign._count.pledges} Người ủng hộ</span>
                            <span>Kết thúc: {campaign.endDate ? formatDate(campaign.endDate) : "Vô thời hạn"}</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Action buttons - positioned absolutely to stay on top */}
            <div className="px-8 pb-8 flex gap-2 relative z-10">
                <Link
                    href={`/dashboard/creator/statement/${campaign.id}`}
                    className="flex-1 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition active:scale-95 gap-2 font-black text-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <FileText size={18} />
                    Báo cáo
                </Link>
                <Link
                    href={`/dashboard/creator/rewards/${campaign.slug}`}
                    className="flex-1 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition active:scale-95 gap-2 font-black text-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Gift size={18} />
                    Quà tặng
                </Link>
                <Link
                    href={`/dashboard/creator/edit/${campaign.slug}`}
                    className="flex-1 h-14 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition active:scale-95 gap-2 font-black text-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Settings size={18} />
                    Chỉnh sửa
                </Link>
            </div>
        </div>
    );
}
