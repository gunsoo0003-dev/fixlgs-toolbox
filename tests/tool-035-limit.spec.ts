import { test, expect } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { TOOL035_SERVICE_LIMITS, TOOL035_LIMIT_STATUS } from "@/lib/tool-035-pdf-extractor";

test("035 approved service limits are synchronized", async () => {
  expect(TOOL035_LIMIT_STATUS).toBe("APPROVED_2026_08_15");
  expect(TOOL035_SERVICE_LIMITS).toEqual({
    inputFiles: 1,
    fileBytes: 50 * 1024 * 1024,
    pages: 200,
    extractedImagesWarning: 500,
    extractedImagesHardStop: 1000,
    pageConcurrency: 1,
  });
});

test("035 rejects a file over 50MB before parsing", async ({ page }) => {
  await page.goto("/en/pdf-text-image-extractor");
  const oversizedPath = path.join(os.tmpdir(), `tool035-over-50mb-${test.info().project.name}.pdf`);
  const fd = fs.openSync(oversizedPath, "w");
  try {
    fs.writeSync(fd, Buffer.from("%PDF-"), 0, 5, 0);
    fs.ftruncateSync(fd, 50 * 1024 * 1024 + 1);
  } finally {
    fs.closeSync(fd);
  }
  try {
    await page.getByTestId("tool035-file-input").setInputFiles(oversizedPath);
    await expect(page.getByTestId("tool035-error")).toContainText("50MB", { timeout: 10_000 });
  } finally {
    try { fs.unlinkSync(oversizedPath); } catch {}
  }
});

test("035 rejects a valid 201-page PDF", async ({ page }) => {
  await page.goto("/ko/pdf-text-image-extractor");
  await page.getByTestId("tool035-file-input").setInputFiles("test-fixtures/tool-035/over-200-pages.pdf");
  await expect(page.getByTestId("tool035-error")).toContainText("200페이지");
});
