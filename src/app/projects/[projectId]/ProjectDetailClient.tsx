'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PublicProjectDetail, PublicReward, getCampaignStatusBadge } from '@/types/project-detail';
import { FolderKanban, Users, ArrowRight, Calendar, Gift, Package, ExternalLink, Wallet, ShoppingBag, Coins } from 'lucide-react';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatVND } from '@/lib/utils';
import QuickAddToCartButton from '@/components/products/QuickAddToCartButton';
import ReportButton from '@/components/report/ReportButton';
import { classifyProjectRewards, unionCatalogRewards } from '@/lib/project/project-catalog';

interface ProjectDetailClientProps {
    project: PublicProjectDetail;
}

function campaignLaunchDate(campaign: { startDate?: string | null; createdAt?: string | null }): string | null {
    return campaign.startDate || campaign.createdAt || null;
}

function RewardCard({ reward, showGiftBadge = false }: { reward: PublicReward; showGiftBadge?: boolean }) {
    const statusInfo = getCampaignStatusBadge(reward.campaignStatus || '');
    const campaignHref = reward.campaignSlug ? `/campaigns/${reward.campaignSlug}` : null;

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
                {reward.imageUrl ? (
                    <div className="relative w-full h-40 overflow-hidden rounded-xl bg-gray-100">
                        <Image
                            src={reward.imageUrl}
                            alt={reward.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                ) : (
                    <div className="w-full h-40 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300" />
                    </div>
                )}
                {showGiftBadge && (
                    <Badge variant="secondary" className="text-xs">Quà tặng kèm</Badge>
                )}
                <h4 className="font-display font-bold text-lg text-gray-900 line-clamp-2">
                    {reward.title}
                </h4>
                {reward.isPreorder && (
                    <div className="text-xs font-semibold text-amber-700">
                        Đặt trước{reward.deliveryDate ? ` · giao dự kiến ${new Date(reward.deliveryDate).toLocaleDateString('vi-VN')}` : ''}
                    </div>
                )}
                {reward.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {reward.description}
                    </p>
                )}
                {reward.campaignTitle && (
                    <div className="text-sm text-gray-500">
                        Chiến dịch: {reward.campaignTitle}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    {reward.campaignStatus ? (
                        <Badge className="text-white" style={{ backgroundColor: statusInfo.color }}>
                            {statusInfo.label}
                        </Badge>
                    ) : (
                        <Badge variant="secondary">Sản phẩm dự án</Badge>
                    )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-bold text-blue-600">
                        {formatVND(reward.minAmount)}
                    </span>
                    <div className="flex items-center gap-2">
                        <QuickAddToCartButton
                            rewardId={reward.id}
                            title={reward.title}
                            image={reward.imageUrl || ''}
                            price={Number(reward.minAmount) || 0}
                            campaignId={reward.campaignId || null}
                            isPreorder={reward.isPreorder}
                            deliveryDate={reward.deliveryDate || null}
                        />
                        {campaignHref && (
                            <Link
                                href={campaignHref}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                                Xem chiến dịch <ExternalLink size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
    const router = useRouter();

    const formatAmount = (amount: number): string => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(0)} triệu`;
        }
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const getProgressPercentage = (current: number, goal: number): number => {
        if (goal === 0) return 0;
        return Math.min((current / goal) * 100, 100);
    };

    const handleCampaignClick = (slug: string) => {
        router.push(`/campaigns/${slug}`);
    };

    const catalogRewards = unionCatalogRewards([
        project.catalogRewards,
        project.campaigns.flatMap((campaign) =>
            campaign.rewards.map((reward) => ({
                ...reward,
                campaignId: reward.campaignId || campaign.id,
                campaignSlug: reward.campaignSlug || campaign.slug,
                campaignTitle: reward.campaignTitle || campaign.title,
                campaignStatus: reward.campaignStatus || campaign.status,
                campaignType: reward.campaignType || campaign.type,
            })),
        ),
    ]);
    const { products, gifts } = classifyProjectRewards(catalogRewards);
    const totalRewards = products.length + gifts.length;
    const campaignTotal = Number(project.campaignTotal || 0);
    const productTotal = Number(project.productTotal || 0);
    const projectTotal = Number(project.projectTotal || campaignTotal + productTotal);
    const linkedBlogPosts = project.blogPosts.filter((post) =>
        project.linkedBlogPostIds.includes(post.id),
    );

    return (
        <div className="min-h-screen bg-white">
            <section
                className="relative overflow-hidden"
                style={{
                    background: project.heroBackgroundType === 'color'
                        ? `linear-gradient(${(project.heroBackgroundConfig?.angle ?? 135)}deg, ${project.heroBackgroundConfig?.colors?.join(', ')})`
                        : 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-white">
                            <h1 className="font-display font-black text-4xl lg:text-5xl mb-4">
                                {project.title}
                            </h1>
                            {project.description && (
                                <p className="text-lg text-blue-100 mb-8 max-w-2xl">
                                    {project.description}
                                </p>
                            )}
                            <div className="mb-8">
                                <ReportButton
                                    targetType="PROJECT"
                                    targetId={project.id}
                                    targetTitle={project.title}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
                                />
                            </div>

                            <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{formatVND(campaignTotal)}</div>
                                        <div className="text-sm text-blue-200">Từ chiến dịch</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{formatVND(productTotal)}</div>
                                        <div className="text-sm text-blue-200">Từ sản phẩm</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                                        <Coins className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{formatVND(projectTotal)}</div>
                                        <div className="text-sm text-blue-200">Tổng dự án</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                                        <FolderKanban className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{project.campaignCount}</div>
                                        <div className="text-sm text-blue-200">Chiến dịch</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{project.blogPostCount}</div>
                                        <div className="text-sm text-blue-200">Bài viết</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex justify-center">
                            <div className="relative w-full max-w-md h-80 lg:h-96">
                                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20" />
                                {project.coverImage && project.heroBackgroundType !== 'color' ? (
                                    <Image
                                        src={project.coverImage}
                                        alt={project.title}
                                        fill
                                        className="rounded-3xl object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="absolute inset-4 flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <FolderKanban className="w-20 h-20 mx-auto mb-4 opacity-60" />
                                            <div className="text-sm text-blue-200">{project.description ? '' : 'Dự án'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {project.richDescription && (
                <section className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="font-display font-bold text-3xl text-gray-900 mb-8">
                        Giới thiệu dự án
                    </h2>
                    <Card className="p-8">
                        <RichTextRenderer content={project.richDescription} />
                    </Card>
                </section>
            )}

            <section className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-8">
                    Chiến dịch trong dự án
                </h2>

                {project.campaigns.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="text-gray-500">
                            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">Chưa có campaign nào trong dự án này</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {project.campaigns.map((campaign, index) => {
                            const statusInfo = getCampaignStatusBadge(campaign.status);
                            const progress = getProgressPercentage(campaign.currentAmount, campaign.goalAmount);
                            const isCompleted = campaign.status === 'SUCCESS' || campaign.status === 'COMPLETED';
                            const isActive = campaign.status === 'ACTIVE' || campaign.status === 'RUNNING';
                            const isComingSoon = campaign.status === 'DRAFT' || campaign.status === 'PENDING' || campaign.status === 'APPROVED';
                            const launchDate = campaignLaunchDate(campaign);

                            return (
                                <Card
                                    key={campaign.id}
                                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => handleCampaignClick(campaign.slug)}
                                >
                                    <div className="flex items-start gap-6">
                                        <div
                                            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                            style={{
                                                backgroundColor: isCompleted ? '#137333' : isActive ? '#f9a825' : '#757575',
                                            }}
                                        >
                                            {index + 1}
                                        </div>

                                        <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                                            {campaign.imageUrl ? (
                                                <Image
                                                    src={campaign.imageUrl}
                                                    alt={campaign.title}
                                                    width={96}
                                                    height={96}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FolderKanban className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-display font-bold text-xl text-gray-900 mb-1">
                                                        {campaign.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {isComingSoon || !launchDate
                                                                ? 'Sắp ra mắt'
                                                                : `Ra mắt: ${formatDate(launchDate)}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className="text-white"
                                                    style={{ backgroundColor: statusInfo.color }}
                                                >
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            {isCompleted ? (
                                                <div className="mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">
                                                            {formatAmount(campaign.currentAmount)}
                                                        </span>
                                                        <span className="text-gray-500">/ {progress.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(progress, 100)}%`,
                                                                backgroundColor: '#137333',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : isActive ? (
                                                <div className="mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">
                                                            {formatAmount(campaign.currentAmount)}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {' '}
                                                            / {formatAmount(campaign.goalAmount)} ({progress.toFixed(0)}%)
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${progress}%`,
                                                                backgroundColor: '#f9a825',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-3">
                                                    <span className="text-gray-500">Sắp ra mắt</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0">
                                            <ArrowRight className="w-6 h-6 text-gray-400" />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="max-w-7xl mx-auto px-6 py-16 bg-gray-50">
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-8">
                    Bài viết từ dự án
                </h2>

                {project.blogPosts.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="text-gray-500">
                            <div className="text-6xl mb-4">📝</div>
                            <p className="text-lg">Chưa có bài viết nào trong dự án này</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.blogPosts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    {post.coverImage && (
                                        <div className="relative w-full h-48 overflow-hidden">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3 className="font-display font-bold text-xl text-gray-900 mb-3 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        {post.publishedAt && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(post.publishedAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {linkedBlogPosts.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="font-display font-bold text-3xl text-gray-900 mb-8">
                        Bài viết được gắn vào dự án
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {linkedBlogPosts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    {post.coverImage ? (
                                        <div className="relative w-full h-40 overflow-hidden">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                                            <Users className="w-10 h-10 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h4 className="font-display font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                            {post.title}
                                        </h4>
                                        {post.excerpt && (
                                            <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex items-center gap-3 mb-8">
                    <Gift className="w-8 h-8 text-purple-600" />
                    <h2 className="font-display font-bold text-3xl text-gray-900">
                        Sản phẩm trong dự án
                    </h2>
                    <Badge variant="secondary" className="ml-2">
                        {totalRewards} gói
                    </Badge>
                </div>

                {totalRewards === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="text-gray-500">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">Dự án này hiện chưa có sản phẩm</p>
                            <p className="text-sm">Có thể gắn sản phẩm có sẵn hoặc tạo sản phẩm mới ở cấp dự án</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-12">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Package className="w-5 h-5 text-blue-600" />
                                <h3 className="font-display font-bold text-xl text-gray-900">Sản phẩm</h3>
                            </div>
                            {products.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <p className="text-gray-500">Chưa có sản phẩm nào trong dự án này</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((reward) => (
                                        <RewardCard key={reward.id} reward={reward} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Gift className="w-5 h-5 text-orange-600" />
                                <h3 className="font-display font-bold text-xl text-gray-900">Rewards & Quà tặng</h3>
                            </div>
                            {gifts.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <p className="text-gray-500">Chưa có quà tặng kèm</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gifts.map((reward) => (
                                        <RewardCard key={reward.id} reward={reward} showGiftBadge />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
