import { expect, test } from '@playwright/test';

const TOOL012 = {
  ko: '/ko/image-border-rounded-corners-tool',
  en: '/en/image-border-rounded-corners-tool',
  ja: '/ja/image-border-rounded-corners-tool',
} as const;

const PROTECTED_ROUTES = [
  '/ko/image-converter',
  '/ko/heic-avif-converter',
  '/ko/svg-bmp-tiff-converter',
  '/ko/image-compressor',
  '/ko/target-size-image-compressor',
  '/ko/image-resizer',
  '/ko/web-image-optimizer',
  '/ko/image-cropper-rotator',
  '/ko/image-brightness-color-adjuster',
  '/ko/image-mosaic-blur-tool',
  '/ko/image-padding-background-tool',
];

test('001-011 protected routes remain reachable and 012 locale routes resolve', async ({ page }) => {
  for (const route of PROTECTED_ROUTES) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), route).toBeTruthy();
  }

  for (const url of Object.values(TOOL012)) {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), url).toBeTruthy();
    await expect(page.locator('input[type="file"][accept*="image/jpeg"]')).toHaveCount(1);
  }
});

test('012 SEO canonical hreflang structured data are present for all locales', async ({ page }) => {
  for (const [locale, url] of Object.entries(TOOL012)) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://toolbox.fixlgs.com${url}`);

    for (const lang of ['ko', 'en', 'ja']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    }
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const joined = jsonLd.join('\n');
    expect(joined, `${locale} WebApplication`).toContain('WebApplication');
    expect(joined, `${locale} FAQPage`).toContain('FAQPage');
    expect(joined, `${locale} BreadcrumbList`).toContain('BreadcrumbList');
  }
});

test('012 sitemap robots and image-edit category registration are additive', async ({ request }) => {
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  for (const url of Object.values(TOOL012)) {
    expect(sitemap).toContain(`https://toolbox.fixlgs.com${url}`);
  }

  // Existing completed tools must remain in sitemap after adding 012.
  for (const url of [
    'https://toolbox.fixlgs.com/ko/image-mosaic-blur-tool',
    'https://toolbox.fixlgs.com/ko/image-padding-background-tool',
  ]) {
    expect(sitemap).toContain(url);
  }

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBeTruthy();
  const robots = await robotsResponse.text();
  expect(robots).toContain('https://toolbox.fixlgs.com/sitemap.xml');

  for (const locale of ['ko', 'en', 'ja'] as const) {
    const categoryResponse = await request.get(`/${locale}/category/image-edit`);
    expect(categoryResponse.ok(), `${locale} image-edit category`).toBeTruthy();
    const category = await categoryResponse.text();
    expect(category).toContain('image-border-rounded-corners-tool');
    expect(category).toContain('image-padding-background-tool');
  }
});
