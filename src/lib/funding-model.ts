export const FUNDING_MODELS = ["ALL_OR_NOTHING", "KEEP_IT_ALL"] as const;

export type FundingModel = (typeof FUNDING_MODELS)[number];

export const DEFAULT_PLATFORM_FEE_RATE = 0.08;

/** Hạn gây quỹ mặc định cho chiến dịch không quà (khoảng 2 tháng). */
export const DEFAULT_DONATION_DURATION_DAYS = 60;

/** Sau hạn gửi hàng, creator có 2 ngày để giao cho vận chuyển. */
export const CARRIER_HANDOFF_GRACE_DAYS = 2;

export function parseFundingModel(value: unknown): FundingModel | null {
  if (value === "ALL_OR_NOTHING" || value === "KEEP_IT_ALL") return value;
  return null;
}

export function getFundingModelLabel(model: FundingModel | string | null | undefined): string {
  if (model === "KEEP_IT_ALL") return "Keep-It-All";
  return "All-or-Nothing";
}

export function getFundingModelDescription(model: FundingModel): string {
  if (model === "KEEP_IT_ALL") {
    return "Không quà: hết hạn giữ số đã góp dù chưa đủ mục tiêu. Có hàng/pre-order: vẫn giao; hoàn nếu trễ quá 2 ngày không đưa vận chuyển.";
  }
  return "Không quà: hết hạn (thường 2 tháng) chưa đủ mục tiêu thì hoàn. Có hàng: chốt hạn vẫn xác nhận giao dù miss goal; hoàn nếu trễ 2 ngày không đưa vận chuyển.";
}

export function canEditFundingModel(status: string | null | undefined): boolean {
  return status === "DRAFT" || status === "PENDING_REVIEW" || !status;
}

export function campaignHasSellableRewards(rewardCount: number | null | undefined): boolean {
  return Number(rewardCount || 0) > 0;
}

export function defaultEndDateForType(campaignType: string, now = new Date()): Date {
  const days = campaignType === "DONATION" ? DEFAULT_DONATION_DURATION_DAYS : DEFAULT_DONATION_DURATION_DAYS;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export function coerceToKeepItAllIfProducts(
  fundingModel: FundingModel | string | null | undefined,
  _hasSellableRewards: boolean,
): FundingModel | null {
  return parseFundingModel(fundingModel);
}

export function assertFundingModelAllowed(params: {
  fundingModel: FundingModel | string | null | undefined;
  hasSellableRewards?: boolean;
}): { ok: true; model: FundingModel } | { ok: false; error: string } {
  const model = parseFundingModel(params.fundingModel);
  if (!model) return { ok: false, error: "Mô hình gây quỹ không hợp lệ" };
  return { ok: true, model };
}

/** Hoàn vì miss goal chỉ khi All-or-Nothing, không có hàng, chưa đủ mục tiêu. */
export function shouldRefundOnDeadline(params: {
  fundingModel: FundingModel | string | null | undefined;
  reachedGoal: boolean;
  hasSellableRewards?: boolean;
}): boolean {
  if (params.hasSellableRewards) return false;
  if (params.reachedGoal) return false;
  return params.fundingModel === "ALL_OR_NOTHING";
}

export function calculatePlatformFee(
  amount: number,
  feeRate: number | null | undefined = DEFAULT_PLATFORM_FEE_RATE,
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const rate =
    Number.isFinite(Number(feeRate)) && Number(feeRate) >= 0
      ? Number(feeRate)
      : DEFAULT_PLATFORM_FEE_RATE;
  return Math.round(amount * rate);
}

export function shipByDate(params: {
  deliveryDate?: Date | string | null;
  campaignEndDate?: Date | string | null;
}): Date | null {
  const raw = params.deliveryDate || params.campaignEndDate;
  if (!raw) return null;
  const date = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function carrierHandoffDeadline(shipBy: Date, now = new Date()): Date {
  return new Date(shipBy.getTime() + CARRIER_HANDOFF_GRACE_DAYS * 24 * 60 * 60 * 1000);
}

export function isPastCarrierHandoffSla(params: {
  deliveryDate?: Date | string | null;
  campaignEndDate?: Date | string | null;
  handedToCarrierAt?: Date | string | null;
  fulfillmentStatus?: string | null;
  now?: Date;
}): boolean {
  const shipped = ["SHIPPED", "DELIVERED"].includes(String(params.fulfillmentStatus || ""));
  if (shipped || params.handedToCarrierAt) return false;
  const shipBy = shipByDate({
    deliveryDate: params.deliveryDate,
    campaignEndDate: params.campaignEndDate,
  });
  if (!shipBy) return false;
  const now = params.now || new Date();
  return now.getTime() > carrierHandoffDeadline(shipBy).getTime();
}
