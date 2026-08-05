import { expect,test } from "@playwright/test";import fs from "node:fs/promises";import path from "node:path";
const fixture=path.resolve(process.cwd(),"public/test-fixtures/sample.svg");
test.describe("003 부하·경계 검수",()=>{
 test("SVG 실제 변환",async({page})=>{await page.goto("/ko/svg-bmp-tiff-image-converter");await page.getByTestId("svg-file-input").setInputFiles(fixture);await expect(page.getByTestId("svg-file-card")).toHaveCount(1);await page.getByTestId("svg-run").click();await expect.poll(()=>page.getByTestId("svg-file-card").getAttribute("data-status"),{timeout:120000}).toMatch(/done|error|cancelled/);await expect(page.getByTestId("svg-file-card")).toHaveAttribute("data-status","done")});
 test("10개 허용·11개 차단",async({page})=>{await page.goto("/ko/svg-bmp-tiff-image-converter");const b=await fs.readFile(fixture);await page.getByTestId("svg-file-input").setInputFiles(Array.from({length:11},(_,i)=>({name:`s-${i}.svg`,mimeType:"image/svg+xml",buffer:b})));await expect(page.getByTestId("svg-file-card")).toHaveCount(10)});
});
