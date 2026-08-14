import { test, expect } from "@playwright/test";
for(const locale of ["ko","en","ja"] as const){test(`026 ${locale} SEO and route`,async({page})=>{await page.goto(`/${locale}/image-to-pdf`);await expect(page.locator("h1")).toBeVisible();await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);await expect(page.getByTestId("tool026-root")).toBeVisible();});}
