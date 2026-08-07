import { defineConfig, devices } from "@playwright/test";

const validationMode = process.env.TOOLBOX_VALIDATION_MODE || "final";
const isFast = validationMode === "fast";
const isCheck = validationMode === "check";

export default defineConfig({
  testDir: "./tests",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : isFast ? 4 : isCheck ? 3 : 2,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/toolbox-validation.json" }],
    ["./tests/reporters/grouped-summary-reporter.ts"],
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: isFast ? "off" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: isFast || isCheck ? "off" : "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
