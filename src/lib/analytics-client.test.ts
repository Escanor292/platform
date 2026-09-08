import { getProductAnalyticsConsent, recordProductAnalytics, setProductAnalyticsConsent } from "@/lib/analytics-client";

describe("product analytics client", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it("does not send events when consent is denied", () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
    setProductAnalyticsConsent(false);
    expect(getProductAnalyticsConsent()).toBe(false);
    recordProductAnalytics({ eventName: "PAGE_VIEW", path: "/campaigns/demo" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends aggregated events after consent and skips admin pages", () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
    setProductAnalyticsConsent(true);
    recordProductAnalytics({ eventName: "PAGE_VIEW", path: "/dashboard/admin" });
    expect(fetchMock).not.toHaveBeenCalled();
    recordProductAnalytics({ eventName: "CTA_CLICK", path: "/", payload: { ctaId: "add_to_cart", label: "Add to cart" } });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/public/analytics",
      expect.objectContaining({ method: "POST" }),
    );
    expect(String(fetchMock.mock.calls[0][1].body)).toContain("add_to_cart");
    expect(String(fetchMock.mock.calls[0][1].body)).not.toContain("password");
  });
});
