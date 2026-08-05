import { expect,test } from "@playwright/test";import fs from "node:fs/promises";import path from "node:path";
const fixture=path.resolve(process.cwd(),"public/test-fixtures/sample.jpg");
test.describe("002 부하·경계 검수",()=>{
 test("JPG 실제 변환",async({page})=>{await page.goto("/ko/heic-avif-image-converter");await page.getByTestId("heic-file-input").setInputFiles(fixture);await expect(page.getByTestId("heic-file-card")).toHaveCount(1);await page.getByTestId("heic-run").click();await expect.poll(()=>page.getByTestId("heic-file-card").getAttribute("data-status"),{timeout:120000}).toMatch(/done|error|cancelled/);await expect(page.getByTestId("heic-file-card")).toHaveAttribute("data-status","done")});
 test("10개 허용·11개 차단",async({page})=>{await page.goto("/ko/heic-avif-image-converter");const b=await fs.readFile(fixture);await page.getByTestId("heic-file-input").setInputFiles(Array.from({length:11},(_,i)=>({name:`h-${i}.jpg`,mimeType:"image/jpeg",buffer:b})));await expect(page.getByTestId("heic-file-card")).toHaveCount(10)});
});
