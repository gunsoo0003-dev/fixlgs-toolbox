import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const fixture = (name: string) => path.join(process.cwd(), "test-fixtures", name);

async function loadReference(page: Page) {
  await page.goto("/ko/image-brightness-color-adjuster");
  await page.locator('input[type="file"]').first().setInputFiles(fixture("tool009-reference.png"));
  await expect(page.locator('[data-testid="tool009-editor"]')).toBeVisible();
}

async function setRange(page: Page, key: string, value: number) {
  const locator = page.locator(`[data-testid="tool009-${key}"]`);
  await locator.fill(String(value));
  await expect(locator).toHaveValue(String(value));
  // The actual range control commits history on pointer-up / key-up.
  // Dispatch pointerup after fill so the validator follows the product event contract.
  await locator.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0, buttons: 0, bubbles: true });
  await expect(page.locator('[data-testid="tool009-undo"]')).toBeEnabled();
  await page.waitForTimeout(50);
}

async function canvasStats(page: Page) {
  return page.locator('[data-testid="tool009-preview-canvas"]').evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2d context unavailable");
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, a = 0, count = 0;
    const luminances: number[] = [];
    let edgeEnergy = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; a += data[i + 3]; count++;
      luminances.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    }
    const luminance = luminances.reduce((sum, value) => sum + value, 0) / luminances.length;
    const std = Math.sqrt(luminances.reduce((sum, value) => sum + (value - luminance) ** 2, 0) / luminances.length);
    for (let y = 0; y < canvas.height; y++) for (let x = 1; x < canvas.width; x++) {
      const current = luminances[y * canvas.width + x];
      const previous = luminances[y * canvas.width + x - 1];
      edgeEnergy += Math.abs(current - previous);
    }
    return { r: r / count, g: g / count, b: b / count, a: a / count, luminance, std, edgeEnergy, width: canvas.width, height: canvas.height };
  });
}

async function decodeDownloadedImage(page: Page, filePath: string) {
  const base64 = (await readFile(filePath)).toString("base64");
  return page.evaluate(async (payload) => {
    const bytes = Uint8Array.from(atob(payload), char => char.charCodeAt(0));
    const blob = new Blob([bytes]);
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("2d context unavailable");
    context.drawImage(bitmap, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, a = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; a += data[i + 3]; count++;
    }
    bitmap.close();
    return { r: r / count, g: g / count, b: b / count, a: a / count, width: canvas.width, height: canvas.height, type: blob.type };
  }, base64);
}

test.describe("009 deterministic pixel processing", () => {
  test("brightness changes average luminance and undo restores the original", async ({ page }) => {
    await loadReference(page);
    const original = await canvasStats(page);
    await setRange(page, "brightness", 30);
    await expect.poll(async () => (await canvasStats(page)).r).toBeGreaterThan(original.r + 20);
    await page.locator('[data-testid="tool009-undo"]').click();
    const restored = await canvasStats(page);
    expect(Math.abs(restored.r - original.r)).toBeLessThan(1);
    expect(Math.abs(restored.g - original.g)).toBeLessThan(1);
    expect(Math.abs(restored.b - original.b)).toBeLessThan(1);
  });

  test("contrast expands channel distance while saturation -100 becomes grayscale", async ({ page }) => {
    await loadReference(page);
    const original = await canvasStats(page);
    await setRange(page, "contrast", 40);
    const contrasted = await canvasStats(page);
    expect(contrasted.std).toBeGreaterThan(original.std);
    await setRange(page, "saturation", -100);
    const gray = await canvasStats(page);
    expect(Math.abs(gray.r - gray.g)).toBeLessThan(1);
    expect(Math.abs(gray.g - gray.b)).toBeLessThan(1);
  });

  test("temperature moves red and blue channels in opposite directions", async ({ page }) => {
    await loadReference(page);
    const original = await canvasStats(page);
    await setRange(page, "temperature", 60);
    const warm = await canvasStats(page);
    expect(warm.r).toBeGreaterThan(original.r + 10);
    expect(warm.b).toBeLessThan(original.b - 10);
    await setRange(page, "temperature", -60);
    const cool = await canvasStats(page);
    expect(cool.r).toBeLessThan(warm.r - 20);
    expect(cool.b).toBeGreaterThan(warm.b + 20);
  });


  test("sharpness increases edge energy without changing canvas dimensions", async ({ page }) => {
    await loadReference(page);
    const original = await canvasStats(page);
    await setRange(page, "sharpness", 100);
    const sharpened = await canvasStats(page);
    expect(sharpened.edgeEnergy).toBeGreaterThanOrEqual(original.edgeEnergy);
    expect(sharpened.width).toBe(original.width);
    expect(sharpened.height).toBe(original.height);
  });

  test("grayscale and sepia produce distinct verified channel relationships", async ({ page }) => {
    await loadReference(page);
    await page.getByRole("button", { name: "흑백" }).click();
    const gray = await canvasStats(page);
    expect(Math.abs(gray.r - gray.g)).toBeLessThan(1);
    expect(Math.abs(gray.g - gray.b)).toBeLessThan(1);
    await page.getByRole("button", { name: "세피아" }).click();
    const sepia = await canvasStats(page);
    expect(sepia.r).toBeGreaterThan(sepia.g);
    expect(sepia.g).toBeGreaterThan(sepia.b);
  });

  test("auto adjust is image-derived, non-cumulative, and undoable", async ({ page }) => {
    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("tool009-dark.png"));
    await page.locator('[data-testid="tool009-auto"]').click();
    const darkValues = await Promise.all(["brightness", "contrast", "saturation", "temperature", "sharpness"].map(key => page.locator(`[data-testid="tool009-${key}"]`).inputValue()));
    expect(Number(darkValues[0])).toBeGreaterThan(0);
    await page.locator('[data-testid="tool009-auto"]').click();
    const repeated = await Promise.all(["brightness", "contrast", "saturation", "temperature", "sharpness"].map(key => page.locator(`[data-testid="tool009-${key}"]`).inputValue()));
    expect(repeated).toEqual(darkValues);
    await page.locator('[data-testid="tool009-undo"]').click();
    const afterUndo = await Promise.all(["brightness", "contrast", "saturation", "temperature", "sharpness"].map(key => page.locator(`[data-testid="tool009-${key}"]`).inputValue()));
    expect(afterUndo.every(value => Number(value) === 0)).toBeTruthy();

    await page.locator('input[type="file"]').first().setInputFiles(fixture("tool009-bright.png"));
    await page.locator('[data-testid="tool009-auto"]').click();
    const brightValues = await Promise.all(["brightness", "contrast", "saturation", "temperature", "sharpness"].map(key => page.locator(`[data-testid="tool009-${key}"]`).inputValue()));
    expect(brightValues).not.toEqual(darkValues);
    expect(Number(brightValues[0])).toBeLessThan(0);
  });

  test("redo is discarded after a new edit and reset-all is itself undoable", async ({ page }) => {
    await loadReference(page);
    await setRange(page, "brightness", 20);
    await setRange(page, "contrast", 15);
    await page.locator('[data-testid="tool009-undo"]').click();
    await expect(page.locator('[data-testid="tool009-redo"]')).toBeEnabled();
    await setRange(page, "saturation", 10);
    await expect(page.locator('[data-testid="tool009-redo"]')).toBeDisabled();
    await page.locator('[data-testid="tool009-reset-adjustments"]').click();
    await expect(page.locator('[data-testid="tool009-brightness"]')).toHaveValue("0");
    await page.locator('[data-testid="tool009-undo"]').click();
    await expect(page.locator('[data-testid="tool009-saturation"]')).toHaveValue("10");
  });
});

test.describe("009 output integrity", () => {
  for (const format of ["jpg", "png", "webp"] as const) {
    test(`${format.toUpperCase()} output keeps pixel dimensions and creates a decodable file`, async ({ page }) => {
      await loadReference(page);
      await page.locator('[data-testid="tool009-output-format"]').selectOption(format);
      await setRange(page, "brightness", 10);
      const preview = await canvasStats(page);
      const downloadPromise = page.waitForEvent("download");
      await page.locator('[data-testid="tool009-download"]').click();
      const download = await downloadPromise;
      const outputPath = await download.path();
      expect(outputPath).toBeTruthy();
      const decoded = await decodeDownloadedImage(page, outputPath!);
      expect(decoded.width).toBe(4);
      expect(decoded.height).toBe(4);
      expect(decoded.r).toBeGreaterThan(100);
      const tolerance = format === "png" ? 1 : 10;
      expect(Math.abs(decoded.r - preview.r)).toBeLessThan(tolerance);
      expect(Math.abs(decoded.g - preview.g)).toBeLessThan(tolerance);
      expect(Math.abs(decoded.b - preview.b)).toBeLessThan(tolerance);
      await expect(page.locator('[data-testid="tool009-result"]')).toContainText(format.toUpperCase());
    });
  }

  test("transparent PNG and WebP preserve alpha while JPG becomes opaque", async ({ page }) => {
    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("tool009-alpha.png"));
    for (const format of ["png", "webp", "jpg"] as const) {
      await page.locator('[data-testid="tool009-output-format"]').selectOption(format);
      const downloadPromise = page.waitForEvent("download");
      await page.locator('[data-testid="tool009-download"]').click();
      const outputPath = await (await downloadPromise).path();
      const decoded = await decodeDownloadedImage(page, outputPath!);
      if (format === "jpg") expect(decoded.a).toBe(255);
      else expect(decoded.a).toBeLessThan(250);
    }
  });

  test("EXIF orientation is applied once and final dimensions match the preview information", async ({ page }) => {
    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("exif-rotated.jpg"));
    await expect(page.locator('[data-testid="tool009-result"]')).toContainText("500 × 300px");
    await page.locator('[data-testid="tool009-output-format"]').selectOption("jpg");
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-testid="tool009-download"]').click();
    const outputPath = await (await downloadPromise).path();
    const decoded = await decodeDownloadedImage(page, outputPath!);
    expect(decoded.width).toBe(500);
    expect(decoded.height).toBe(300);
  });

  test("full reset removes the image, history, result, and returns to the first screen", async ({ page }) => {
    await loadReference(page);
    await setRange(page, "brightness", 25);
    await page.locator('[data-testid="tool009-full-reset"]').click();
    await expect(page.locator('[data-testid="tool009-editor"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tool009-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool009-error"]')).toHaveCount(0);
  });
});
