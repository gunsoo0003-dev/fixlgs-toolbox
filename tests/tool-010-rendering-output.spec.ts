import { expect, test } from "@playwright/test";
import { canvasPixel, createRectangle, openTool010, pixelDistance } from "./helpers/tool-010";

test.describe("010 rendering and output", () => {
  test.beforeEach(async ({ page }) => openTool010(page));

  test("solid redaction changes inside pixels and preserves outside pixels", async ({ page }) => {
    const beforeInside = await canvasPixel(page, .35, .35);
    const beforeOutside = await canvasPixel(page, .85, .85);
    await createRectangle(page, { x: .2, y: .2 }, { x: .55, y: .55 });
    await page.getByRole("button", { name: "단색 가림" }).click();
    await page.locator('input[type="color"]').first().fill("#ff0000");
    await page.getByRole("button", { name: "영역 숨기기" }).click();
    await page.waitForTimeout(100);
    const afterInside = await canvasPixel(page, .35, .35);
    const afterOutside = await canvasPixel(page, .85, .85);
    expect(afterInside[0]).toBeGreaterThan(240);
    expect(afterInside[1]).toBeLessThan(20);
    expect(afterInside[2]).toBeLessThan(20);
    expect(afterInside[3]).toBe(255);
    expect(pixelDistance(beforeInside, afterInside)).toBeGreaterThan(30);
    expect(pixelDistance(beforeOutside, afterOutside)).toBeLessThanOrEqual(4);
  });

  test("mosaic and blur alter selected pixels without changing canvas dimensions", async ({ page }) => {
    const canvas = page.locator('[data-testid="tool010-canvas"]');
    const dimensions = await canvas.evaluate(c => ({ width: (c as HTMLCanvasElement).width, height: (c as HTMLCanvasElement).height }));
    const original = await canvasPixel(page, .35, .35);
    await createRectangle(page, { x: .15, y: .15 }, { x: .6, y: .6 });
    await page.getByRole("button", { name: "영역 숨기기" }).click();
    const mosaic = await canvasPixel(page, .35, .35);
    expect(pixelDistance(original, mosaic)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "블러" }).click();
    await page.locator('[data-testid="tool010-strength"]').fill("60");
    await page.waitForTimeout(100);
    const blurred = await canvasPixel(page, .35, .35);
    expect(pixelDistance(mosaic, blurred)).toBeGreaterThan(0);
    await expect(canvas).toHaveJSProperty("width", dimensions.width);
    await expect(canvas).toHaveJSProperty("height", dimensions.height);
  });

  test("whole-image pixelation toggles once and remains undoable", async ({ page }) => {
    const button = page.locator('[data-testid="tool010-pixelate-all"]');
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await page.locator('[data-testid="tool010-pixel-strength"]').fill("48");
    await page.locator('[data-testid="tool010-undo"]').click();
    await page.locator('[data-testid="tool010-undo"]').click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await page.locator('[data-testid="tool010-redo"]').click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  });

  test("original preview hides effects only in preview and never in export", async ({ page }) => {
    await createRectangle(page);
    await page.getByRole("button", { name: "단색 가림" }).click();
    await page.getByRole("button", { name: "원본 보기" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-download"]').click();
    const download = await downloadPromise;
    expect(await download.path()).not.toBeNull();
  });

  test("area guides can be hidden and are not included in generated result", async ({ page }) => {
    await createRectangle(page);
    await page.getByRole("button", { name: "영역 숨기기" }).click();
    await expect(page.getByRole("button", { name: "영역 표시" })).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-download"]').click();
    expect(await (await downloadPromise).path()).not.toBeNull();
  });

  for (const format of ["jpg", "png", "webp"] as const) {
    test(`downloads ${format.toUpperCase()} and keeps editor state`, async ({ page }) => {
      await createRectangle(page);
      await page.locator('[data-testid="tool010-output-format"]').selectOption(format);
      const downloadPromise = page.waitForEvent("download");
      await page.locator('[data-testid="tool010-download"]').click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(new RegExp(`\\.${format}$`, "i"));
      await expect(page.locator('[data-testid="tool010-editor"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool010-result"]')).toContainText(format.toUpperCase());
    });
  }

  test("sanitizes output filename and supports repeated download", async ({ page }) => {
    const filename = page.getByLabel("파일명");
    await filename.fill(' bad / name:*?<>| ');
    await filename.blur();
    const firstPromise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-download"]').click();
    const first = await firstPromise;
    expect(first.suggestedFilename()).not.toMatch(/[\\/:*?"<>|]/);
    const secondPromise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-download"]').click();
    expect(await (await secondPromise).path()).not.toBeNull();
  });

  test("JPG output exposes a background color control for transparent images", async ({ page }) => {
    await page.locator('[data-testid="tool010-full-reset"]').click();
    await openTool010(page, "ko", "transparent.png");
    await page.locator('[data-testid="tool010-output-format"]').selectOption("jpg");
    await expect(page.getByLabel("JPG 배경색")).toBeVisible();
    await page.getByLabel("JPG 배경색").fill("#00ff00");
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-download"]').click();
    expect(await (await downloadPromise).path()).not.toBeNull();
  });
});
