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
    return { ok: false, status: 400, error: `Số tiền tối thiểu cho phần quà này là ${minimumRewardAmount.toLocaleString("vi-VN")}đ` };
  }
  if (reward.maxAmount && amount > Number(reward.maxAmount)) {
    return { ok: false, status: 400, error: "Số tiền vượt quá mức tối đa của phần quà" };
  }
  if (reward.maxQuantity && quantity > reward.maxQuantity) {
    return { ok: false, status: 400, error: "Số lượng vượt quá giới hạn của phần quà" };
  }
  if (!["STANDARD", "EXPRESS", "EMAIL", "DOWNLOAD"].includes(shippingMethod)) {
    return { ok: false, status: 400, error: "Phương thức giao hàng không hợp lệ" };
  }
  if (reward.fulfillmentType === "PHYSICAL" && !["STANDARD", "EXPRESS"].includes(shippingMethod)) {
    return { ok: false, status: 400, error: "Sản phẩm vật lý cần chọn phương thức vận chuyển" };
  }
  if (reward.fulfillmentType !== "PHYSICAL" && !["EMAIL", "DOWNLOAD"].includes(shippingMethod)) {
    return { ok: false, status: 400, error: "Tài sản số cần chọn phương thức nhận qua email hoặc kho đã mua" };
  }
  if (paymentMethod === "COD" && reward.fulfillmentType !== "PHYSICAL") {
    return { ok: false, status: 400, error: "COD chỉ áp dụng cho sản phẩm vật lý" };
  }
  if (paymentMethod === "COD" && !reward.isPreorder && reward.availability !== "AVAILABLE") {
    return { ok: false, status: 400, error: "COD thường chỉ áp dụng cho sản phẩm vật lý có sẵn" };
  }
  if (reward.stock !== null && reward.stock < quantity) {
    return { ok: false, status: 409, error: "Sản phẩm không đủ tồn kho" };
  }
  if (reward.fulfillmentType === "PHYSICAL" && !shippingAddress && !sessionShippingAddress) {
    return { ok: false, status: 400, error: "Vui lòng nhập địa chỉ nhận hàng" };
  }
  return { ok: true };
}
