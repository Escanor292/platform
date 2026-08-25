import { isPublicPageSummaryQuestion, publicPageContextFromPath, summarizePublicPage } from "./public-page-summary";

describe("public page summary", () => {
  it("recognizes summary requests and current public routes", () => {
    expect(isPublicPageSummaryQuestion("tóm tắt trang này giúp tôi")).toBe(true);
    expect(publicPageContextFromPath("/projects/green-project")).toEqual({ type: "project", id: "green-project" });
    expect(publicPageContextFromPath("/products/reward-123")).toEqual({ type: "product", id: "reward-123" });
    expect(publicPageContextFromPath("/campaigns/help-school")).toEqual({ type: "campaign", id: "help-school" });
    expect(publicPageContextFromPath("/blog/posts/story")).toEqual({ type: "blog", id: "story" });
    expect(publicPageContextFromPath("/profile/user-1")).toEqual({ type: "profile", id: "user-1" });
  });

  it("summarizes public project facts without inventing missing data", () => {
    const answer = summarizePublicPage("project", {
      title: "Dự án xanh",
      description: "Trồng cây cho cộng đồng.",
      _count: { campaigns: 2, blog_posts: 1, rewards: 3 },
    });
    expect(answer).toContain("Dự án xanh");
    expect(answer).toContain("2 chiến dịch");
    expect(answer).toContain("1 bài viết");
  });

  it("summarizes product, blog and profile public facts", () => {
    expect(summarizePublicPage("product", { title: "Áo xanh", description: "Sản phẩm cộng đồng.", minAmount: 120000, averageRating: 4.5, reviewCount: 3, soldCount: 7 })).toMatch(/4\.5\/5.*3 đánh giá.*7 lượt/);
    expect(summarizePublicPage("blog", { title: "Câu chuyện xanh", excerpt: "Một cập nhật cộng đồng.", viewCount: 20, likeCount: 4, commentCount: 2 })).toMatch(/Câu chuyện xanh.*20 lượt xem.*2 bình luận/);
    expect(summarizePublicPage("profile", { name: "Người tạo", bio: "Giới thiệu công khai.", publicStats: { campaignCount: 1, totalRaised: 500000, totalBackers: 6 } })).toMatch(/Người tạo.*1 chiến dịch.*6 lượt ủng hộ/);
  });

  it("combines public campaign metrics and supplemental updates/reviews", () => {
    const answer = summarizePublicPage("campaign", {
      title: "Mầm xanh",
      status: "ACTIVE",
      goalAmount: 1000000,
      currentAmount: 500000,
      description: "Một chiến dịch cộng đồng.",
      _count: { pledges: 8, campaign_followers: 4 },
      rewards: [{ id: "reward-1" }],
    }, { updates: [{ id: "update-1" }], reviews: [{ id: "review-1" }] });
    expect(answer).toContain("50% mục tiêu");
    expect(answer).toContain("8 lượt ủng hộ");
    expect(answer).toContain("1 cập nhật");
    expect(answer).toContain("1 phản hồi");
  });
});
