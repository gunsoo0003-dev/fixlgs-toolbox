import {expect,type Page} from '@playwright/test';
export const TOOL023_ROUTE='/ko/app-icon-favicon-generator';
export const TOOL023_TESTIDS={
  root:'tool023-root',
  fileInput:'tool023-file-input',
  fileInputLoaded:'tool023-file-input-loaded',
  preview:'tool023-preview',
  generate:'tool023-generate',
  status:'tool023-status',
  startCard:'tool023-start-card',
  dropzone:'tool023-dropzone',
  workspaceDropzone:'tool023-workspace-dropzone',
  resetSettings:'tool023-reset-settings',
  resetAll:'tool023-reset-all',
  safeToggle:'tool023-safe-toggle'
} as const;
export async function openTool023(page:Page,locale='ko'){await page.goto(`/${locale}/app-icon-favicon-generator`);await expect(page.getByTestId(TOOL023_TESTIDS.root)).toBeVisible();}
export async function upload023(page:Page,path='tests/fixtures/tool023/square-transparent.png'){await openTool023(page);await page.getByTestId(TOOL023_TESTIDS.fileInput).setInputFiles(path);await expect(page.getByTestId(TOOL023_TESTIDS.preview)).toBeVisible();}
