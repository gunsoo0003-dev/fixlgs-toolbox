import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  testMatch:/tool-054-.*\.spec\.ts/,
  timeout:30_000,
  expect:{timeout:7_000},
  fullyParallel:false,
  retries:0,
  workers:1,
  reporter:[['list']],
  use:{baseURL:'http://127.0.0.1:41754',trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 41754',url:'http://127.0.0.1:41754/ko/timer-stopwatch',reuseExistingServer:false,timeout:120_000},
  projects:[{name:'desktop-chromium',use:{...devices['Desktop Chrome']}},{name:'mobile-chromium',use:{...devices['Pixel 5']}}]
});
