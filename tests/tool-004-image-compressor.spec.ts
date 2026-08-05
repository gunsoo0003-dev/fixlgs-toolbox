import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { cardNumbers, resetCompressor, runCompressor, uploadCompressorFixture } from "./helpers/toolbox-validation";

test.describe("004 이미지 압축기 실제 기능", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/image-compressor");
  });

  test("JPG를 실제 처리하고 픽셀 크기와 형식을 유지한다", async ({ page }) => {
    const card = await uploadCompressorFixture(page, "sample.jpg");
    await runCompressor(page);
    const result = await cardNumbers(card);
    expect(result.status).toMatch(/done|kept/);
    expect(result.resultSize).toBeGreaterThan(0);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.format).toBe("jpg");
    expect(result.resultName).toMatch(/\.jpg$/);
  });

  test("EXIF 회전 JPG를 표시 방향에 맞는 픽셀 크기로 처리한다", async ({ page }) => {
    const card = await uploadCompressorFixture(page, "exif-rotated.jpg");
    const before = await cardNumbers(card);
    expect(before.orientation).toBe(6);
    expect(before.width).toBe(500);
    expect(before.height).toBe(300);
    await runCompressor(page);
    const after = await cardNumbers(card);
    expect(after.status).toBe("done");
    expect(after.width).toBe(500);
    expect(after.height).toBe(300);
  });

  for (const mode of ["lossless", "balanced", "strong"] as const) {
    test(`PNG ${mode} 모드가 투명 PNG를 처리한다`, async ({ page }) => {
      const card = await uploadCompressorFixture(page, "transparent.png");
      await page.getByTestId("compressor-item-png-mode").selectOption(mode);
      await runCompressor(page);
      const result = await cardNumbers(card);
      expect(result.status).toMatch(/done|kept/);
      expect(result.resultSize).toBeGreaterThan(0);
      expect(result.width).toBe(640);
      expect(result.height).toBe(480);
      expect(result.format).toBe("png");
    });
  }

  test("WebP를 실제 처리한다", async ({ page }) => {
    const card = await uploadCompressorFixture(page, "sample.webp");
    await runCompressor(page);
    const result = await cardNumbers(card);
    expect(result.status).toMatch(/done|kept/);
    expect(result.resultSize).toBeGreaterThan(0);
    expect(result.format).toBe("webp");
  });

  test("파일별 원본 유지가 실제 결과와 ZIP에 반영된다", async ({ page }) => {
    const card = await uploadCompressorFixture(page, "sample.jpg");
    await page.getByTestId("compressor-item-keep-original").check();
    await runCompressor(page);
    const result = await cardNumbers(card);
    expect(result.status).toBe("kept");
    expect(result.resultSize).toBe(result.originalSize);

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("compressor-zip").click();
    const download = await downloadPromise;
    const saved = await download.path();
    expect(saved).toBeTruthy();
    const bytes = await fs.readFile(saved!);
    expect(bytes.subarray(0, 2).toString("ascii")).toBe("PK");
  });

  test("비교 화면과 재압축 조작이 동작한다", async ({ page }) => {
    await uploadCompressorFixture(page, "sample.jpg");
    await runCompressor(page);
    await page.getByTestId("compressor-item-compare").click();
    await expect(page.getByTestId("compressor-compare-modal")).toBeVisible();
    await expect(page.getByTestId("compressor-compare-slider")).toBeVisible();
    await page.getByRole("button", { name: "닫기" }).click();
    await expect(page.getByTestId("compressor-compare-modal")).toHaveCount(0);
  });

  test("같은 이름 파일은 결과 이름이 충돌하지 않는다", async ({ page }) => {
    const input = page.getByTestId("compressor-file-input");
    const bytes = await fs.readFile(path.resolve(process.cwd(), "public", "test-fixtures", "sample.jpg"));
    await input.setInputFiles([
      { name: "photo.jpg", mimeType: "image/jpeg", buffer: bytes },
      { name: "photo.jpg", mimeType: "image/jpeg", buffer: bytes },
    ]);
    await expect(page.getByTestId("compressor-file-card")).toHaveCount(2);
    await page.getByTestId("compressor-run").click();
    const cards = page.getByTestId("compressor-file-card");
    await expect(cards.nth(0)).toHaveAttribute("data-status", /done|kept/, { timeout: 120_000 });
    await expect(cards.nth(1)).toHaveAttribute("data-status", /done|kept/, { timeout: 120_000 });
    const names = await cards.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-result-name")));
    expect(new Set(names).size).toBe(2);
    expect(names).toContain("photo.jpg");
    expect(names).toContain("photo-2.jpg");
  });

  test("전체 초기화가 파일과 결과를 모두 제거한다", async ({ page }) => {
    await uploadCompressorFixture(page, "sample.jpg");
    await runCompressor(page);
    await resetCompressor(page);
    await expect(page.getByTestId("compressor-summary")).toHaveCount(0);
  });
});
