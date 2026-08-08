import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/tool017-core.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3017",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3017",
    url: "http://127.0.0.1:3017",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL017_RUNTIME: "1" },
  },
  projects: [
    {
      name: "desktop-core",
      testMatch: /tool-017-core\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-core",
      testMatch: /tool-017-mobile-core\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
  ],
});
