import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: /tool-028-.*\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/tool028-runtime.json' }]],
  use: { baseURL: 'http://127.0.0.1:3028', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  webServer: {
    command: 'node scripts/tool-028/runtime-workspace.mjs dev',
    url: 'http://127.0.0.1:3028/ko/merge-pdf',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TOOL028_RUNTIME: '1' },
  },
  projects: [
    { name: 'desktop-028', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-028', use: { ...devices['Pixel 7'] } },
  ],
});
