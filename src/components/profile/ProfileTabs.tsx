'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Rocket, MessageCircle, Heart, Award, Tag, Layers, TrendingUp, FolderKanban, Package, Gift, Plus, Pencil, Trash2, MoreVertical, Share2, LayoutList, FileText } from 'lucide-react';
import { formatVND, formatDate } from '@/lib/utils';
import ShopeeProductCard from '@/components/products/ShopeeProductCard';
import { CampaignGrowthProgress } from '@/components/campaign/CampaignGrowthProgress';
import { getCampaignTypeLabel } from '@/lib/campaign-helpers';
import { ProfileBlogCard } from '@/components/profile/ProfileBlogCard';
import { UserBadgeList } from '@/components/badge/UserBadgeList';
import { AddProductModal } from '@/components/profile/AddProductModal';
import QuickAddToCartButton from '@/components/products/QuickAddToCartButton';
import { getOrderedTabSectionsFor, getPreferredProfileTabFor, getSectionLimit, isLayoutSectionVisible, profileAudience, type ProfileCustomizationConfig } from '@/lib/profile-customization';

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
    profileConfig: ProfileCustomizationConfig;
    badgeCount?: number;
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
    profileConfig,
    badgeCount = 0,
}: ProfileTabsProps) {
    // Crash prevention: fallback to empty arrays
    const safeProjects = projects || [];
    const safeCampaigns = campaigns || [];
    const safeBlogPosts = blogPosts || [];
    const safePledges = pledges || [];
    const featured = profileConfig.featured;
    const orderByFeatured = <T extends { id: string }>(items: T[], ids: string[]) => {
        if (ids.length === 0) return items;
        const rank = new Map(ids.map((id, index) => [id, index]));
        return [...items].sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
    };
    const orderedProjects = orderByFeatured(safeProjects, featured.projectIds).slice(0, getSectionLimit(profileConfig, 'projects'));
    const orderedCampaigns = orderByFeatured(safeCampaigns, featured.campaignIds).slice(0, getSectionLimit(profileConfig, 'campaigns'));
    const orderedBlogPosts = orderByFeatured(safeBlogPosts, featured.blogPostIds).slice(0, getSectionLimit(profileConfig, 'blog'));
    const limitedPledges = safePledges.slice(0, getSectionLimit(profileConfig, 'pledges'));

    // State for delete operations
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // State for Add Product modal
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);

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

    // Classification logic for rewards (reused from ProjectDetailClient.tsx)
    const classifyRewards = () => {
        const products: Array<{ reward: any; campaign: any; isMain: boolean }> = [];
        const gifts: Array<{ reward: any; campaign: any; isMain: boolean }> = [];
        const seen = new Set<string>();

        // Reward nào có media (ảnh/video) hoặc giá gốc → sản phẩm TMĐT, ưu tiên hiện ở tab Sản phẩm
        const isEcommerceProduct = (r: any) =>
            (Array.isArray(r.productImages) && r.productImages.length > 0) || !!r.maxAmount;

        orderedProjects.forEach((project) => {
            (project.campaigns || []).forEach((campaign: any) => {
                const activeRewards = (campaign.rewards || []).filter((r: any) => r.isActive);

                if (campaign.type === 'REWARD') {
                    if (activeRewards.length > 0) {
                        const sortedRewards = [...activeRewards].sort((a, b) =>
                            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        );

                        sortedRewards.forEach((reward, idx) => {
                            if (isEcommerceProduct(reward)) {
                                // Sản phẩm TMĐT luôn hiện trong tab Sản phẩm (không trùng lặp)
                                if (!seen.has(reward.id)) {
                                    products.push({ reward, campaign, isMain: true });
                                    seen.add(reward.id);
                                }
                            } else if (idx === 0) {
                                // Reward đầu tiên của campaign REWARD (không có media/giá gốc) là sản phẩm chính
                                products.push({ reward, campaign, isMain: true });
                            } else {
                                gifts.push({ reward, campaign, isMain: false });
                            }
                        });
                    }
                } else if (campaign.type === 'DONATION') {
                    activeRewards.forEach((reward: any) => {
                        if (isEcommerceProduct(reward) && !seen.has(reward.id)) {
                            products.push({ reward, campaign, isMain: true });
                            seen.add(reward.id);
                        } else {
                            gifts.push({ reward, campaign, isMain: false });
                        }
                    });
                }
            });

            // Sản phẩm trực tiếp thuộc dự án (không qua chiến dịch nào)
            (project.rewards || []).forEach((reward: any) => {
                if (reward.isActive && !seen.has(reward.id)) {
                    products.push({ reward, campaign: null, isMain: true });
                    seen.add(reward.id);
                }
            });
        });

        const featuredRank = new Map(featured.rewardIds.map((id, index) => [id, index]));
        const featuredProducts = featured.rewardIds.length > 0
            ? [...products].sort((a, b) => (featuredRank.get(a.reward.id) ?? 999) - (featuredRank.get(b.reward.id) ?? 999))
            : products;
        return { products: featuredProducts.slice(0, getSectionLimit(profileConfig, 'products')), gifts };
    };

    const { products, gifts } = classifyRewards();
    const totalProducts = products.length;
    const totalGifts = gifts.length;

    const audience = profileAudience(isOwnProfile, showAsPublic);
    const ownerView = audience === 'owner';
    const tabOrder = getOrderedTabSectionsFor(profileConfig, audience).map((item) => item.id);

    // Define tabs based on view mode
    const tabs: { id: TabType; label: string; count?: number; show: boolean }[] = [
        {
            id: 'projects',
            label: 'Dự án',
            count: orderedProjects.length,
            show: isLayoutSectionVisible(profileConfig, 'projects', audience) && (ownerView || orderedProjects.length > 0),
        },
        {
            id: 'campaigns',
            label: 'Chiến dịch',
            count: orderedCampaigns.length,
            show: isLayoutSectionVisible(profileConfig, 'campaigns', audience) && (ownerView || orderedCampaigns.length > 0),
        },
        {
            id: 'products',
            label: 'Sản phẩm',
            count: totalProducts,
            show: isLayoutSectionVisible(profileConfig, 'products', audience) && (ownerView || totalProducts > 0),
        },
        {
            id: 'blog',
            label: 'Blog',
            count: orderedBlogPosts.length,
            show: isLayoutSectionVisible(profileConfig, 'blog', audience) && (ownerView || orderedBlogPosts.length > 0),
        },
        {
            id: 'pledges',
            label: 'Đã ủng hộ',
            count: limitedPledges.length,
            show: isLayoutSectionVisible(profileConfig, 'pledges', audience) && (ownerView || limitedPledges.length > 0),
        },
        {
            id: 'badges',
            label: 'Huy hiệu',
            count: badgeCount,
            show: isLayoutSectionVisible(profileConfig, 'badges', audience) && (ownerView || badgeCount > 0),
        },
    ].sort((a, b) => {
        const ai = tabOrder.indexOf(a.id);
        const bi = tabOrder.indexOf(b.id);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    const visibleTabs = tabs.filter((tab) => tab.show);

    const getDefaultTab = (): TabType => {
        const preferred = getPreferredProfileTabFor(profileConfig, audience);
        if (visibleTabs.some((tab) => tab.id === preferred)) return preferred;
        const withContent = visibleTabs.find((tab) => (tab.count ?? 1) > 0);
        return withContent?.id ?? visibleTabs[0]?.id ?? 'campaigns';
    };

    const visibleTabKey = visibleTabs.map((tab) => tab.id).join('|');
    const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab);

    useEffect(() => {
        if (!visibleTabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(getDefaultTab());
        }
    }, [visibleTabKey]);

    if (visibleTabs.length === 0) return null;

    return (
        <div className="space-y-6" style={{ color: 'var(--profile-text)' }}>
            {/* Tabs Navigation */}
            <div className="bg-[var(--profile-surface)] border border-[color:var(--profile-primary)]/10 p-2 shadow-sm" style={{ borderRadius: 'var(--profile-card-radius)' }}>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar md:flex-wrap">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap px-3 py-2 font-bold text-xs transition-all sm:px-6 sm:py-3 sm:text-sm ${activeTab === tab.id
                                ? 'shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-[color:var(--profile-primary)] hover:text-[color:var(--profile-primary)]'
                                }`}
                            style={{
                                borderRadius: 'var(--profile-radius)',
                                ...(activeTab === tab.id ? { background: 'var(--profile-primary)', color: 'var(--profile-contrast)' } : {}),
                            }}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`ml-2 ${activeTab === tab.id ? 'opacity-80' : 'text-gray-400'}`}>
                                    ({tab.count})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-[var(--profile-surface)] border border-[color:var(--profile-primary)]/10 p-4 shadow-sm md:p-8" style={{ borderRadius: 'var(--profile-card-radius)' }}>
                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 md:text-2xl">
                                <FolderKanban size={24} className="text-blue-600" />
                                Dự án ({orderedProjects.length})
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
                                {orderedProjects.map((project) => {
                                    const campaignCount = project.campaigns?.length || 0;
                                    const blogCount = project.project_blog_links?.length || 0;
                                    const productCount = (project as any)._count?.project_reward_links || 0;
                                    return (
                                    <div key={project.id} className="group relative">
                                        <Link href={`/projects/${project.id}`} className="block">
                                            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
                                                    {project.coverImage ? (
                                                        <Image
                                                            src={project.coverImage}
                                                            alt={project.title}
                                                            fill
                                                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                                <FolderKanban size={28} className="text-white" />
                                                            </div>
                                                            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Chưa có ảnh bìa</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-purple-600 shadow-sm">
                                                        {campaignCount} chiến dịch
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="font-black text-gray-900 text-lg mb-1.5 line-clamp-2 group-hover:text-purple-600 transition">
                                                        {project.title}
                                                    </h3>
                                                    {project.description && (
                                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <LayoutList size={14} className="text-blue-500" />
                                                            <span className="font-semibold">{campaignCount}</span>
                                                            <span>chiến dịch</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <FileText size={14} className="text-purple-500" />
                                                            <span className="font-semibold">{blogCount}</span>
                                                            <span>bài viết</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Package size={14} className="text-green-500" />
                                                            <span className="font-semibold">{productCount}</span>
                                                            <span>sản phẩm</span>
                                                        </div>
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
                                    );
                                })}
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
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 md:text-2xl">
                                <Rocket size={24} className="text-blue-600" />
                                Chiến dịch đã tạo (                        {orderedCampaigns.length})
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
                                {orderedCampaigns.map((campaign) => {
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
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 md:text-2xl">
                                <Package size={24} className="text-emerald-600" />
                                Sản phẩm ({totalProducts})
                            </h2>
                            {isOwnerMode && (
                                <button
                                    onClick={() => setIsAddProductOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm font-bold transition flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Thêm sản phẩm
                                </button>
                            )}
                        </div>
                        {products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {products.map(({ reward, campaign }) => (
                                        <ShopeeProductCard
                                            key={reward.id}
                                            product={{
                                                id: reward.id,
                                                title: reward.title,
                                                description: reward.description,
                                                minAmount: reward.minAmount,
                                                maxAmount: reward.maxAmount,
                                                stock: reward.stock,
                                                productImages: Array.isArray(reward.productImages) ? reward.productImages : [],
                                                campaignTitle: campaign?.title || null,
                                                campaignId: campaign?.id || null,
                                                isPreorder: reward.isPreorder === true,
                                                deliveryDate: reward.deliveryDate || null,
                                                isOwnerMode,
                                                onEditUrl: campaign?.slug
                                                    ? `/dashboard/creator/rewards/${campaign.slug}/edit/${reward.id}`
                                                    : `/products/${reward.id}?edit=1`,
                                                onDelete: (id: string, title: string) =>
                                                    handleDelete(id, title, `/api/rewards/${id}`),
                                            }}
                                        />
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
                                                                    {reward.isPreorder && (
                                                                        <div className="mt-1 text-[11px] font-semibold text-amber-700">
                                                                            Đặt trước{reward.deliveryDate ? ` · giao dự kiến ${new Date(reward.deliveryDate).toLocaleDateString('vi-VN')}` : ''}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="ml-3 text-right">
                                                                    <div className="text-xs font-black text-pink-600">
                                                                        {formatVND(reward.minAmount)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <QuickAddToCartButton
                                                        rewardId={reward.id}
                                                        title={reward.title}
                                                        image={Array.isArray(reward.productImages) ? reward.productImages[0] || '' : ''}
                                                        price={Number(reward.minAmount) || 0}
                                                        campaignId={campaign?.id || null}
                                                        isPreorder={reward.isPreorder === true}
                                                        deliveryDate={reward.deliveryDate || null}
                                                        className="absolute bottom-2 right-2 h-9 w-9 rounded-lg"
                                                    />
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
                                <p className="text-gray-400 text-sm">Chọn sản phẩm từ chiến dịch hoặc tạo sản phẩm mới với giá như nền tảng thương mại điện tử.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Blog Tab */}
                {activeTab === 'blog' && (
                    <div>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 md:text-2xl">
                                <MessageCircle size={24} className="text-pgreen" />
                                {isOwnProfile && !showAsPublic ? 'Blog của tôi' : 'Bài viết'} (                        {orderedBlogPosts.length})
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
                                {orderedBlogPosts.map((post) => (
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
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-black text-gray-900 md:text-2xl">
                            <Heart size={24} className="text-pink-600" />
                            Đã ủng hộ (                        {limitedPledges.length})
                        </h2>
                        {safePledges.length > 0 ? (
                            <div className="space-y-4">
                                {limitedPledges.map((pledge) => (
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
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-black text-gray-900 md:text-2xl">
                            <Award size={24} className="text-purple-600" />
                            Huy hiệu
                        </h2>
                        <BadgeTabContent userId={userId} />
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            <AddProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} />
        </div>
    );
}
