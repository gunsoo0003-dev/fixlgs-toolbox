import { expect, type Page } from '@playwright/test';
import path from 'node:path';

export const TOOL018 = {
  ko: '/ko/image-metadata-checker',
  en: '/en/image-metadata-checker',
  ja: '/ja/image-metadata-checker',
} as const;

export const TOOL018_FIXTURES = {
  noExif: path.resolve(process.cwd(), 'test-fixtures/tool-018/no-exif.jpg'),
  exifGps: path.resolve(process.cwd(), 'test-fixtures/tool-018/exif-gps.jpg'),
  exifGpsSouthWest: path.resolve(process.cwd(), 'test-fixtures/tool-018/exif-gps-south-west.jpg'),
  malformedExif: path.resolve(process.cwd(), 'test-fixtures/tool-018/malformed-exif.jpg'),
  orientation: path.resolve(process.cwd(), 'test-fixtures/tool-018/orientation-6.jpg'),
  ppi300: path.resolve(process.cwd(), 'test-fixtures/tool-018/ppi-300.jpg'),
  transparentPng: path.resolve(process.cwd(), 'test-fixtures/tool-018/transparent-300ppi.png'),
  webp: path.resolve(process.cwd(), 'test-fixtures/tool-018/plain.webp'),
  corrupt: path.resolve(process.cwd(), 'test-fixtures/tool-018/corrupt.jpg'),
  zero: path.resolve(process.cwd(), 'test-fixtures/tool-018/zero-byte.jpg'),
  mismatch: path.resolve(process.cwd(), 'test-fixtures/tool-018/extension-mismatch.jpg'),
  longMetadata: path.resolve(process.cwd(), 'test-fixtures/tool-018/long-metadata.png'),
  headerOnlyCorrupt: path.resolve(process.cwd(), 'test-fixtures/tool-018/header-only-corrupt.jpg'),
  extendedExif: path.resolve(process.cwd(), 'test-fixtures/tool-018/extended-exif.jpg'),
  ppiCm: path.resolve(process.cwd(), 'test-fixtures/tool-018/ppi-cm.jpg'),
  metadataPng: path.resolve(process.cwd(), 'test-fixtures/tool-018/metadata-icc.png'),
  metadataWebp: path.resolve(process.cwd(), 'test-fixtures/tool-018/metadata-icc.webp'),
} as const;

export async function openTool018(page: Page, locale: keyof typeof TOOL018 = 'ko') {
  await page.goto(TOOL018[locale]);
  await expect(page.getByTestId('tool018-root')).toBeVisible();
  await expect(page.getByTestId('tool018-dropzone')).toBeVisible();
  await expect(page.getByTestId('tool018-input')).toBeAttached();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function upload018(page: Page, files: string | string[]) {
  await page.getByTestId('tool018-input').setInputFiles(files);
  await expect(page.getByTestId('tool018-result')).toBeVisible();
  await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-ready', '1');
}
