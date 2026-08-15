import { test, expect } from "@playwright/test";

test("032 regression protects active PDF category baselines in supplied project", async ({ page }) => {
  for (const route of ["/en/image-to-pdf", "/en/pdf-to-image-converter"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
  }
});

test("032 locale routes expose the same tool root", async ({ page }) => {
  for (const locale of ["ko", "en", "ja"]) {
    await page.goto(`/${locale}/pdf-signature`);
    await expect(page.getByTestId("tool032-root")).toBeVisible();
  }
});
