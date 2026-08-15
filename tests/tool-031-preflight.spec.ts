import { test, expect } from "@playwright/test";
for (const locale of ["ko","en","ja"] as const) test(`031 preflight ${locale}`, async ({ page }) => {
  await page.goto(`/${locale}/pdf-page-number-watermark`);
  const root=page.getByTestId("tool031-root"); await expect(root).toBeVisible();
  await expect(root.getByTestId("tool031-file-input")).toHaveAttribute("accept",/pdf/);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});
