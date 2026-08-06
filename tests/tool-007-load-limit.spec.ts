import { test, expect } from "@playwright/test";
import { mkdtempSync, openSync, writeSync, ftruncateSync, closeSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WEB_IMAGE_OPTIMIZER_LIMITS as LIMITS } from "../components/web-image-optimizer-tool";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAFElEQVR4nGP8z8AARAwMjDAGCjAAANwAAfLQ6vQAAAAASUVORK5CYII=",
  "base64",
);

function paddedPng(bytes: number) {
  if (bytes <= png.length) return png;
  return Buffer.concat([png, Buffer.alloc(bytes - png.length)]);
}

function uniquePng(index: number) {
  return Buffer.concat([png, Buffer.from([index & 0xff])]);
}

function createPaddedPngFile(directory: string, name: string, bytes: number, marker = 0) {
  const filePath = join(directory, name);
  const fd = openSync(filePath, "w");
  try {
    writeSync(fd, png, 0, Math.min(png.length, bytes), 0);
    ftruncateSync(fd, bytes);
    if (bytes > 0) writeSync(fd, Buffer.from([marker & 0xff]), 0, 1, bytes - 1);
  } finally {
    closeSync(fd);
  }
  return filePath;
}

test.describe("TOOLBOX 007 operational safety boundary", () => {
  let tempDirectory = "";

  test.beforeAll(() => {
    tempDirectory = mkdtempSync(join(tmpdir(), "toolbox-007-"));
  });

  test.afterAll(() => {
    if (tempDirectory) rmSync(tempDirectory, { recursive: true, force: true });
  });

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "heavy boundary suite runs once on desktop");
    await page.goto("/ko/web-image-optimizer");
  });

  test("rejects unsupported, animated-signature and zero-byte files without breaking the page", async ({ page }) => {
    await page.getByTestId("optimizer-file-input").setInputFiles({ name: "bad.gif", mimeType: "image/gif", buffer: Buffer.from("GIF89a") });
    await expect(page.getByText(/지원하지 않는 형식|애니메이션/)).toBeVisible();
    await page.getByTestId("optimizer-file-input").setInputFiles({ name: "empty.png", mimeType: "image/png", buffer: Buffer.alloc(0) });
    await expect(page.getByRole("heading", { level: 1, name: "웹 이미지 최적화기" })).toBeVisible();
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(0);
  });

  test("accepts exact file-count limit and blocks the next file", async ({ page }) => {
    await page.getByTestId("optimizer-file-input").setInputFiles(
      Array.from({ length: LIMITS.count }, (_, index) => ({ name: `image-${index}.png`, mimeType: "image/png", buffer: uniquePng(index) })),
    );
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(LIMITS.count);
    await page.getByTestId("optimizer-file-input").setInputFiles({ name: "overflow.png", mimeType: "image/png", buffer: png });
    await expect(page.getByText(/안전 범위/)).toBeVisible();
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(LIMITS.count);
  });

  test("accepts exact per-file bytes and rejects one byte above", async ({ page }) => {
    await page.getByTestId("optimizer-file-input").setInputFiles({
      name: "at-limit.png", mimeType: "image/png", buffer: paddedPng(LIMITS.perFile),
    });
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(1);
    await page.getByTestId("optimizer-reset").click();
    await page.getByTestId("optimizer-file-input").setInputFiles({
      name: "over-limit.png", mimeType: "image/png", buffer: paddedPng(LIMITS.perFile + 1),
    });
    await expect(page.getByText(/안전 범위/)).toBeVisible();
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(0);
  });

  test("blocks a batch whose aggregate bytes exceed the total limit before decoding", async ({ page }) => {
    const each = Math.floor(LIMITS.total / 4);
    const initialFiles = Array.from({ length: 4 }, (_, index) =>
      createPaddedPngFile(tempDirectory, `large-${index}.png`, each, index + 1),
    );
    await page.getByTestId("optimizer-file-input").setInputFiles(initialFiles);
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(4);

    const overflowBytes = LIMITS.total - each * 4 + 1;
    const overflowFile = createPaddedPngFile(tempDirectory, "total-overflow.png", overflowBytes);
    await page.getByTestId("optimizer-file-input").setInputFiles(overflowFile);
    await expect(page.getByText(/안전 범위/)).toBeVisible();
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(4);
  });

  test("deduplicates identical files and keeps the first copy", async ({ page }) => {
    const file = { name: "same.png", mimeType: "image/png", buffer: png };
    await page.getByTestId("optimizer-file-input").setInputFiles([file, file]);
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(1);
  });

  test("representative maximum-count optimization completes and ZIP remains available", async ({ page }) => {
    await page.getByTestId("optimizer-file-input").setInputFiles(
      Array.from({ length: LIMITS.count }, (_, index) => ({ name: `run-${index}.png`, mimeType: "image/png", buffer: uniquePng(index) })),
    );
    const started = Date.now();
    await page.getByTestId("optimizer-run").click();
    await expect(page.getByTestId("optimizer-summary")).toBeVisible({ timeout: 60_000 });
    expect(Date.now() - started).toBeLessThan(60_000);
    await expect(page.getByTestId("optimizer-zip")).toBeEnabled();
    await expect(page.locator('[data-testid="optimizer-file-card"][data-status="failed"]')).toHaveCount(0);
  });
});
