import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /tool-032-.*\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/tool032-runtime.json" }]],
  use: {
    baseURL: "http://127.0.0.1:3032",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    acceptDownloads: true,
  },
  webServer: {
    command: "node scripts/tool-032/runtime-workspace.mjs dev",
    url: "http://127.0.0.1:3032/ko/pdf-signature",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL032_RUNTIME: "1" },
  },
  projects: [
    { name: "desktop-032", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-032", use: { ...devices["Pixel 7"] } },
  ],
});
