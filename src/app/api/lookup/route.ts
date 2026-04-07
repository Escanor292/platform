import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/lookup?code=...
 * Tra cứu công khai chi tiết một giao dịch qua Payment ID hoặc Transaction Reference
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing transaction code" }, { status: 400 });
  }

  try {
    // 1. Thử tìm trong bảng Transaction (chính thức sau khi success)
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { referenceCode: code },
          { gatewayTransactionId: code },
          { paymentId: code }
        ]
      },
      include: {
        campaign: {
          select: {
            title: true,
            slug: true,
            imageUrl: true
          }
        }
      }
    });

    if (transaction) {
      // Bảo mật: Lọc bỏ IP và các thông tin nhạy cảm
      const { ipAddress, ...safeTransaction } = transaction;
      return NextResponse.json({ transaction: safeTransaction });
    }

    // 2. Thử tìm trong bảng Payment (nếu thanh toán chưa hoàn tất hoặc vừa xong)
    const payment = await prisma.payment.findUnique({
      where: { id: code },
      include: {
        pledge: {
          include: {
            campaign: {
              select: {
                title: true,
                slug: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (payment) {
      return NextResponse.json({ payment });
    }

    return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });

  } catch (error: any) {
    console.error("Lookup API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống tra cứu" }, { status: 500 });
  }
}
