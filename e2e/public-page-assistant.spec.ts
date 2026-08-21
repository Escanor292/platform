import { expect, test, type Page } from "@playwright/test";

type Fixture = Record<string, unknown>;

async function mockPublicEntity(page: Page, sourceType: "product" | "blog" | "profile", sourceId: string, data: Fixture) {
  await page.route(`**/api/public/entities/${sourceType}/${sourceId}`, route => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ data }),
  }));
}

async function openAssistant(page: Page) {
  await page.getByRole("button", { name: "Mở trợ lý nhanh" }).click();
  await expect(page.getByRole("region", { name: "Trợ lý trang" })).toBeVisible();
}

test.describe("Hỏi nhanh trên thực thể công khai", () => {
  test("hiển thị giá và tồn kho của product từ dữ liệu public", async ({ page }) => {
    await mockPublicEntity(page, "product", "e2e-product", {
      title: "Bình nước tái sử dụng",
      description: "Sản phẩm hỗ trợ chiến dịch xanh.",
      minAmount: 150_000,
      maxAmount: 200_000,
      stock: 7,
      campaigns: { title: "Sống xanh" },
      projects: { title: "Trường học xanh" },
    });
    await page.goto("/products/e2e-product");
    await openAssistant(page);
    await expect(page.getByText("Còn lại: 7", { exact: false })).toBeVisible();
    await page.locator("#quick-page-assistant-input").fill("Giá tối thiểu bao nhiêu tiền?");
    await page.locator("#quick-page-assistant-input").press("Enter");
    await expect(page.getByRole("region", { name: "Trợ lý trang" }).locator("div.mr-5").last()).toContainText("Mức ủng hộ tối thiểu công khai của “Bình nước tái sử dụng” là 150.000");
  });

  test("hiển thị số liệu public của blog", async ({ page }) => {
    await mockPublicEntity(page, "blog", "e2e-blog", {
      title: "Nhật ký gieo mầm",
      excerpt: "Cập nhật hành trình hoạt động cộng đồng.",
      viewCount: 42,
      likeCount: 5,
      commentCount: 3,
    });
    await page.goto("/blog/e2e-blog");
    await openAssistant(page);
    await expect(page.getByText("Lượt xem: 42", { exact: false })).toBeVisible();
    await expect(page.getByText("Lượt thích: 5", { exact: false })).toBeVisible();
    await expect(page.getByText("Bình luận: 3", { exact: false })).toBeVisible();
  });

  test("trả lời số dự án public trên profile", async ({ page }) => {
    await mockPublicEntity(page, "profile", "e2e-profile", {
      displayName: "Lan Tử Tế",
      bio: "Người khởi xướng các dự án cộng đồng.",
      _count: { projects: 2 },
      projects: [{ title: "Lớp học xanh" }, { title: "Nước sạch cho em" }],
      publicStats: { campaignCount: 3, totalRaised: 800_000, totalBackers: 12 },
    });
    await page.goto("/profile/e2e-profile");
    await openAssistant(page);
    await page.locator("#quick-page-assistant-input").fill("Có bao nhiêu dự án?");
    await page.locator("#quick-page-assistant-input").press("Enter");
    await expect(page.getByRole("region", { name: "Trợ lý trang" }).locator("div.mr-5").last()).toContainText("Lan Tử Tế có 2 dự án công khai. Dự án hiển thị: Lớp học xanh, Nước sạch cho em.");
  });
});
