import {
  calculatePlatformFee,
  canEditFundingModel,
  parseFundingModel,
  shouldRefundOnDeadline,
} from "./funding-model";

describe("funding-model", () => {
  test("parseFundingModel chỉ nhận 2 giá trị hợp lệ", () => {
    expect(parseFundingModel("ALL_OR_NOTHING")).toBe("ALL_OR_NOTHING");
    expect(parseFundingModel("KEEP_IT_ALL")).toBe("KEEP_IT_ALL");
    expect(parseFundingModel("all-or-nothing")).toBeNull();
    expect(parseFundingModel(null)).toBeNull();
  });

  test("không cho đổi mô hình sau khi duyệt", () => {
    expect(canEditFundingModel("DRAFT")).toBe(true);
    expect(canEditFundingModel("PENDING_REVIEW")).toBe(true);
    expect(canEditFundingModel(undefined)).toBe(true);
    expect(canEditFundingModel("ACTIVE")).toBe(false);
    expect(canEditFundingModel("SUCCESS")).toBe(false);
    expect(canEditFundingModel("FAILED")).toBe(false);
    expect(canEditFundingModel("CANCELED")).toBe(false);
  });

  test("AON không đạt mục tiêu thì hoàn; Keep-It-All thì không", () => {
    expect(shouldRefundOnDeadline({ fundingModel: "ALL_OR_NOTHING", reachedGoal: false })).toBe(true);
    expect(shouldRefundOnDeadline({ fundingModel: "KEEP_IT_ALL", reachedGoal: false })).toBe(false);
    expect(shouldRefundOnDeadline({ fundingModel: "ALL_OR_NOTHING", reachedGoal: true })).toBe(false);
    expect(shouldRefundOnDeadline({ fundingModel: "KEEP_IT_ALL", reachedGoal: true })).toBe(false);
  });

  test("Keep-It-All vẫn trừ phí nền tảng trên số ủng hộ", () => {
    expect(calculatePlatformFee(1_000_000, 0.08)).toBe(80_000);
    expect(calculatePlatformFee(1_000_000)).toBe(80_000);
    expect(calculatePlatformFee(0, 0.08)).toBe(0);
  });
});
