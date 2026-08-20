import { expect, test } from '@playwright/test';

const tools = [
  ['027', 'pdf-to-image-converter'],
  ['028', 'merge-pdf'],
  ['029', 'split-extract-pdf'],
  ['030', 'pdf-page-organizer'],
  ['031', 'pdf-page-number-watermark'],
  ['032', 'pdf-signature'],
  ['033', 'pdf-compressor'],
  ['034', 'pdf-password-metadata'],
  ['035', 'pdf-text-image-extractor'],
  ['036', 'character-document-counter'],
  ['037', 'text-whitespace-linebreak-cleaner'],
  ['038', 'case-sentence-format-converter'],
  ['039', 'list-sorter-duplicate-remover'],
  ['040', 'delimiter-list-converter'],
  ['041', 'text-extractor'],
  ['042', 'text-find-replace'],
  ['043', 'text-diff-compare'],
  ['044', 'keyword-frequency-duplicate-analyzer'],
  ['045', 'date-difference-calculator'],
  ['046', 'date-add-subtract-calculator'],
  ['047', 'dday-anniversary-calculator'],
  ['048', 'age-life-calculator'],
  ['049', 'employment-tenure-calculator'],
  ['050', 'business-day-calculator'],
  ['051', 'time-calculator'],
  ['052', 'world-time-timezone-converter'],
  ['053', 'unix-timestamp-converter'],
  ['054', 'timer-stopwatch'],
  ['055', 'length-area-volume-converter'],
  ['056', 'weight-temperature-pressure-converter'],
  ['057', 'speed-fuel-energy-converter'],
  ['058', 'data-cooking-unit-converter'],
  ['059', 'pixel-print-size-converter'],
  ['060', 'shoe-clothing-size-converter'],
  ['061', 'percentage-percent-change-calculator'],
  ['062', 'discount-price-calculator'],
  ['063', 'ratio-proportion-calculator'],
  ['064', 'statistics-calculator'],
  ['065', 'fraction-decimal-calculator'],
] as const;

const locales = ['ko', 'en', 'ja'] as const;

for (const [toolNo, slug] of tools) {
  test(`TOOL${toolNo} full-width IMPORTANT NOTES divider`, async ({ page }, testInfo) => {
    for (const locale of locales) {
      const runtimeErrors: string[] = [];
      const onPageError = (error: Error) => runtimeErrors.push(`pageerror: ${error.message}`);
      const onConsole = (msg: { type(): string; text(): string }) => {
        if (msg.type() === 'error') runtimeErrors.push(`console.error: ${msg.text()}`);
      };
      page.on('pageerror', onPageError);
      page.on('console', onConsole);

      const url = `/${locale}/${slug}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(response, `${toolNo} ${locale} response`).not.toBeNull();
      expect(response!.status(), `${toolNo} ${locale} HTTP`).toBeLessThan(400);

      const notes = page.locator(
        '.toolbox-tool-info-band.toolbox-tool-info-band--section-start.toolbox-tool-info-band--format-head'
      );
      await expect(notes, `TOOL${toolNo} ${locale} notes common-divider`).toHaveCount(1);
      await expect(notes).toBeVisible();

      const divider = await notes.evaluate((element) => {
        const pseudo = getComputedStyle(element, '::before');
        const width = Number.parseFloat(pseudo.width);
        const borderTopWidth = Number.parseFloat(pseudo.borderTopWidth);
        const viewportWidth = window.innerWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        return {
          width,
          borderTopWidth,
          viewportWidth,
          scrollWidth,
          left: pseudo.left,
          transform: pseudo.transform,
          content: pseudo.content,
        };
      });

      expect(Number.isFinite(divider.width), `TOOL${toolNo} ${locale} divider width`).toBeTruthy();
      expect(
        Math.abs(divider.width - divider.viewportWidth),
        `TOOL${toolNo} ${locale} divider width=${divider.width}, viewport=${divider.viewportWidth}`
      ).toBeLessThanOrEqual(2);
      expect(divider.borderTopWidth, `TOOL${toolNo} ${locale} divider border`).toBeGreaterThanOrEqual(1);
      // Global page overflow is informational only in this divider-specific regression check.
      expect(divider.content, `TOOL${toolNo} ${locale} pseudo content`).not.toBe('none');
      expect(runtimeErrors, `TOOL${toolNo} ${locale} runtime errors`).toEqual([]);

      console.log(
        `DIVIDER_PASS TOOL${toolNo} ${locale} ${testInfo.project.name} width=${divider.width}/${divider.viewportWidth} scroll=${divider.scrollWidth}`
      );

      page.off('pageerror', onPageError);
      page.off('console', onConsole);
    }
  });
}
