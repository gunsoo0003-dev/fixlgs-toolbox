import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  testMatch:/tool-039-(preflight|core|boundary|feature|regression|limit)\.spec\.ts/,
  timeout:45_000,
  expect:{timeout:12_000},
  fullyParallel:false,
  workers:1,
  reporter:[['list'],['json',{outputFile:'test-results/tool039-runtime.json'}]],
  use:{baseURL:'http://127.0.0.1:3039',trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
  webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 3039',url:'http://127.0.0.1:3039/ko/list-sorter-duplicate-remover',reuseExistingServer:false,timeout:120_000},
  projects:[
    {name:'desktop-039',use:{...devices['Desktop Chrome']}},
    {name:'mobile-039',use:{...devices['Pixel 7']}},
  ],
});
