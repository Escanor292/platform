import { assertFundingModelAllowed, canEditFundingModel } from "@/lib/funding-model";

export function applyFundingModelUpdate(params: {
  requestedModel: unknown;
  currentModel: string;
  status: string;
  hasProducts: boolean;
}): { ok: true; fundingModel?: string } | { ok: false; error: string } {
  if (params.requestedModel !== undefined) {
    const fundingCheck = assertFundingModelAllowed({
      fundingModel: params.requestedModel,
      hasSellableRewards: params.hasProducts,
    });
    if (!fundingCheck.ok) {
      if (params.currentModel === "ALL_OR_NOTHING" && params.hasProducts) {
        return { ok: true, fundingModel: "KEEP_IT_ALL" };
      }
      return { ok: false, error: fundingCheck.error };
    }
    if (fundingCheck.model !== params.currentModel) {
      const safeCoerce = params.currentModel === "ALL_OR_NOTHING" && fundingCheck.model === "KEEP_IT_ALL";
      if (!safeCoerce && !canEditFundingModel(params.status)) {
        return { ok: false, error: "Khong the doi mo hinh gay quy sau khi chien dich da duoc duyet" };
      }
      return { ok: true, fundingModel: fundingCheck.model };
    }
    return { ok: true };
  }
  if (params.hasProducts && params.currentModel === "ALL_OR_NOTHING") {
    return { ok: true, fundingModel: "KEEP_IT_ALL" };
  }
  return { ok: true };
}
