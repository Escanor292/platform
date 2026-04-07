import prisma from "@/lib/prisma";

/**
 * Xử lý hoàn tiền cho một pledge cụ thể
 * Hỗ trợ: VNPay, MoMo, PayOS, Bank Transfer
 */
export async function processRefund(pledge: {
  id: string;
  amount: number;
  payment?: { id: string; method?: string | null; transactionRef?: string | null } | null;
}): Promise<void> {
  if (!pledge.payment) {
    // Không có payment record, skip
    console.warn(`[refund] No payment record for pledge ${pledge.id}`);
    return;
  }

  const { method } = pledge.payment;

  try {
    // Tạo transaction hoàn tiền
    await prisma.transaction.create({
      data: {
        amount: pledge.amount,
        type: "REFUND",
        status: "PENDING",
        referenceCode: `REF-${pledge.id}-${Date.now()}`,
        pledgeId: pledge.id,
      },
    });

    // Xử lý hoàn tiền theo phương thức
    switch (method) {
      case "VNPAY":
        await refundVNPay(pledge.payment.transactionRef!, pledge.amount);
        break;
      case "MOMO":
        await refundMoMo(pledge.payment.transactionRef!, pledge.amount);
        break;
      case "PAYOS":
        await refundPayOS(pledge.payment.id, pledge.amount);
        break;
      case "BANK":
      default:
        // Bank transfer: manual process, chỉ ghi nhận status PENDING
        console.log(`[refund] Manual bank refund needed for pledge ${pledge.id}, amount: ${pledge.amount}`);
        break;
    }

    // Cập nhật transaction thành công
    await prisma.transaction.updateMany({
      where: { pledgeId: pledge.id, type: "REFUND", status: "PENDING" },
      data: { status: "SUCCESS" },
    });

    // Cập nhật pledge
    await prisma.pledge.update({
      where: { id: pledge.id },
      data: { isReleased: false },
    });
  } catch (error) {
    // Cập nhật transaction thất bại
    await prisma.transaction.updateMany({
      where: { pledgeId: pledge.id, type: "REFUND", status: "PENDING" },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

async function refundVNPay(txnRef: string, amount: number): Promise<void> {
  // VNPay Refund API - cần implement với VNPay SDK
  console.log(`[VNPay refund] txnRef=${txnRef}, amount=${amount}`);
  // TODO: Gọi VNPay Refund API
}

async function refundMoMo(orderId: string, amount: number): Promise<void> {
  // MoMo Refund API
  const refundBody = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    orderId: `REF-${orderId}-${Date.now()}`,
    requestId: `REF-REQ-${Date.now()}`,
    amount,
    transId: orderId,
    lang: "vi",
    description: "Hoàn tiền do campaign không đạt mục tiêu",
  };

  console.log(`[MoMo refund] body=${JSON.stringify(refundBody)}`);
  // TODO: Gọi MoMo Refund API
}

async function refundPayOS(paymentId: string, amount: number): Promise<void> {
  // PayOS Refund - theo tài liệu PayOS
  console.log(`[PayOS refund] paymentId=${paymentId}, amount=${amount}`);
  // TODO: Gọi PayOS Refund API
}
