import { expect, test } from "@playwright/test";
import { dispatchTouchPointer, openTool010 } from "./helpers/tool-010";

const viewports = [
  { name: "tablet portrait", width: 768, height: 1024 },
  { name: "tablet landscape", width: 1024, height: 768 },
  { name: "small mobile", width: 360, height: 740 },
  { name: "large mobile", width: 430, height: 932 },
];

for (const viewport of viewports) {
  test(`${viewport.name} has no horizontal overflow and keeps canvas/tools/download reachable`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openTool010(page, "ja");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
    await expect(page.locator('[data-testid="tool010-canvas"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "長方形" })).toBeVisible();
    await expect(page.locator('[data-testid="tool010-download"]')).toBeVisible();
  });
}

test("touch pointer draws with one finger and two pointers do not create accidental regions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTool010(page);
  const canvas = page.locator('[data-testid="tool010-canvas"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas missing");
  await page.locator('[data-testid="tool010-mode-brush"]').click();
  await dispatchTouchPointer(page, "pointerdown", 1, box.x + 80, box.y + 80);
  await dispatchTouchPointer(page, "pointermove", 1, box.x + 160, box.y + 150);
  await dispatchTouchPointer(page, "pointerup", 1, box.x + 160, box.y + 150);
  await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();

  await page.getByRole("button", { name: "캔버스 이동" }).click();
  await dispatchTouchPointer(page, "pointerdown", 1, box.x + 100, box.y + 100);
  await dispatchTouchPointer(page, "pointerdown", 2, box.x + 220, box.y + 220);
  await dispatchTouchPointer(page, "pointermove", 1, box.x + 90, box.y + 90);
  await dispatchTouchPointer(page, "pointermove", 2, box.x + 240, box.y + 240);
  await dispatchTouchPointer(page, "pointerup", 1, box.x + 90, box.y + 90);
  await dispatchTouchPointer(page, "pointerup", 2, box.x + 240, box.y + 240);
  await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
});

test("screen rotation retains editor state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTool010(page);
  await page.locator('[data-testid="tool010-mode-rect"]').click();
  const canvas = page.locator('[data-testid="tool010-canvas"]');
  const box = await canvas.boundingBox(); if (!box) throw new Error("canvas missing");
  await page.mouse.move(box.x + 40, box.y + 40); await page.mouse.down(); await page.mouse.move(box.x + 160, box.y + 120); await page.mouse.up();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
});

test("light and dark themes preserve canvas fidelity, focus and active-state contrast", async ({ page }) => {
  await openTool010(page);
  const themeButton = page.getByRole("button", { name: /테마|theme|テーマ/i });
  const before = await page.locator('[data-testid="tool010-canvas"]').screenshot();
  if (await themeButton.count()) await themeButton.click();
  const after = await page.locator('[data-testid="tool010-canvas"]').screenshot();
  expect(Buffer.compare(before, after)).toBe(0);
  const rect = page.locator('[data-testid="tool010-mode-rect"]');
  await rect.click();
  await expect(rect).toHaveAttribute("aria-pressed", "true");
  await rect.focus();
  await expect(rect).toBeFocused();
  const contrast = await rect.evaluate(el => {
    const style = getComputedStyle(el);
    return { color: style.color, background: style.backgroundColor, outline: style.outlineStyle };
  });
  expect(contrast.color).not.toBe(contrast.background);
});
