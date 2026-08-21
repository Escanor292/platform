import { expect, test, type Page } from "@playwright/test";

const publicPages = [
  { label: "product", path: "/products/e2e-public-product", entityPath: "/api/public/entities/product/e2e-public-product", summaryText: "Còn lại: 7" },
  { label: "blog", path: "/blog/e2e-nhat-ky-gieo-mam", entityPath: "/api/public/entities/blog/e2e-nhat-ky-gieo-mam", summaryText: "Lượt xem: 42" },
  { label: "profile", path: "/profile/e2e-public-user", entityPath: "/api/public/entities/profile/e2e-public-user", summaryText: "Dự án công khai: 1" },
] as const;

async function openAssistant(page: Page) {
  await page.getByRole("button", { name: "Mở trợ lý nhanh" }).click();
  await expect(page.getByRole("region", { name: "Trợ lý trang" })).toBeVisible();
}

test.describe("Hỏi nhanh trên thực thể công khai", () => {
  test("product công khai tải không cần đăng nhập và trả lời giá/tồn kho từ allowlist thật", async ({ page }) => {
    await page.goto("/products/e2e-public-product");
    await expect(page).toHaveURL(/\/products\/e2e-public-product$/);
    await expect(page.getByRole("heading", { name: "Bình nước tái sử dụng" })).toBeVisible();
    await openAssistant(page);
    await expect(page.getByText("Còn lại: 7", { exact: false })).toBeVisible();
    await page.locator("#quick-page-assistant-input").fill("Giá tối thiểu bao nhiêu tiền?");
    await page.locator("#quick-page-assistant-input").press("Enter");
    await expect(page.getByRole("region", { name: "Trợ lý trang" }).locator("div.mr-5").last()).toContainText("Mức ủng hộ tối thiểu công khai của “Bình nước tái sử dụng” là 150.000");
  });

  test("blog công khai tải không cần đăng nhập và hiển thị số liệu public thật", async ({ page }) => {
    await page.goto("/blog/e2e-nhat-ky-gieo-mam");
    await expect(page).toHaveURL(/\/blog\/e2e-nhat-ky-gieo-mam$/);
    await expect(page.getByRole("heading", { name: "Nhật ký gieo mầm" })).toBeVisible();
    await openAssistant(page);
    await expect(page.getByText("Lượt xem: 42", { exact: false })).toBeVisible();
    await expect(page.getByText("Lượt thích: 5", { exact: false })).toBeVisible();
    await expect(page.getByText("Bình luận: 3", { exact: false })).toBeVisible();
  });

  test("profile công khai tải không cần đăng nhập và trả lời dự án public thật", async ({ page }) => {
    await page.goto("/profile/e2e-public-user");
    await expect(page).toHaveURL(/\/profile\/e2e-public-user$/);
    await expect(page.getByRole("heading", { name: "Lan Tử Tế" })).toBeVisible();
    await openAssistant(page);
    await page.locator("#quick-page-assistant-input").fill("Có bao nhiêu dự án?");
    await page.locator("#quick-page-assistant-input").press("Enter");
    await expect(page.getByRole("region", { name: "Trợ lý trang" }).locator("div.mr-5").last()).toContainText("Lan Tử Tế có 1 dự án công khai. Dự án hiển thị: Lớp học xanh.");
  });

  for (const publicPage of publicPages) {
    test(`${publicPage.label} hiển thị loading và lỗi khi API allowlist không khả dụng`, async ({ page }) => {
      await page.route(`**${publicPage.entityPath}`, async route => {
        await new Promise(resolve => setTimeout(resolve, 400));
        await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "unavailable" }) });
      });
      await page.goto(publicPage.path);
      await expect(page).toHaveURL(new RegExp(`${publicPage.path}$`));
      await page.getByRole("button", { name: "Mở trợ lý nhanh" }).click();
      await expect(page.getByText("Đang đọc thông tin công khai…")).toBeVisible();
      await expect(page.getByText("Không thể tải thông tin công khai của trang này.")).toBeVisible();
    });
  }
});
