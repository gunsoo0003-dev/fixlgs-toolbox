import { test, expect } from '@playwright/test';
import { TOOL014, TOOL014_TESTIDS } from './helpers/tool-014';

const PROTECTED = [
 '/ko/jpg-png-webp-image-converter','/ko/heic-avif-image-converter','/ko/svg-bmp-tiff-image-converter','/ko/image-compressor','/ko/target-size-image-compressor','/ko/image-resizer','/ko/web-image-optimizer','/ko/image-cropper-rotator','/ko/image-brightness-color-adjuster','/ko/image-mosaic-blur-tool','/ko/image-padding-background-tool','/ko/image-border-rounded-corners-tool','/ko/image-merger'
];
const TITLES={ko:'이미지 콜라주 만들기',en:'Image Collage Maker',ja:'画像コラージュ作成ツール'} as const;

test.describe('014 regression-only',()=>{
 test('protected 001-013 routes remain reachable',async({page})=>{for(const route of PROTECTED){const r=await page.goto(route,{waitUntil:'domcontentloaded'});expect(r?.ok(),route).toBeTruthy();}});
 for(const locale of ['ko','en','ja'] as const){test(`014 ${locale} SEO and contact integration`,async({page})=>{const r=await page.goto(TOOL014[locale],{waitUntil:'domcontentloaded'});expect(r?.ok()).toBeTruthy();await expect(page.getByTestId(TOOL014_TESTIDS.root)).toBeVisible();await expect(page.locator('h1')).toContainText(TITLES[locale]);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new RegExp(`/${locale}/image-collage-maker$`));for(const lang of ['ko','en','ja'])await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute('href',new RegExp(`/${lang}/image-collage-maker$`));const contact=page.locator('footer a[href*="fixlgs.com/contact?app="]');await expect(contact).toHaveCount(1);});}
 test('014 category card is LIVE and linked',async({page})=>{await page.goto('/ko/category/image-edit');const card=page.locator('a[href="/ko/image-collage-maker"]');await expect(card).toHaveCount(1);await expect(card).toContainText('14');await expect(card).toContainText('LIVE');});
 test('sitemap and structured data include 014',async({page})=>{const s=await page.request.get('/sitemap.xml');expect(s.ok()).toBeTruthy();expect(await s.text()).toContain('/ko/image-collage-maker');await page.goto(TOOL014.ko);const json=(await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');expect(json).toContain('WebApplication');expect(json).toContain('FAQPage');expect(json).toContain('/ko/image-collage-maker');});
});
