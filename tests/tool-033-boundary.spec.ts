import { test, expect } from '@playwright/test';
test('TOOL033 rejects non-PDF', async ({ page }) => { await page.goto('/ko/pdf-compressor'); await page.getByTestId('tool033-file-input').setInputFiles('tests/fixtures/tool-033/mime-mismatch.pdf'); await expect(page.getByTestId('tool033-error')).toBeVisible(); });
