import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { submitCampaignForReview } from '@/lib/moderation/campaign-review';

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
        _count: { select: { pledges: { where: { status: 'SUCCESS' } } } },
      },
    });
    if (!campaign) return NextResponse.json({ error: 'Không tìm thấy chiến dịch' }, { status: 404 });

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, role: true },
    });
    const isAdmin = !!user?.isAdmin || user?.role === 'ADMIN';
    if (!isAdmin && campaign.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Không có quyền gửi duyệt chiến dịch này' }, { status: 403 });
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
      { error: error.message || 'Không gửi duyệt được' },
      { status: error.message?.includes('không thể') || error.message?.includes('Không') ? 400 : 500 }
    );
  }
}
