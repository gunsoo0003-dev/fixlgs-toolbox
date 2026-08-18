import { expect, test } from "@playwright/test";
for(const locale of ["ko","en","ja"] as const){
 test(`TOOL046 ${locale} same engine result`,async({page})=>{
  await page.goto(`/${locale}/date-add-subtract-calculator`);
  await page.getByTestId("tool046-start-date").fill("2028-01-31");
  await page.getByTestId("tool046-unit").selectOption("month");
  await page.getByTestId("tool046-quantity").fill("1");
  await page.getByTestId("tool046-calculate").click();
  await expect(page.getByTestId("tool046-result-date")).toHaveText("2028-02-29");
  await expect(page.locator(`a[href="/${locale}/date-difference-calculator"]`)).toBeVisible();
 });
 test(`TOOL046 ${locale} category card is live`,async({page})=>{
  await page.goto(`/${locale}/category/date-time`);
  await expect(page.locator(`a[href="/${locale}/date-add-subtract-calculator"]`)).toBeVisible();
 });
}
