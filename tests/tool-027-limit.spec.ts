import { test, expect } from "@playwright/test";
import { closeSync, openSync, unlinkSync, writeSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
const MiB = 1024 * 1024;

test("027 service-limit contract is visible in live product", async ({ page }) => {
  await page.goto("/ko/pdf-to-image-converter");
  const root = page.getByTestId("tool027-root");
  await expect(root).toHaveAttribute("data-max-file-bytes", String(50 * MiB));
  await expect(root).toHaveAttribute("data-max-pages", "100");
  await expect(root).toHaveAttribute("data-max-scale", "3");
  await expect(root).toHaveAttribute("data-max-canvas-pixels", "55000000");
});

test("027 rejects 50MiB + 1 before PDF parsing", async ({ page }) => {
  const oversizedPdf = join(tmpdir(), `tool027-over-limit-${process.pid}-${Date.now()}.pdf`);
  const fd = openSync(oversizedPdf, "w");
  try {
    writeSync(fd, Buffer.from("%PDF-1.7\n"), 0, 9, 0);
    writeSync(fd, Buffer.from([0]), 0, 1, 50 * MiB);
  } finally {
    closeSync(fd);
  }

  try {
    await page.goto("/en/pdf-to-image-converter");
    await page.getByTestId("tool027-file-input").setInputFiles(oversizedPdf);
    await expect(page.getByTestId("tool027-status")).toContainText("50MB or smaller");
    await expect(page.getByTestId("tool027-workspace")).toHaveCount(0);
  } finally {
    unlinkSync(oversizedPdf);
  }
});

test("027 rejects documents over 100 pages", async ({ page }) => {
  await page.goto("/ko/pdf-to-image-converter");
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/over-100pages.pdf");
  await expect(page.getByTestId("tool027-status")).toContainText("최대 100페이지");
  await expect(page.getByTestId("tool027-workspace")).toHaveCount(0);
});
