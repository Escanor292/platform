import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withdrawCampaign } from '@/lib/moderation/campaign-review';

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
      select: { id: true, creatorId: true, status: true },
    });
    if (!campaign) return NextResponse.json({ error: 'Không tìm thấy chiến dịch' }, { status: 404 });
    if (campaign.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Chỉ chủ chiến dịch mới rút khỏi hàng đợi' }, { status: 403 });
    }
    await withdrawCampaign({
      campaignId: campaign.id,
      status: campaign.status,
      creatorId: session.user.id,
    });
    return NextResponse.json({ success: true, status: 'DRAFT' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Không rút được' }, { status: 400 });
  }
}
