import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

const TOOL_URL = '/ko/image-border-rounded-corners-tool';
const JPG = path.join(process.cwd(), 'public', 'test-fixtures', 'sample.jpg');

async function gotoTool(page: Page) {
  const response = await page.goto(TOOL_URL);
  expect(response?.ok()).toBeTruthy();
  return page.getByTestId('tool012-file');
}

async function openTool(page: Page) {
  const fileInput = await gotoTool(page);
  await fileInput.setInputFiles(JPG);
  await expect(page.getByTestId('tool012-root')).toBeVisible();
  await expect(page.getByTestId('tool012-editor')).toBeVisible();
}

function settingRange(page: Page, label: string) {
  return page.locator('.padding-range').filter({ hasText: label }).locator('input[type="range"]');
}

function linkedRadiusNumber(page: Page) {
  return page.locator('.padding-range').filter({ hasText: '모서리 반경' }).locator('input[inputmode="numeric"]');
}

test('unsupported, empty, MIME-mismatched and corrupted files are rejected without entering editor', async ({ page }) => {
  const fileInput = await gotoTool(page);

  await fileInput.setInputFiles({ name: 'vector.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.locator('.mosaic-error[role="alert"]')).toContainText('지원하지 않는 이미지 형식입니다.');
  await expect(page.getByTestId('tool012-editor')).toHaveCount(0);

  await fileInput.setInputFiles({ name: 'empty.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(0) });
  await expect(page.locator('.mosaic-error[role="alert"]')).toContainText('지원하지 않는 이미지 형식입니다.');
  await expect(page.getByTestId('tool012-editor')).toHaveCount(0);

  await fileInput.setInputFiles({ name: 'mismatch.jpg', mimeType: 'text/plain', buffer: Buffer.from('not an image') });
  await expect(page.locator('.mosaic-error[role="alert"]')).toContainText('지원하지 않는 이미지 형식입니다.');
  await expect(page.getByTestId('tool012-editor')).toHaveCount(0);

  await fileInput.setInputFiles({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('broken jpeg bytes') });
  await expect(page.locator('.mosaic-error[role="alert"]')).toContainText('이미지를 읽을 수 없습니다.');
  await expect(page.getByTestId('tool012-editor')).toHaveCount(0);
});

test('linked radius handles 0, negative, decimal, text and blank input safely', async ({ page }) => {
  await openTool(page);
  const input = linkedRadiusNumber(page);

  await input.fill('0');
  await expect(input).toHaveValue('0');
  await input.fill('-10');
  await expect(input).toHaveValue('0');
  await input.fill('12.6');
  await expect(input).toHaveValue('13');
  await input.fill('abc');
  await expect(input).toHaveValue('0');

  // Editing must allow a temporary blank state rather than immediately forcing 0.
  await input.fill('');
  await expect(input).toHaveValue('');
  await input.blur();
  await expect(input).toHaveValue('0');
});

test('radius above the drawable maximum is normalized to the image-safe maximum', async ({ page }) => {
  await openTool(page);
  const input = linkedRadiusNumber(page);
  const range = page.locator('.padding-range').filter({ hasText: '모서리 반경' }).locator('input[type="range"]');
  await expect(range).toHaveAttribute('max', '300');

  await input.fill('99999');
  await input.blur();
  await expect(input).toHaveValue('300');
});

test('outside border at 0 and maximum thickness updates result dimensions without invalid canvas size', async ({ page }) => {
  await openTool(page);
  await page.getByTestId('tool012-border-toggle').check();
  await page.getByRole('button', { name: '바깥쪽', exact: true }).click();
  const thickness = settingRange(page, '두께');

  await thickness.fill('0');
  await expect(page.getByTestId('tool012-output-size')).toHaveText('800 × 600px');
  await thickness.fill('200');
  await expect(page.getByTestId('tool012-output-size')).toHaveText('1200 × 1000px');
  await expect(page.getByTestId('tool012-download')).toBeEnabled();
});

test('shadow negative/positive offsets and maximum blur/spread produce asymmetric auto padding without clipping bounds', async ({ page }) => {
  await openTool(page);
  await page.getByTestId('tool012-shadow-toggle').check();
  await settingRange(page, '가로 위치').fill('-100');
  await settingRange(page, '세로 위치').fill('100');
  await settingRange(page, '블러').fill('150');
  await settingRange(page, '확산').fill('100');
  await expect(page.getByTestId('tool012-output-size')).toHaveText('1600 × 1400px');
  await expect(page.getByTestId('tool012-download')).toBeEnabled();
});

test('maximum extra padding expands all four sides predictably', async ({ page }) => {
  await openTool(page);
  await settingRange(page, '추가 여백').fill('500');
  await expect(page.getByTestId('tool012-output-size')).toHaveText('1800 × 1600px');
});

test('JPG with transparent background exposes background-color fallback and downloads opaque JPG', async ({ page }) => {
  await openTool(page);
  await linkedRadiusNumber(page).fill('80');
  await page.getByTestId('tool012-output-format').selectOption('jpg');
  await expect(page.getByText(/JPG는 투명 배경을 지원하지 않아 배경색이 적용됩니다/)).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('tool012-download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.jpg$/i);
  await expect(page.getByTestId('tool012-status')).toContainText('다운로드 준비 완료');
});

test('filename sanitizes forbidden filesystem characters on blur', async ({ page }) => {
  await openTool(page);
  const filename = page.locator('.adjuster-output').locator('label').filter({ hasText: '파일명' }).locator('input');
  await filename.fill('a/b:c*?d"e<f>g|h.jpg');
  await filename.blur();
  await expect(filename).toHaveValue('a-b-c--d-e-f-g-h');
});
