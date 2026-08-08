import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/tool018-runtime.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3018",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3018",
    url: "http://127.0.0.1:3018",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL018_RUNTIME: "1" },
  },
  projects: [
    { name: "desktop-018", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-018", use: { ...devices["Pixel 7"] } },
  ],
});
