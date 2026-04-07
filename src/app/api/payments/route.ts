import { NextResponse } from "next/server";
import { VNPay } from "vnpay";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// VNPay Configuration
const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE!,
  secureSecret: process.env.VNP_HASH_SECRET!,
  api_Host: "https://sandbox.vnpayment.vn",
});

/**
 * POST /api/payments
 * Chấp nhận tất cả yêu cầu ủng hộ (pledge) và khởi tạo thanh toán qua gateway tương ứng.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    const data = await request.json();
    const { 
      amount, campaignId, rewardId, 
      method = "VNPAY", // VNPAY, PAYOS, MOMO, BANK_TRANSFER
      tipAmount = 0, vatAmount = 0,
      guestEmail = null, displayName = null, 
      isAnonymous = false, ipAddress = null
    } = data;

    if (!amount || !campaignId) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Tạo bản ghi Pledge
    const pledge = await prisma.pledge.create({
      data: {
        userId: user?.id || null,
        campaignId,
        rewardId,
        amount,
        projectAmount: amount - tipAmount - vatAmount,
        platformTipAmount: tipAmount,
        vatAmount: vatAmount,
        guestEmail,
        displayName: isAnonymous ? "Người dùng ẩn danh" : (displayName || user?.name || "Người ủng hộ"),
        isAnonymous,
        ipAddress,
      }
    });

    // 2. Tạo bản ghi Payment (Trạng thái PENDING)
    const payment = await prisma.payment.create({
      data: {
        pledgeId: pledge.id,
        userId: user?.id || null,
        amount,
        method: method,
      }
    });

    // 3. Khởi tạo thanh toán tùy theo phương thức
    let checkoutUrl = "";

    switch (method.toUpperCase()) {
      case "VNPAY": {
        checkoutUrl = vnpay.buildPaymentUrl({
          vnp_Amount: amount,
          vnp_IpAddr: ipAddress || "127.0.0.1",
          vnp_OrderInfo: `CFVN-PLEDGE-${pledge.id.slice(0, 8)}`,
          vnp_OrderType: "billpayment",
          vnp_ReturnUrl: `${process.env.NEXTAUTH_URL}/payment-success?code=${payment.id}`,
          vnp_TxnRef: payment.id,
        });
        break;
      }
      
      case "PAYOS":
      case "MOMO": {
        // TODO: Cài đặt SDK và tích hợp PayOS / MoMo tại đây
        // Hiện tại trả về mock URL hoặc thông báo chưa hỗ trợ
        return NextResponse.json({ 
            error: `Phương thức ${method} đang được bảo trì. Vui lòng chọn VNPAY.`,
            paymentId: payment.id 
        }, { status: 400 });
      }

      default: {
        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
      }
    }

    return NextResponse.json({ 
        checkoutUrl,
        paymentId: payment.id 
    });

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
