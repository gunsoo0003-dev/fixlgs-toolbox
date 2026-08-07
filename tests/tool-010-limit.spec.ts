import { expect, test } from "@playwright/test";
import { tool010Fixture } from "./helpers/tool-010";

test("010 rejects over-safe-limit fixture while preserving upload UI", async ({ page }) => {
  await page.goto("/ko/image-mosaic-blur-tool");
  await page.locator('input[type="file"]').first().setInputFiles(tool010Fixture("tool010-probe-over-19_2mp.png"));
  await expect(page.locator('[data-testid="tool010-error"]')).toContainText(/처리 한도|19\.2MP/);
  await expect(page.locator('[data-testid="tool010-select"]')).toBeVisible();
});
