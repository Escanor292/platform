/**
 * Trang chi tiết sản phẩm
 * - Nếu sản phẩm thuộc chiến dịch → giao diện dạng huy động vốn (progress, Pledge ngay)
 * - Nếu sản phẩm độc lập → giao diện dạng thương mại điện tử
 */

import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  Package,
  RotateCcw,
  Users,
  FolderOpen,
  Share2,
  Check,
  Calendar,
  Layers,
  Star,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatVND } from '@/lib/utils';
import { auth } from '@/lib/auth';
import ProductGallery from '@/components/products/ProductGallery';
import { ProductQuickEdit } from '@/components/products/ProductQuickEdit';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import ReportButton from '@/components/report/ReportButton';
import { ProductPurchaseButton } from '@/components/products/ProductPurchaseButton';
import CampaignRewardDonationButton from '@/components/products/CampaignRewardDonationButton';
import QuickAddToCartButton from '@/components/products/QuickAddToCartButton';
import ProductReviews from '@/components/products/ProductReviews';

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ rewardId: string }>;
}) {
  const { rewardId } = await params;

  const reward = await prisma.rewards.findUnique({
    where: { id: rewardId },
    include: {
      campaigns: {
        include: {
          users: { select: { id: true, name: true, avatar: true } },
          projects: { select: { id: true, title: true } },
          pledges: {
            where: { status: 'SUCCESS' },
            select: { amount: true },
            orderBy: { amount: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              pledges: { where: { status: 'SUCCESS' } },
            },
          },
        },
      },
      projects: true,
      _count: {
        select: {
          pledges: { where: { status: 'SUCCESS' } },
          product_reviews: true,
        },
      },
    },
  });

  if (!reward) return notFound();

  const reviewSummary = await prisma.product_reviews.aggregate({
    where: { rewardId: reward.id },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const soldCount = (reward as any)._count?.pledges ?? 0;
  const reviewCount = reviewSummary._count._all;
  const averageRating = reviewSummary._avg.rating ?? 0;

  const campaign = (reward as any).campaigns as any;
  const campaignProject = campaign?.projects || null;
  const project = (reward as any).projects;
  const relatedProject = campaignProject || project;
  // ID nhà sáng tạo để liên hệ (an toàn với sản phẩm có/không chiến dịch)
  const contactUserId =
    campaign?.users?.id ||
    campaign?.creatorId ||
    project?.creatorId;
  const images = reward.productImages || [];
  const hasDiscount =
    reward.maxAmount && Number(reward.maxAmount) > Number(reward.minAmount);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(reward.maxAmount!) - Number(reward.minAmount)) /
          Number(reward.maxAmount!)) *
          100
      )
    : 0;

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://platform-guypmwy3d-escanor292s-projects.vercel.app'}/products/${reward.id}`;

  // Kiểm tra quyền chủ sở hữu (cho chỉnh sửa nhanh tại chỗ)
  const session = await auth();
  const currentUserId = (session?.user as any)?.id as string | undefined;
  const ownerIds = [
    campaign?.users?.id,
    campaign?.creatorId,
    campaignProject?.creatorId,
    project?.creatorId,
  ].filter(Boolean);
  const isOwner = Boolean(currentUserId && ownerIds.includes(currentUserId));
  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.isAdmin === true;
  if (!reward.isActive && !isOwner && !isAdmin) {
    notFound();
  }

  // ---------- Chế độ 1: Sản phẩm thuộc chiến dịch (dạng huy động) ----------
  if (campaign) {
    const totalRaised = campaign.currentAmount || 0;
    const goal = campaign.goalAmount || 1;
    const percent = Math.min(100, Math.round((totalRaised / goal) * 100));
    const daysLeft = campaign.endDate
      ? daysBetween(new Date(), new Date(campaign.endDate))
      : null;
    const topPledge = campaign.pledges[0];
    const backers = (campaign._count as any)?.pledges ?? 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <a href="/" className="hover:text-pgreen">Trang chủ</a>
            <span>›</span>
              {campaignProject && (
                <>
                  <a href={`/projects/${campaignProject.id}`} className="hover:text-pgreen">
                    Dự án
                  </a>
                  <span>›</span>
                </>
              )}
            <a href={`/campaigns/${campaign.slug}`} className="hover:text-pgreen">
              {campaign.title}
            </a>
            <span>›</span>
            <span className="text-gray-700 font-medium">{reward.title}</span>
          </nav>

          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Ảnh sản phẩm */}
              <div className="relative min-h-[320px] lg:min-h-[420px] bg-gray-100">
                {images[0] ? (
                  <ProductGallery images={images} videoUrl={reward.productVideo} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <Package size={72} />
                  </div>
                )}
              </div>

              {/* Thông tin */}
              <div className="p-8 lg:p-10 flex flex-col">
                {/* Liên kết dự án + chiến dịch */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {relatedProject && (
                    <a
                      href={`/projects/${relatedProject.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 hover:border-blue-200 transition-colors"
                    >
                      <FolderOpen size={13} />
                      Dự án: {relatedProject.title}
                    </a>
                  )}
                  <a
                    href={`/campaigns/${campaign.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-pgreen bg-pgreen/10 border border-pgreen/20 px-3 py-1.5 rounded-full hover:bg-pgreen/15 hover:border-pgreen/30 transition-colors"
                  >
                    <Layers size={13} />
                    Chiến dịch: {campaign.title}
                  </a>
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {reward.title}
                </h1>

                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    {reviewCount > 0 ? averageRating.toFixed(1) : 'Chưa có đánh giá'}
                  </span>
                  <span className="text-gray-500">{reviewCount} đánh giá</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">{soldCount} lượt bán</span>
                </div>

                {reward.isPreorder && (
                  <div className="mb-4 space-y-2">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                      <Calendar size={15} />
                      Đặt hàng trước
                      {reward.deliveryDate && ` · dự kiến giao ${new Date(reward.deliveryDate).toLocaleDateString('vi-VN')}`}
                    </div>
                    <p className="text-xs text-gray-500">
                      Online cọc {reward.onlineDepositPercent}% · COD cọc {reward.codDepositPercent}% · phần còn lại thanh toán theo phương thức đã chọn.
                    </p>
                  </div>
                )}

                {reward.description && (
                  <p className="text-gray-600 leading-relaxed mb-5 text-sm">
                    {reward.description}
                  </p>
                )}

                {/* Giá */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-pgreen">
                      {formatVND(reward.minAmount)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          {formatVND(reward.maxAmount!)}
                        </span>
                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded">
                          -{discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mức đóng góp tối thiểu để nhận sản phẩm này
                  </p>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-900">
                      {formatVND(totalRaised)}
                    </span>
                    <span className="font-bold text-pgreen">{percent}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pgreen to-fgreen rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                    <span>Mục tiêu: {formatVND(goal)}</span>
                    {daysLeft !== null && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> Còn {daysLeft} ngày
                      </span>
                    )}
                  </div>
                </div>

                {/* Pledge cao nhất */}
                {topPledge && (
                  <div className="mb-6 p-4 rounded-2xl bg-cream/60 border border-pgreen/10">
                    <div className="text-xs font-semibold text-gray-500 mb-0.5">
                      Đóng góp cao nhất cho phần quà này
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatVND(topPledge.amount)}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex w-full flex-wrap items-center gap-3 mt-auto">
                  <QuickAddToCartButton
                    rewardId={reward.id}
                    title={reward.title}
                    image={images[0] || ''}
                    price={Number(reward.minAmount)}
                    campaignId={campaign.id}
                    isPreorder={reward.isPreorder}
                    deliveryDate={reward.deliveryDate?.toISOString() || null}
                    className="h-12 w-12 rounded-2xl"
                  />
                  <CampaignRewardDonationButton
                    campaignId={campaign.id}
                    campaignSlug={campaign.slug}
                    reward={{
                      id: reward.id,
                      title: reward.title,
                      description: reward.description,
                      minAmount: Number(reward.minAmount),
                      estimatedDelivery: reward.deliveryDate?.toISOString() || null,
                      isPreorder: reward.isPreorder,
                      onlineDepositPercent: reward.onlineDepositPercent,
                      codDepositPercent: reward.codDepositPercent,
                      availability: reward.availability,
                      fulfillmentType: reward.fulfillmentType,
                      maxQuantity: reward.maxQuantity,
                    }}
                  />
                  <button
                    type="button"
                    data-share-button
                    data-url={shareUrl}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-gray-700 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={17} />
                    Chia sẻ
                  </button>
                  <ReportButton
                    targetType="PRODUCT"
                    targetId={reward.id}
                    targetTitle={reward.title}
                  />
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-100">
                  {[
                    { icon: ShieldCheck, title: 'Thanh toán an toàn', sub: 'Bảo mật 100%' },
                    { icon: Package, title: 'Giao hàng toàn quốc', sub: 'Miễn phí vận chuyển' },
                    { icon: RotateCcw, title: 'Đổi trả dễ dàng', sub: 'Trong 7 ngày' },
                    {
                      icon: Users,
                      title: 'Cộng đồng ủng hộ',
                      sub: `${backers} người ủng hộ`,
                    },
                  ].map(({ icon: Icon, title, sub }) => (
                    <div key={title} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-pgreen/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-pgreen" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{title}</div>
                        <div className="text-[11px] text-gray-500">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ProductReviews rewardId={reward.id} />
        <ShareScript />
        {isOwner && (
          <ProductQuickEdit
            product={{
              id: reward.id,
              title: reward.title,
              description: reward.description,
              minAmount: Number(reward.minAmount),
              maxAmount: reward.maxAmount ? Number(reward.maxAmount) : null,
              stock: reward.stock,
              maxQuantity: reward.maxQuantity,
              deliveryDate: reward.deliveryDate,
              isPreorder: reward.isPreorder,
              onlineDepositPercent: reward.onlineDepositPercent,
              codDepositPercent: reward.codDepositPercent,
              isActive: reward.isActive,
              productImages: images,
              productVideo: reward.productVideo,
            }}
            isOwner={isOwner}
          />
        )}
      </div>
    );
  }

  // ---------- Chế độ 2: Sản phẩm độc lập (dạng TMĐT) ----------
  const stockText = reward.stock
    ? `Còn ${reward.stock} sản phẩm`
    : 'Không giới hạn số lượng';
  const deliveryText = reward.deliveryDate
    ? `Giao dự kiến: ${new Date(reward.deliveryDate).toLocaleDateString('vi-VN')}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <a href="/" className="hover:text-pgreen">Trang chủ</a>
          <span>›</span>
          <span className="text-gray-700 font-medium">{reward.title}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Gallery */}
            <div className="relative min-h-[320px] lg:min-h-[420px] bg-gray-100">
              {images.length > 0 || reward.productVideo ? (
                <ProductGallery images={images} videoUrl={reward.productVideo} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <Package size={72} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 lg:p-10 flex flex-col">
              {project && (
                <a
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center gap-1.5 w-fit text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-3 hover:bg-blue-100 hover:border-blue-200 transition-colors"
                >
                  <FolderOpen size={13} />
                  Dự án: {project.title}
                </a>
              )}

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {reward.title}
              </h1>

              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  {reviewCount > 0 ? averageRating.toFixed(1) : 'Chưa có đánh giá'}
                </span>
                <span className="text-gray-500">{reviewCount} đánh giá</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{soldCount} lượt bán</span>
              </div>

              {reward.isPreorder && (
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                  <Calendar size={15} /> Đặt hàng trước
                  {reward.deliveryDate ? ` · dự kiến giao ${new Date(reward.deliveryDate).toLocaleDateString('vi-VN')}` : ''}
                </div>
              )}

              {/* Giá */}
              <div className="mb-5 p-4 rounded-2xl bg-cream/50 border border-pgreen/10">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-pgreen">
                    {formatVND(reward.minAmount)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        {formatVND(reward.maxAmount!)}
                      </span>
                      <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-5">
                <span className="flex items-center gap-1.5">
                  <Package size={15} className="text-pgreen" /> {stockText}
                </span>
                {reward.isPreorder && deliveryText && (
                  <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                    <Calendar size={15} className="text-amber-600" /> Đặt trước · {deliveryText}
                  </span>
                )}
                {((reward as any)._count?.pledges ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users size={15} className="text-pgreen" />{' '}
                    {(reward as any)._count.pledges} người đã nhận
                  </span>
                )}
              </div>

              {reward.description && (
                <p className="text-gray-600 leading-relaxed mb-6 text-sm whitespace-pre-line">
                  {reward.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-auto">
                <AddToCartButton
                  rewardId={reward.id}
                  title={reward.title}
                  image={images[0] || ''}
                  price={Number(reward.minAmount)}
                  originalPrice={reward.maxAmount ? Number(reward.maxAmount) : undefined}
                  stock={reward.stock}
                  isPreorder={reward.isPreorder}
                  deliveryDate={reward.deliveryDate?.toISOString() || null}
                  contactUserId={contactUserId}
                  ownerName={campaign?.users?.name || 'Nhà sáng tạo'}
                  campaignId={campaign?.id}
                  compact
                />
                <ProductPurchaseButton
                  rewardId={reward.id}
                  title={reward.title}
                  minAmount={Number(reward.minAmount)}
                  stock={reward.stock}
                  maxQuantity={reward.maxQuantity}
                  availability={reward.availability}
                  isPreorder={reward.isPreorder}
                  deliveryDate={reward.deliveryDate?.toISOString() || null}
                  onlineDepositPercent={reward.onlineDepositPercent}
                  codDepositPercent={reward.codDepositPercent}
                  fulfillmentType={reward.fulfillmentType}
                  campaignId={campaign?.id}
                />
                <button
                  type="button"
                  data-share-button
                  data-url={shareUrl}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-gray-700 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={17} />
                  Chia sẻ
                </button>
                <ReportButton
                  targetType="PRODUCT"
                  targetId={reward.id}
                  targetTitle={reward.title}
                />
              </div>

              {/* Trust */}
              <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-100">
                {[
                  { icon: ShieldCheck, title: 'Thanh toán an toàn', sub: 'Bảo mật 100%' },
                  { icon: Package, title: 'Giao hàng toàn quốc', sub: 'Miễn phí vận chuyển' },
                  { icon: RotateCcw, title: 'Đổi trả dễ dàng', sub: 'Trong 7 ngày' },
                  { icon: Users, title: 'Đã bán', sub: `${soldCount} lượt bán` },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-pgreen/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-pgreen" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{title}</div>
                      <div className="text-[11px] text-gray-500">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProductReviews rewardId={reward.id} />
      <ShareScript />
      {isOwner && (
        <ProductQuickEdit
          product={{
            id: reward.id,
            title: reward.title,
            description: reward.description,
            minAmount: Number(reward.minAmount),
            maxAmount: reward.maxAmount ? Number(reward.maxAmount) : null,
            stock: reward.stock,
            maxQuantity: reward.maxQuantity,
            deliveryDate: reward.deliveryDate,
            isPreorder: reward.isPreorder,
            isActive: reward.isActive,
            productImages: images,
            productVideo: reward.productVideo,
          }}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}

/** Client script: xử lý nút chia sẻ (copy link) */
function ShareScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
      document.querySelectorAll('[data-share-button]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const url = btn.getAttribute('data-url') || window.location.href;
          try {
            await navigator.clipboard.writeText(url);
            const original = btn.innerHTML;
            btn.innerHTML = '<svg width=17 height=17 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã sao chép link';
            setTimeout(() => { btn.innerHTML = original; }, 2000);
          } catch (e) {
            prompt('Sao chép link sản phẩm:', url);
          }
        });
      });
    `,
      }}
    />
  );
}
