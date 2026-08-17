import { test, expect } from '@playwright/test';

async function openOptions(page: any) {
  const details = page.getByTestId('tool040-options');
  if (!(await details.getAttribute('open'))) await details.locator('summary').click();
}

async function setLargeSourceValue(page: any, value: string) {
  const source = page.getByTestId('tool040-source');
  await source.evaluate((element: HTMLTextAreaElement, nextValue: string) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (!setter) throw new Error('HTMLTextAreaElement value setter unavailable');
    setter.call(element, nextValue);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  await expect(page.getByTestId('tool040-convert')).toBeEnabled({ timeout: 5_000 });
}

test('TOOL040 candidate input limit plus one is blocked', async ({ page }) => {
  await page.goto('/en/delimiter-list-converter');
  await page.getByTestId('tool040-source').fill('a'.repeat(300001));
  await page.getByTestId('tool040-convert').click();
  await expect(page.getByTestId('tool040-error')).toBeVisible();
  await expect(page.getByTestId('tool040-result')).toHaveValue('');
});

test('TOOL040 candidate custom delimiter limit plus one is blocked', async ({ page }) => {
  await page.goto('/en/delimiter-list-converter');
  await openOptions(page);
  await page.getByTestId('tool040-source-kind').selectOption('custom');
  await page.getByTestId('tool040-source-custom').fill('x'.repeat(51));
  await page.getByTestId('tool040-source').fill('a');
  await page.getByTestId('tool040-convert').click();
  await expect(page.getByTestId('tool040-error')).toBeVisible();
});

test('TOOL040 candidate item limit plus one is blocked', async ({ page }) => {
  await page.goto('/en/delimiter-list-converter');
  const oversizedItemList = Array.from({ length: 50001 }, () => 'a').join('\n');
  await setLargeSourceValue(page, oversizedItemList);
  await page.getByTestId('tool040-convert').click();
  await expect(page.getByTestId('tool040-error')).toBeVisible();
  await expect(page.getByTestId('tool040-result')).toHaveValue('');
});
