import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: /tool-027-.*\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/tool027-runtime.json" }]],
  use: { baseURL: "http://127.0.0.1:3027", trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure" },
  webServer: {
    command: "node scripts/tool-027/runtime-workspace.mjs dev",
    url: "http://127.0.0.1:3027/ko/pdf-to-image-converter",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL027_RUNTIME: "1" },
  },
  projects: [
    { name: "desktop-027", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-027", use: { ...devices["Pixel 7"] } },
  ],
});
