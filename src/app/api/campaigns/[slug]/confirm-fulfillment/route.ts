import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { campaignHasSellableRewards } from "@/lib/funding-model";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await context.params;
  const campaign = await prisma.campaigns.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    select: {
      id: true,
      slug: true,
      creatorId: true,
      status: true,
      fulfillmentConfirmedAt: true,
      _count: { select: { rewards: true } },
    },
  });
  if (!campaign) return NextResponse.json({ error: "Không tìm thấy chiến dịch" }, { status: 404 });
  if (campaign.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Không có quyền xác nhận giao hàng" }, { status: 403 });
  }
  if (!campaignHasSellableRewards(campaign._count.rewards)) {
    return NextResponse.json({ error: "Chiến dịch không có sản phẩm để giao" }, { status: 400 });
  }
  if (!["SUCCESS", "FAILED", "ACTIVE"].includes(campaign.status)) {
    return NextResponse.json({ error: "Chưa đến lúc xác nhận giao" }, { status: 400 });
  }
  const updated = await prisma.campaigns.update({
    where: { id: campaign.id },
    data: { fulfillmentConfirmedAt: campaign.fulfillmentConfirmedAt || new Date(), updatedAt: new Date() },
    select: { id: true, fulfillmentConfirmedAt: true, status: true },
  });
  return NextResponse.json({
    ok: true,
    campaign: updated,
    message: "Đã xác nhận sẽ giao hàng (kể cả khi chưa đủ mục tiêu).",
  });
}
