import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /tool-037-(preflight|core|boundary|feature|regression|limit)\.spec\.ts/,
  timeout: 45_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/tool037-runtime.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:3037',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3037',
    url: 'http://127.0.0.1:3037/ko/text-whitespace-linebreak-cleaner',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-037', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-037', use: { ...devices['Pixel 7'] } },
  ],
});
