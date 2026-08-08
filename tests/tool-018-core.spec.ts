import { expect, test } from '@playwright/test';
import { openTool018, upload018, TOOL018_FIXTURES } from './helpers/tool-018';

test.describe('018 core metadata behavior', () => {
  test.beforeEach(async ({ page }) => { await openTool018(page); });

  test('reads basic JPEG information without inventing EXIF/GPS', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.noExif);
    await expect(page.getByTestId('tool018-basic-info')).toContainText('300 × 240 px');
    await expect(page.getByTestId('tool018-basic-info')).toContainText('0.07 MP');
    await expect(page.getByTestId('tool018-basic-info')).toContainText('5:4');
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-gps', '0');
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-exif', '0');
    await expect(page.getByTestId('tool018-print-info')).toContainText('DPI·PPI 정보 없음');
  });

  test('reads EXIF, camera, capture and GPS values', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.exifGps);
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-gps', '1');
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-exif', '1');
    await expect(page.getByTestId('tool018-camera-info')).toContainText('FIXLGS Camera');
    await expect(page.getByTestId('tool018-camera-info')).toContainText('Metadata Test Model');
    await expect(page.getByTestId('tool018-camera-info')).toContainText('ISO 100');
    await expect(page.getByTestId('tool018-camera-info')).toContainText('1/250 s');
    await expect(page.getByTestId('tool018-camera-info')).toContainText(/2026-08-08/);
    await expect(page.getByTestId('tool018-gps-info')).toContainText('36.01900000');
    await expect(page.getByTestId('tool018-gps-info')).toContainText('129.34350000');
    await expect(page.getByTestId('tool018-gps-warning')).toBeVisible();
  });

  test('reads lens specification, metering mode and software privacy state', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.extendedExif);
    await expect(page.getByTestId('tool018-camera-info')).toContainText('24–70 mm · f/2.8–2.8');
    await expect(page.getByTestId('tool018-camera-info')).toContainText('Pattern');
    await expect(page.getByTestId('tool018-privacy-summary')).toContainText('소프트웨어 정보');
    await expect(page.getByTestId('tool018-privacy-summary')).toContainText('있음');
  });

  test('distinguishes raw pixel orientation from displayed EXIF orientation', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.orientation);
    const basic = page.getByTestId('tool018-basic-info');
    await expect(basic).toContainText('이미지 방향');
    await expect(basic).toContainText('세로');
    await expect(basic).toContainText('원본 픽셀 방향');
    await expect(basic).toContainText('가로');
    await expect(basic).toContainText('EXIF Orientation');
    await expect(basic).toContainText('6');
  });

  test('applies South and West GPS references as negative coordinates', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.exifGpsSouthWest);
    await expect(page.getByTestId('tool018-gps-info')).toContainText('-36.01900000');
    await expect(page.getByTestId('tool018-gps-info')).toContainText('-129.34350000');
  });

  test('reads stored 300 PPI and calculates print size', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.ppi300);
    await expect(page.getByTestId('tool018-print-info')).toContainText('300.00 × 300.00 PPI');
    await expect(page.getByTestId('tool018-custom-ppi')).toHaveValue('300');
    await expect(page.getByTestId('tool018-print-size')).toContainText('2.54 × 2.03 cm');
    await expect(page.getByTestId('tool018-print-size')).toContainText('1.00 × 0.80 in');
    await page.getByTestId('tool018-custom-ppi').fill('150');
    await expect(page.getByTestId('tool018-print-size')).toContainText('5.08 × 4.06 cm');
  });

  test('converts centimeter resolution metadata to PPI', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.ppiCm);
    await expect(page.getByTestId('tool018-print-info')).toContainText(/300\.00 × 300\.00 PPI/);
  });

  test('removes PNG and WebP privacy metadata while preserving ICC profile', async ({ page }) => {
    for (const fixture of [TOOL018_FIXTURES.metadataPng, TOOL018_FIXTURES.metadataWebp]) {
      await upload018(page, fixture);
      await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-original-icc', '1');
      await page.getByTestId('tool018-remove-metadata').click();
      await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-clean', '1');
      await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-clean-xmp', '0');
      await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-clean-icc', '1');
      await page.getByText('전체 초기화').click();
    }
  });

  test('supports PNG and WebP basic analysis', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.transparentPng);
    await expect(page.getByTestId('tool018-basic-info')).toContainText('PNG');
    await expect(page.getByTestId('tool018-basic-info')).toContainText('180 × 120 px');
    await page.getByText('전체 초기화').click();
    await upload018(page, TOOL018_FIXTURES.webp);
    await expect(page.getByTestId('tool018-basic-info')).toContainText('WebP');
    await expect(page.getByTestId('tool018-basic-info')).toContainText('160 × 90 px');
  });

  test('removes privacy metadata, rechecks result and keeps dimensions', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.exifGps);
    await page.getByTestId('tool018-remove-metadata').click();
    await expect(page.getByTestId('tool018-removal-result')).toBeVisible();
    await expect(page.getByTestId('tool018-removal-result')).toContainText('있음 → 없음');
    await expect(page.getByTestId('tool018-removal-result')).toContainText('300×240 → 300×240');
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-clean', '1');
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-original-gps', '1');
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-clean-gps', '0');
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-clean-exif', '0');
  });

  test('does not claim GPS existed when cleaning a GPS-free image', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.noExif);
    await page.getByTestId('tool018-remove-metadata').click();
    await expect(page.getByTestId('tool018-removal-result')).toContainText('없음 → 없음');
  });

  test('preserves EXIF orientation needed for visual direction after cleaning', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.orientation);
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-original-exif-orientation', '6');
    await page.getByTestId('tool018-remove-metadata').click();
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-clean-exif-orientation', '6');
  });

  test('downloads the rechecked clean image', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.exifGps);
    await page.getByTestId('tool018-remove-metadata').click();
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-clean-gps', '0');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('tool018-download-clean').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/-clean\.jpg$/);
  });
});
