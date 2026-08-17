import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir:"./tests",
  timeout:30_000,
  retries:0,
  workers:1,
  reporter:[["list"],["html",{outputFolder:"docs/tool-042/results/playwright-report",open:"never"}]],
  use:{baseURL:"http://127.0.0.1:41742",trace:"retain-on-failure"},
  webServer:{command:"npm run dev -- --hostname 127.0.0.1 --port 41742",url:"http://127.0.0.1:41742/ko/text-find-replace",reuseExistingServer:false,timeout:30_000},
  projects:[
    {name:"desktop-chromium",use:{...devices["Desktop Chrome"]}},
    {name:"mobile-chromium",use:{...devices["Pixel 5"]}},
  ],
});
