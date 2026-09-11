import { applyFundingModelUpdate } from "./apply-funding-model-update";

describe("applyFundingModelUpdate", () => {
  test("AON with products stays AON", () => {
    expect(applyFundingModelUpdate({
      requestedModel: undefined,
      currentModel: "ALL_OR_NOTHING",
      status: "ACTIVE",
      hasProducts: true,
    })).toEqual({ ok: true });
  });

  test("can keep AON when products exist in draft", () => {
    expect(applyFundingModelUpdate({
      requestedModel: "ALL_OR_NOTHING",
      currentModel: "ALL_OR_NOTHING",
      status: "DRAFT",
      hasProducts: true,
    })).toEqual({ ok: true });
  });

  test("can switch draft KIA to AON even with products", () => {
    expect(applyFundingModelUpdate({
      requestedModel: "ALL_OR_NOTHING",
      currentModel: "KEEP_IT_ALL",
      status: "DRAFT",
      hasProducts: true,
    })).toEqual({ ok: true, fundingModel: "ALL_OR_NOTHING" });
  });

  test("AON to Keep-It-All is allowed after approve", () => {
    const result = applyFundingModelUpdate({
      requestedModel: "KEEP_IT_ALL",
      currentModel: "ALL_OR_NOTHING",
      status: "ACTIVE",
      hasProducts: false,
    });
    expect(result.ok).toBe(false);
  });

  test("Keep-It-All to AON after approve is blocked", () => {
    const result = applyFundingModelUpdate({
      requestedModel: "ALL_OR_NOTHING",
      currentModel: "KEEP_IT_ALL",
      status: "ACTIVE",
      hasProducts: false,
    });
    expect(result.ok).toBe(false);
  });
});
