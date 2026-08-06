import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) => path.join(process.cwd(), "test-fixtures", name);

async function waitForOutcome(page: import("@playwright/test").Page, timeout = 120_000) {
  const editor = page.locator('[data-testid="tool009-editor"]');
  const error = page.locator('[data-testid="tool009-error"]');
  await expect(editor.or(error)).toBeVisible({ timeout });
  return { editor, error };
}

test.describe("009 safety boundaries", () => {
  test("accepts an image at the configured pixel boundary", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("tool009-probe-19_2mp.png"));
    const { editor, error } = await waitForOutcome(page);
    await expect(error).toHaveCount(0);
    await expect(editor).toBeVisible();
  });

  test("rejects an image above the configured pixel boundary", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("tool009-probe-over-19_2mp.png"));
    const { editor, error } = await waitForOutcome(page);
    await expect(editor).toHaveCount(0);
    await expect(error).toContainText(/최대 1,920만 픽셀|초과한 이미지는 처리할 수 없습니다|너무 커|메모리/, { timeout: 120_000 });
  });

  test("rejects MIME and extension mismatch", async ({ page }) => {
    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles({
      name: "fake.png",
      mimeType: "image/jpeg",
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });
    const { editor, error } = await waitForOutcome(page, 30_000);
    await expect(editor).toHaveCount(0);
    await expect(error).toContainText("지원하지 않는");
  });
});
