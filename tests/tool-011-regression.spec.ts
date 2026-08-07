import { test, expect } from '@playwright/test';
import { TOOL011 } from './helpers/tool-011';

test('001-010 routes remain reachable and 011 language URLs resolve to same tool', async ({page}) => {
  const routes=['/ko/image-converter','/ko/heic-avif-converter','/ko/svg-bmp-tiff-converter','/ko/image-compressor','/ko/target-size-image-compressor','/ko/image-resizer','/ko/web-image-optimizer','/ko/image-cropper-rotator','/ko/image-brightness-color-adjuster','/ko/image-mosaic-blur'];
  for(const route of routes){ const r=await page.goto(route); expect(r?.ok(),route).toBeTruthy(); }
  for(const url of Object.values(TOOL011)){ const r=await page.goto(url); expect(r?.ok(),url).toBeTruthy(); await expect(page.getByTestId('tool011-root')).toBeVisible(); }
});

test('011 SEO sitemap robots category registration are present', async ({page}) => {
  await page.goto(TOOL011.ko); await expect(page.locator('h1')).toContainText('이미지 여백');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',/\/ko\/image-padding-background-tool$/);
  const sitemap=await (await page.request.get('/sitemap.xml')).text(); for(const locale of ['ko','en','ja']) expect(sitemap).toContain(`/${locale}/image-padding-background-tool`);
  const robots=await (await page.request.get('/robots.txt')).text(); expect(robots).toContain('sitemap.xml');
});
