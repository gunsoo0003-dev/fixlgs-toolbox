import { expect, type Page } from '@playwright/test';
export const TOOL016_ROUTE='/ko/add-text-to-image';
export const TOOL016_TESTIDS={root:'tool016-root',fileInput:'tool016-file-input',addbar:'tool016-addbar',previewCanvas:'tool016-preview-canvas',settings:'tool016-settings',content:'tool016-content',fontSize:'tool016-font-size',maxWidth:'tool016-max-width',layers:'tool016-layers',output:'tool016-output',filename:'tool016-filename',download:'tool016-download',status:'tool016-status',error:'tool016-error'} as const;
export async function openTool016(page:Page,locale='ko'){await page.goto(`/${locale}/add-text-to-image`);await expect(page.getByTestId(TOOL016_TESTIDS.root)).toBeVisible();}
export async function upload016(page:Page,path='test-fixtures/sample.jpg'){await openTool016(page);await page.getByTestId(TOOL016_TESTIDS.fileInput).setInputFiles(path);await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();}
