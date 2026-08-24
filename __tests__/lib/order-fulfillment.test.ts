import { fulfillmentLabel, isContributionReversed, isReversingFulfillmentStatus, reversalReason } from "@/lib/order-fulfillment";

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

  it("provides stable Vietnamese labels and reasons", () => {
    expect(fulfillmentLabel("DELIVERY_FAILED")).toBe("Giao không thành công");
    expect(reversalReason({ fulfillmentStatus: "CANCELED", deliveryFailureReason: null, cancellationReason: "Khách hủy đơn", returnReason: null })).toBe("Khách hủy đơn");
    expect(reversalReason({ fulfillmentStatus: "RETURNED", deliveryFailureReason: null, cancellationReason: null, returnReason: null })).toBe("Trả hàng");
  });
});
