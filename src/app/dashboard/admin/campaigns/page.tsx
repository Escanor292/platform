import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCampaignReviewFields } from '@/lib/moderation/campaign-review';
import { hoursWaiting, isSlaOverdue } from '@/lib/moderation/policy';
import CampaignQueueClient, { type QueueCampaign } from '@/components/admin/CampaignQueueClient';

const STATUS_FILTERS = ['PENDING_REVIEW', 'ACTIVE', 'SUCCESS', 'FAILED', 'CANCELED', 'DRAFT'] as const;

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'ADMIN' && !(session.user as any).isAdmin)) redirect('/');

  const { status, q } = await searchParams;
  const query = (q || '').trim();
  const activeFilter = STATUS_FILTERS.includes(status as (typeof STATUS_FILTERS)[number]) ? status : undefined;

  const campaigns = await prisma.campaigns.findMany({
    where: {
      ...(activeFilter ? { status: activeFilter as any } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { campaignCode: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: activeFilter === 'PENDING_REVIEW' ? { createdAt: 'asc' } : { createdAt: 'desc' },
    include: {
      users: { select: { name: true, email: true, id: true } },
      _count: { select: { pledges: { where: { status: 'SUCCESS' } } } },
    },
  });

  const extra = await getCampaignReviewFields(campaigns.map((item) => item.id));
  const now = new Date();
  const slaCutoff = new Date(now.getTime() - 24 * 36e5);

  const [totalCount, pendingCount, activeCount, successCount, slaOverdueCount] = await Promise.all([
    prisma.campaigns.count(),
    prisma.campaigns.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.campaigns.count({ where: { status: 'ACTIVE' } }),
    prisma.campaigns.count({ where: { status: 'SUCCESS' } }),
    prisma.campaigns.count({ where: { status: 'PENDING_REVIEW', createdAt: { lte: slaCutoff } } }),
  ]);

  const rows: QueueCampaign[] = campaigns.map((campaign) => ({
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    campaignCode: campaign.campaignCode,
    imageUrl: campaign.imageUrl,
    status: campaign.status,
    goalAmount: Number(campaign.goalAmount),
    currentAmount: Number(campaign.currentAmount),
    createdAt: campaign.createdAt.toISOString(),
    slaOverdue: campaign.status === 'PENDING_REVIEW' && isSlaOverdue(campaign.createdAt, 24, now),
    slaHours: hoursWaiting(campaign.createdAt, now),
    rejectionReason: extra[campaign.id]?.rejectionReason ?? null,
    moderationAction: extra[campaign.id]?.moderationAction ?? null,
    successPledgeCount: campaign._count.pledges,
    creator: campaign.users,
  }));

  const summary = [
    { label: 'Tổng số', value: totalCount, href: '/dashboard/admin/campaigns', active: !activeFilter },
    { label: 'Chờ duyệt', value: pendingCount, href: '/dashboard/admin/campaigns?status=PENDING_REVIEW', active: activeFilter === 'PENDING_REVIEW' },
    { label: 'Quá 24 giờ', value: slaOverdueCount, href: '/dashboard/admin/campaigns?status=PENDING_REVIEW', active: false, warn: true },
    { label: 'Đang hoạt động', value: activeCount, href: '/dashboard/admin/campaigns?status=ACTIVE', active: activeFilter === 'ACTIVE' },
    { label: 'Thành công', value: successCount, href: '/dashboard/admin/campaigns?status=SUCCESS', active: activeFilter === 'SUCCESS' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/admin" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white transition hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Hàng đợi chiến dịch</h1>
            <p className="font-medium text-gray-400">
              {query ? `Kết quả cho “${query}” · ${campaigns.length} chiến dịch` : activeFilter ? `Lọc: ${activeFilter} · ${campaigns.length} kết quả` : `Nháp → Chờ duyệt → Hoạt động. SLA 24 giờ.`}
            </p>
          </div>
        </div>

        <form action="/dashboard/admin/campaigns" className="flex gap-3">
          {activeFilter ? <input type="hidden" name="status" value={activeFilter} /> : null}
          <input name="q" defaultValue={query} placeholder="Tìm tên, mã hoặc slug chiến dịch" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none" />
          <button className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white">Tìm</button>
        </form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {summary.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-3xl border p-5 transition ${
                item.active
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : item.warn
                    ? 'border-red-100 bg-red-50 text-red-800'
                    : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`mb-1 text-sm font-bold ${item.active ? 'text-white/70' : item.warn ? 'text-red-500' : 'text-gray-400'}`}>{item.label}</div>
              <div className="text-3xl font-black">{item.value}</div>
            </Link>
          ))}
        </div>

        <CampaignQueueClient campaigns={rows} />
      </div>
    </div>
  );
}
