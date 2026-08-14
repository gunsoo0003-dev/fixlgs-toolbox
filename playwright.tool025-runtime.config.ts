import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: /tool-025-.*\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/tool025-runtime.json" }]],
  use: { baseURL: "http://127.0.0.1:3025", trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure" },
  webServer: {
    command: "node scripts/tool-025/runtime-workspace.mjs dev",
    url: "http://127.0.0.1:3025/ko/id-passport-photo-maker",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL025_RUNTIME: "1" },
  },
  projects: [
    { name: "desktop-025", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-025", use: { ...devices["Pixel 7"] } },
  ],
});
