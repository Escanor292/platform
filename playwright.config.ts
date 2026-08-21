import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: "E2E_TEST_MODE=1 DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/tutefund_platform_test NEXTAUTH_SECRET=e2e-local-secret NEXTAUTH_URL=http://127.0.0.1:3100 npm run dev -- --port 3100",
    url: `${baseURL}/e2e/assistant-fixture`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
