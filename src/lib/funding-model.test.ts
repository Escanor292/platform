import {
  AON_WITH_PRODUCTS_ERROR,
  assertFundingModelAllowed,
  calculatePlatformFee,
  canEditFundingModel,
  coerceToKeepItAllIfProducts,
  parseFundingModel,
  shouldRefundOnDeadline,
} from "./funding-model";

describe("funding-model", () => {
  test("parseFundingModel only accepts 2 valid values", () => {
    expect(parseFundingModel("ALL_OR_NOTHING")).toBe("ALL_OR_NOTHING");
    expect(parseFundingModel("KEEP_IT_ALL")).toBe("KEEP_IT_ALL");
    expect(parseFundingModel("all-or-nothing")).toBeNull();
    expect(parseFundingModel(null)).toBeNull();
  });

  test("cannot edit model after approval", () => {
    expect(canEditFundingModel("DRAFT")).toBe(true);
    expect(canEditFundingModel("PENDING_REVIEW")).toBe(true);
    expect(canEditFundingModel(undefined)).toBe(true);
    expect(canEditFundingModel("ACTIVE")).toBe(false);
    expect(canEditFundingModel("SUCCESS")).toBe(false);
    expect(canEditFundingModel("FAILED")).toBe(false);
    expect(canEditFundingModel("CANCELED")).toBe(false);
  });

  test("AON refunds on miss-goal; Keep-It-All does not", () => {
    expect(shouldRefundOnDeadline({ fundingModel: "ALL_OR_NOTHING", reachedGoal: false })).toBe(true);
    expect(shouldRefundOnDeadline({ fundingModel: "KEEP_IT_ALL", reachedGoal: false })).toBe(false);
    expect(shouldRefundOnDeadline({ fundingModel: "ALL_OR_NOTHING", reachedGoal: true })).toBe(false);
    expect(shouldRefundOnDeadline({ fundingModel: "KEEP_IT_ALL", reachedGoal: true })).toBe(false);
  });

  test("products never refund for miss-goal even if AON leftover", () => {
    expect(shouldRefundOnDeadline({
      fundingModel: "ALL_OR_NOTHING",
      reachedGoal: false,
      hasSellableRewards: true,
    })).toBe(false);
  });

  test("explicit AON is rejected when products exist", () => {
    expect(assertFundingModelAllowed({ fundingModel: "ALL_OR_NOTHING", hasSellableRewards: true })).toEqual({
      ok: false,
      error: AON_WITH_PRODUCTS_ERROR,
    });
    expect(assertFundingModelAllowed({ fundingModel: "KEEP_IT_ALL", hasSellableRewards: true })).toEqual({
      ok: true,
      model: "KEEP_IT_ALL",
    });
    expect(assertFundingModelAllowed({ fundingModel: "ALL_OR_NOTHING", hasSellableRewards: false })).toEqual({
      ok: true,
      model: "ALL_OR_NOTHING",
    });
  });

  test("adding a product coerces AON to Keep-It-All", () => {
    expect(coerceToKeepItAllIfProducts("ALL_OR_NOTHING", true)).toBe("KEEP_IT_ALL");
    expect(coerceToKeepItAllIfProducts("KEEP_IT_ALL", true)).toBe("KEEP_IT_ALL");
    expect(coerceToKeepItAllIfProducts("ALL_OR_NOTHING", false)).toBe("ALL_OR_NOTHING");
  });

  test("Keep-It-All still takes platform fee on the pledge", () => {
    expect(calculatePlatformFee(1_000_000, 0.08)).toBe(80_000);
    expect(calculatePlatformFee(1_000_000)).toBe(80_000);
    expect(calculatePlatformFee(0, 0.08)).toBe(0);
  });
});
