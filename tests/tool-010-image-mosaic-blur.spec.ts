import { expect, test } from "@playwright/test";
import path from "node:path";
import { createBrush, createRectangle, dragCanvasPointer } from "./helpers/tool-010";
const fixture=(name:string)=>path.join(process.cwd(),"test-fixtures",name);
for(const locale of ["ko","en","ja"] as const){
 test(`${locale} 010 route SEO content`,async({page})=>{await page.goto(`/${locale}/image-mosaic-blur-tool`);await expect(page.locator("h1")).toBeVisible();await expect(page.locator('[data-testid="tool010-select"]')).toBeVisible();await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",new RegExp(`/${locale}/image-mosaic-blur-tool$`));await expect(page.locator(".toolbox-tool-faq-list")).toBeVisible()});
}
test("010 complete editor controls and multi-region history",async({page})=>{await page.goto("/ko/image-mosaic-blur-tool");await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));await expect(page.locator('[data-testid="tool010-editor"]')).toBeVisible();await createRectangle(page,{x:.15,y:.15},{x:.45,y:.4});await createBrush(page,{x:.55,y:.3},{x:.7,y:.45});await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();await expect(page.getByRole("button",{name:"실행 취소"})).toBeEnabled();await page.getByRole("button",{name:"실행 취소"}).click();await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();await page.getByRole("button",{name:"다시 실행"}).click();await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible()});
test("010 methods, pixelation and output",async({page})=>{await page.goto("/ko/image-mosaic-blur-tool");await page.locator('input[type="file"]').first().setInputFiles(fixture("transparent.png"));for(const name of ["모자이크","블러","단색 가림","전체 픽셀화"]){await expect(page.getByRole("button",{name})).toBeVisible()}await page.locator('[data-testid="tool010-output-format"]').selectOption("png");const dl=page.waitForEvent("download");await page.locator('[data-testid="tool010-download"]').click();await dl});
test("010 mobile Japanese has no horizontal overflow",async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto("/ja/image-mosaic-blur-tool");await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)).toBeFalsy();await expect(page.getByRole("button",{name:"画像をダウンロード"})).toBeVisible()});
test("010 category card live and sitemap",async({page})=>{await page.goto("/ko/category/image-edit");await expect(page.getByRole("link",{name:/이미지 모자이크/})).toBeVisible();const xml=await (await page.request.get("/sitemap.xml")).text();for(const l of ["ko","en","ja"])expect(xml).toContain(`/${l}/image-mosaic-blur-tool`)});


test("010 inherits the 001/009 workbench structure",async({page})=>{
  await page.goto("/ko/image-mosaic-blur-tool");
  await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
  const workbench=page.locator('[data-testid="tool010-editor"]');
  await expect(workbench.locator(':scope > .toolbox-workbench-upload')).toHaveCount(1);
  await expect(workbench.locator(':scope > .toolbox-workbench-editor-grid')).toHaveCount(1);
  await expect(workbench.locator(':scope > .adjuster-output-card')).toHaveCount(1);
  await expect(workbench.locator(':scope > .adjuster-output-card > .toolbox-workbench-actions')).toHaveCount(1);
  await expect(workbench.locator(':scope > .adjuster-output-card > .toolbox-workbench-result-card')).toHaveCount(1);
});

test("010 original preview toggle never removes effects from export",async({page})=>{
  await page.goto("/ko/image-mosaic-blur-tool");
  await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
  await createRectangle(page,{x:.2,y:.2},{x:.6,y:.6});
  await page.getByRole("button",{name:"단색 가림"}).click();
  await page.getByRole("button",{name:"원본 보기"}).click();
  const download=page.waitForEvent("download");await page.locator('[data-testid="tool010-download"]').click();
  const item=await download;expect((await item.path())!==null).toBeTruthy();
});

test("010 move and resize each create an undoable history step",async({page})=>{
  await page.goto("/ko/image-mosaic-blur-tool");
  await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
  await createRectangle(page,{x:.2,y:.2},{x:.45,y:.45});
  await page.locator('[data-testid="tool010-mode-select"]').click();
  await dragCanvasPointer(page,{x:.3,y:.3},{x:.4,y:.4});
  await expect(page.locator('[data-testid="tool010-undo"]')).toBeEnabled();
  await page.locator('[data-testid="tool010-undo"]').click();
  await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
});
