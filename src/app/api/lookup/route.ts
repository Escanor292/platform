import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Tra cứu Pledge theo transactionId
    const pledge = await prisma.pledge.findUnique({
      where: { transactionId },
      include: {
        campaign: {
          select: {
            title: true,
            slug: true,
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

    // Format dữ liệu an toàn để trả về (Bỏ đi IP, Device, Contact)
    // "Ẩn danh với public ≠ ẩn danh với system"
    const safeData = {
      transactionId: pledge.transactionId,
      displayName: pledge.isAnonymous ? "Người dùng ẩn danh" : pledge.displayName,
      amount: pledge.amount,
      tipAmount: pledge.tipAmount,
      vatAmount: pledge.vatAmount,
      totalAmount: pledge.totalAmount,
      paymentProvider: pledge.paymentProvider,
      status: pledge.status,
      refundStatus: pledge.refundStatus,
      createdAt: pledge.createdAt,
      campaign: {
        title: pledge.campaign.title,
        slug: pledge.campaign.slug,
      },
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
