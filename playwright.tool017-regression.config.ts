import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/tool017-regression.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3117",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3117",
    url: "http://127.0.0.1:3117",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL017_REGRESSION: "1" },
  },
  projects: [
    {
      name: "desktop-regression",
      testMatch: /tool-017-regression\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-regression",
      testMatch: /tool-017-mobile-regression\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
  ],
});
