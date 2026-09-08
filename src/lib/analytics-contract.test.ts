import { parseProductAnalyticsPayload } from "@/lib/analytics-contract";

describe("product analytics contract", () => {
  it("accepts public page view, leave and CTA payloads", () => {
    expect(parseProductAnalyticsPayload({ eventName: "PAGE_VIEW", path: "/campaigns/abc" })).toEqual({
      eventName: "PAGE_VIEW",
      path: "/campaigns/abc",
    });
    expect(parseProductAnalyticsPayload({
      eventName: "PAGE_LEAVE",
      path: "/products",
      payload: { durationMs: 12500 },
    })).toEqual({
      eventName: "PAGE_LEAVE",
      path: "/products",
      payload: { durationMs: 12500 },
    });
    expect(parseProductAnalyticsPayload({
      eventName: "CTA_CLICK",
      path: "/campaigns/abc?utm=x",
      payload: { ctaId: "pledge_submit", label: "Ung ho ngay" },
    })).toEqual({
      eventName: "CTA_CLICK",
      path: "/campaigns/abc",
      payload: { ctaId: "pledge_submit", label: "Ung ho ngay" },
    });
  });

  it("rejects sensitive paths, unknown events and CTA without id", () => {
    expect(parseProductAnalyticsPayload({ eventName: "PAGE_VIEW", path: "/dashboard/admin/analytics" })).toBeNull();
    expect(parseProductAnalyticsPayload({ eventName: "PAGE_VIEW", path: "/kyc" })).toBeNull();
    expect(parseProductAnalyticsPayload({ eventName: "SEARCH_QUERY", path: "/" })).toBeNull();
    expect(parseProductAnalyticsPayload({ eventName: "CTA_CLICK", path: "/", payload: {} })).toBeNull();
  });
});
