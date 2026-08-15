'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Rocket, MessageCircle, Heart, Award, Tag, Layers, TrendingUp } from 'lucide-react';
import { formatVND, formatDate } from '@/lib/utils';
import { CampaignGrowthProgress } from '@/components/campaign/CampaignGrowthProgress';
import { getCampaignTypeLabel } from '@/lib/campaign-helpers';
import { ProfileBlogCard } from '@/components/profile/ProfileBlogCard';
import { UserBadgeList } from '@/components/badge/UserBadgeList';

type TabType = 'campaigns' | 'blog' | 'pledges' | 'badges';

interface ProfileTabsProps {
    userId: string;
    isOwnProfile: boolean;
    showAsPublic: boolean;
    campaigns: any[];
    blogPosts: any[];
    pledges: any[];
    isCreator: boolean;
    isBacker: boolean;
}

export function ProfileTabs({
    userId,
    isOwnProfile,
    showAsPublic,
    campaigns,
    blogPosts,
    pledges,
    isCreator,
    isBacker,
}: ProfileTabsProps) {
    // Determine default tab
    const getDefaultTab = (): TabType => {
        if (isCreator && campaigns.length > 0) return 'campaigns';
        if (blogPosts.length > 0) return 'blog';
        if (isBacker && pledges.length > 0 && isOwnProfile && !showAsPublic) return 'pledges';
        return 'badges';
    };

    const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());

    // Define tabs based on view mode
    const tabs: { id: TabType; label: string; count?: number; show: boolean }[] = [
        {
            id: 'campaigns',
            label: 'Chiến dịch',
            count: campaigns.length,
            show: isCreator && campaigns.length > 0,
        },
        {
            id: 'blog',
            label: 'Blog',
            count: blogPosts.length,
            show: blogPosts.length > 0,
        },
        {
            id: 'pledges',
            label: 'Đã ủng hộ',
            count: pledges.length,
            show: isBacker && pledges.length > 0 && isOwnProfile && !showAsPublic,
        },
        {
            id: 'badges',
            label: 'Huy hiệu',
            show: true, // Always show
        },
    ];

    const visibleTabs = tabs.filter((tab) => tab.show);

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-2">
                <div className="flex flex-wrap gap-2">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-[1.5rem] font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-pgreen to-fgreen text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-pgreen hover:text-pgreen'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`ml-2 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
                                    ({tab.count})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Rocket size={24} className="text-blue-600" />
                            Chiến dịch đã tạo ({campaigns.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {campaigns.map((campaign) => {
                                const progress = Math.min(
                                    100,
                                    Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100)
                                );
                                return (
                                    <Link key={campaign.id} href={`/campaigns/${campaign.slug}`} className="group">
                                        <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                                            <div className="relative h-40 overflow-hidden">
                                                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                                    <span
                                                        className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${campaign.status === 'ACTIVE'
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-blue-500 text-white'
                                                            }`}
                                                    >
                                                        {campaign.status}
                                                    </span>
                                                    <span className="px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[8px] font-black uppercase border border-white/20 text-blue-600 flex items-center gap-1">
                                                        <Tag size={8} />
                                                        {campaign.category}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[8px] font-black uppercase border border-white/20 flex items-center gap-1 ${campaign.type === 'REWARD' ? 'text-emerald-600' : 'text-orange-600'
                                                            }`}
                                                    >
                                                        <Layers size={8} />
                                                        {getCampaignTypeLabel(campaign.type as any)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                                                    {campaign.title}
                                                </h3>
                                                <div className="space-y-4">
                                                    <CampaignGrowthProgress
                                                        currentAmount={Number(campaign.currentAmount)}
                                                        goalAmount={Number(campaign.goalAmount)}
                                                        variant="compact"
                                                        size="sm"
                                                        showTree={false}
                                                    />
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                        {campaign._count.pledges} người ủng hộ
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Blog Tab */}
                {activeTab === 'blog' && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <MessageCircle size={24} className="text-pgreen" />
                            {isOwnProfile && !showAsPublic ? 'Blog của tôi' : 'Bài viết'} ({blogPosts.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogPosts.map((post) => (
                                <ProfileBlogCard
                                    key={post.id}
                                    post={post}
                                    isOwner={isOwnProfile && !showAsPublic}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Pledges Tab */}
                {activeTab === 'pledges' && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Heart size={24} className="text-pink-600" />
                            Đã ủng hộ ({pledges.length})
                        </h2>
                        <div className="space-y-4">
                            {pledges.map((pledge) => (
                                <Link
                                    key={pledge.id}
                                    href={`/campaigns/${pledge.campaigns.slug}`}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition group"
                                >
                                    <img
                                        src={pledge.campaigns.imageUrl || '/placeholder.jpg'}
                                        alt={pledge.campaigns.title}
                                        className="w-16 h-16 rounded-xl object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition">
                                            {pledge.campaigns.title}
                                        </h3>
                                        <div className="text-xs text-gray-400">
                                            {new Date(pledge.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-pink-600">
                                            {formatVND(Number(pledge.amount))}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Award size={24} className="text-purple-600" />
                            Huy hiệu
                        </h2>
                        <UserBadgeList userId={userId} maxDisplay={20} />
                    </div>
                )}
            </div>
        </div>
    );
}
