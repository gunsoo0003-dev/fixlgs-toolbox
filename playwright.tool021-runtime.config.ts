import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /tool-021-.*\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/tool021-runtime.json" }]],
  use: {
    baseURL: "http://127.0.0.1:3021",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/tool-021/runtime-workspace.mjs dev",
    url: "http://127.0.0.1:3021",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL021_RUNTIME: "1" },
  },
  projects: [
    { name: "desktop-021", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-021", use: { ...devices["Pixel 7"] } },
  ],
});
