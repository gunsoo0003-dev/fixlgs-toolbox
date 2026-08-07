import { test, expect } from '@playwright/test';
import { openTool015, TOOL015_TESTIDS } from './helpers/tool-015';

const VALID_BEFORE = 'test-fixtures/sample.jpg';
const VALID_AFTER = 'test-fixtures/target-large.png';
const VALID_THIRD = 'test-fixtures/transparent.png';

async function uploadBoundaryTwo(page: Parameters<typeof openTool015>[0]) {
  await openTool015(page, 'ko');
  const state = page.getByTestId(TOOL015_TESTIDS.state);
  await page.getByTestId(TOOL015_TESTIDS.beforeInput).setInputFiles(VALID_BEFORE);
  await expect.poll(async () => state.getAttribute('data-before-ready'), { timeout: 10000 }).toBe('1');
  await page.getByTestId(TOOL015_TESTIDS.afterInput).setInputFiles(VALID_AFTER);
  await expect.poll(async () => state.getAttribute('data-after-ready'), { timeout: 10000 }).toBe('1');
}

test.describe('015 boundary-only', () => {
  test('one valid image stays ready but download remains disabled until both slots are ready', async ({ page }) => {
    await openTool015(page, 'ko');
    await page.getByTestId(TOOL015_TESTIDS.beforeInput).setInputFiles(VALID_BEFORE);
    const state = page.getByTestId(TOOL015_TESTIDS.state);
    await expect(state).toHaveAttribute('data-before-ready', '1');
    await expect(state).toHaveAttribute('data-after-ready', '0');
    await expect(page.getByTestId(TOOL015_TESTIDS.download)).toBeDisabled();
  });

  test('more than two files are rejected without replacing the current slots', async ({ page }) => {
    await openTool015(page, 'ko');
    await page.getByTestId(TOOL015_TESTIDS.bothInput).setInputFiles([
      VALID_BEFORE,
      VALID_AFTER,
      VALID_THIRD,
    ]);
    const state = page.getByTestId(TOOL015_TESTIDS.state);
    await expect(state).toHaveAttribute('data-before-ready', '0');
    await expect(state).toHaveAttribute('data-after-ready', '0');
    await expect(page.getByTestId(TOOL015_TESTIDS.error)).toContainText('두 장');
    await expect(page.getByTestId(TOOL015_TESTIDS.download)).toBeDisabled();
  });

  test('unsupported, empty and corrupted files do not make a slot ready', async ({ page }) => {
    await openTool015(page, 'ko');
    const input = page.getByTestId(TOOL015_TESTIDS.beforeInput);
    const state = page.getByTestId(TOOL015_TESTIDS.state);

    await input.setInputFiles({ name:'vector.svg', mimeType:'image/svg+xml', buffer:Buffer.from('<svg/>') });
    await expect(state).toHaveAttribute('data-before-ready', '0');
    await expect(page.getByTestId(TOOL015_TESTIDS.error)).toBeVisible();

    await input.setInputFiles({ name:'empty.png', mimeType:'image/png', buffer:Buffer.alloc(0) });
    await expect(state).toHaveAttribute('data-before-ready', '0');
    await expect(page.getByTestId(TOOL015_TESTIDS.error)).toBeVisible();

    await input.setInputFiles({ name:'broken.jpg', mimeType:'image/jpeg', buffer:Buffer.from('broken jpeg') });
    await expect(state).toHaveAttribute('data-before-ready', '0');
    await expect(page.getByTestId(TOOL015_TESTIDS.error)).toBeVisible();
  });

  test('divider width, gap and padding clamp to their configured UI ranges', async ({ page }) => {
    await uploadBoundaryTwo(page);
    const divider = page.getByTestId(TOOL015_TESTIDS.dividerWidth);
    const gap = page.getByTestId(TOOL015_TESTIDS.gap);
    const padding = page.getByTestId(TOOL015_TESTIDS.padding);

    await divider.fill('-1');
    await expect(divider).toHaveValue('0');
    await divider.fill('999');
    await expect(divider).toHaveValue('30');

    await gap.fill('-1');
    await expect(gap).toHaveValue('0');
    await gap.fill('999');
    await expect(gap).toHaveValue('200');

    await padding.fill('-1');
    await expect(padding).toHaveValue('0');
    await padding.fill('999');
    await expect(padding).toHaveValue('300');
  });

  test('result width and height clamp to the minimum 64 pixels', async ({ page }) => {
    await uploadBoundaryTwo(page);
    const width = page.getByTestId(TOOL015_TESTIDS.width);
    const height = page.getByTestId(TOOL015_TESTIDS.height);
    await width.fill('0');
    await height.fill('-10');
    await expect(width).toHaveValue('64');
    await expect(height).toHaveValue('64');
  });
});
