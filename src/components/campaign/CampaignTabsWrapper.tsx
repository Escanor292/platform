'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatVND, formatDate } from "@/lib/utils";
import { Clock, ShieldCheck } from "lucide-react";
import CommentSection from "@/components/campaign/CommentSection";
import UpdateSection from "@/components/campaign/UpdateSection";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import BackerLink from "@/components/campaign/BackerLink";
import PledgeForm from "@/components/campaign/PledgeForm";
import CampaignGrowthProgress from "@/components/campaign/CampaignGrowthProgress";

interface CampaignTabsWrapperProps {
    campaign: any;
    isCreator: boolean;
    slug: string;
    daysLeft: number | string;
    percentRaised: number;
}

export default function CampaignTabsWrapper({
    campaign,
    isCreator,
    slug,
    daysLeft,
    percentRaised
}: CampaignTabsWrapperProps) {
    return (
        <div className="border-t border-gray-200">
            <Tabs defaultValue="details" className="w-full">
                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 bg-white sticky top-20 z-40">
                    <div className="max-w-7xl mx-auto px-6">
                        <TabsList className="h-auto bg-transparent p-0 gap-8 w-full justify-start">
                            <TabsTrigger
                                value="details"
                                className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                            >
                                Chi tiết dự án
                            </TabsTrigger>
                            <TabsTrigger
                                value="updates"
                                className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                            >
                                Cập nhật tin tức
                            </TabsTrigger>
                            <TabsTrigger
                                value="backers"
                                className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                            >
                                Người ủng hộ
                            </TabsTrigger>
                            <TabsTrigger
                                value="comments"
                                className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                            >
                                Thảo luận cộng đồng
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <TabsContent value="details" className="mt-0">
                                <div className="prose max-w-none">
                                    <RichTextRenderer content={campaign.longDescription || campaign.description} />
                                </div>
                            </TabsContent>

                            <TabsContent value="updates" className="mt-0">
                                <UpdateSection campaignId={campaign.id} slug={slug} isCreator={isCreator} />
                            </TabsContent>

                            <TabsContent value="backers" className="mt-0">
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Người ủng hộ ({(campaign as any)._count?.pledges || 0})
                                    </h2>
                                    {campaign.pledges.length > 0 ? (
                                        <div className="space-y-4">
                                            {campaign.pledges.map((pledge: any) => (
                                                <div key={pledge.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <BackerLink
                                                        userId={pledge.userId}
                                                        userName={pledge.user?.name}
                                                        displayName={pledge.displayName}
                                                        isAnonymous={pledge.isAnonymous}
                                                        userAvatar={pledge.user?.avatar}
                                                    />
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        Ủng hộ {formatVND(pledge.amount)} • {formatDate(pledge.createdAt)}
                                                    </div>
                                                </div>
                                            ))}
                                            {(campaign as any)._count?.pledges > 5 && (
                                                <div className="text-center py-4">
                                                    <p className="text-sm text-gray-500">
                                                        Và {(campaign as any)._count.pledges - 5} người ủng hộ khác...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">Chưa có người ủng hộ</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="comments" className="mt-0">
                                <CommentSection campaignId={campaign.id} slug={slug} />
                            </TabsContent>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-32 space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                                    <CampaignGrowthProgress
                                        currentAmount={Number(campaign.currentAmount)}
                                        goalAmount={Number(campaign.goalAmount)}
                                        size="lg"
                                        showTree={false}
                                        showAnimatedHead={false}
                                    />

                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-600">
                                            {(campaign as any)._count?.pledges || 0} người ủng hộ
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{daysLeft} ngày còn lại</span>
                                        </div>
                                    </div>

                                    <PledgeForm campaignId={campaign.id} />

                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                        <ShieldCheck className="text-green-600" size={16} />
                                        <span className="text-xs text-green-800">Cam kết minh bạch</span>
                                    </div>
                                </div>

                                {/* Rewards */}
                                {campaign.rewards && campaign.rewards.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                        <h3 className="font-bold text-gray-900">Phần thưởng</h3>
                                        <div className="space-y-3">
                                            {campaign.rewards.map((reward: any) => (
                                                <div key={reward.id} className="border-b border-gray-100 pb-3 last:border-0">
                                                    <div className="text-sm font-semibold text-gray-900">{formatVND(reward.amount)}</div>
                                                    <div className="text-xs text-gray-600 mt-1">{reward.title}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
