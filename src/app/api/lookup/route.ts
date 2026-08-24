import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp mã giao dịch (transactionId)" },
        { status: 400 }
      );
    }

    // Tra cứu Pledge theo nhiều trường ID khả thi
    const pledge = await prisma.pledges.findFirst({
      where: {
        OR: [
          { transactionId: transactionId },
          { id: transactionId },
          { payosOrderCode: transactionId }
        ]
      },
      include: {
        campaigns: {
          select: {
            title: true,
            slug: true,
            campaignCode: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!pledge) {
      return NextResponse.json(
        { error: "Không tìm thấy giao dịch nào với mã này" },
        { status: 404 }
      );
    }

    // Format dữ liệu an toàn để trả về
    const safeData = {
      transactionId: pledge.transactionId,
      displayName: pledge.isAnonymous ? "Người dùng ẩn danh" : (pledge.displayName || "Khách"),
      amount: pledge.amount,
      tipAmount: pledge.tipAmount,
      vatAmount: pledge.vatAmount,
      totalAmount: pledge.totalAmount,
      paymentProvider: pledge.paymentProvider,
      status: pledge.status,
      refundStatus: pledge.refundStatus,
      createdAt: pledge.createdAt,
      campaign: pledge.campaigns ? {
        title: pledge.campaigns.title,
        slug: pledge.campaigns.slug,
        campaignCode: pledge.campaigns.campaignCode,
        imageUrl: pledge.campaigns.imageUrl,
      } : null,
    };

    return NextResponse.json(safeData);
  } catch (error) {
    console.error("[LOOKUP_API]", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống trong quá trình tra cứu" },
      { status: 500 }
    );
  }
}
