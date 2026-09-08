import { campaignRaisedAmount, isCampaignClosed, isCampaignOpenForPledges } from "./money-buckets";

describe("money-buckets", () => {
  test("only ACTIVE receives campaign-bucket pledges", () => {
    expect(isCampaignOpenForPledges("ACTIVE")).toBe(true);
    expect(isCampaignOpenForPledges("SUCCESS")).toBe(false);
    expect(isCampaignOpenForPledges("FAILED")).toBe(false);
    expect(isCampaignOpenForPledges("DRAFT")).toBe(false);
  });

  test("closed statuses are SUCCESS COMPLETED FAILED CANCELED", () => {
    expect(isCampaignClosed("SUCCESS")).toBe(true);
    expect(isCampaignClosed("COMPLETED")).toBe(true);
    expect(isCampaignClosed("FAILED")).toBe(true);
    expect(isCampaignClosed("CANCELED")).toBe(true);
    expect(isCampaignClosed("ACTIVE")).toBe(false);
    expect(isCampaignClosed("DRAFT")).toBe(false);
    expect(isCampaignClosed(null)).toBe(false);
  });

  test("campaign raised uses currentAmount (product-bucket sales never land here)", () => {
    expect(campaignRaisedAmount({
      status: "SUCCESS",
      currentAmount: 1_000_000,
      closedAmount: 900_000,
    })).toBe(1_000_000);
    expect(campaignRaisedAmount({
      status: "ACTIVE",
      currentAmount: 500_000,
      closedAmount: null,
    })).toBe(500_000);
  });
});
