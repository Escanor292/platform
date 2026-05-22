import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ txId: string }>;

/**
 * GET /api/transactions/[txId]
 * Tra cứu thông tin giao dịch công khai bằng mã tham chiếu (transactionId hoặc ID)
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { txId } = await params;

    if (!txId || txId.length < 4) {
      return NextResponse.json(
        { error: "Mã giao dịch không hợp lệ" },
        { status: 400 }
      );
    }

    // Trong schema mới, thông tin thanh toán nằm trong model Pledge
    const pledge = await prisma.pledge.findFirst({
      where: {
        OR: [
          { id: txId },
          { transactionId: txId },
        ],
      },
      select: {
        id: true,
        transactionId: true,
        amount: true,
        status: true,
        createdAt: true,
        displayName: true,
        isAnonymous: true,
        paymentProvider: true,
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!pledge) {
      return NextResponse.json(
        { error: "Không tìm thấy giao dịch với mã này" },
        { status: 404 }
      );
    }

    // Ẩn tên nếu ủng hộ ẩn danh
    const responseData = {
      ...pledge,
      displayName: pledge.isAnonymous ? "Người dùng ẩn danh" : pledge.displayName,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[GET /api/transactions/[txId]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
