import { expect,test } from "@playwright/test";import fs from "node:fs/promises";import path from "node:path";
const fixture=path.resolve(process.cwd(),"public/test-fixtures/target-large.jpg");
test.describe("004 부하·경계 검수",()=>{
 test("실제 압축",async({page})=>{await page.goto("/ko/image-compressor");await page.getByTestId("compressor-file-input").setInputFiles(fixture);await expect(page.getByTestId("compressor-file-card")).toHaveCount(1);await page.getByTestId("compressor-run").click();await expect.poll(()=>page.getByTestId("compressor-file-card").getAttribute("data-status"),{timeout:180000}).toMatch(/done|kept|failed|cancelled/);expect(await page.getByTestId("compressor-file-card").getAttribute("data-status")).toMatch(/done|kept/)});
 test("10개 허용·11개 차단",async({page})=>{await page.goto("/ko/image-compressor");const b=await fs.readFile(fixture);await page.getByTestId("compressor-file-input").setInputFiles(Array.from({length:11},(_,i)=>({name:`c-${i}.jpg`,mimeType:"image/jpeg",buffer:b})));await expect(page.getByTestId("compressor-file-card")).toHaveCount(10)});
});
