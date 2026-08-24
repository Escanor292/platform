import { fulfillmentLabel, isContributionReversed, isReversingFulfillmentStatus, reversalReason } from "@/lib/order-fulfillment";
import { calculateCancellationSettlement, calculateDepositAmount, normalizeDepositPercent } from "@/lib/preorder-deposit";

describe("order fulfillment accounting rules", () => {
  it("marks delivery failure, cancellation and return as reversing statuses", () => {
    expect(isReversingFulfillmentStatus("DELIVERY_FAILED")).toBe(true);
    expect(isReversingFulfillmentStatus("CANCELED")).toBe(true);
    expect(isReversingFulfillmentStatus("RETURNED")).toBe(true);
    expect(isReversingFulfillmentStatus("DELIVERED")).toBe(false);
  });

  it("treats a reversed pledge as excluded from current campaign total", () => {
    expect(isContributionReversed({ accountingReversedAt: new Date(), status: "SUCCESS", fulfillmentStatus: "DELIVERED" })).toBe(true);
    expect(isContributionReversed({ accountingReversedAt: null, status: "REFUNDED", fulfillmentStatus: "DELIVERED" })).toBe(true);
    expect(isContributionReversed({ accountingReversedAt: null, status: "SUCCESS", fulfillmentStatus: "DELIVERED" })).toBe(false);
  });

  it("calculates creator-configured deposits and cancellation settlement", () => {
    expect(normalizeDepositPercent(30, 50)).toBe(30);
    expect(normalizeDepositPercent(150, 50)).toBe(50);
    expect(calculateDepositAmount(100000, 50)).toBe(50000);
    expect(calculateCancellationSettlement(100000, 100000, 30)).toEqual({
      cancellationFeeAmount: 30000,
      refundAmount: 70000,
    });
    expect(calculateCancellationSettlement(50000, 100000, 50)).toEqual({
      cancellationFeeAmount: 50000,
      refundAmount: 0,
    });
  });

  it("provides stable Vietnamese labels and reasons", () => {
    expect(fulfillmentLabel("DELIVERY_FAILED")).toBe("Giao không thành công");
    expect(reversalReason({ fulfillmentStatus: "CANCELED", deliveryFailureReason: null, cancellationReason: "Khách hủy đơn", returnReason: null })).toBe("Khách hủy đơn");
    expect(reversalReason({ fulfillmentStatus: "RETURNED", deliveryFailureReason: null, cancellationReason: null, returnReason: null })).toBe("Trả hàng");
  });
});
