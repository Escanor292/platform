import { isProductReviewQuestion, rewardIdFromProductPath, summarizePublicProductReviews } from "./public-product-review-summary";

describe("public product review summary", () => {
  it("chỉ nhận diện câu hỏi review sản phẩm và lấy đúng reward ID từ route public", () => {
    expect(isProductReviewQuestion("Sản phẩm có các đánh giá hay bình luận như thế nào?")).toBe(true);
    expect(isProductReviewQuestion("Chính sách bảo mật là gì?")).toBe(false);
    expect(rewardIdFromProductPath("/products/reward-public?ref=assistant")).toBe("reward-public");
    expect(rewardIdFromProductPath("/campaigns/example")).toBeNull();
  });

  it("trả lời trung thực khi chưa có review công khai", () => {
    expect(summarizePublicProductReviews([])).toMatch(/chưa có đánh giá công khai/i);
  });
});
