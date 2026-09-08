export const FUNDING_MODELS = ["ALL_OR_NOTHING", "KEEP_IT_ALL"] as const;

export type FundingModel = (typeof FUNDING_MODELS)[number];

export const DEFAULT_PLATFORM_FEE_RATE = 0.08;

export const AON_WITH_PRODUCTS_ERROR =
  "Chien dich co ban san pham (pre-order hoac hang co san) khong duoc All-or-Nothing. He thong tu doi Keep-It-All khi them phan qua.";

export const AON_COERCED_TO_KIA_NOTE =
  "Da tu doi Keep-It-All vi chien dich co ban san pham.";

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
    return "Het han van nhan so da gop, du chua du muc tieu. Khong hoan vi miss goal. Chien dich dong theo ngay het han, khong dong som khi du muc tieu.";
  }
  return "Chi dung khi chua ban san pham. Them phan qua se tu doi Keep-It-All. Dong theo ngay het han: dat muc tieu thi chi ho, khong dat thi hoan.";
}

/** Chi duoc doi tay khi chua duyet. Doi AON->KIA khi them qua thi luon duoc. */
export function canEditFundingModel(status: string | null | undefined): boolean {
  return status === "DRAFT" || status === "PENDING_REVIEW" || !status;
}

export function campaignHasSellableRewards(rewardCount: number | null | undefined): boolean {
  return Number(rewardCount || 0) > 0;
}

export function coerceToKeepItAllIfProducts(
  fundingModel: FundingModel | string | null | undefined,
  hasSellableRewards: boolean,
): FundingModel | null {
  const model = parseFundingModel(fundingModel);
  if (!model) return null;
  if (hasSellableRewards && model === "ALL_OR_NOTHING") return "KEEP_IT_ALL";
  return model;
}

/** Chan khi user doi tay sang AON luc da co SKU. Them qua thi dung coerce, khong ham nay. */
export function assertFundingModelAllowed(params: {
  fundingModel: FundingModel | string | null | undefined;
  hasSellableRewards: boolean;
}): { ok: true; model: FundingModel } | { ok: false; error: string } {
  const model = parseFundingModel(params.fundingModel);
  if (!model) return { ok: false, error: "Mo hinh gay quy khong hop le" };
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
