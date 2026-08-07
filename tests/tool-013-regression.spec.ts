import { test, expect } from '@playwright/test';
import { TOOL013, TOOL013_TESTIDS } from './helpers/tool-013';

const PROTECTED_ROUTES = [
  '/ko/jpg-png-webp-image-converter',
  '/ko/heic-avif-image-converter',
  '/ko/svg-bmp-tiff-image-converter',
  '/ko/image-compressor',
  '/ko/target-size-image-compressor',
  '/ko/image-resizer',
  '/ko/web-image-optimizer',
  '/ko/image-cropper-rotator',
  '/ko/image-brightness-color-adjuster',
  '/ko/image-mosaic-blur-tool',
  '/ko/image-padding-background-tool',
  '/ko/image-border-rounded-corners-tool',
] as const;

const EXPECTED_TITLES = {
  ko: '이미지 합치기',
  en: 'Image Merger',
  ja: '画像結合ツール',
} as const;

const EXPECTED_CONTACT_APPS = {
  ko: '이미지 합치기',
  en: 'Image Merger',
  ja: '画像結合ツール',
} as const;

test.describe('013 regression-only', () => {
  test('protected 001-012 routes remain reachable', async ({ page }) => {
    for (const route of PROTECTED_ROUTES) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response, `HARNESS_ERROR: no response for ${route}`).not.toBeNull();
      expect(response?.ok(), `PRODUCT_FAIL: protected route ${route}`).toBeTruthy();
    }
  });

  for (const locale of ['ko', 'en', 'ja'] as const) {
    test(`013 ${locale} route, root, canonical, hreflang and contact remain connected`, async ({ page }) => {
      const route = TOOL013[locale];
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response, `HARNESS_ERROR: no response for ${route}`).not.toBeNull();
      expect(response?.ok(), `PRODUCT_FAIL: 013 route ${route}`).toBeTruthy();
      await expect(page.getByTestId(TOOL013_TESTIDS.root)).toBeVisible();
      await expect(page.locator('h1')).toContainText(EXPECTED_TITLES[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/${locale}/image-merger$`));
      for (const lang of ['ko', 'en', 'ja']) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute('href', new RegExp(`/${lang}/image-merger$`));
      }
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', /\/en\/image-merger$/);
      const contact = page.locator('footer a[href*="fixlgs.com/contact?app="]');
      await expect(contact).toHaveCount(1);
      const href = await contact.getAttribute('href');
      expect(decodeURIComponent(href || '')).toContain(`app=${EXPECTED_CONTACT_APPS[locale]}`);
    });
  }

  test('013 category registration remains LIVE and linked', async ({ page }) => {
    const response = await page.goto('/ko/category/image-edit', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), 'PRODUCT_FAIL: image-edit category route').toBeTruthy();
    const card = page.locator('a[href="/ko/image-merger"]');
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('13');
    await expect(card).toContainText('LIVE');
  });

  test('013 sitemap and robots integration are present', async ({ page }) => {
    const sitemapResponse = await page.request.get('/sitemap.xml');
    expect(sitemapResponse.ok(), 'PRODUCT_FAIL: sitemap.xml response').toBeTruthy();
    const sitemap = await sitemapResponse.text();
    for (const locale of ['ko', 'en', 'ja']) expect(sitemap).toContain(`/${locale}/image-merger`);

    const robotsResponse = await page.request.get('/robots.txt');
    expect(robotsResponse.ok(), 'PRODUCT_FAIL: robots.txt response').toBeTruthy();
    const robots = await robotsResponse.text();
    expect(robots).toContain('https://toolbox.fixlgs.com/sitemap.xml');
  });

  test('013 structured data remains attached to the tool route', async ({ page }) => {
    await page.goto(TOOL013.ko, { waitUntil: 'domcontentloaded' });
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const joined = jsonLd.join('\n');
    expect(joined).toContain('WebApplication');
    expect(joined).toContain('FAQPage');
    expect(joined).toContain('BreadcrumbList');
    expect(joined).toContain('/ko/image-merger');
  });
});
