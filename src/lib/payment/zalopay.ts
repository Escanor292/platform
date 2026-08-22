import crypto from "crypto";

type ZaloPayOrderInput = {
  appTransId: string;
  amount: number;
  appUser: string;
  description: string;
  callbackUrl: string;
  redirectUrl: string;
};

type ZaloPayOrderResponse = {
  return_code: number;
  return_message: string;
  order_url?: string;
  order_token?: string;
  qr_code?: string;
};

function config() {
  const appId = Number(process.env.ZALOPAY_APP_ID);
  const key1 = process.env.ZALOPAY_KEY1;
  const key2 = process.env.ZALOPAY_KEY2;
  if (!appId || !key1 || !key2) throw new Error("Thiếu ZALOPAY_APP_ID, ZALOPAY_KEY1 hoặc ZALOPAY_KEY2");
  const baseUrl = process.env.ZALOPAY_API_URL || (process.env.NODE_ENV === "production" ? "https://openapi.zalopay.vn" : "https://sb-openapi.zalopay.vn");
  return { appId, key1, key2, baseUrl };
}

function vietnamDatePrefix() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}${get("month")}${get("day")}`;
}

export function createZaloPayTransactionId(pledgeId: string) {
  return `${vietnamDatePrefix()}_${pledgeId.replace(/-/g, "").slice(0, 28)}`;
}

export async function createZaloPayOrder(input: ZaloPayOrderInput): Promise<ZaloPayOrderResponse> {
  const { appId, key1, baseUrl } = config();
  const appTime = Date.now();
  const item = "[]";
  const embedData = JSON.stringify({ redirecturl: input.redirectUrl, preferred_payment_method: ["zalopay_wallet"] });
  const macInput = [appId, input.appTransId, input.appUser, input.amount, appTime, embedData, item].join("|");
  const mac = crypto.createHmac("sha256", key1).update(macInput).digest("hex");
  const response = await fetch(`${baseUrl}/v2/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ app_id: appId, app_user: input.appUser, app_trans_id: input.appTransId, app_time: appTime, amount: input.amount, description: input.description, callback_url: input.callbackUrl, item, embed_data: embedData, mac, bank_code: "" }),
  });
  const data = await response.json() as ZaloPayOrderResponse;
  if (!response.ok || data.return_code !== 1 || !data.order_url) throw new Error(data.return_message || "ZaloPay không thể tạo đơn hàng");
  return data;
}

export function verifyZaloPayCallback(data: string, mac: string) {
  const { key2 } = config();
  const expected = crypto.createHmac("sha256", key2).update(data).digest("hex");
  if (expected.length !== mac.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(mac));
}
