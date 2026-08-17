import { expect, test } from "@playwright/test";
import { route042 } from "./helpers/tool-042";

test("TOOL042 result stays separate from original",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("A");
  await page.getByTestId("tool042-find-0").fill("A");
  await page.getByTestId("tool042-replace-0").fill("B");
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-input")).toHaveValue("A");
  await expect(page.getByTestId("tool042-result")).toHaveValue("B");
  await expect(page.getByTestId("tool042-copy")).toBeEnabled();
  await expect(page.getByTestId("tool042-download")).toBeEnabled();
});

test("TOOL042 one active workspace owns drag state",async({page})=>{
  await page.goto(route042());
  await expect(page.locator('[data-testid="tool042-workspace"]')).toHaveCount(1);
});

test("TOOL042 result actions stay visible but disabled before result",async({page})=>{
  await page.goto(route042());
  await expect(page.getByTestId("tool042-copy")).toBeVisible();
  await expect(page.getByTestId("tool042-copy")).toBeDisabled();
  await expect(page.getByTestId("tool042-download")).toBeVisible();
  await expect(page.getByTestId("tool042-download")).toBeDisabled();
});

for(const locale of ["ko","en","ja"] as const){
  test(`TOOL042 ${locale} route has no horizontal overflow`,async({page})=>{
    await page.goto(route042(locale));
    await expect(page.getByTestId("tool042-root")).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
