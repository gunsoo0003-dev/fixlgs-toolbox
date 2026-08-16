import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /tool-036-(preflight|core|boundary|feature|regression|limit)\.spec\.ts/,
  timeout: 45_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/tool036-runtime.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:3036',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3036',
    url: 'http://127.0.0.1:3036/ko/character-document-counter',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-036', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-036', use: { ...devices['Pixel 7'] } },
  ],
});
