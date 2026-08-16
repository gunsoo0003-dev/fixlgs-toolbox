import type { Page } from '@playwright/test';
export const TOOL037_LIMIT=1_000_000;
export const route037=(locale='ko')=>`/${locale}/text-whitespace-linebreak-cleaner`;
export async function fill037(page:Page,text:string){await page.getByTestId('tool037-input').fill(text);}
export async function clean037(page:Page,text:string){await fill037(page,text);await page.getByTestId('tool037-clean').click();}
