import { expect, test } from "@playwright/test";
import { createRectangle, dispatchTouchPointer, openTool010 } from "./helpers/tool-010";

test.describe("010 view controls, mobile and accessibility", () => {
  test("zoom, fit, 100 percent and pan do not change output dimensions", async ({ page }) => {
    await openTool010(page);
    await page.locator('[data-testid="tool010-zoom-in"]').click();
    await expect(page.locator('[data-testid="tool010-zoom-level"]')).toHaveText("125%");
    await page.locator('[data-testid="tool010-fit"]').click();
    await expect(page.locator('[data-testid="tool010-zoom-level"]')).toHaveText("100%");
    await page.getByRole("button", { name: "캔버스 이동" }).click();
    const canvas = page.locator('[data-testid="tool010-canvas"]');
    const box = await canvas.boundingBox(); if (!box) throw new Error("canvas missing");
    await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5); await page.mouse.down();
    await page.mouse.move(box.x + box.width * .6, box.y + box.height * .6); await page.mouse.up();
    await expect(page.locator('[data-testid="tool010-result"]')).toContainText("800 × 600px");
  });

  test("mobile Japanese UI has no horizontal overflow and retains primary controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTool010(page, "ja");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
    for (const name of ["長方形", "フリーブラシ", "モザイク", "ぼかし", "不透明な塗りつぶし", "画像をダウンロード"]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }
  });

  test("mobile canvas editing suppresses page scrolling only during the gesture", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTool010(page);
    const canvas = page.locator('[data-testid="tool010-canvas"]');
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox(); if (!box) throw new Error("canvas missing");
    const before = await page.evaluate(() => scrollY);
    await page.locator('[data-testid="tool010-mode-rect"]').click();
    await dispatchTouchPointer(page, "pointerdown", 1, box.x + box.width * .2, box.y + box.height * .2);
    await dispatchTouchPointer(page, "pointermove", 1, box.x + box.width * .55, box.y + box.height * .55);
    await dispatchTouchPointer(page, "pointerup", 1, box.x + box.width * .55, box.y + box.height * .55);
    const after = await page.evaluate(() => scrollY);
    expect(Math.abs(after - before)).toBeLessThan(4);
    await page.mouse.wheel(0, 400);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThanOrEqual(before);
  });

  test("active tools expose aria-pressed and sliders are keyboard operable", async ({ page }) => {
    await openTool010(page);
    const rect = page.locator('[data-testid="tool010-mode-rect"]');
    await rect.click();
    await expect(rect).toHaveAttribute("aria-pressed", "true");
    const strength = page.locator('[data-testid="tool010-strength"]');
    await strength.focus();
    const before = Number(await strength.inputValue());
    await page.keyboard.press("ArrowRight");
    expect(Number(await strength.inputValue())).toBeGreaterThan(before);
  });

  test("focus reaches upload, tools, output and reset controls", async ({ page }) => {
    await page.goto("/ko/image-mosaic-blur-tool");
    await page.keyboard.press("Tab");
    await expect(page.locator(':focus')).toBeVisible();
    await openTool010(page);
    for (const locator of [
      page.locator('[data-testid="tool010-mode-rect"]'),
      page.locator('[data-testid="tool010-strength"]'),
      page.locator('[data-testid="tool010-download"]'),
      page.locator('[data-testid="tool010-full-reset"]'),
    ]) {
      await locator.focus();
      await expect(locator).toBeFocused();
    }
  });

  test("full reset returns to empty state and clears editor", async ({ page }) => {
    await openTool010(page);
    await createRectangle(page);
    await page.locator('[data-testid="tool010-full-reset"]').click();
    await expect(page.locator('[data-testid="tool010-editor"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tool010-select"]')).toBeVisible();
  });
});
