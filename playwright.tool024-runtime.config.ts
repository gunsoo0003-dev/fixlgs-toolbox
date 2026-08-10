import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /tool-024-.*\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/tool024-runtime.json" }]],
  use: {
    baseURL: "http://127.0.0.1:3024",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/tool-024/runtime-workspace.mjs dev",
    url: "http://127.0.0.1:3024/ko/app-store-screenshot-maker",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL024_RUNTIME: "1" },
  },
  projects: [
    { name: "desktop-024", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-024", use: { ...devices["Pixel 7"] } },
  ],
});
