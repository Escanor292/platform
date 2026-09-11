import { calculateDepositAmount, normalizeDepositPercent } from "@/lib/preorder-deposit";
import { calculatePlatformFee } from "@/lib/funding-model";

export const MIN_DONATION_AMOUNT = 50_000;
export const MAX_TIP_PERCENT = 1000;

export function isValidInternalEmail(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 254 && /^\S+@\S+\.\S+$/.test(value.trim());
}

export function computePledgeCharge(params: {
  amount: number;
  quantity: number;
  paymentMethod: "ONLINE" | "COD";
  platformTipPercent: number;
  reward: {
    availability: string;
    isPreorder: boolean;
    onlineDepositPercent: number | null;
    codDepositPercent: number | null;
    fulfillmentType: string;
  } | null;
  shippingMethod: string;
  feeRate: number;
}) {
  const isPreorder = Boolean(params.reward?.isPreorder);
  const isReadyProduct = params.reward?.availability === "AVAILABLE" && !isPreorder;
  const baseAmount = params.reward ? params.amount * params.quantity : params.amount;
  const depositPercent = isPreorder
    ? (params.paymentMethod === "COD"
      ? normalizeDepositPercent(params.reward?.codDepositPercent, 50)
      : normalizeDepositPercent(params.reward?.onlineDepositPercent, 30))
    : 0;
  const tipPercent = !isReadyProduct && params.paymentMethod === "ONLINE"
    ? Math.min(Math.max(Number.isFinite(params.platformTipPercent) ? params.platformTipPercent : 0, 0), MAX_TIP_PERCENT)
    : 0;
  const tipAmount = Math.round((baseAmount * tipPercent) / 100);
  const vatAmount = Math.round(tipAmount * 0.1);
  const shippingFee = params.reward?.fulfillmentType === "PHYSICAL" && params.shippingMethod === "EXPRESS" ? 30000 : 0;
  const totalAmount = baseAmount + tipAmount + vatAmount + shippingFee;
  const depositAmount = isPreorder ? calculateDepositAmount(baseAmount, depositPercent) : 0;
  const chargeAmount = isPreorder && params.paymentMethod === "COD" ? depositAmount : totalAmount;
  const remainingAmount = Math.max(0, totalAmount - chargeAmount);
  const platformFee = calculatePlatformFee(baseAmount, params.feeRate);
  return {
    isPreorder,
    baseAmount,
    tipAmount,
    vatAmount,
    shippingFee,
    totalAmount,
    depositAmount,
    chargeAmount,
    remainingAmount,
    platformFee,
  };
}
