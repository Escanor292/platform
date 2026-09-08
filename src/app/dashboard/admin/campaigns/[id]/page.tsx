import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { getCampaignReviewFields } from '@/lib/moderation/campaign-review';
import AdminCampaignReviewPanel from '@/components/admin/AdminCampaignReviewPanel';
import { formatVND } from '@/lib/utils';

export default async function AdminCampaignPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'ADMIN' && !(session.user as any).isAdmin)) {
    redirect('/');
  }

  const { id } = await params;
  const campaign = await prisma.campaigns.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      users: { select: { id: true, name: true, email: true, avatar: true } },
      projects: { select: { id: true, title: true, slug: true } },
      _count: { select: { pledges: { where: { status: 'SUCCESS' } } } },
    },
  });
  if (!campaign) notFound();

  const review = (await getCampaignReviewFields([campaign.id]))[campaign.id];
  const images = campaign.images?.length ? campaign.images : campaign.imageUrl ? [campaign.imageUrl] : [];

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <Link href="/dashboard/admin/campaigns?status=PENDING_REVIEW" className="text-sm font-semibold text-pgreen">
            ← Hàng đợi chiến dịch
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">{campaign.category}</p>
          <h1 className="mt-1 text-3xl font-black text-gray-900">{campaign.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {campaign.users?.name || 'Ẩn danh'} · {campaign.users?.email} · {campaign.campaignCode}
          </p>
          <p className="mt-4 text-gray-600">{campaign.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-gray-400">Mục tiêu</div>
              <div className="font-black">{formatVND(Number(campaign.goalAmount))}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-gray-400">Đã huy động</div>
              <div className="font-black">{formatVND(Number(campaign.currentAmount))}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-gray-400">Mô hình</div>
              <div className="font-black">{campaign.fundingModel === "KEEP_IT_ALL" ? "Keep-It-All" : "All-or-Nothing"}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-gray-400">Nổi bật hệ thống</div>
              <div className="font-black">{campaign.isFeatured ? "Có" : "Không"}</div>
            </div>
          </div>
          {images[0] && <img src={images[0]} alt={campaign.title} className="mt-6 w-full rounded-2xl object-cover" />}
          <div className="prose mt-8 max-w-none">
            {campaign.longDescription ? (
              <RichTextRenderer content={campaign.longDescription} />
            ) : (
              <p className="text-gray-400">Chưa có nội dung chi tiết.</p>
            )}
          </div>
        </article>
        <AdminCampaignReviewPanel
          campaignId={campaign.id}
          slug={campaign.slug}
          title={campaign.title}
          status={campaign.status}
          rejectionReason={review?.rejectionReason || ''}
          reviewerNote={review?.reviewerNote || ''}
          moderationAction={review?.moderationAction || null}
          successPledgeCount={campaign._count.pledges}
          isFeatured={campaign.isFeatured}
          fundingModel={campaign.fundingModel}
        />
      </div>
    </div>
  );
}
