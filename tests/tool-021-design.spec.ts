import { test, expect } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) => path.join(process.cwd(), "test-fixtures/tool-021", name);

async function startBlank(page: import("@playwright/test").Page, locale = "en") {
  await page.goto(`/${locale}/social-media-image-maker`);
  await page.locator('[data-testid="tool021-start-blank"]').click();
}

test("light/dark theme does not alter the design canvas", async ({ page }) => {
  await startBlank(page);
  await page.locator('[data-testid="tool021-title"]').fill("Theme invariant");
  const canvas = page.locator('[data-testid="tool021-interactive-preview"] canvas');
  const before = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL("image/png"));
  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const after = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL("image/png"));
  expect(after).toBe(before);
});

for (const width of [320, 360]) {
  test(`Japanese mobile ${width}px has no page overflow and presets stay one horizontal row`, async ({ page }) => {
    await page.setViewportSize({ width, height: 780 });
    await page.goto('/ja/social-media-image-maker');
    await page.locator('[data-testid="tool021-start-blank"]').click();
    const metrics = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      bodyScroll: document.documentElement.scrollWidth,
    }));
    expect(metrics.bodyScroll).toBeLessThanOrEqual(metrics.viewport + 1);
    const pillMetrics = await page.locator('[class*="pillRow"]').evaluate((el) => ({
      clientWidth: (el as HTMLElement).clientWidth,
      scrollWidth: (el as HTMLElement).scrollWidth,
      childrenTop: Array.from(el.children).map((child) => Math.round((child as HTMLElement).getBoundingClientRect().top)),
    }));
    expect(pillMetrics.scrollWidth).toBeGreaterThan(pillMetrics.clientWidth);
    expect(new Set(pillMetrics.childrenTop).size).toBe(1);
    const zipButton = page.locator('[data-testid="tool021-download-zip"]');
    const lineCheck = await zipButton.evaluate((el) => {
      const cs = getComputedStyle(el);
      const lineHeight = Number.parseFloat(cs.lineHeight);
      const height = (el as HTMLElement).getBoundingClientRect().height;
      const paddingY = Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom);
      return { lines: (height - paddingY) / lineHeight };
    });
    expect(lineCheck.lines).toBeLessThan(2.6);
  });
}

test("per-preset override persists independently and reset returns to common", async ({ page }) => {
  await startBlank(page);
  await page.locator('[data-testid="tool021-scope-preset"]').click();
  const story = page.locator('[data-testid="tool021-preset-instagram-story"]');
  const xPost = page.locator('[data-testid="tool021-preset-x-post"]');
  await story.click();
  const titleX = page.locator('[data-testid="tool021-title-x"]');
  await titleX.fill("0.31");
  await xPost.click();
  expect(await titleX.inputValue()).not.toBe("0.31");
  await story.click();
  expect(await titleX.inputValue()).toBe("0.31");
  await page.locator('[data-testid="tool021-reset-preset"]').click();
  expect(await titleX.inputValue()).toBe("0.08");
});

test("no-stretch renderer keeps a circular marker circular in Story preview", async ({ page }) => {
  await page.goto('/en/social-media-image-maker');
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(fixture('no-stretch-marker.png'));
  await page.locator('[data-testid="tool021-preset-instagram-story"]').click();
  const bounds = await page.locator('[data-testid="tool021-interactive-preview"] canvas').evaluate((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let minX = width, maxX = -1, minY = height, maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        if (pixels[i] > 180 && pixels[i + 1] < 90 && pixels[i + 2] < 90) {
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      }
    }
    return { w: maxX - minX + 1, h: maxY - minY + 1 };
  });
  expect(bounds.w).toBeGreaterThan(30);
  expect(Math.abs(bounds.w / bounds.h - 1)).toBeLessThan(0.06);
});

test("browser console and page runtime stay clean through core editing", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await startBlank(page);
  await page.locator('[data-testid="tool021-title"]').fill("Runtime check");
  await page.locator('[data-testid="tool021-preset-x-post"]').click();
  await page.locator('[data-testid="tool021-scope-preset"]').click();
  await page.locator('[data-testid="tool021-background-x"]').fill("0.3");
  expect(errors).toEqual([]);
});

test('transparent logo preserves alpha over the design background', async ({page}) => {
  await startBlank(page);
  const canvas = page.locator('[data-testid="tool021-interactive-preview"] canvas');
  const before = await canvas.evaluate((el: HTMLCanvasElement) => {
    const ctx = el.getContext('2d')!;
    const min = Math.min(el.width, el.height);
    const x = Math.round(el.width * 0.74);
    const y = Math.round(el.height * 0.07);
    const centerX = Math.round(x + min * 0.16 * 0.5);
    const centerY = Math.round(y + min * 0.16 * 0.5);
    return {
      corner: Array.from(ctx.getImageData(x + 1, y + 1, 1, 1).data),
      center: Array.from(ctx.getImageData(centerX, centerY, 1, 1).data),
    };
  });
  await page.locator('[data-testid="tool021-logo-input"]').setInputFiles(fixture('transparent.png'));
  const after = await canvas.evaluate((el: HTMLCanvasElement) => {
    const ctx = el.getContext('2d')!;
    const min = Math.min(el.width, el.height);
    const x = Math.round(el.width * 0.74);
    const y = Math.round(el.height * 0.07);
    const centerX = Math.round(x + min * 0.16 * 0.5);
    const centerY = Math.round(y + min * 0.16 * 0.5);
    return {
      corner: Array.from(ctx.getImageData(x + 1, y + 1, 1, 1).data),
      center: Array.from(ctx.getImageData(centerX, centerY, 1, 1).data),
    };
  });
  expect(after.corner).toEqual(before.corner);
  expect(after.center).not.toEqual(before.center);
});

test('long KO/EN/JA and emoji text render without canvas/runtime failure', async ({page}) => {
  const cases = [
    ['/ko/social-media-image-maker','한 번 만든 디자인을 여러 SNS 규격에 맞춰 반복 작업 없이 빠르게 출력하는 긴 한국어 테스트 문장입니다.'],
    ['/en/social-media-image-maker','Create one social campaign design and adapt it across Instagram Facebook X and LinkedIn without rebuilding every composition from scratch.'],
    ['/ja/social-media-image-maker','一つのデザインから複数のSNSサイズを作成して必要なサイズだけ位置や切り抜きを調整するための長い日本語テスト文章です'],
  ] as const;
  for (const [url,text] of cases) {
    await page.goto(url);
    await page.locator('[data-testid="tool021-start-blank"]').click();
    const canvas = page.locator('[data-testid="tool021-interactive-preview"] canvas');
    const before = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL('image/png'));
    await page.locator('[data-testid="tool021-title"]').fill(text);
    await page.locator('[data-testid="tool021-subtitle"]').fill('SALE ✨ 50% OFF 🚀 #FIXLGS & <SNS>');
    const after = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL('image/png'));
    expect(after).not.toBe(before);
  }
});

test('file picker inputs remain keyboard-focusable', async ({page}) => {
  await page.goto('/en/social-media-image-maker');
  const firstInput = page.locator('[data-testid="tool021-background-input"]');
  await firstInput.focus();
  await expect(firstInput).toBeFocused();
  await page.locator('[data-testid="tool021-start-blank"]').click();
  const logoInput = page.locator('[data-testid="tool021-logo-input"]');
  await logoInput.focus();
  await expect(logoInput).toBeFocused();
});
