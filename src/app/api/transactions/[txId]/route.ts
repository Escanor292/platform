import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ txId: string }> };

/**
 * GET /api/transactions/[txId]
 * Tra cứu thông tin giao dịch công khai bằng mã tham chiếu
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { id: txId },
          { referenceCode: txId },
        ],
      },
      select: {
        id: true,
        referenceCode: true,
        amount: true,
        type: true,
        status: true,
        createdAt: true,
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
        pledge: {
          select: {
            displayName: true,
            isAnonymous: true,
            amount: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Không tìm thấy giao dịch với mã này" },
        { status: 404 }
      );
    }

    // Ẩn tên nếu ẩn danh
    if (transaction.pledge?.isAnonymous) {
      transaction.pledge.displayName = "Ẩn danh";
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[GET /api/transactions/[txId]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
