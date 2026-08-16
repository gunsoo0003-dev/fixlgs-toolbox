import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  testMatch:/tool-038-(preflight|core|boundary|feature|regression|limit)\.spec\.ts/,
  timeout:45_000,expect:{timeout:12_000},fullyParallel:false,workers:1,
  reporter:[['list'],['json',{outputFile:'test-results/tool038-runtime.json'}]],
  use:{baseURL:'http://127.0.0.1:3038',trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
  webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 3038',url:'http://127.0.0.1:3038/ko/case-sentence-format-converter',reuseExistingServer:false,timeout:120_000},
  projects:[{name:'desktop-038',use:{...devices['Desktop Chrome']}},{name:'mobile-038',use:{...devices['Pixel 7']}}],
});
