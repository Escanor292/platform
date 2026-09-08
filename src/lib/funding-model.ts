export const FUNDING_MODELS = ["ALL_OR_NOTHING", "KEEP_IT_ALL"] as const;

export type FundingModel = (typeof FUNDING_MODELS)[number];

export const DEFAULT_PLATFORM_FEE_RATE = 0.08;

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
    return "Hết hạn vẫn nhận số đã góp, dù chưa đủ mục tiêu. Không hoàn tự động. Sàn vẫn trừ phí nền tảng trước khi chi hộ.";
  }
  return "Chỉ nhận tiền nếu đạt mục tiêu khi hết hạn. Không đạt → hoàn cho người ủng hộ.";
}

/** Chỉ được đổi khi chưa duyệt (nháp / chờ duyệt). */
export function canEditFundingModel(status: string | null | undefined): boolean {
  return status === "DRAFT" || status === "PENDING_REVIEW" || !status;
}

export function shouldRefundOnDeadline(params: {
  fundingModel: FundingModel | string | null | undefined;
  reachedGoal: boolean;
}): boolean {
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
