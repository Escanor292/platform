'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Rocket, MessageCircle, Heart, Award, Tag, Layers, TrendingUp, FolderKanban, Package, Gift, Plus, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { formatVND, formatDate } from '@/lib/utils';
import { CampaignGrowthProgress } from '@/components/campaign/CampaignGrowthProgress';
import { getCampaignTypeLabel } from '@/lib/campaign-helpers';
import { ProfileBlogCard } from '@/components/profile/ProfileBlogCard';
import { UserBadgeList } from '@/components/badge/UserBadgeList';

type TabType = 'projects' | 'campaigns' | 'products' | 'blog' | 'pledges' | 'badges';

interface ProfileTabsProps {
    userId: string;
    isOwnProfile: boolean;
    showAsPublic: boolean;
    campaigns: any[];
    blogPosts: any[];
    pledges: any[];
    projects: any[];
    isCreator: boolean;
    isBacker: boolean;
}

// Helper component for Badges tab with empty state handling
function BadgeTabContent({ userId }: { userId: string }) {
    const [hasBadges, setHasBadges] = useState<boolean | null>(null);

    // Check if user has badges by calling the API
    useEffect(() => {
        async function checkBadges() {
            try {
                const { getUserBadges } = await import('@/services/badgeApi');
                const badges = await getUserBadges(userId);
                setHasBadges(badges.length > 0);
            } catch {
                setHasBadges(false);
            }
        }
        checkBadges();
    }, [userId]);

    if (hasBadges === null) {
        return (
            <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                ))}
            </div>
        );
    }

    if (hasBadges) {
        return <UserBadgeList userId={userId} maxDisplay={20} />;
    }

    return (
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <Award size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">Bạn chưa có huy hiệu nào.</p>
            <p className="text-gray-400 text-sm">Hoàn thành các hành động để nhận huy hiệu!</p>
        </div>
    );
}

export function ProfileTabs({
    userId,
    isOwnProfile,
    showAsPublic,
    campaigns,
    blogPosts,
    pledges,
    projects,
    isCreator,
    isBacker,
}: ProfileTabsProps) {
    // Crash prevention: fallback to empty arrays
    const safeProjects = projects || [];
    const safeCampaigns = campaigns || [];
    const safeBlogPosts = blogPosts || [];
    const safePledges = pledges || [];

    // State for delete operations
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Helper function for delete with confirm dialog
    const handleDelete = async (
        id: string,
        name: string,
        apiEndpoint: string
    ) => {
        const confirmed = window.confirm(`Xóa "${name}" không thể hoàn tác?`);
        if (!confirmed) return;

        setDeletingId(id);
        setDeleteError(null);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể xóa');
            }

            // Refresh page to reflect changes
            window.location.reload();
        } catch (error: any) {
            setDeleteError(error.message || 'Lỗi khi xóa');
            alert(`Lỗi: ${error.message || 'Không thể xóa'}`);
        } finally {
            setDeletingId(null);
        }
    };

    // Check if owner mode (not public preview)
    const isOwnerMode = isOwnProfile && !showAsPublic;

    // Determine default tab
    const getDefaultTab = (): TabType => {
        if (safeProjects.length > 0) return 'projects';
        if (isCreator && safeCampaigns.length > 0) return 'campaigns';
        if (safeBlogPosts.length > 0) return 'blog';
        if (isBacker && safePledges.length > 0 && isOwnProfile && !showAsPublic) return 'pledges';
        return 'badges';
    };

    const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());

    // Classification logic for rewards (reused from ProjectDetailClient.tsx)
    const classifyRewards = () => {
        const products: Array<{ reward: any; campaign: any; isMain: boolean }> = [];
        const gifts: Array<{ reward: any; campaign: any; isMain: boolean }> = [];

        safeProjects.forEach((project) => {
            (project.campaigns || []).forEach((campaign: any) => {
                const activeRewards = (campaign.rewards || []).filter((r: any) => r.isActive);

                if (campaign.type === 'REWARD') {
                    // For REWARD campaigns: first reward (earliest createdAt) is main product
                    if (activeRewards.length > 0) {
                        const sortedRewards = [...activeRewards].sort((a, b) =>
                            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        );

                        // First reward is main product
                        products.push({ reward: sortedRewards[0], campaign, isMain: true });

                        // Remaining rewards are gifts
                        sortedRewards.slice(1).forEach((reward) => {
                            gifts.push({ reward, campaign, isMain: false });
                        });
                    }
                } else if (campaign.type === 'DONATION') {
                    // For DONATION campaigns: all rewards are gifts
                    activeRewards.forEach((reward: any) => {
                        gifts.push({ reward, campaign, isMain: false });
                    });
                }
            });
        });

        return { products, gifts };
    };

    const { products, gifts } = classifyRewards();
    const totalProducts = products.length;
    const totalGifts = gifts.length;

    // Define tabs based on view mode
    const tabs: { id: TabType; label: string; count?: number; show: boolean }[] = [
        {
            id: 'projects',
            label: 'Dự án',
            count: safeProjects.length,
            show: (isOwnProfile && !showAsPublic) || safeProjects.length > 0,
        },
        {
            id: 'campaigns',
            label: 'Chiến dịch',
            count: safeCampaigns.length,
            show: (isOwnProfile && !showAsPublic) || (isCreator && safeCampaigns.length > 0),
        },
        {
            id: 'products',
            label: 'Sản phẩm',
            count: totalProducts,
            show: (isOwnProfile && !showAsPublic) || totalProducts > 0,
        },
        {
            id: 'blog',
            label: 'Blog',
            count: safeBlogPosts.length,
            show: (isOwnProfile && !showAsPublic) || safeBlogPosts.length > 0,
        },
        {
            id: 'pledges',
            label: 'Đã ủng hộ',
            count: safePledges.length,
            show: isBacker && safePledges.length > 0 && isOwnProfile && !showAsPublic,
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
                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <FolderKanban size={24} className="text-blue-600" />
                                Dự án ({safeProjects.length})
                            </h2>
                            {isOwnerMode && (
                                <Link
                                    href="/dashboard/creator/projects"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm font-bold transition flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Tạo dự án
                                </Link>
                            )}
                        </div>
                        {safeProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {safeProjects.map((project) => (
                                    <div key={project.id} className="group relative">
                                        <Link href={`/projects/${project.id}`} className="block">
                                            <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                                                <div className="p-6">
                                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                                                        {project.title}
                                                    </h3>
                                                    {project.description && (
                                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span className="font-bold uppercase">
                                                            {project.campaigns?.length || 0} chiến dịch
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                        {isOwnerMode && (
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <Link
                                                    href="/dashboard/creator/projects"
                                                    className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition"
                                                    title="Sửa dự án"
                                                >
                                                    <Pencil size={16} className="text-gray-600" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(project.id, project.title, `/api/projects/${project.id}`)}
                                                    disabled={deletingId === project.id}
                                                    className="p-2 bg-white rounded-lg shadow-md hover:bg-red-100 transition disabled:opacity-50"
                                                    title="Xóa dự án"
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <FolderKanban size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium mb-2">Bạn chưa có dự án nào.</p>
                                <p className="text-gray-400 text-sm">Tạo dự án đầu tiên để tổ chức các chiến dịch theo chuỗi.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <Rocket size={24} className="text-blue-600" />
                                Chiến dịch đã tạo ({safeCampaigns.length})
                            </h2>
                            {isOwnerMode && (
                                <Link
                                    href="/campaigns/create"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm font-bold transition flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Tạo chiến dịch
                                </Link>
                            )}
                        </div>
                        {safeCampaigns.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {safeCampaigns.map((campaign) => {
                                    const progress = Math.min(
                                        100,
                                        Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100)
                                    );
                                    return (
                                        <div key={campaign.id} className="group relative">
                                            <Link href={`/campaigns/${campaign.slug}`} className="block">
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
                                            {isOwnerMode && (
                                                <div className="absolute top-3 right-3 flex gap-2">
                                                    <Link
                                                        href={`/dashboard/creator/edit/${campaign.slug}`}
                                                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition"
                                                        title="Sửa chiến dịch"
                                                    >
                                                        <Pencil size={16} className="text-gray-600" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(campaign.slug, campaign.title, `/api/campaigns/${campaign.slug}`)}
                                                        disabled={deletingId === campaign.slug}
                                                        className="p-2 bg-white rounded-lg shadow-md hover:bg-red-100 transition disabled:opacity-50"
                                                        title="Xóa chiến dịch"
                                                    >
                                                        <Trash2 size={16} className="text-red-600" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <Rocket size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium mb-2">Bạn chưa có chiến dịch nào.</p>
                                <p className="text-gray-400 text-sm">Bắt đầu gây quỹ ngay!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <Package size={24} className="text-emerald-600" />
                                Sản phẩm ({totalProducts})
                            </h2>
                            {isOwnerMode && (
                                <Link
                                    href={safeCampaigns.length > 0 ? `/dashboard/creator/rewards/${safeCampaigns[0].slug}` : '/dashboard/creator/projects'}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm font-bold transition flex items-center gap-2"
                                    title={safeCampaigns.length > 0 ? 'Thêm sản phẩm vào chiến dịch' : 'Tạo chiến dịch trước để thêm sản phẩm'}
                                >
                                    <Plus size={16} />
                                    Thêm sản phẩm
                                </Link>
                            )}
                        </div>
                        {products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {products.map(({ reward, campaign }) => (
                                        <div key={reward.id} className="group relative">
                                            <Link href={`/campaigns/${campaign.slug}`} className="block">
                                                <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                                                                    {reward.title}
                                                                </h3>
                                                                {reward.description && (
                                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                                        {reward.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="ml-3 text-right">
                                                                <div className="text-sm font-black text-emerald-600">
                                                                    {formatVND(reward.minAmount)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <span className="font-bold uppercase">
                                                                {campaign.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                            {isOwnerMode && (
                                                <div className="absolute top-3 right-3 flex gap-2">
                                                    <Link
                                                        href={`/dashboard/creator/rewards/${campaign.slug}/edit/${reward.id}`}
                                                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition"
                                                        title="Sửa sản phẩm"
                                                    >
                                                        <Pencil size={16} className="text-gray-600" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(reward.id, reward.title, `/api/rewards/${reward.id}`)}
                                                        disabled={deletingId === reward.id}
                                                        className="p-2 bg-white rounded-lg shadow-md hover:bg-red-100 transition disabled:opacity-50"
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <Trash2 size={16} className="text-red-600" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {totalGifts > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Gift size={20} className="text-pink-600" />
                                            Quà tặng kèm ({totalGifts})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {gifts.map(({ reward, campaign }) => (
                                                <div key={reward.id} className="group relative">
                                                    <Link href={`/campaigns/${campaign.slug}`} className="block">
                                                        <div className="bg-pink-50 rounded-xl p-4 hover:bg-pink-100 transition-all">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-blue-600 transition">
                                                                        {reward.title}
                                                                    </h4>
                                                                    <div className="text-xs text-gray-500">
                                                                        {campaign.title}
                                                                    </div>
                                                                </div>
                                                                <div className="ml-3 text-right">
                                                                    <div className="text-xs font-black text-pink-600">
                                                                        {formatVND(reward.minAmount)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    {isOwnerMode && (
                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                            <Link
                                                                href={`/dashboard/creator/rewards/${campaign.slug}/edit/${reward.id}`}
                                                                className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-100 transition"
                                                                title="Sửa quà tặng"
                                                            >
                                                                <Pencil size={14} className="text-gray-600" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(reward.id, reward.title, `/api/rewards/${reward.id}`)}
                                                                disabled={deletingId === reward.id}
                                                                className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-100 transition disabled:opacity-50"
                                                                title="Xóa quà tặng"
                                                            >
                                                                <Trash2 size={14} className="text-red-600" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium mb-2">Chưa có sản phẩm nào.</p>
                                <p className="text-gray-400 text-sm">Thêm phần quà vào các chiến dịch của bạn.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Blog Tab */}
                {activeTab === 'blog' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <MessageCircle size={24} className="text-pgreen" />
                                {isOwnProfile && !showAsPublic ? 'Blog của tôi' : 'Bài viết'} ({safeBlogPosts.length})
                            </h2>
                            {isOwnerMode && (
                                <Link
                                    href="/blog/editor"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm font-bold transition flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Viết bài
                                </Link>
                            )}
                        </div>
                        {safeBlogPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {safeBlogPosts.map((post) => (
                                    <div key={post.id} className="relative">
                                        <ProfileBlogCard
                                            post={post}
                                            isOwner={isOwnProfile && !showAsPublic}
                                        />
                                        {isOwnerMode && (
                                            <button
                                                onClick={() => handleDelete(post.slug, post.title, `/api/blog/posts/${post.slug}`)}
                                                disabled={deletingId === post.slug}
                                                className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-md hover:bg-red-100 transition disabled:opacity-50"
                                                title="Xóa bài viết"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium mb-2">Bạn chưa có bài viết nào.</p>
                                <p className="text-gray-400 text-sm">Viết bài đầu tiên để chia sẻ hành trình.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pledges Tab */}
                {activeTab === 'pledges' && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Heart size={24} className="text-pink-600" />
                            Đã ủng hộ ({safePledges.length})
                        </h2>
                        {safePledges.length > 0 ? (
                            <div className="space-y-4">
                                {safePledges.map((pledge) => (
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
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium mb-2">Bạn chưa ủng hộ dự án nào.</p>
                                <p className="text-gray-400 text-sm">Khám phá các dự án thú vị để ủng hộ.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Award size={24} className="text-purple-600" />
                            Huy hiệu
                        </h2>
                        <BadgeTabContent userId={userId} />
                    </div>
                )}
            </div>
        </div>
    );
}
