import { MIN_DONATION_AMOUNT } from "@/lib/payment/pledge-charge";

export function validateRewardCheckout(params: {
  reward: {
    minAmount: unknown;
    maxAmount: unknown;
    maxQuantity: number | null;
    stock: number | null;
    availability: string;
    isPreorder: boolean;
    fulfillmentType: string;
  };
  amount: number;
  quantity: number;
  shippingMethod: string;
  paymentMethod: string;
  shippingAddress: string;
  sessionShippingAddress?: string;
}): { ok: true } | { ok: false; status: number; error: string } {
  const { reward, amount, quantity, shippingMethod, paymentMethod, shippingAddress, sessionShippingAddress } = params;
  const minimumRewardAmount = Math.max(MIN_DONATION_AMOUNT, Number(reward.minAmount));
  if (amount < minimumRewardAmount) {
    return { ok: false, status: 400, error: `So tien toi thieu cho phan qua nay la ${minimumRewardAmount.toLocaleString("vi-VN")}d` };
  }
  if (reward.maxAmount && amount > Number(reward.maxAmount)) {
    return { ok: false, status: 400, error: "So tien vuot qua muc toi da cua phan qua" };
  }
  if (reward.maxQuantity && quantity > reward.maxQuantity) {
    return { ok: false, status: 400, error: "So luong vuot qua gioi han cua phan qua" };
  }
  if (!["STANDARD", "EXPRESS", "EMAIL", "DOWNLOAD"].includes(shippingMethod)) {
    return { ok: false, status: 400, error: "Phuong thuc giao hang khong hop le" };
  }
  if (reward.fulfillmentType === "PHYSICAL" && !["STANDARD", "EXPRESS"].includes(shippingMethod)) {
    return { ok: false, status: 400, error: "San pham vat ly can chon phuong thuc van chuyen" };
  }
  if (reward.fulfillmentType !== "PHYSICAL" && !["EMAIL", "DOWNLOAD"].includes(shippingMethod)) {
    return { ok: false, status: 400, error: "Tai san so can chon phuong thuc nhan qua email hoac kho da mua" };
  }
  if (paymentMethod === "COD" && reward.fulfillmentType !== "PHYSICAL") {
    return { ok: false, status: 400, error: "COD chi ap dung cho san pham vat ly" };
  }
  if (paymentMethod === "COD" && !reward.isPreorder && reward.availability !== "AVAILABLE") {
    return { ok: false, status: 400, error: "COD thuong chi ap dung cho san pham vat ly co san" };
  }
  if (reward.stock !== null && reward.stock < quantity) {
    return { ok: false, status: 409, error: "San pham khong du ton kho" };
  }
  if (reward.fulfillmentType === "PHYSICAL" && !shippingAddress && !sessionShippingAddress) {
    return { ok: false, status: 400, error: "Vui long nhap dia chi nhan hang" };
  }
  return { ok: true };
}
