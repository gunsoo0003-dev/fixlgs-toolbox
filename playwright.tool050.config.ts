import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',timeout:30_000,retries:0,workers:1,
  reporter:[['list'],['html',{outputFolder:'docs/tool-047/results/playwright-report',open:'never'}]],
  use:{baseURL:'http://127.0.0.1:41750',trace:'retain-on-failure'},
  webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 41750',url:'http://127.0.0.1:41750/ko/dday-anniversary-calculator',reuseExistingServer:false,timeout:30_000},
  projects:[{name:'desktop-chromium',use:{...devices['Desktop Chrome']}},{name:'mobile-chromium',use:{...devices['Pixel 5']}}]
});
