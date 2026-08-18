import { expect, test } from "@playwright/test";

test("TOOL046 subtract week + complete reset",async({page})=>{
 await page.goto("/ko/date-add-subtract-calculator");
 await page.getByTestId("tool046-start-date").fill("2026-08-16");
 await page.getByTestId("tool046-direction").selectOption("subtract");
 await page.getByTestId("tool046-unit").selectOption("week");
 await page.getByTestId("tool046-quantity").fill("2");
 await page.getByTestId("tool046-calculate").click();
 await expect(page.getByTestId("tool046-result-date")).toHaveText("2026-08-02");
 await expect(page.getByTestId("tool046-weekday")).toHaveText("일요일");
 await page.getByTestId("tool046-reset").click();
 await expect(page.getByTestId("tool046-start-date")).toHaveValue("");
 await expect(page.getByTestId("tool046-direction")).toHaveValue("add");
 await expect(page.getByTestId("tool046-unit")).toHaveValue("day");
 await expect(page.getByTestId("tool046-quantity")).toHaveValue("7");
 await expect(page.getByTestId("tool046-result-date")).toHaveCount(0);
 await expect(page.getByTestId("tool046-copy")).toHaveCount(0);
 await expect(page.getByTestId("tool046-error")).toHaveCount(0);
});

test("TOOL046 quick +30 days uses current start date and switches calculation controls",async({page})=>{
 await page.goto("/en/date-add-subtract-calculator");
 await page.getByTestId("tool046-start-date").fill("2026-08-16");
 await page.getByTestId("tool046-direction").selectOption("subtract");
 await page.getByTestId("tool046-unit").selectOption("year");
 await page.getByTestId("tool046-quantity").fill("3");
 await page.getByRole("button",{name:"+30 days"}).click();
 await expect(page.getByTestId("tool046-result-date")).toHaveText("2026-09-15");
 await expect(page.getByTestId("tool046-direction")).toHaveValue("add");
 await expect(page.getByTestId("tool046-unit")).toHaveValue("day");
 await expect(page.getByTestId("tool046-quantity")).toHaveValue("30");
});

test("TOOL046 localized weekday is rendered for all locales",async({page})=>{
 const expected={ko:"일요일",en:"Sunday",ja:"日曜日"} as const;
 for(const locale of ["ko","en","ja"] as const){
  await page.goto(`/${locale}/date-add-subtract-calculator`);
  await page.getByTestId("tool046-start-date").fill("2026-08-16");
  await page.getByTestId("tool046-quantity").fill("0");
  await page.getByTestId("tool046-calculate").click();
  await expect(page.getByTestId("tool046-weekday")).toHaveText(expected[locale]);
 }
});

test("TOOL046 copy uses result and localized weekday",async({page,context})=>{
 await context.grantPermissions(["clipboard-read","clipboard-write"]);
 await page.goto("/en/date-add-subtract-calculator");
 await page.getByTestId("tool046-start-date").fill("2026-08-16");
 await page.getByTestId("tool046-quantity").fill("10");
 await page.getByTestId("tool046-calculate").click();
 await page.getByTestId("tool046-copy").click();
 await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toBe("2026-08-26 Wednesday");
});
