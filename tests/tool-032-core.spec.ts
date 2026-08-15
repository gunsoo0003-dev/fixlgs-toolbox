import { test, expect } from "@playwright/test";
import path from "node:path";

const fixture = (...parts: string[]) => path.join(process.cwd(), "fixtures", "tool-032", ...parts);

async function loadPdf(page: any) {
  await page.goto("/en/pdf-signature");
  await page.getByTestId("tool032-file-input").setInputFiles(fixture("mixed-4page.pdf"));
  await expect(page.getByTestId("tool032-workspace")).toBeVisible();
}

test("032 image signature -> placement -> all pages -> verified result/download", async ({ page }) => {
  await loadPdf(page);
  await page.getByRole("tab", { name: "Signature image" }).click();
  await page.getByTestId("tool032-signature-input").setInputFiles(fixture("transparent-signature.png"));
  await expect(page.getByTestId("tool032-signature-overlay")).toBeVisible();
  await page.getByLabel("All pages").check();
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("tool032-create").click();
  await expect(page.getByTestId("tool032-result")).toContainText("4 pages");
  await expect(page.getByTestId("tool032-result")).toContainText("1, 2, 3, 4");
  await page.getByTestId("tool032-download").click();
  const download = await downloadPromise;
  expect(await download.suggestedFilename()).toMatch(/-signed\.pdf$/);
});

test("032 drawn transparent signature becomes an overlay", async ({ page }) => {
  await loadPdf(page);
  const canvas = page.getByTestId("tool032-draw-canvas");
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  if (!box) return;
  await page.mouse.move(box.x + 40, box.y + 110);
  await page.mouse.down();
  await page.mouse.move(box.x + 110, box.y + 70, { steps: 8 });
  await page.mouse.move(box.x + 170, box.y + 120, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByTestId("tool032-signature-overlay")).toBeVisible();
});
