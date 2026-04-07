import { VNPay } from "vnpay";

export const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE || "",
  secureSecret: process.env.VNPAY_HASH_SECRET || "",
  vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  testMode: true,
});

export function verifyVNPayReturn(queryParams: any) {
  return vnpay.verifyReturnUrl(queryParams);
}
