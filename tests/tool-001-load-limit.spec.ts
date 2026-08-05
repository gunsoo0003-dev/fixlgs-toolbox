import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
const fixture=path.resolve(process.cwd(),"public/test-fixtures/sample.jpg");
test.describe("001 부하·경계 검수",()=>{
 test("실제 변환과 안정 선택자",async({page})=>{await page.goto("/ko/jpg-png-webp-image-converter");await page.getByTestId("converter-file-input").setInputFiles(fixture);await expect(page.getByTestId("converter-file-card")).toHaveCount(1);await page.getByTestId("converter-run").click();await expect.poll(()=>page.getByTestId("converter-file-card").getAttribute("data-status"),{timeout:120000}).toMatch(/done|error|cancelled/);await expect(page.getByTestId("converter-file-card")).toHaveAttribute("data-status","done")});
 test("10개 허용·11개 차단",async({page})=>{await page.goto("/ko/jpg-png-webp-image-converter");const b=await fs.readFile(fixture);await page.getByTestId("converter-file-input").setInputFiles(Array.from({length:11},(_,i)=>({name:`a-${i}.jpg`,mimeType:"image/jpeg",buffer:b})));await expect(page.getByTestId("converter-file-card")).toHaveCount(10)});
});
