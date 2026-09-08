import { filtersToSearchParams, parseCampaignFilters } from "./campaign-query-params";

describe("campaign query params", () => {
  test("parse fundingModel, tags, featured, SUCCESS", () => {
    const params = new URLSearchParams(
      "fundingModel=KEEP_IT_ALL&tags=video-game&tags=board-game&isFeatured=true&status=SUCCESS&campaignType=REWARD"
    );
    const filters = parseCampaignFilters(params);
    expect(filters.fundingModel).toBe("KEEP_IT_ALL");
    expect(filters.tags).toEqual(["video-game", "board-game"]);
    expect(filters.isFeatured).toBe(true);
    expect(filters.status).toBe("SUCCESS");
    expect(filters.campaignType).toBe("REWARD");
  });

  test("bỏ loại chiến dịch đã gỡ (EQUITY)", () => {
    const filters = parseCampaignFilters(new URLSearchParams("campaignType=EQUITY"));
    expect(filters.campaignType).toBeUndefined();
  });

  test("round-trip filters", () => {
    const params = filtersToSearchParams({
      fundingModel: "KEEP_IT_ALL",
      tags: ["edtech"],
      isFeatured: true,
    });
    const parsed = parseCampaignFilters(params);
    expect(parsed.fundingModel).toBe("KEEP_IT_ALL");
    expect(parsed.tags).toEqual(["edtech"]);
    expect(parsed.isFeatured).toBe(true);
  });
});
