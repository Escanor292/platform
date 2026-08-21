import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3100";
const databaseUrl = process.env.E2E_DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/tutefund_platform_test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { args: ["--disable-dev-shm-usage", "--disable-gpu"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: `DATABASE_URL=${databaseUrl} NEXTAUTH_SECRET=e2e-local-secret NEXTAUTH_URL=http://127.0.0.1:3100 npm run dev -- --port 3100`,
    url: `${baseURL}/products/e2e-public-product`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
