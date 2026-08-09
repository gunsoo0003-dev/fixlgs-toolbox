import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PRESETS = [
  ["instagram-post", "1080×1350"],
  ["instagram-story", "1080×1920"],
  ["facebook-feed", "1080×1350"],
  ["x-post", "1200×675"],
  ["linkedin-post", "1200×1200"],
] as const;

for (const locale of ["ko", "en", "ja"] as const) {
  test(`${locale}: 021 basic flow and preset grid`, async ({ page }) => {
    await page.goto(`/${locale}/social-media-image-maker`);
    await expect(page.locator('[data-testid="tool021-root"]')).toBeVisible();
    await page.locator('[data-testid="tool021-start-blank"]').click();
    await page.locator('[data-testid="tool021-title"]').fill(locale === "ja" ? "テストタイトル" : "FIXLGS Social Test");
    await page.locator('[data-testid="tool021-subtitle"]').fill(locale === "ja" ? "説明テキストです" : "One design, many outputs");
    for (const [id, size] of PRESETS) {
      await expect(page.locator(`[data-testid="tool021-preset-${id}"]`)).toContainText(size);
      await expect(page.locator(`[data-testid="tool021-preview-${id}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-testid="tool021-interactive-preview"]')).toBeVisible();
  });
}

test("background upload and per-preset override remain independent", async ({ page }) => {
  await page.goto('/ko/social-media-image-maker');
  const fixture = path.join(process.cwd(), 'test-fixtures/tool-021/landscape.jpg');
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(fixture);
  await page.locator('[data-testid="tool021-preset-instagram-story"]').click();
  const preview = page.locator('[data-testid="tool021-interactive-preview"]');
  await preview.focus();
  await page.keyboard.press('ArrowRight');
  await page.locator('[data-testid="tool021-preset-x-post"]').click();
  await page.locator('[data-testid="tool021-preset-instagram-story"]').click();
  await expect(page.locator('[data-testid="tool021-override-instagram-story"]')).toBeVisible();
});

test("zero output selection is reachable and ZIP action reports an error", async ({ page }) => {
  await page.goto('/en/social-media-image-maker');
  await page.locator('[data-testid="tool021-start-blank"]').click();
  for (const [id] of PRESETS) await page.locator(`[data-testid="tool021-select-${id}"]`).uncheck();
  await page.locator('[data-testid="tool021-download-zip"]').click();
  await expect(page.locator('[data-testid="tool021-error"]')).toBeVisible();
});

test("EXIF orientation is applied before layout", async ({ page }) => {
  await page.goto('/en/social-media-image-maker');
  const fixture = path.join(process.cwd(), 'test-fixtures/tool-021/exif-rotated.jpg');
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(fixture);
  await expect(page.locator('[data-testid="tool021-bg-dimensions"]')).toHaveText('500×300px');
});

function imageDimensions(bytes: Buffer) {
  if (bytes.length >= 24 && bytes.subarray(1, 4).toString('ascii') === 'PNG') {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      const size = bytes.readUInt16BE(offset);
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
        return { height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
      }
      offset += size;
    }
  }
  throw new Error('unsupported image bytes');
}

function storedZipEntries(bytes: Buffer) {
  const entries: Array<{ name: string; data: Buffer }> = [];
  let offset = 0;
  while (offset + 30 <= bytes.length && bytes.readUInt32LE(offset) === 0x04034b50) {
    const method = bytes.readUInt16LE(offset + 8);
    const compressedSize = bytes.readUInt32LE(offset + 18);
    const nameLength = bytes.readUInt16LE(offset + 26);
    const extraLength = bytes.readUInt16LE(offset + 28);
    expect(method).toBe(0);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = bytes.subarray(nameStart, nameStart + nameLength).toString('utf8');
    entries.push({ name, data: bytes.subarray(dataStart, dataStart + compressedSize) });
    offset = dataStart + compressedSize;
  }
  return entries;
}

test('PNG individual exports match every preset dimension and filename suffix', async ({ page }) => {
  await page.goto('/en/social-media-image-maker');
  await page.locator('[data-testid="tool021-start-blank"]').click();
  await page.locator('[data-testid="tool021-title"]').fill('FIXLGS export verification');
  await page.locator('[data-testid="tool021-format"]').selectOption('png');

  const expected = [
    ['instagram-post', 1080, 1350, 'instagram-post'],
    ['instagram-story', 1080, 1920, 'instagram-story'],
    ['facebook-feed', 1080, 1350, 'facebook'],
    ['x-post', 1200, 675, 'x'],
    ['linkedin-post', 1200, 1200, 'linkedin'],
  ] as const;

  for (const [id, width, height, suffix] of expected) {
    await page.locator(`[data-testid="tool021-preset-${id}"]`).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-testid="tool021-download-current"]').click(),
    ]);
    expect(download.suggestedFilename()).toBe(`social-design-${suffix}.png`);
    const filePath = await download.path();
    expect(filePath).not.toBeNull();
    const dimensions = imageDimensions(fs.readFileSync(filePath!));
    expect(dimensions).toEqual({ width, height });
  }
});

test('selected ZIP contains exactly five ordered PNG outputs with correct dimensions', async ({ page }) => {
  await page.goto('/en/social-media-image-maker');
  await page.locator('[data-testid="tool021-start-blank"]').click();
  await page.locator('[data-testid="tool021-format"]').selectOption('png');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-testid="tool021-download-zip"]').click(),
  ]);
  expect(download.suggestedFilename()).toBe('social-design-sns-set.zip');
  const filePath = await download.path();
  expect(filePath).not.toBeNull();
  const entries = storedZipEntries(fs.readFileSync(filePath!));
  expect(entries.map((entry) => entry.name)).toEqual([
    'social-design-instagram-post.png',
    'social-design-instagram-story.png',
    'social-design-facebook.png',
    'social-design-x.png',
    'social-design-linkedin.png',
  ]);
  const dimensions = entries.map((entry) => imageDimensions(entry.data));
  expect(dimensions).toEqual([
    { width: 1080, height: 1350 },
    { width: 1080, height: 1920 },
    { width: 1080, height: 1350 },
    { width: 1200, height: 675 },
    { width: 1200, height: 1200 },
  ]);
});

test('one selected preset exports only that preset and repeated export remains stable', async ({ page }) => {
  await page.goto('/en/social-media-image-maker');
  await page.locator('[data-testid="tool021-start-blank"]').click();
  for (const [id] of PRESETS) {
    if (id !== 'x-post') await page.locator(`[data-testid="tool021-select-${id}"]`).uncheck();
  }
  await page.locator('[data-testid="tool021-format"]').selectOption('png');
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-testid="tool021-download-zip"]').click(),
    ]);
    const filePath = await download.path();
    expect(filePath).not.toBeNull();
    const entries = storedZipEntries(fs.readFileSync(filePath!));
    expect(entries.map((entry) => entry.name)).toEqual(['social-design-x.png']);
    expect(imageDimensions(entries[0].data)).toEqual({ width: 1200, height: 675 });
  }
});

test('reset this size removes only its override and reset all restores common defaults', async ({ page }) => {
  await page.goto('/en/social-media-image-maker');
  await page.locator('[data-testid="tool021-start-blank"]').click();
  await page.locator('[data-testid="tool021-title"]').fill('Changed title');
  await page.locator('[data-testid="tool021-scope-preset"]').click();
  await page.locator('[data-testid="tool021-preset-instagram-story"]').click();
  const preview = page.locator('[data-testid="tool021-interactive-preview"]');
  await preview.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-testid="tool021-override-instagram-story"]')).toBeVisible();
  await page.locator('[data-testid="tool021-reset-preset"]').click();
  await expect(page.locator('[data-testid="tool021-override-instagram-story"]')).toContainText(/공통|common|共通/i);
  await expect(page.locator('[data-testid="tool021-title"]')).toHaveValue('Changed title');
  await page.locator('[data-testid="tool021-reset-all"]').click();
  // Reset All intentionally returns the tool to its start screen.
  await expect(page.locator('[data-testid="tool021-start-blank"]')).toBeVisible();
  await expect(page.locator('[data-testid="tool021-title"]')).toHaveCount(0);

  // Re-enter the editor and verify that the actual defaults were restored.
  await page.locator('[data-testid="tool021-start-blank"]').click();
  await expect(page.locator('[data-testid="tool021-title"]')).toHaveValue('');
  await expect(page.locator('[data-testid="tool021-select-instagram-post"]')).toBeChecked();
  await expect(page.locator('[data-testid="tool021-select-linkedin-post"]')).toBeChecked();
});

for (const [locale, fileName] of [['ko','한글 파일명.jpg'],['ja','日本語ファイル名.jpg']] as const) {
  test(`${locale}: non-ASCII background filename remains usable in download`, async ({page}) => {
    await page.goto(`/${locale}/social-media-image-maker`);
    await page.locator('[data-testid="tool021-background-input"]').setInputFiles(path.join(process.cwd(),'test-fixtures/tool-021',fileName));
    await page.locator('[data-testid="tool021-format"]').selectOption('png');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-testid="tool021-download-current"]').click(),
    ]);
    const expectedStem = fileName.replace(/\.jpg$/,'').replace(/\s+/g,'-');
    expect(download.suggestedFilename()).toContain(expectedStem);
    expect(download.suggestedFilename()).toMatch(/-instagram-post\.png$/);
  });
}

test('continue editing keeps the current design after an export', async ({page}) => {
  await page.goto('/en/social-media-image-maker');
  await page.locator('[data-testid="tool021-start-blank"]').click();
  await page.locator('[data-testid="tool021-title"]').fill('Keep this design');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-testid="tool021-download-current"]').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/instagram-post/);
  await page.locator('[data-testid="tool021-continue-editing"]').click();
  await expect(page.locator('[data-testid="tool021-title"]')).toHaveValue('Keep this design');
  await expect(page.locator('[data-testid="tool021-interactive-preview"]')).toBeVisible();
});
