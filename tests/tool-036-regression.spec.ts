import { test, expect } from '@playwright/test';

for (const locale of ['ko','en','ja'] as const) {
  test(`TOOL036 ${locale} route and containment`, async ({ page }) => {
    await page.goto(`/${locale}/character-document-counter`);
    await expect(page.getByTestId('tool036-root')).toBeVisible();
    const diag = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflow = doc.scrollWidth - doc.clientWidth;
      const offenders = Array.from(document.querySelectorAll<HTMLElement>('body *')).map((el) => {
        const rect = el.getBoundingClientRect();
        return { tag: el.tagName.toLowerCase(), cls: el.className || '', testid: el.dataset?.testid || '', left: Math.round(rect.left * 10) / 10, right: Math.round(rect.right * 10) / 10, width: Math.round(rect.width * 10) / 10, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
      }).filter((item) => item.right > doc.clientWidth + 1 || item.left < -1 || item.scrollWidth > item.clientWidth + 1).slice(0, 25);
      return { overflow, viewport: doc.clientWidth, scrollWidth: doc.scrollWidth, offenders };
    });
    if (diag.overflow > 1) console.log(`TOOL036_OVERFLOW_DIAG=${JSON.stringify(diag)}`);
    expect(diag.overflow).toBeLessThanOrEqual(1);
  });
}
