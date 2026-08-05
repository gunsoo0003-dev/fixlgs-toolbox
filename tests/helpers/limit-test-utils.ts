import { expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

export type RasterMime = "image/jpeg" | "image/png" | "image/webp";

export async function makeRasterBuffer(page: Page, width: number, height: number, mime: RasterMime = "image/jpeg", quality = 0.82): Promise<Buffer> {
  const bytes = await page.evaluate(async ({ width, height, mime, quality }) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    // 한계 검수는 픽셀 처리 한계를 측정하는 목적이다.
    // PNG는 그라디언트가 고해상도에서 파일 크기와 디코딩 부담을 불필요하게 키우므로
    // 단색 면과 소수의 고정 도형만 사용한다. JPG/WebP는 기존 그라디언트를 유지한다.
    if (mime === "image/png") {
      ctx.fillStyle = "#0f62fe";
      ctx.fillRect(0, 0, width, height);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0f62fe");
      gradient.addColorStop(0.45, "#f4f4f4");
      gradient.addColorStop(1, "#111111");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // 고해상도 샘플 자체가 파일당 용량 제한을 먼저 넘지 않도록
    // 압축이 잘 되는 고정 도형만 소수 배치한다.
    const inset = Math.max(8, Math.floor(Math.min(width, height) * 0.04));
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.fillRect(inset, inset, Math.max(1, width - inset * 2), Math.max(1, height - inset * 2));
    ctx.fillStyle = "rgba(15,98,254,.28)";
    ctx.fillRect(Math.floor(width * 0.18), Math.floor(height * 0.2), Math.max(1, Math.floor(width * 0.24)), Math.max(1, Math.floor(height * 0.22)));
    ctx.fillStyle = "rgba(17,17,17,.24)";
    ctx.fillRect(Math.floor(width * 0.58), Math.floor(height * 0.56), Math.max(1, Math.floor(width * 0.22)), Math.max(1, Math.floor(height * 0.2)));
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error(`Failed to encode ${mime}`)), mime, quality);
    });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, { width, height, mime, quality });
  return Buffer.from(bytes);
}

export function makeSvgBuffer(width: number, height: number, complexity = 64): Buffer {
  const shapes: string[] = [];
  for (let index = 0; index < complexity; index += 1) {
    const x = (index * 7919) % Math.max(1, width);
    const y = (index * 1543) % Math.max(1, height);
    const size = Math.max(4, Math.floor(Math.min(width, height) / (16 + (index % 11))));
    shapes.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="hsl(${index * 37 % 360} 70% 50% / .35)"/>`);
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g"><stop stop-color="#0f62fe"/><stop offset="1" stop-color="#111"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${shapes.join("")}</svg>`);
}

export async function waitForStatus(page: Page, testId: string, terminal: RegExp, timeout: number): Promise<string | null> {
  const card = page.getByTestId(testId).first();
  await expect.poll(() => card.getAttribute("data-status"), { timeout, intervals: [250, 500, 1000, 2000] }).toMatch(terminal);
  return card.getAttribute("data-status");
}

export async function saveMetric(tool: string, testInfo: TestInfo, label: string, data: Record<string, unknown>) {
  const payload = Buffer.from(JSON.stringify({ tool, project: testInfo.project.name, label, ...data }, null, 2));
  await testInfo.attach(`${tool}-${label}.json`, { body: payload, contentType: "application/json" });
  const dir = path.resolve(process.cwd(), "test-results", `${tool}-limit-metrics`);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${testInfo.project.name}-${label}.json`), payload);
}

export function projectMatches(testInfo: TestInfo, target: "desktop" | "mobile") {
  const mobile = testInfo.project.name.includes("mobile");
  return target === "mobile" ? mobile : !mobile;
}

export async function makeOversizedJpeg(bytes: number): Promise<Buffer> {
  const buffer = Buffer.alloc(bytes, 0);
  buffer[0] = 0xff; buffer[1] = 0xd8; buffer[2] = 0xff; buffer[3] = 0xe0;
  return buffer;
}
