import { expect, type Download, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const tool010Fixture = (name: string) => path.join(process.cwd(), "test-fixtures", name);

export async function openTool010(page: Page, locale: "ko" | "en" | "ja" = "ko", fixture = "sample.jpg") {
  await page.goto(`/${locale}/image-mosaic-blur-tool`);
  await page.locator('input[type="file"]').first().setInputFiles(tool010Fixture(fixture));
  await expect(page.locator('[data-testid="tool010-editor"]')).toBeVisible();
  await expect(page.locator('[data-testid="tool010-canvas"]')).toBeVisible();
}

export async function dragCanvasPointer(page: Page, start: { x: number; y: number }, end: { x: number; y: number }, steps = 6) {
  const canvas = page.locator('[data-testid="tool010-canvas"]');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("tool010 canvas is not visible");
  const point = (ratio: { x: number; y: number }) => ({ clientX: box.x + box.width * ratio.x, clientY: box.y + box.height * ratio.y });
  const startPoint = point(start);
  const endPoint = point(end);
  const pointerId = 1;
  await canvas.dispatchEvent("pointerdown", { ...startPoint, pointerId, pointerType: "mouse", isPrimary: true, button: 0, buttons: 1, bubbles: true, cancelable: true });
  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps;
    await canvas.dispatchEvent("pointermove", {
      clientX: startPoint.clientX + (endPoint.clientX - startPoint.clientX) * progress,
      clientY: startPoint.clientY + (endPoint.clientY - startPoint.clientY) * progress,
      pointerId, pointerType: "mouse", isPrimary: true, button: -1, buttons: 1, bubbles: true, cancelable: true,
    });
  }
  await canvas.dispatchEvent("pointerup", { ...endPoint, pointerId, pointerType: "mouse", isPrimary: true, button: 0, buttons: 0, bubbles: true, cancelable: true });
  return { canvas, box };
}

export async function clickCanvasPointer(page: Page, pointRatio = { x: 0.1, y: 0.1 }) {
  return dragCanvasPointer(page, pointRatio, pointRatio, 1);
}

export async function createRectangle(page: Page, start = { x: 0.2, y: 0.2 }, end = { x: 0.55, y: 0.55 }) {
  await page.locator('[data-testid="tool010-mode-rect"]').click();
  const result = await dragCanvasPointer(page, start, end, 6);
  await expect(page.locator('[data-testid="tool010-applied-count"]')).not.toContainText(": 0");
  return result;
}

export async function createBrush(page: Page, start = { x: 0.6, y: 0.25 }, end = { x: 0.8, y: 0.5 }) {
  await page.locator('[data-testid="tool010-mode-brush"]').click();
  const result = await dragCanvasPointer(page, start, end, 12);
  await expect(page.locator('[data-testid="tool010-applied-count"]')).not.toContainText(": 0");
  return result;
}

export async function dispatchTouchPointer(page: Page, type: "pointerdown" | "pointermove" | "pointerup", pointerId: number, x: number, y: number) {
  await page.locator('[data-testid="tool010-canvas"]').dispatchEvent(type, {
    pointerId,
    pointerType: "touch",
    isPrimary: pointerId === 1,
    clientX: x,
    clientY: y,
    buttons: type === "pointerup" ? 0 : 1,
    bubbles: true,
    cancelable: true,
  });
}

export async function canvasPixel(page: Page, xRatio: number, yRatio: number) {
  return page.locator('[data-testid="tool010-canvas"]').evaluate((canvas, ratios) => {
    const c = canvas as HTMLCanvasElement;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    const x = Math.max(0, Math.min(c.width - 1, Math.round(c.width * ratios.x)));
    const y = Math.max(0, Math.min(c.height - 1, Math.round(c.height * ratios.y)));
    return Array.from(ctx.getImageData(x, y, 1, 1).data);
  }, { x: xRatio, y: yRatio });
}

export function pixelDistance(a: number[], b: number[]) {
  return a.reduce((sum, value, index) => sum + Math.abs(value - (b[index] ?? 0)), 0);
}

export async function decodeDownloadedImage(page: Page, download: Download, insideRatio = { x: .35, y: .35 }) {
  const filePath = await download.path();
  if (!filePath) throw new Error("download path unavailable");
  const bytes = await readFile(filePath);
  const base64 = bytes.toString("base64");
  const mime = download.suggestedFilename().toLowerCase().endsWith(".png") ? "image/png" : download.suggestedFilename().toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg";
  return page.evaluate(async ({ base64, mime, insideRatio }) => {
    const image = new Image();
    image.src = `data:${mime};base64,${base64}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("decode context unavailable");
    context.drawImage(image, 0, 0);
    const sample = (xRatio: number, yRatio: number) => Array.from(context.getImageData(Math.min(canvas.width - 1, Math.round(canvas.width * xRatio)), Math.min(canvas.height - 1, Math.round(canvas.height * yRatio)), 1, 1).data);
    return { width: canvas.width, height: canvas.height, inside: sample(insideRatio.x, insideRatio.y), outside: sample(.88, .88), corner: sample(.02, .02) };
  }, { base64, mime, insideRatio });
}
