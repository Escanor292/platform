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
      return { ok: false, error: fundingCheck.error };
    }
    if (fundingCheck.model !== params.currentModel) {
      if (!canEditFundingModel(params.status)) {
        return { ok: false, error: "Không thể đổi mô hình gây quỹ sau khi chiến dịch đã được duyệt" };
      }
      return { ok: true, fundingModel: fundingCheck.model };
    }
    return { ok: true };
  }
  return { ok: true };
}
