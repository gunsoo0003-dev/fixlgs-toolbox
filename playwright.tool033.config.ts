import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /tool-033-.*\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/tool033-runtime.json" }]],
  use: {
    baseURL: "http://127.0.0.1:3033",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    acceptDownloads: true,
  },
  webServer: {
    command: "node scripts/tool-033/runtime-workspace.mjs dev",
    url: "http://127.0.0.1:3033/ko/pdf-compressor",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL033_RUNTIME: "1" },
  },
  projects: [
    { name: "desktop-033", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-033", use: { ...devices["Pixel 7"] } },
  ],
});
