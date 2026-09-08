import {
  AON_WITH_PRODUCTS_ERROR,
  assertFundingModelAllowed,
  calculatePlatformFee,
  canEditFundingModel,
  parseFundingModel,
  shouldRefundOnDeadline,
} from "./funding-model";

describe("funding-model", () => {
  test("parseFundingModel chi nhan 2 gia tri hop le", () => {
    expect(parseFundingModel("ALL_OR_NOTHING")).toBe("ALL_OR_NOTHING");
    expect(parseFundingModel("KEEP_IT_ALL")).toBe("KEEP_IT_ALL");
    expect(parseFundingModel("all-or-nothing")).toBeNull();
    expect(parseFundingModel(null)).toBeNull();
  });

  test("khong cho doi mo hinh sau khi duyet", () => {
    expect(canEditFundingModel("DRAFT")).toBe(true);
    expect(canEditFundingModel("PENDING_REVIEW")).toBe(true);
    expect(canEditFundingModel(undefined)).toBe(true);
    expect(canEditFundingModel("ACTIVE")).toBe(false);
    expect(canEditFundingModel("SUCCESS")).toBe(false);
    expect(canEditFundingModel("FAILED")).toBe(false);
    expect(canEditFundingModel("CANCELED")).toBe(false);
  });

  test("AON khong dat muc tieu thi hoan; Keep-It-All thi khong", () => {
    expect(shouldRefundOnDeadline({ fundingModel: "ALL_OR_NOTHING", reachedGoal: false })).toBe(true);
    expect(shouldRefundOnDeadline({ fundingModel: "KEEP_IT_ALL", reachedGoal: false })).toBe(false);
    expect(shouldRefundOnDeadline({ fundingModel: "ALL_OR_NOTHING", reachedGoal: true })).toBe(false);
    expect(shouldRefundOnDeadline({ fundingModel: "KEEP_IT_ALL", reachedGoal: true })).toBe(false);
  });

  test("co san pham thi khong hoan vi miss goal du gan nham AON", () => {
    expect(shouldRefundOnDeadline({
      fundingModel: "ALL_OR_NOTHING",
      reachedGoal: false,
      hasSellableRewards: true,
    })).toBe(false);
  });

  test("cam AON khi chien dich co san pham", () => {
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

  test("Keep-It-All van tru phi nen tang tren so ung ho", () => {
    expect(calculatePlatformFee(1_000_000, 0.08)).toBe(80_000);
    expect(calculatePlatformFee(1_000_000)).toBe(80_000);
    expect(calculatePlatformFee(0, 0.08)).toBe(0);
  });
});
