import { expect, test } from "@playwright/test";

test("TOOL046 approved max quantity remains deterministic",async({page})=>{
 await page.goto("/en/date-add-subtract-calculator");
 await page.getByTestId("tool046-start-date").fill("2000-01-01");
 await page.getByTestId("tool046-unit").selectOption("day");
 await page.getByTestId("tool046-quantity").fill("100000");
 await page.getByTestId("tool046-calculate").click();
 await expect(page.getByTestId("tool046-result-date")).toHaveText("2273-10-16");
});

test("TOOL046 quantity above approved max is blocked",async({page})=>{
 await page.goto("/ko/date-add-subtract-calculator");
 await page.getByTestId("tool046-start-date").fill("2026-08-16");
 await page.getByTestId("tool046-quantity").fill("100001");
 await page.getByTestId("tool046-calculate").click();
 await expect(page.getByTestId("tool046-error")).toBeVisible();
 await expect(page.getByTestId("tool046-result-date")).toHaveCount(0);
});
