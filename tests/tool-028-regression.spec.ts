import { test, expect } from '@playwright/test';

for (const locale of ['ko', 'en', 'ja']) {
  test(`028 metadata and local-only UI ${locale}`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => {
      if (['xhr', 'fetch'].includes(request.resourceType())) requests.push(request.url());
    });
    await page.goto(`/${locale}/merge-pdf`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://toolbox.fixlgs.com/${locale}/merge-pdf`);
    await expect(page.locator('link[hreflang="ko"]')).toHaveAttribute('href', 'https://toolbox.fixlgs.com/ko/merge-pdf');
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', 'https://toolbox.fixlgs.com/en/merge-pdf');
    await expect(page.locator('link[hreflang="ja"]')).toHaveAttribute('href', 'https://toolbox.fixlgs.com/ja/merge-pdf');
    await page.getByTestId('tool028-file-input').setInputFiles([
      'tests/fixtures/tool-028/한글-계약서.pdf',
      'tests/fixtures/tool-028/日本語-資料.pdf',
    ]);
    await expect(page.getByTestId('tool028-file-count')).toHaveText('2');
    expect(requests.filter(url => !url.startsWith('http://127.0.0.1:3028'))).toEqual([]);
  });
}
