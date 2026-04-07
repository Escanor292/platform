import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Tạo mã tham chiếu giao dịch duy nhất cho Crowdfunding VN
 * Định dạng: CFVN-YYYYMMDD-RANDOM (8 ký tự)
 */
export function generateReferenceCode() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CFVN-${date}-${random}`;
}

/**
 * Xử lý hoàn tất thanh toán:
 * 1. Cập nhật trạng thái Pledge & Payment thành SUCCESS
 * 2. Cập nhật Campaign currentAmount
 * 3. Tạo/Cập nhật Transaction chính thức với đầy đủ metadata từ Pledge
 */
export async function completePayment(paymentId: string, gatewayTransactionId?: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Tìm thông tin Payment & Pledge
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { pledge: true }
    });

    if (!payment || payment.status === "SUCCESS") return payment;

    // 2. Cập nhật Payment & Pledge
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: { 
        status: "SUCCESS",
        transactionId: gatewayTransactionId 
      }
    });

    await tx.pledge.update({
      where: { id: payment.pledgeId },
      data: { isReleased: true }
    });

    // 3. Cập nhật số tiền dự án
    await tx.campaign.update({
      where: { id: payment.pledge.campaignId },
      data: {
        currentAmount: { increment: payment.pledge.projectAmount }
      }
    });

    // 4. Tạo bản ghi Transaction chính thức
    // Sao chép toàn bộ metadata từ Pledge sang Transaction để tra cứu công khai
    await tx.transaction.create({
      data: {
        amount: payment.pledge.amount,
        type: "PLEDGE",
        status: "SUCCESS",
        description: `Ủng hộ dự án qua ${payment.method}`,
        referenceCode: gatewayTransactionId || payment.id,
        
        campaignId: payment.pledge.campaignId,
        userId: payment.pledge.userId, // Có thể null nếu là guest
        paymentId: payment.id,

        projectAmount: payment.pledge.projectAmount,
        platformTipAmount: payment.pledge.platformTipAmount,
        vatAmount: payment.pledge.vatAmount,

        // Metadata Guest / Anonymous
        guestEmail: payment.pledge.guestEmail,
        displayName: payment.pledge.isAnonymous ? "Người dùng ẩn danh" : (payment.pledge.displayName || "Cổ động viên"),
        isAnonymous: payment.pledge.isAnonymous,
        ipAddress: payment.pledge.ipAddress,

        paymentMethod: payment.method,
        gatewayTransactionId: gatewayTransactionId,

        isInvoiceRequired: payment.pledge.isInvoiceRequired,
        invoiceName: payment.pledge.invoiceName,
        invoiceTaxId: payment.pledge.invoiceTaxId,
        invoiceAddress: payment.pledge.invoiceAddress,
      }
    });

    return updatedPayment;
  });
}
