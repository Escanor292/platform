import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { submitCampaignForReview } from '@/lib/moderation/campaign-review';
import { AON_WITH_PRODUCTS_ERROR, campaignHasSellableRewards } from '@/lib/funding-model';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { slug } = await context.params;
    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: {
        id: true,
        slug: true,
        title: true,
        creatorId: true,
        status: true,
        fundingModel: true,
        _count: {
          select: {
            pledges: { where: { status: 'SUCCESS' } },
            rewards: true,
          },
        },
      },
    });
    if (!campaign) return NextResponse.json({ error: 'Khong tim thay chien dich' }, { status: 404 });

    if (campaign.fundingModel === 'ALL_OR_NOTHING' && campaignHasSellableRewards(campaign._count.rewards)) {
      return NextResponse.json({ error: AON_WITH_PRODUCTS_ERROR }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, role: true },
    });
    const isAdmin = !!user?.isAdmin || user?.role === 'ADMIN';
    if (!isAdmin && campaign.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Khong co quyen gui duyet chien dich nay' }, { status: 403 });
    }

    const result = await submitCampaignForReview({
      campaignId: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      creatorId: session.user.id,
      status: campaign.status,
      successPledgeCount: campaign._count.pledges,
      isAdmin,
    });
    return NextResponse.json({ success: true, status: result.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Khong gui duyet duoc' },
      { status: error.message?.includes('khong the') || error.message?.includes('Khong') ? 400 : 500 }
    );
  }
}
