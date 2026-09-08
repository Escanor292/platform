import { decideCheckoutBucket } from "./resolve-checkout";

describe("decideCheckoutBucket", () => {
  test("donation requires ACTIVE campaign", () => {
    expect(decideCheckoutBucket(false, "ACTIVE")).toEqual({ ok: true, bucket: "CAMPAIGN" });
    expect(decideCheckoutBucket(false, "SUCCESS").ok).toBe(false);
    expect(decideCheckoutBucket(false, "DRAFT").ok).toBe(false);
    expect(decideCheckoutBucket(false, null).ok).toBe(false);
  });

  test("active campaign product goes to campaign bucket", () => {
    expect(decideCheckoutBucket(true, "ACTIVE")).toEqual({ ok: true, bucket: "CAMPAIGN" });
  });

  test("closed campaign product goes to product bucket", () => {
    expect(decideCheckoutBucket(true, "SUCCESS")).toEqual({ ok: true, bucket: "PRODUCT" });
    expect(decideCheckoutBucket(true, "FAILED")).toEqual({ ok: true, bucket: "PRODUCT" });
    expect(decideCheckoutBucket(true, "CANCELED")).toEqual({ ok: true, bucket: "PRODUCT" });
  });

  test("standalone shop product goes to product bucket", () => {
    expect(decideCheckoutBucket(true, null)).toEqual({ ok: true, bucket: "PRODUCT" });
  });

  test("draft or pending campaign cannot sell yet", () => {
    expect(decideCheckoutBucket(true, "DRAFT").ok).toBe(false);
    expect(decideCheckoutBucket(true, "PENDING_REVIEW").ok).toBe(false);
  });
});
