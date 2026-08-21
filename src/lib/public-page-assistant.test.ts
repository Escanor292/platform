import { resolvePublicAssistantContext } from "./public-page-assistant";

describe("resolvePublicAssistantContext", () => {
  it("recognizes each permitted public entity page", () => {
    expect(resolvePublicAssistantContext("/campaigns/mam-xanh")).toEqual({ sourceType: "campaign", sourceId: "mam-xanh" });
    expect(resolvePublicAssistantContext("/products/reward_42")).toEqual({ sourceType: "product", sourceId: "reward_42" });
    expect(resolvePublicAssistantContext("/blog/hanh-trinh-tu-te")).toEqual({ sourceType: "blog", sourceId: "hanh-trinh-tu-te" });
    expect(resolvePublicAssistantContext("/projects/project-42")).toEqual({ sourceType: "project", sourceId: "project-42" });
    expect(resolvePublicAssistantContext("/profile/user_42")).toEqual({ sourceType: "profile", sourceId: "user_42" });
  });

  it("rejects unrelated and malformed routes before a request can be made", () => {
    expect(resolvePublicAssistantContext("/settings")).toBeNull();
    expect(resolvePublicAssistantContext("/campaigns/https:%2F%2Fprivate.example")).toBeNull();
    expect(resolvePublicAssistantContext("/campaigns/")).toBeNull();
  });
});
