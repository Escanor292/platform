import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasOpenRewardReport, releaseHeldReward } from "@/lib/payment/release-reward";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ rewardId: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để xác nhận" }, { status: 401 });
    }

    const { rewardId } = await context.params;
    const pledge = await prisma.pledges.findFirst({
      where: { rewardId, userId, status: "SUCCESS" },
      select: { id: true, receivedAt: true, fulfillmentStatus: true },
      orderBy: { createdAt: "desc" },
    });

    if (!pledge) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng hợp lệ cho sản phẩm này" }, { status: 403 });
    }

    if (["RETURN_REQUESTED", "RETURNED", "CANCELED", "DELIVERY_FAILED"].includes(pledge.fulfillmentStatus)) {
      return NextResponse.json({ error: "Đơn đang khiếu nại hoặc đã đóng, không xác nhận nhận hàng" }, { status: 409 });
    }

    if (await hasOpenRewardReport(pledge.id)) {
      return NextResponse.json({ error: "Đơn đang có báo cáo, admin sẽ xử lý" }, { status: 409 });
    }

    const receivedAt = new Date();
    await prisma.pledges.update({
      where: { id: pledge.id },
      data: { receivedAt, fulfillmentStatus: "DELIVERED", updatedAt: receivedAt },
    });
    await releaseHeldReward(pledge.id, receivedAt);

    return NextResponse.json({ receivedAt });
  } catch (error) {
    console.error("[PRODUCT_RECEIVED_POST_ERROR]", error);
    return NextResponse.json({ error: "Không thể xác nhận đã nhận hàng" }, { status: 500 });
  }
}
