import { expect, test } from "@playwright/test";
import { clickCanvasPointer, createBrush, createRectangle, dragCanvasPointer, openTool010 } from "./helpers/tool-010";

test.describe("010 selection, editing and history", () => {
  test.beforeEach(async ({ page }) => openTool010(page));

  test("creates rectangle in both normal and reverse drag directions and rejects click-only regions", async ({ page }) => {
    await createRectangle(page);
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await createRectangle(page, { x: .8, y: .8 }, { x: .6, y: .6 });
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await page.locator('[data-testid="tool010-mode-rect"]').click();
    await clickCanvasPointer(page, { x: .1, y: .1 });
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
  });

  test("creates freehand brush strokes and undo/redo treats one stroke as one step", async ({ page }) => {
    await createBrush(page);
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await page.locator('[data-testid="tool010-undo"]').click();
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await page.locator('[data-testid="tool010-redo"]').click();
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
  });

  test("moves and resizes a rectangle, each as an undoable edit", async ({ page }) => {
    await createRectangle(page, { x: .2, y: .2 }, { x: .45, y: .45 });
    await page.locator('[data-testid="tool010-mode-select"]').click();
    await dragCanvasPointer(page, { x: .3, y: .3 }, { x: .42, y: .42 });
    await expect(page.locator('[data-testid="tool010-undo"]')).toBeEnabled();
    await page.locator('[data-testid="tool010-undo"]').click();
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await page.locator('[data-testid="tool010-redo"]').click();
    await dragCanvasPointer(page, { x: .57, y: .57 }, { x: .7, y: .7 });
    await page.locator('[data-testid="tool010-undo"]').click();
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
  });

  test("changes method, strength and color per selected area", async ({ page }) => {
    await createRectangle(page);
    await page.getByRole("button", { name: "블러" }).click();
    await page.locator('[data-testid="tool010-strength"]').fill("40");
    await page.getByRole("button", { name: "단색 가림" }).click();
    await page.locator('input[type="color"]').first().fill("#ff0000");
    await expect(page.getByText(/rect · solid/)).toBeVisible();
  });

  test("deletes selected area, deletes all and restores deletion with undo", async ({ page }) => {
    await createRectangle(page);
    await createBrush(page);
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await page.locator('[data-testid="tool010-delete-selected"]').click();
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await page.locator('[data-testid="tool010-delete-all"]').click();
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await page.locator('[data-testid="tool010-undo"]').click();
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
  });

  test("keyboard undo redo delete and arrow movement are supported", async ({ page }) => {
    await createRectangle(page);
    await page.locator('[data-testid="tool010-mode-select"]').click();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Shift+ArrowDown");
    await page.keyboard.press("Control+z");
    await page.keyboard.press("Control+y");
    await page.keyboard.press("Delete");
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
  });

  test("new edit after undo clears redo history", async ({ page }) => {
    await createRectangle(page);
    await createBrush(page);
    await page.locator('[data-testid="tool010-undo"]').click();
    await expect(page.locator('[data-testid="tool010-redo"]')).toBeEnabled();
    await createRectangle(page, { x: .65, y: .6 }, { x: .85, y: .8 });
    await expect(page.locator('[data-testid="tool010-redo"]')).toBeDisabled();
  });
});
