import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  timeout:45_000,
  expect:{timeout:8_000},
  fullyParallel:false,
  workers:1,
  reporter:'line',
  use:{baseURL:'http://127.0.0.1:3041',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['Pixel 5']}}],
  webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 3041',url:'http://127.0.0.1:3041/ko/text-extractor',reuseExistingServer:false,timeout:120_000},
});
