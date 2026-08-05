import { expect, test } from "@playwright/test";

const toolRoutes = [
  "jpg-png-webp-image-converter",
  "heic-avif-image-converter",
  "svg-bmp-tiff-image-converter",
  "image-compressor",
] as const;

const locales = ["ko", "en", "ja"] as const;

test("TOOLBOX common automatic validation completes", async ({ page }) => {
  await page.goto("/dev/validation");
  const dashboard = page.getByTestId("validation-dashboard");
  await expect(dashboard).toBeVisible();

  await page.getByTestId("validation-run-all").click();
  await expect(dashboard).toHaveAttribute("data-running", "true", { timeout: 10_000 });
  await expect(dashboard).toHaveAttribute("data-complete", "true", { timeout: 180_000 });

  const rows = page.locator('[data-testid="validation-result"]');
  const total = Number(await page.getByTestId("validation-total").textContent());
  const passed = Number(await page.getByTestId("validation-pass").textContent());

  expect(total).toBeGreaterThan(0);
  await expect(rows).toHaveCount(total);
  await expect(rows.locator('[data-status="FAIL"]')).toHaveCount(0);
  expect(passed).toBe(total);
});

test("all public tool routes render in three languages", async ({ page }) => {
  for (const slug of toolRoutes) {
    for (const locale of locales) {
      await page.goto(`/${locale}/${slug}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("body")).not.toContainText("Application error");
    }
  }
});

test("public tool pages do not overflow the viewport", async ({ page }) => {
  await page.goto("/en/image-compressor");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBeFalsy();
});
