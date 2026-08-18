import { expect, test } from "@playwright/test";

test("empty start date is rejected without mounting a result",async({page})=>{
 await page.goto("/ko/date-add-subtract-calculator");
 await page.getByTestId("tool046-calculate").click();
 await expect(page.getByTestId("tool046-error")).toBeVisible();
 await expect(page.getByTestId("tool046-result-date")).toHaveCount(0);
 await expect(page.getByTestId("tool046-copy")).toHaveCount(0);
});

test("negative and decimal quantities are rejected without stale result",async({page})=>{
 await page.goto("/ko/date-add-subtract-calculator");
 await page.getByTestId("tool046-start-date").fill("2026-08-16");
 await page.getByTestId("tool046-quantity").fill("1");
 await page.getByTestId("tool046-calculate").click();
 await expect(page.getByTestId("tool046-result-date")).toBeVisible();
 for(const bad of ["-1","1.5"]){
  await page.getByTestId("tool046-quantity").fill(bad);
  await page.getByTestId("tool046-calculate").click();
  await expect(page.getByTestId("tool046-error")).toBeVisible();
  await expect(page.getByTestId("tool046-result-date")).toHaveCount(0);
 }
});

test("zero preserves the same date",async({page})=>{
 await page.goto("/en/date-add-subtract-calculator");
 await page.getByTestId("tool046-start-date").fill("2026-08-16");
 await page.getByTestId("tool046-quantity").fill("0");
 await page.getByTestId("tool046-calculate").click();
 await expect(page.getByTestId("tool046-result-date")).toHaveText("2026-08-16");
 await expect(page.getByTestId("tool046-error")).toHaveCount(0);
});
