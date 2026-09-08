export const FUNDING_MODELS = ["ALL_OR_NOTHING", "KEEP_IT_ALL"] as const;

export type FundingModel = (typeof FUNDING_MODELS)[number];

export const DEFAULT_PLATFORM_FEE_RATE = 0.08;

export const AON_WITH_PRODUCTS_ERROR =
  "Chiến dịch có bán sản phẩm (pre-order hoặc hàng có sẵn) không được All-or-Nothing. Đổi Keep-It-All trước khi thêm phần quà.";

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
    return "Hết hạn vẫn nhận số đã góp, dù chưa đủ mục tiêu. Không hoàn vì miss goal. Chiến dịch đóng theo ngày hết hạn, không đóng sớm khi đủ mục tiêu.";
  }
  return "Chỉ dùng khi không bán sản phẩm. Đóng theo ngày hết hạn: đạt mục tiêu thì chi hộ, không đạt thì hoàn. Đủ goal giữa chừng vẫn chạy đến hạn.";
}

/** Chỉ được đổi khi chưa duyệt (nháp / chờ duyệt). */
export function canEditFundingModel(status: string | null | undefined): boolean {
  return status === "DRAFT" || status === "PENDING_REVIEW" || !status;
}

export function campaignHasSellableRewards(rewardCount: number | null | undefined): boolean {
  return Number(rewardCount || 0) > 0;
}

/** AON cấm khi đã/sắp có SKU. Trả error nếu conflict; không tự im lặng đổi model. */
export function assertFundingModelAllowed(params: {
  fundingModel: FundingModel | string | null | undefined;
  hasSellableRewards: boolean;
}): { ok: true; model: FundingModel } | { ok: false; error: string } {
  const model = parseFundingModel(params.fundingModel);
  if (!model) return { ok: false, error: "Mô hình gây quỹ không hợp lệ" };
  if (params.hasSellableRewards && model === "ALL_OR_NOTHING") {
    return { ok: false, error: AON_WITH_PRODUCTS_ERROR };
  }
  return { ok: true, model };
}

export function shouldRefundOnDeadline(params: {
  fundingModel: FundingModel | string | null | undefined;
  reachedGoal: boolean;
  hasSellableRewards?: boolean;
}): boolean {
  if (params.hasSellableRewards) return false;
  if (params.reachedGoal) return false;
  return params.fundingModel !== "KEEP_IT_ALL";
}

/** Phí sàn trừ trên số ủng hộ, không cộng thêm cho backer. Áp dụng cả AON và Keep-It-All. */
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
