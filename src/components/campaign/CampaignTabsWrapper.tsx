'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatVND, formatDate } from "@/lib/utils";
import { Clock, ShieldCheck, BookOpen } from "lucide-react";
import CommentSection from "@/components/campaign/CommentSection";
import UpdateSection from "@/components/campaign/UpdateSection";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { ProductBoxRenderer } from "@/components/shared/ProductBoxRenderer";
import BackerLink from "@/components/campaign/BackerLink";
import CampaignRewards from "@/components/campaign/CampaignRewards";
import LinkedBlogsSection from "@/components/campaign/LinkedBlogsSection";

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
        <div className="w-full">
            <Tabs defaultValue="details" className="w-full">
                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 bg-white mb-6">
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
                            value="blogs"
                            className="relative py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent flex items-center gap-2"
                        >
                            <BookOpen className="h-4 w-4" />
                            Blog
                            {campaign.linkedBlogs && campaign.linkedBlogs.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    {campaign.linkedBlogs.length}
                                </span>
                            )}
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

                {/* Content */}
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <TabsContent value="details" className="mt-0">
                                <div className="prose max-w-none">
                                    <>
                                        <RichTextRenderer content={campaign.longDescription || campaign.description} />
                                        <ProductBoxRenderer />
                                    </>
                                </div>
                            </TabsContent>

                            <TabsContent value="updates" className="mt-0">
                                <UpdateSection campaignId={campaign.id} slug={slug} isCreator={isCreator} />
                            </TabsContent>

                            <TabsContent value="blogs" className="mt-0">
                                <LinkedBlogsSection linkedBlogs={campaign.linkedBlogs || []} />
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
                            <div className="lg:sticky lg:top-32 space-y-6">
                                {/* Rewards Section */}
                                <CampaignRewards
                                    campaignId={campaign.id}
                                    rewards={campaign.rewards || []}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
