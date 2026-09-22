import { computeOrderSuccessStats } from "./owner-revenue";

describe("computeOrderSuccessStats", () => {
  test("bo PENDING khoi mau so", () => {
    const stats = computeOrderSuccessStats([
      { status: "PENDING", accountingReversedAt: null, fulfillmentStatus: "NOT_APPLICABLE" },
      { status: "SUCCESS", accountingReversedAt: null, fulfillmentStatus: "DELIVERED" },
      { status: "FAILED", accountingReversedAt: null, fulfillmentStatus: "NOT_APPLICABLE" },
    ]);
    expect(stats.totalCount).toBe(2);
    expect(stats.successCount).toBe(1);
    expect(stats.successRate).toBe(0.5);
  });

  test("don dao so khong tinh thanh cong", () => {
    const stats = computeOrderSuccessStats([
      { status: "SUCCESS", accountingReversedAt: new Date(), fulfillmentStatus: "DELIVERED" },
      { status: "SUCCESS", accountingReversedAt: null, fulfillmentStatus: "RETURNED" },
      { status: "SUCCESS", accountingReversedAt: null, fulfillmentStatus: "DELIVERED" },
    ]);
    expect(stats.successCount).toBe(1);
    expect(stats.totalCount).toBe(3);
  });
});
