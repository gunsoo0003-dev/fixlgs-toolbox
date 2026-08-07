import { expect, test } from "@playwright/test";
import { openTool010, tool010Fixture } from "./helpers/tool-010";

test.describe("010 resource lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const state = { created: [] as string[], revoked: [] as string[] };
      const create = URL.createObjectURL.bind(URL);
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (value: Blob | MediaSource) => { const url = create(value); state.created.push(url); return url; };
      URL.revokeObjectURL = (url: string) => { state.revoked.push(url); revoke(url); };
      (window as any).__tool010UrlLifecycle = state;
    });
  });

  test("image replacement, repeated downloads and full reset revoke every object URL", async ({ page }) => {
    await openTool010(page);
    for (let index = 0; index < 3; index += 1) {
      const promise = page.waitForEvent("download");
      await page.locator('[data-testid="tool010-download"]').click();
      await promise;
      await page.waitForTimeout(20);
    }
    await page.locator('input[type="file"]').first().setInputFiles(tool010Fixture("transparent.png"));
    await page.locator('[data-testid="tool010-full-reset"]').click();
    await page.waitForTimeout(50);
    const lifecycle = await page.evaluate(() => (window as any).__tool010UrlLifecycle);
    expect(lifecycle.created.length).toBeGreaterThanOrEqual(5);
    expect(new Set(lifecycle.revoked).size).toBeGreaterThanOrEqual(new Set(lifecycle.created).size);
  });

  test("processing reset does not resurrect stale asynchronous results", async ({ page }) => {
    await openTool010(page);
    await page.locator('[data-testid="tool010-download"]').click();
    await page.locator('[data-testid="tool010-full-reset"]').click();
    await expect(page.locator('[data-testid="tool010-editor"]')).toHaveCount(0);
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="tool010-editor"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tool010-result"]')).toHaveCount(0);
  });
});
