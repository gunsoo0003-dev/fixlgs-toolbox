import { test, expect } from '@playwright/test';
test('TOOL033 exposes one policy source', async ({page})=>{await page.goto('/ko/pdf-compressor');const root=page.getByTestId('tool033-root');await expect(root).toHaveAttribute('data-max-file-bytes',String(50*1024*1024));await expect(root).toHaveAttribute('data-max-pages','200');});
