import { expect, test } from "@playwright/test";
import { createRectangle, decodeDownloadedImage, tool010Fixture } from "./helpers/tool-010";

const route = "/ko/image-mosaic-blur-tool";

test.describe("010 input, decoding and replacement", () => {
  test("accepts JPG, PNG and WebP with actual decoding", async ({ page }) => {
    for (const fixture of ["sample.jpg", "transparent.png", "target-large.jpg"]) {
      await page.goto(route);
      await page.locator('input[type="file"]').first().setInputFiles(tool010Fixture(fixture));
      await expect(page.locator('[data-testid="tool010-editor"]')).toBeVisible();
      await expect(page.locator('[data-testid="tool010-error"]')).toHaveCount(0);
    }
  });

  test("rejects empty, corrupt, unsupported and mismatched files without losing upload UI", async ({ page }) => {
    await page.goto(route);
    const input = page.locator('input[type="file"]').first();
    const cases = [
      { file: { name: "empty.png", mimeType: "image/png", buffer: Buffer.alloc(0) }, message: /빈 파일/ },
      { file: { name: "fake.png", mimeType: "image/jpeg", buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) }, message: /일치하지 않습니다/ },
      { file: { name: "broken.jpg", mimeType: "image/jpeg", buffer: Buffer.from("not-an-image") }, message: /지원하지 않는|읽을 수 없습니다/ },
      { file: { name: "vector.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") }, message: /지원하지 않는/ },
    ];
    for (const item of cases) {
      await input.setInputFiles(item.file);
      await expect(page.locator('[data-testid="tool010-error"]')).toContainText(item.message);
      await expect(page.locator('[data-testid="tool010-select"]')).toBeVisible();
    }
  });

  test("supports drag and drop image input", async ({ page }) => {
    await page.goto(route);
    await page.evaluate(async () => {
      const response = await fetch("/test-fixtures/sample.jpg");
      const blob = await response.blob();
      const file = new File([blob], "dropped.jpg", { type: "image/jpeg" });
      const data = new DataTransfer();
      data.items.add(file);
      const target = document.querySelector(".toolbox-workbench-upload");
      target?.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: data }));
    });
    await expect(page.locator('[data-testid="tool010-editor"]')).toBeVisible();
  });

  test("supports clipboard paste image and ignores text-only paste", async ({ page }) => {
    await page.goto(route);
    const root = page.locator('[data-testid="tool010-root"]');
    await expect(root).toHaveAttribute("data-clipboard-paste-ready", "true");
    await page.evaluate(async () => {
      const response = await fetch("/test-fixtures/sample.jpg");
      const blob = await response.blob();
      const file = new File([blob], "pasted.jpg", { type: "image/jpeg" });
      const data = new DataTransfer();
      data.items.add(file);
      window.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }));
    });
    await expect(page.locator('[data-testid="tool010-editor"]')).toBeVisible();

    await page.locator('[data-testid="tool010-full-reset"]').click();
    await expect(root).toHaveAttribute("data-clipboard-paste-ready", "true");
    await page.evaluate(() => {
      const data = new DataTransfer();
      data.setData("text/plain", "text only");
      window.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }));
    });
    await expect(page.locator('[data-testid="tool010-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool010-error"]')).toHaveCount(0);
  });

  test("applies EXIF orientation consistently to preview, coordinates and final output", async ({ page }) => {
    await page.goto(route);
    await page.locator('input[type="file"]').first().setInputFiles(tool010Fixture("exif-rotated.jpg"));
    await expect(page.locator('[data-testid="tool010-editor"]')).toBeVisible();
    const dimensions = await page.locator('[data-testid="tool010-canvas"]').evaluate(canvas => ({ width: (canvas as HTMLCanvasElement).width, height: (canvas as HTMLCanvasElement).height }));
    expect(dimensions).toEqual({ width: 300, height: 500 });
    await createRectangle(page, { x: .1, y: .1 }, { x: .35, y: .3 });
    await page.getByRole("button", { name: "단색 가림" }).click();
    await page.locator('[data-testid="tool010-output-format"]').selectOption("png");
    const promise = page.waitForEvent("download");
    await page.locator('[data-testid="tool010-download"]').click();
    const decoded = await decodeDownloadedImage(page, await promise, { x: .2, y: .2 });
    expect({ width: decoded.width, height: decoded.height }).toEqual(dimensions);
    expect(decoded.inside[0] + decoded.inside[1] + decoded.inside[2]).toBeLessThan(50);
  });

  test("replacing an image clears regions and history", async ({ page }) => {
    await page.goto(route);
    const input = page.locator('input[type="file"]').first();
    await input.setInputFiles(tool010Fixture("sample.jpg"));
    const canvas = page.locator('[data-testid="tool010-canvas"]');
    const box = await canvas.boundingBox();
    if (!box) throw new Error("canvas missing");
    await page.locator('[data-testid="tool010-mode-rect"]').click();
    await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down();
    await page.mouse.move(box.x + 160, box.y + 120); await page.mouse.up();
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await input.setInputFiles(tool010Fixture("transparent.png"));
    await expect(page.locator('[data-testid="tool010-applied-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool010-undo"]')).toBeDisabled();
  });
});
