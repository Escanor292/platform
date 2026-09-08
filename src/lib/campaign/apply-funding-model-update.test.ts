import { applyFundingModelUpdate } from "./apply-funding-model-update";

describe("applyFundingModelUpdate", () => {
  test("leftover AON with products coerces to Keep-It-All even after approve", () => {
    expect(applyFundingModelUpdate({
      requestedModel: undefined,
      currentModel: "ALL_OR_NOTHING",
      status: "ACTIVE",
      hasProducts: true,
    })).toEqual({ ok: true, fundingModel: "KEEP_IT_ALL" });
  });

  test("stale AON form with products still coerces instead of 400", () => {
    expect(applyFundingModelUpdate({
      requestedModel: "ALL_OR_NOTHING",
      currentModel: "ALL_OR_NOTHING",
      status: "ACTIVE",
      hasProducts: true,
    })).toEqual({ ok: true, fundingModel: "KEEP_IT_ALL" });
  });

  test("cannot switch Keep-It-All back to AON when products exist", () => {
    const result = applyFundingModelUpdate({
      requestedModel: "ALL_OR_NOTHING",
      currentModel: "KEEP_IT_ALL",
      status: "DRAFT",
      hasProducts: true,
    });
    expect(result.ok).toBe(false);
  });

  test("AON to Keep-It-All is allowed after approve", () => {
    expect(applyFundingModelUpdate({
      requestedModel: "KEEP_IT_ALL",
      currentModel: "ALL_OR_NOTHING",
      status: "ACTIVE",
      hasProducts: false,
    })).toEqual({ ok: true, fundingModel: "KEEP_IT_ALL" });
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
