import { expect, test } from "@playwright/test";
for(const locale of ["ko","en","ja"] as const){
 test(`TOOL046 ${locale} initial state and mount contract`,async({page})=>{
  await page.goto(`/${locale}/date-add-subtract-calculator`);
  await expect(page.getByTestId("tool046-root")).toBeVisible();
  await expect(page.getByTestId("tool046-workspace")).toBeVisible();
  await expect(page.getByTestId("tool046-start-date")).toHaveValue("");
  await expect(page.getByTestId("tool046-direction")).toHaveValue("add");
  await expect(page.getByTestId("tool046-unit")).toHaveValue("day");
  await expect(page.getByTestId("tool046-quantity")).toHaveValue("7");
  await expect(page.getByTestId("tool046-reset")).toBeEnabled();
  await expect(page.getByTestId("tool046-calculate")).toBeEnabled();
  await expect(page.getByTestId("tool046-result")).toBeVisible();
  await expect(page.getByTestId("tool046-result-date")).toHaveCount(0);
  await expect(page.getByTestId("tool046-weekday")).toHaveCount(0);
  await expect(page.getByTestId("tool046-copy")).toHaveCount(0);
  await expect(page.getByTestId("tool046-error")).toHaveCount(0);
 });
}
