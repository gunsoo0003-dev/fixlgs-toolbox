import { expect, test } from '@playwright/test';

const TOOL011 = {
  ko: '/ko/image-padding-background-tool',
  en: '/en/image-padding-background-tool',
  ja: '/ja/image-padding-background-tool',
} as const;

test('001-010 routes remain reachable and 011 language URLs resolve to same tool', async ({ page }) => {
  const routes = [
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
  ];

  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBeTruthy();
  }

  for (const url of Object.values(TOOL011)) {
    const response = await page.goto(url);
    expect(response?.ok(), url).toBeTruthy();
    await expect(page.getByTestId('tool011-root')).toBeVisible();
  }
});

test('011 SEO sitemap robots category registration are present', async ({ request }) => {
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  for (const url of Object.values(TOOL011)) {
    expect(sitemap).toContain(`https://toolbox.fixlgs.com${url}`);
  }

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBeTruthy();
  const robots = await robotsResponse.text();
  expect(robots).toContain('https://toolbox.fixlgs.com/sitemap.xml');

  for (const locale of ['ko', 'en', 'ja'] as const) {
    const categoryResponse = await request.get(`/${locale}/category/image-edit`);
    expect(categoryResponse.ok(), `${locale} image-edit category`).toBeTruthy();
    const category = await categoryResponse.text();
    expect(category).toContain('image-padding-background-tool');
  }
});
