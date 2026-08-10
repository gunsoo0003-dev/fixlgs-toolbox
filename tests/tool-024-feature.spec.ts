import { test, expect } from '@playwright/test';
import fs from 'node:fs';

async function dataTransferForFixture(page: import('@playwright/test').Page, fixturePath: string, name: string, type: string) {
  const base64 = fs.readFileSync(fixturePath).toString('base64');
  return page.evaluateHandle(({ base64, name, type }) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], name, { type }));
    return dt;
  }, { base64, name, type });
}

test('024 feature flow: copy, design controls, presets and ZIP export', async ({ page }) => {
  await page.goto('/ko/app-store-screenshot-maker');
  const input = page.getByTestId('tool024-dropzone').locator('input[type=file]');
  await input.setInputFiles(['test-fixtures/portrait-1080x1920.jpg','test-fixtures/tiny-image.jpg']);
  await expect(page.getByTestId('tool024-result-count')).toHaveText('2');
  await page.getByTestId('tool024-background-mode').selectOption('gradient');
  await page.getByTestId('tool024-title-y').evaluate((el: HTMLInputElement)=>{el.value='0.08';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.getByTestId('tool024-description-y').evaluate((el: HTMLInputElement)=>{el.value='0.17';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.getByTestId('tool024-root').locator('input:not([type])').first().fill('빠르고 선명한 앱 작업 흐름');
  await page.getByTestId('tool024-root').locator('textarea').fill('실제 앱 화면 비율을 유지하면서 스토어 스크린샷을 만듭니다.');
  await expect(page.getByTestId('tool024-result-count')).toHaveText('2');
  await expect(page.getByTestId('tool024-workspace-dropzone')).toBeVisible();
  await page.getByTestId('tool024-output-format').selectOption('jpg');
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('tool024-export-zip').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('fixlgs_app-store-screenshots.zip');
  await expect(page.getByRole('status')).toContainText(/완료|Ready/);
});

test('024 removed language UI stays removed and output count is slide x preset only', async ({ page }) => {
  await page.goto('/ko/app-store-screenshot-maker');
  const toolRoot = page.getByTestId('tool024-root');
  await expect(toolRoot.getByText('언어 버전', { exact: true })).toHaveCount(0);
  await expect(toolRoot.getByText('한국어', { exact: true })).toHaveCount(0);
  await expect(toolRoot.getByText('English', { exact: true })).toHaveCount(0);
  await expect(toolRoot.getByText('日本語', { exact: true })).toHaveCount(0);

  await page.getByTestId('tool024-dropzone').locator('input[type=file]').setInputFiles([
    'test-fixtures/portrait-1080x1920.jpg',
    'test-fixtures/tiny-image.jpg',
  ]);
  await expect(page.getByTestId('tool024-result-count')).toHaveText('2');

  const presetChecks = page.locator('section').filter({ hasText: '05 · PRESETS' }).locator('input[type=checkbox]');
  await expect(presetChecks).toHaveCount(6);
  await presetChecks.nth(1).check();
  await expect(page.getByTestId('tool024-result-count')).toHaveText('4');
});

test('024 accepts an external file drop on the lower workspace', async ({ page }) => {
  await page.goto('/ko/app-store-screenshot-maker');
  const workspace = page.getByTestId('tool024-workspace-dropzone');
  const top = page.getByTestId('tool024-dropzone');
  const dt = await dataTransferForFixture(page, 'test-fixtures/portrait-1080x1920.jpg', 'workspace-drop.jpg', 'image/jpeg');

  const before = await top.evaluate((el) => getComputedStyle(el).borderColor);
  await workspace.dispatchEvent('dragenter', { dataTransfer: dt });
  const during = await top.evaluate((el) => getComputedStyle(el).borderColor);
  expect(during).not.toBe(before);

  await workspace.dispatchEvent('drop', { dataTransfer: dt });
  await expect(page.getByTestId('tool024-preview')).toBeVisible();
  await expect(page.getByTestId('tool024-result-count')).toHaveText('1');
});

test('024 design baseline is usable at desktop and mobile widths', async ({ page }) => {
  await page.goto('/ja/app-store-screenshot-maker');
  await expect(page.locator('h1')).toContainText('アプリストア');
  await expect(page.getByTestId('tool024-root')).toBeVisible();
  await expect(page.locator('.toolbox-tool-guide')).toHaveCount(1);
  await expect(page.locator('.toolbox-tool-format-guide')).toHaveCount(1);
  await expect(page.locator('.toolbox-tool-info-band')).toHaveCount(1);
  await expect(page.locator('.toolbox-tool-faq')).toHaveCount(1);
  await expect(page.locator('.toolbox-howto, .toolbox-guide, .toolbox-cautions, .toolbox-related-tools')).toHaveCount(0);
  await page.getByTestId('tool024-dropzone').locator('input[type=file]').setInputFiles('test-fixtures/portrait-1080x1920.jpg');
  await expect(page.getByTestId('tool024-preview')).toBeVisible();
  const overflowDiagnostic = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const viewportWidth = doc.clientWidth;
    const tolerance = 2;
    const describe = (el: Element) => {
      const node = el as HTMLElement;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        tag: node.tagName.toLowerCase(),
        id: node.id || null,
        className: typeof node.className === 'string' ? node.className : null,
        testId: node.getAttribute('data-testid'),
        left: Number(rect.left.toFixed(2)),
        right: Number(rect.right.toFixed(2)),
        width: Number(rect.width.toFixed(2)),
        scrollWidth: node.scrollWidth,
        clientWidth: node.clientWidth,
        position: style.position,
        display: style.display,
        minWidth: style.minWidth,
        maxWidth: style.maxWidth,
        whiteSpace: style.whiteSpace,
        overflowX: style.overflowX,
        transform: style.transform,
      };
    };
    const overflowing = Array.from(document.querySelectorAll('body *'))
      .filter((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return rect.width > 0 && (rect.right > viewportWidth + tolerance || rect.left < -tolerance);
      })
      .slice(0, 40)
      .map(describe);
    const pseudo = Array.from(document.querySelectorAll('body *'))
      .flatMap((el) => ['::before', '::after'].map((pseudoName) => {
        const style = getComputedStyle(el, pseudoName);
        if (!style || style.content === 'none' || style.display === 'none') return null;
        const width = Number.parseFloat(style.width);
        if (!Number.isFinite(width) || width <= viewportWidth + tolerance) return null;
        const node = el as HTMLElement;
        return {
          hostTag: node.tagName.toLowerCase(),
          hostId: node.id || null,
          hostClassName: typeof node.className === 'string' ? node.className : null,
          pseudo: pseudoName,
          width: style.width,
          position: style.position,
          left: style.left,
          right: style.right,
          transform: style.transform,
        };
      }))
      .filter(Boolean)
      .slice(0, 20);
    return {
      overflow: doc.scrollWidth > viewportWidth + tolerance,
      viewportWidth,
      documentScrollWidth: doc.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
      overflowing,
      pseudo,
    };
  });
  if (overflowDiagnostic.overflow) {
    console.log('TOOL024_DESKTOP_OVERFLOW_DIAGNOSTIC=' + JSON.stringify(overflowDiagnostic, null, 2));
  }
  expect(overflowDiagnostic.overflow, `Desktop horizontal overflow detected: ${JSON.stringify(overflowDiagnostic)}`).toBeFalsy();
});
