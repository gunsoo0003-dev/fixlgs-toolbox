import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  testMatch:/tool-081-.*\.spec\.ts/,
  fullyParallel:false,
  workers:1,
  webServer:{
    command:'npm run dev -- --hostname 127.0.0.1 --port 3000',
    url:'http://127.0.0.1:3000/ko/area-price-per-unit-calculator',
    reuseExistingServer:true,
    timeout:120000,
    stdout:'pipe',
    stderr:'pipe'
  },
  use:{
    baseURL:'http://127.0.0.1:3000',
    trace:'retain-on-failure'
  },
  projects:[
    {name:'desktop-chromium',use:{...devices['Desktop Chrome']}},
    {name:'mobile-chromium',use:{...devices['Pixel 7']}}
  ]
});
