import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applyCampaignReview } from '@/lib/moderation/campaign-review';
import { MAX_BULK_REVIEW, normalizeRejectReason } from '@/lib/moderation/policy';
import { notifyOwner } from '@/lib/moderation/notify-admins';
import { cacheInvalidatePrefix, CAMPAIGNS_CACHE_PREFIX } from '@/lib/redis-cache';

function isAdmin(user: any) {
  return user?.role === 'ADMIN' || user?.isAdmin === true;
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : [];
    const status = body.status as string;
    const reason = typeof body.reason === 'string' ? body.reason : '';

    if (!['ACTIVE', 'CANCELED'].includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }
    if (ids.length === 0 || ids.length > MAX_BULK_REVIEW) {
      return NextResponse.json({ error: `Chọn từ 1 đến ${MAX_BULK_REVIEW} chiến dịch` }, { status: 400 });
    }
    if (status === 'CANCELED' && !normalizeRejectReason(reason)) {
      return NextResponse.json({ error: 'Cần nhập lý do từ chối' }, { status: 400 });
    }

    const campaigns = await prisma.campaigns.findMany({
      where: { id: { in: ids }, status: 'PENDING_REVIEW' },
      select: { id: true, title: true, slug: true, creatorId: true },
    });

    for (const campaign of campaigns) {
      await applyCampaignReview({
        campaignId: campaign.id,
        status: status as 'ACTIVE' | 'CANCELED',
        reason,
        reviewerId: session.user.id,
        action: status === 'ACTIVE' ? 'APPROVE' : 'REJECT',
      });
      const trimmed = normalizeRejectReason(reason);
      await notifyOwner({
        userId: campaign.creatorId,
        type: status === 'ACTIVE' ? 'CAMPAIGN_APPROVED' : 'CAMPAIGN_REJECTED',
        title: status === 'ACTIVE' ? 'Chiến dịch đã được duyệt' : 'Chiến dịch chưa được duyệt',
        message:
          status === 'ACTIVE'
            ? `Chiến dịch “${campaign.title}” đã được Admin phê duyệt.`
            : `Chiến dịch “${campaign.title}” bị từ chối.${trimmed ? ` Lý do: ${trimmed}` : ''}`,
        href: `/dashboard/creator/edit/${campaign.slug}`,
      });
    }

    await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX).catch(() => undefined);
    return NextResponse.json({ updated: campaigns.length });
  } catch (error) {
    console.error('[API] PATCH /api/admin/campaigns/bulk', error);
    return NextResponse.json({ error: 'Không thể duyệt hàng loạt' }, { status: 500 });
  }
}
