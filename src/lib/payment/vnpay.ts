import { VNPay, ProductCode } from "vnpay";

export const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE!,
  secureSecret: process.env.VNP_HASH_SECRET!,
});

/**
 * Build VNPay payment URL for a given payment record
 */
export function buildVNPayUrl({
  amount,
  paymentId,
  ipAddress,
  orderInfo,
  returnUrl,
}: {
  amount: number;
  paymentId: string;
  ipAddress?: string;
  orderInfo: string;
  returnUrl: string;
}) {
  return vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddress || "127.0.0.1",
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: paymentId,
  });
}


/**
 * Verify VNPay IPN (Instant Payment Notification) or Return URL
 */
export function verifyVNPayReturn(queryParams: any) {
  return vnpay.verifyReturnUrl(queryParams);
}
