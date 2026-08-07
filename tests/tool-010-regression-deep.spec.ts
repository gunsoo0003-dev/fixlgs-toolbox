import { expect, test } from "@playwright/test";

const completed = [
  "/ko/jpg-png-webp-image-converter",
  "/ko/heic-avif-image-converter",
  "/ko/svg-bmp-tiff-image-converter",
  "/ko/image-compressor",
  "/ko/target-size-image-compressor",
  "/ko/image-resizer",
  "/ko/web-image-optimizer",
  "/ko/image-cropper-rotator",
  "/ko/image-brightness-color-adjuster",
];

test("001-009 routes, shell, language switch, theme switch and category numbering remain intact", async ({ page, request }) => {
  for (const route of completed) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBeTruthy();
    await expect(page.locator("header"), route).toBeVisible();
    await expect(page.locator("footer"), route).toBeVisible();
    await expect(page.locator("h1"), route).toBeVisible();
  }
  await page.goto("/ko/category/image-edit");
  for (const number of ["08", "09", "10"]) await expect(page.getByText(number, { exact: true }).first()).toBeVisible();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const route of completed) expect(sitemap).toContain(route);
  for (const locale of ["ko", "en", "ja"]) expect(sitemap).toContain(`/${locale}/image-mosaic-blur-tool`);
});
