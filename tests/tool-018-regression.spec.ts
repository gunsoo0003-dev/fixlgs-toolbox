import { expect, test } from '@playwright/test';
import { openTool018 } from './helpers/tool-018';

test.describe('018 route, locale, SEO and protected-route regression', () => {
  for (const locale of ['ko','en','ja'] as const) {
    test(`${locale} page renders localized H1, metadata, canonical, hreflang and structured data`, async ({ page }) => {
      await openTool018(page, locale);
      const expected = locale === 'ko' ? '이미지 정보·메타데이터 검사기' : locale === 'en' ? 'Image Info & Metadata Checker' : '画像情報・メタデータチェッカー';
      const expectedTitle = locale === 'ko' ? '이미지 정보·메타데이터 검사기 | EXIF·GPS·DPI 확인 및 제거' : locale === 'en' ? 'Image Metadata Checker | EXIF, GPS, DPI & Metadata Removal' : '画像メタデータ確認 | EXIF・GPS・DPI確認と削除';
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(expected);
      await expect(page).toHaveTitle(expectedTitle);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /DPI|PPI/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://toolbox.fixlgs.com/${locale}/image-metadata-checker`);
      await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveAttribute('href', 'https://toolbox.fixlgs.com/ko/image-metadata-checker');
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://toolbox.fixlgs.com/en/image-metadata-checker');
      await expect(page.locator('link[rel="alternate"][hreflang="ja"]')).toHaveAttribute('href', 'https://toolbox.fixlgs.com/ja/image-metadata-checker');
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', 'https://toolbox.fixlgs.com/en/image-metadata-checker');
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
      const ld = await page.locator('script[type="application/ld+json"]').textContent();
      expect(ld).toContain('WebApplication');
      expect(ld).toContain('FAQPage');
      expect(ld).toContain('BreadcrumbList');
    });
  }

  test('image-edit category exposes 018 as the last active metadata checker card in the baseline layout', async ({ page }) => {
    await page.goto('/ko/category/image-edit');
    const link = page.locator('a[href="/ko/image-metadata-checker"]');
    await expect(link).toBeVisible();
    await expect(link).toContainText('이미지 정보메타데이터 검사기');
  });

  test('existing protected image tool remains reachable', async ({ page }) => {
    await page.goto('/ko/web-image-optimizer');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('sitemap and robots expose the integrated tool route safely', async ({ page }) => {
    const sitemap = await page.request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    const xml = await sitemap.text();
    expect(xml).toContain('/ko/image-metadata-checker');
    expect(xml).toContain('/en/image-metadata-checker');
    expect(xml).toContain('/ja/image-metadata-checker');
    const robots = await page.request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('sitemap');
  });

  test('related-tool cards link to the intended existing tools', async ({ page }) => {
    await openTool018(page, 'ko');
    for (const href of ['/ko/web-image-optimizer','/ko/image-compressor','/ko/image-resizer']) {
      await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
    }
  });

  test('contact link keeps app query parameter', async ({ page }) => {
    await openTool018(page, 'ko');
    const contact = page.locator('footer a[href*="fixlgs.com/contact?app="]');
    await expect(contact).toHaveAttribute('href', /app=%EC%9D%B4%EB%AF%B8%EC%A7%80/);
  });
});
