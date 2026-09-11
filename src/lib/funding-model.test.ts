import {
  assertFundingModelAllowed,
  calculatePlatformFee,
  canEditFundingModel,
  coerceToKeepItAllIfProducts,
  isPastCarrierHandoffSla,
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
  });

  test("AON refunds on miss-goal only when there are no products", () => {
    expect(shouldRefundOnDeadline({ fundingModel: "ALL_OR_NOTHING", reachedGoal: false })).toBe(true);
    expect(shouldRefundOnDeadline({ fundingModel: "KEEP_IT_ALL", reachedGoal: false })).toBe(false);
    expect(shouldRefundOnDeadline({ fundingModel: "ALL_OR_NOTHING", reachedGoal: true })).toBe(false);
  });

  test("products never refund for miss-goal; ship SLA handles late carrier handoff", () => {
    expect(shouldRefundOnDeadline({
      fundingModel: "ALL_OR_NOTHING",
      reachedGoal: false,
      hasSellableRewards: true,
    })).toBe(false);
    expect(shouldRefundOnDeadline({
      fundingModel: "KEEP_IT_ALL",
      reachedGoal: false,
      hasSellableRewards: true,
    })).toBe(false);
  });

  test("AON is allowed when products exist", () => {
    expect(assertFundingModelAllowed({ fundingModel: "ALL_OR_NOTHING", hasSellableRewards: true })).toEqual({
      ok: true,
      model: "ALL_OR_NOTHING",
    });
    expect(coerceToKeepItAllIfProducts("ALL_OR_NOTHING", true)).toBe("ALL_OR_NOTHING");
  });

  test("carrier SLA is 2 days after ship-by", () => {
    const shipBy = new Date("2026-09-01T00:00:00Z");
    expect(isPastCarrierHandoffSla({
      deliveryDate: shipBy,
      fulfillmentStatus: "PROCESSING",
      now: new Date("2026-09-04T00:00:00Z"),
    })).toBe(true);
    expect(isPastCarrierHandoffSla({
      deliveryDate: shipBy,
      fulfillmentStatus: "SHIPPED",
      now: new Date("2026-09-10T00:00:00Z"),
    })).toBe(false);
    expect(isPastCarrierHandoffSla({
      deliveryDate: shipBy,
      fulfillmentStatus: "PROCESSING",
      now: new Date("2026-09-02T12:00:00Z"),
    })).toBe(false);
  });

  test("Keep-It-All still takes platform fee on the pledge", () => {
    expect(calculatePlatformFee(1_000_000, 0.08)).toBe(80_000);
  });
});
