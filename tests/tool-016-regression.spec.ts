import { test, expect } from '@playwright/test';
import { openTool016, TOOL016_TESTIDS } from './helpers/tool-016';
import { TOOL015_TESTIDS } from './helpers/tool-015';

const EXPECTED_H1 = {
  ko: '이미지에글자 넣기',
  en: 'Add Text to Image',
  ja: '画像文字入れツール',
} as const;
const EXPECTED_TITLE = {
  ko: '이미지에 글자 넣기 | 사진에 제목·날짜·문구 추가',
  en: 'Add Text to Image Online | Photo Text Editor',
  ja: '画像文字入れツール | 写真にタイトル・日付・文字を追加',
} as const;
const EXPECTED_CONTACT = {
  ko: '이미지에 글자 넣기',
  en: 'Add Text to Image',
  ja: '画像文字入れツール',
} as const;

for (const locale of ['ko', 'en', 'ja'] as const) {
  test(`016 ${locale} route, SEO and language links are connected`, async ({ page }) => {
    await openTool016(page, locale);
    await expect(page.getByTestId(TOOL016_TESTIDS.root)).toBeVisible();
    await expect(page.locator('h1')).toContainText(EXPECTED_H1[locale]);
    await expect(page).toHaveTitle(EXPECTED_TITLE[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/${locale}/add-text-to-image$`));
    for (const lang of ['ko', 'en', 'ja']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute('href', new RegExp(`/${lang}/add-text-to-image$`));
    }
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', /\/en\/add-text-to-image$/);
    const contact = page.locator('footer a[href*="fixlgs.com/contact?app="]');
    await expect(contact).toHaveCount(1);
    expect(decodeURIComponent(await contact.getAttribute('href') || '')).toContain(`app=${EXPECTED_CONTACT[locale]}`);
  });
}

test('016 image-edit category card displays UI number 16 and is LIVE', async ({ page }) => {
  await page.goto('/ko/category/image-edit', { waitUntil: 'domcontentloaded' });
  const card = page.locator('a[href="/ko/add-text-to-image"]');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('16');
  await expect(card).not.toContainText('016');
  await expect(card).toContainText('LIVE');
});

test('016 sitemap and robots integration are present', async ({ page }) => {
  const sitemap = await page.request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  for (const locale of ['ko', 'en', 'ja']) expect(xml).toContain(`/${locale}/add-text-to-image`);
  const robots = await page.request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('https://toolbox.fixlgs.com/sitemap.xml');
});

test('016 structured data contains WebApplication, FAQPage and BreadcrumbList', async ({ page }) => {
  await page.goto('/ko/add-text-to-image', { waitUntil: 'domcontentloaded' });
  const joined = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
  expect(joined).toContain('WebApplication');
  expect(joined).toContain('FAQPage');
  expect(joined).toContain('BreadcrumbList');
  expect(joined).toContain('/ko/add-text-to-image');
});

test('015 protected route still opens after 016 integration', async ({ page }) => {
  const response = await page.goto('/ko/before-after-image-maker', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByTestId(TOOL015_TESTIDS.root)).toBeVisible();
});

test('016 responsive settings navigation matches desktop and mobile layouts', async ({ page }, testInfo) => {
  await openTool016(page, 'ko');
  await page.getByTestId(TOOL016_TESTIDS.fileInput).setInputFiles('test-fixtures/sample.jpg');
  await page.getByRole('button', { name: '제목 추가' }).click();
  const tabNames = ['문구', '글자', '효과', '위치'] as const;
  for (const name of tabNames) {
    const tab = page.getByRole('button', { name, exact: true });
    if (testInfo.project.name.includes('mobile')) {
      await expect(tab).toHaveCount(1);
      await expect(tab).toBeVisible();
    } else {
      await expect(tab).toHaveCount(0);
    }
  }
});
