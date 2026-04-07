/**
 * MoMo Payment Integration
 * Tài liệu: https://developers.momo.vn
 */

import crypto from "crypto";

const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE!;
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY!;
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY!;
const MOMO_ENDPOINT =
  process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";

interface MoMoPaymentParams {
  amount: number;
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
}

interface MoMoPaymentResponse {
  resultCode: number;
  message: string;
  payUrl?: string;
  orderId: string;
}

/**
 * Tạo link thanh toán MoMo
 */
export async function createMoMoPayment({
  amount,
  orderId,
  orderInfo,
  redirectUrl,
  ipnUrl,
}: MoMoPaymentParams): Promise<MoMoPaymentResponse> {
  const requestId = `${MOMO_PARTNER_CODE}-${Date.now()}`;
  const requestType = "payWithMethod";
  const extraData = "";

  const rawSignature = [
    `accessKey=${MOMO_ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${MOMO_PARTNER_CODE}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  const payload = {
    partnerCode: MOMO_PARTNER_CODE,
    accessKey: MOMO_ACCESS_KEY,
    requestId,
    amount: String(amount),
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    signature,
    lang: "vi",
  };

  const response = await fetch(MOMO_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json() as Promise<MoMoPaymentResponse>;
}

/**
 * Xác thực callback từ MoMo
 */
export function verifyMoMoSignature(
  params: Record<string, string>,
  receivedSignature: string
): boolean {
  const rawSignature = [
    `accessKey=${MOMO_ACCESS_KEY}`,
    `amount=${params.amount}`,
    `extraData=${params.extraData}`,
    `message=${params.message}`,
    `orderId=${params.orderId}`,
    `orderInfo=${params.orderInfo}`,
    `orderType=${params.orderType}`,
    `partnerCode=${params.partnerCode}`,
    `payType=${params.payType}`,
    `requestId=${params.requestId}`,
    `responseTime=${params.responseTime}`,
    `resultCode=${params.resultCode}`,
    `transId=${params.transId}`,
  ].join("&");

  const expectedSignature = crypto
    .createHmac("sha256", MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  return expectedSignature === receivedSignature;
}
