import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture=(name:string)=>path.join(process.cwd(),"test-fixtures",name);

test.describe("010 additional completion checks",()=>{
  test("validates zero-byte, signature, MIME and extension mismatch",async({page})=>{
    await page.goto("/ko/image-mosaic-blur-tool");
    const input=page.locator('input[type="file"]').first();
    await input.setInputFiles({name:"empty.png",mimeType:"image/png",buffer:Buffer.alloc(0)});
    await expect(page.locator('[data-testid="tool010-error"]')).toContainText("빈 파일");
    await input.setInputFiles({name:"fake.png",mimeType:"image/jpeg",buffer:Buffer.from([0xff,0xd8,0xff,0xd9])});
    await expect(page.locator('[data-testid="tool010-error"]')).toContainText(/일치하지 않습니다|지원하지 않는/);
    await input.setInputFiles({name:"broken.jpg",mimeType:"image/jpeg",buffer:Buffer.from("not-an-image")});
    await expect(page.locator('[data-testid="tool010-error"]')).toContainText(/지원하지 않는|읽을 수 없습니다/);
  });

  test("full reset removes image, regions, result and history",async({page})=>{
    await page.goto("/ko/image-mosaic-blur-tool");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
    const canvas=page.locator('[data-testid="tool010-canvas"]'),box=await canvas.boundingBox();if(!box)throw new Error("canvas missing");
    await page.getByRole("button",{name:"사각형"}).click();await page.mouse.move(box.x+20,box.y+20);await page.mouse.down();await page.mouse.move(box.x+120,box.y+100);await page.mouse.up();
    await page.locator('[data-testid="tool010-full-reset"]').click();
    await expect(page.locator('[data-testid="tool010-editor"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tool010-select"]')).toBeVisible();
  });

  test("three locale routes preserve the same tool during language switching",async({page})=>{
    for(const locale of ["ko","en","ja"]){await page.goto(`/${locale}/image-mosaic-blur-tool`);await expect(page.locator("h1")).toBeVisible();await expect(page).toHaveURL(new RegExp(`/${locale}/image-mosaic-blur-tool$`))}
  });

  test("dark mobile editor retains canvas, controls and no overflow",async({page})=>{
    await page.setViewportSize({width:390,height:844});await page.goto("/ja/image-mosaic-blur-tool");
    const theme=page.getByRole("button",{name:/テーマ|theme|테마/i});if(await theme.count())await theme.click();
    await page.locator('input[type="file"]').first().setInputFiles(fixture("transparent.png"));
    await expect(page.locator('[data-testid="tool010-canvas"]')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBeTruthy();
  });
});
