import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: /tool-026-.*\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/tool026-runtime.json" }]],
  use: { baseURL: "http://127.0.0.1:3026", trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure" },
  webServer: {
    command: "node scripts/tool-026/runtime-workspace.mjs dev",
    url: "http://127.0.0.1:3026/ko/image-to-pdf",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL026_RUNTIME: "1" },
  },
  projects: [
    { name: "desktop-026", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-026", use: { ...devices["Pixel 7"] } },
  ],
});
