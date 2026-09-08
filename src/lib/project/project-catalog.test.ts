import { classifyProjectRewards, isSellableProduct, unionCatalogRewards } from "./project-catalog";
import type { PublicReward } from "@/types/project-detail";

function reward(partial: Partial<PublicReward> & Pick<PublicReward, "id" | "title">): PublicReward {
  return {
    description: null,
    minAmount: 0,
    imageUrl: null,
    isIncludedInProject: true,
    maxQuantity: null,
    deliveryDate: null,
    isPreorder: false,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("project-catalog", () => {
  test("priced fulfillmentType is a product even without campaign type", () => {
    expect(isSellableProduct({
      minAmount: 150000,
      fulfillmentType: "PHYSICAL",
      campaignType: null,
    })).toBe(true);
  });

  test("donation without product fulfillment is a gift", () => {
    expect(isSellableProduct({
      minAmount: 50000,
      fulfillmentType: null,
      campaignType: "DONATION",
    })).toBe(false);
  });

  test("union dedups by id and keeps campaign products plus linked ones", () => {
    const merged = unionCatalogRewards([
      [reward({ id: "a", title: "Campaign product", minAmount: 1, campaignId: "c1" })],
      [reward({ id: "a", title: "Campaign product", minAmount: 1, campaignId: "c1" }), reward({ id: "b", title: "Linked", minAmount: 2 })],
      [reward({ id: "c", title: "Project owned", minAmount: 3, projectId: "p1" })],
    ]);
    expect(merged.map((item) => item.id).sort()).toEqual(["a", "b", "c"]);
  });

  test("classify splits sellable products from gifts and skips inactive", () => {
    const { products, gifts } = classifyProjectRewards([
      reward({ id: "p", title: "Hang", minAmount: 120000, fulfillmentType: "PHYSICAL" }),
      reward({ id: "g", title: "Qua", minAmount: 20000, campaignType: "DONATION" }),
      reward({ id: "off", title: "An", minAmount: 90000, fulfillmentType: "PHYSICAL", isActive: false }),
    ]);
    expect(products.map((item) => item.id)).toEqual(["p"]);
    expect(gifts.map((item) => item.id)).toEqual(["g"]);
  });
});
