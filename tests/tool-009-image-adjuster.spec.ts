import { expect, test } from "@playwright/test";
import path from "node:path";

const locales=["ko","en","ja"] as const;
const fixture=(name:string)=>path.join(process.cwd(),"test-fixtures",name);

for(const locale of locales){
 test(`${locale} tool 009 route, SEO and complete content`,async({page})=>{
  await page.goto(`/${locale}/image-brightness-color-adjuster`);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('[data-testid="tool009-select"]')).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",new RegExp(`/${locale}/image-brightness-color-adjuster$`));
  await expect(page.locator(".toolbox-tool-guide ol li")).toHaveCount(5);
  await expect(page.locator(".toolbox-tool-faq-list")).toBeVisible();
 });
}

test("009 editor exposes all required controls and history",async({page})=>{
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
 await expect(page.locator('[data-testid="tool009-editor"]')).toBeVisible();
 for(const key of ["brightness","contrast","saturation","temperature","sharpness"]){await expect(page.locator(`[data-testid="tool009-${key}"]`)).toBeVisible()}
 await expect(page.getByRole("button",{name:"자동보정"})).toBeVisible();
 await expect(page.getByRole("button",{name:"흑백"})).toBeVisible();
 await expect(page.getByRole("button",{name:"세피아"})).toBeVisible();
 await expect(page.getByRole("button",{name:"실행 취소"})).toBeDisabled();
 await page.locator('[data-testid="tool009-brightness"]').fill("20");
 await page.locator('[data-testid="tool009-brightness"]').press("ArrowRight");
 await expect(page.getByRole("button",{name:"실행 취소"})).toBeEnabled();
});

test("009 grayscale and sepia are mutually exclusive",async({page})=>{
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
 const gray=page.getByRole("button",{name:"흑백"}),sepia=page.getByRole("button",{name:"세피아"});
 await gray.click();await expect(gray).toHaveClass(/is-active/);
 await sepia.click();await expect(sepia).toHaveClass(/is-active/);await expect(gray).not.toHaveClass(/is-active/);
});

test("009 transparent PNG warns when JPG output is selected",async({page})=>{
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("transparent.png"));
 await page.getByLabel("출력 형식").selectOption("jpg");
 await expect(page.getByText(/JPG는 투명도를 지원하지 않아/)).toBeVisible();
 await expect(page.getByLabel("JPG 배경색")).toBeVisible();
});

test("009 rejects empty and unsupported files without losing the page",async({page})=>{
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles({name:"empty.jpg",mimeType:"image/jpeg",buffer:Buffer.alloc(0)});
 await expect(page.locator('[data-testid="tool009-error"]')).toContainText("빈 파일");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.svg"));
 await expect(page.locator('[data-testid="tool009-error"]')).toContainText("지원하지 않는");
 await expect(page.locator('[data-testid="tool009-select"]')).toBeVisible();
});

test("009 category card is live",async({page})=>{await page.goto("/ko/category/image-edit");await expect(page.getByRole("link",{name:/이미지 밝기\s*색상 보정기/})).toBeVisible()});

test("009 output settings, reset distinction, and result details",async({page})=>{
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
 await page.locator('[data-testid="tool009-contrast"]').fill("18");
 await page.locator('[data-testid="tool009-contrast"]').press("ArrowRight");
 await page.getByLabel("출력 형식").selectOption("webp");
 await page.getByLabel("파일명").fill("sample-adjusted");
 await page.getByRole("button",{name:"모든 보정값 초기화"}).click();
 await expect(page.locator('[data-testid="tool009-editor"]')).toBeVisible();
 await expect(page.getByLabel("출력 형식")).toHaveValue("webp");
 await expect(page.getByLabel("파일명")).toHaveValue("sample-adjusted");
 await expect(page.locator('[data-testid="tool009-contrast"]')).toHaveValue("0");
 await expect(page.getByText(/원본 용량/)).toBeVisible();
 await expect(page.getByText(/픽셀 크기/)).toBeVisible();
});

test("009 compare view is keyboard accessible",async({page})=>{
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
 await page.getByRole("button",{name:"비교 보기"}).click();
 const compare=page.getByLabel("비교 보기");
 await expect(compare).toBeVisible();
 await compare.focus();
 await compare.press("ArrowRight");
 await expect(compare).toHaveValue("51");
});

test("009 Japanese mobile layout has no horizontal overflow",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/ja/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
 expect(overflow).toBeFalsy();
 await expect(page.getByRole("button",{name:"画像をダウンロード"})).toBeVisible();
});

test("009 dark mode and tablet layout keep controls readable without overflow",async({page})=>{
 await page.setViewportSize({width:820,height:1180});
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.getByRole("button",{name:"다크 모드"}).click();
 await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
 await expect(page.locator('[data-testid="tool009-editor"]')).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
 expect(overflow).toBeFalsy();
 await expect(page.locator('[data-testid="tool009-download"]')).toBeVisible();
});

test("009 revokes generated object URLs after download",async({page})=>{
 await page.addInitScript(()=>{
  const originalCreate=URL.createObjectURL.bind(URL),originalRevoke=URL.revokeObjectURL.bind(URL);
  (window as unknown as {__tool009Urls:{created:string[];revoked:string[]}}).__tool009Urls={created:[],revoked:[]};
  URL.createObjectURL=(blob:Blob)=>{const value=originalCreate(blob);(window as unknown as {__tool009Urls:{created:string[];revoked:string[]}}).__tool009Urls.created.push(value);return value};
  URL.revokeObjectURL=(value:string)=>{(window as unknown as {__tool009Urls:{created:string[];revoked:string[]}}).__tool009Urls.revoked.push(value);return originalRevoke(value)};
 });
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
 const download=page.waitForEvent("download");
 await page.locator('[data-testid="tool009-download"]').click();
 await download;
 await expect.poll(()=>page.evaluate(()=>(window as unknown as {__tool009Urls:{created:string[];revoked:string[]}}).__tool009Urls)).toEqual(expect.objectContaining({created:expect.any(Array),revoked:expect.any(Array)}));
 const counts=await page.evaluate(()=>{const state=(window as unknown as {__tool009Urls:{created:string[];revoked:string[]}}).__tool009Urls;return{created:state.created.length,revoked:state.revoked.length}});
 expect(counts.created).toBeGreaterThan(0);
 expect(counts.revoked).toBe(counts.created);
});

test("009 reset during delayed final rendering cancels stale completion",async({page})=>{
 await page.addInitScript(()=>{
  const original=createImageBitmap.bind(globalThis);
  (window as unknown as {__delayTool009?:boolean}).__delayTool009=false;
  globalThis.createImageBitmap=(async(...args:Parameters<typeof createImageBitmap>)=>{
   if((window as unknown as {__delayTool009?:boolean}).__delayTool009)await new Promise(resolve=>setTimeout(resolve,250));
   return original(...args);
  }) as typeof createImageBitmap;
 });
 await page.goto("/ko/image-brightness-color-adjuster");
 await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
 await page.evaluate(()=>(window as unknown as {__delayTool009?:boolean}).__delayTool009=true);
 await page.locator('[data-testid="tool009-download"]').click();
 await page.locator('[data-testid="tool009-full-reset"]').click();
 await expect(page.locator('[data-testid="tool009-select"]')).toBeVisible();
 await page.waitForTimeout(400);
 await expect(page.locator('[data-testid="tool009-editor"]')).toHaveCount(0);
 await expect(page.getByText("다운로드 준비 완료")).toHaveCount(0);
});
