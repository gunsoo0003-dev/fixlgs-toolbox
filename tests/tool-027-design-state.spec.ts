import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("027 026-category dropzone state transition remains intact", async ({ page }) => {
  await page.goto("/ko/pdf-to-image-converter");
  const drop = page.getByTestId("tool027-dropzone");
  await expect(drop).not.toHaveClass(/dropzoneReady/);
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/sample-3pages.pdf");
  await expect(drop).toHaveClass(/dropzoneReady/);
  await expect(page.getByTestId("tool027-workspace")).toBeVisible();
  await page.getByTestId("tool027-reset-all").click();
  await expect(drop).not.toHaveClass(/dropzoneReady/);
});


test("027 post-upload workspace accepts replacement PDF across the whole work area", async ({ page }) => {
  await page.goto("/ko/pdf-to-image-converter");
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/sample-3pages.pdf");
  await expect(page.getByTestId("tool027-selected-count")).toHaveText("3 / 3");

  const replacementBase64 = readFileSync("test-fixtures/tool-027/mixed-pages.pdf").toString("base64");
  const workspace = page.getByTestId("tool027-workspace");
  await workspace.evaluate((element, base64) => {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], "mixed-pages.pdf", { type: "application/pdf" }));
    element.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, replacementBase64);
  await expect(workspace).toHaveClass(/workspaceDragging/);
  await expect(page.getByTestId("tool027-dropzone")).toHaveClass(/dragging/);

  await workspace.evaluate((element, base64) => {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], "mixed-pages.pdf", { type: "application/pdf" }));
    element.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, replacementBase64);

  await expect(page.getByTestId("tool027-selected-count")).toHaveText("2 / 2");
  await expect(page.getByTestId("tool027-dropzone")).not.toHaveClass(/dragging/);
  await expect(page.getByTestId("tool027-dropzone")).toContainText("mixed-pages.pdf");
});

test("027 has no horizontal overflow on representative mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/pdf-to-image-converter");
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/sample-3pages.pdf");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
