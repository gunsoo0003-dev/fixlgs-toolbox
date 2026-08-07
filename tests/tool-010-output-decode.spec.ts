import { expect, test } from "@playwright/test";
import { createRectangle, decodeDownloadedImage, openTool010, pixelDistance } from "./helpers/tool-010";

test.describe("010 decoded final output validation", () => {
  test("downloaded PNG preserves source dimensions, redacts inside, preserves outside, and excludes selection guides", async ({ page }) => {
    await openTool010(page);
    await createRectangle(page, { x: .2, y: .2 }, { x: .55, y: .55 });
    await page.getByRole("button", { name: "단색 가림" }).click();
    await page.locator('input[type="color"]').first().fill("#ff0000");
    const promise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-output-format"]').selectOption("png");
    await page.locator('[data-testid="tool010-download"]').click();
    const decoded = await decodeDownloadedImage(page, await promise);
    expect(decoded.width).toBe(800);
    expect(decoded.height).toBe(600);
    expect(decoded.inside[0]).toBeGreaterThan(240);
    expect(decoded.inside[1]).toBeLessThan(20);
    expect(decoded.inside[2]).toBeLessThan(20);
    expect(decoded.inside[3]).toBe(255);
    expect(pixelDistance(decoded.outside, [224, 224, 224, 255])).toBeLessThan(500);
    expect(decoded.corner[2]).not.toBeGreaterThan(decoded.corner[0] + 80);
  });

  test("transparent PNG stays transparent in PNG/WebP and JPG uses selected background", async ({ page }) => {
    await openTool010(page, "ko", "transparent.png");
    for (const format of ["png", "webp"] as const) {
      await page.locator('[data-testid="tool010-output-format"]').selectOption(format);
      const promise = page.waitForEvent("download");
      await page.locator('[data-testid="tool010-download"]').click();
      const decoded = await decodeDownloadedImage(page, await promise);
      expect(decoded.corner[3]).toBeLessThan(255);
    }
    await page.locator('[data-testid="tool010-output-format"]').selectOption("jpg");
    await page.getByLabel("JPG 배경색").fill("#00ff00");
    const promise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-download"]').click();
    const decoded = await decodeDownloadedImage(page, await promise);
    expect(decoded.corner[1]).toBeGreaterThan(decoded.corner[0]);
    expect(decoded.corner[1]).toBeGreaterThan(decoded.corner[2]);
    expect(decoded.corner[3]).toBe(255);
  });

  test("original preview does not bypass redaction in final file", async ({ page }) => {
    await openTool010(page);
    await createRectangle(page);
    await page.getByRole("button", { name: "단색 가림" }).click();
    await page.getByRole("button", { name: "원본 보기" }).click();
    await page.locator('[data-testid="tool010-output-format"]').selectOption("png");
    const promise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-download"]').click();
    const decoded = await decodeDownloadedImage(page, await promise);
    expect(decoded.inside[0] + decoded.inside[1] + decoded.inside[2]).toBeLessThan(40);
  });
});
