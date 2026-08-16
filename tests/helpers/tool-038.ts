import type { Page } from '@playwright/test';
export const route038=(locale='ko')=>`/${locale}/case-sentence-format-converter`;
export async function fill038(page:Page,text:string){await page.getByTestId('tool038-input').fill(text);}
export async function selectMode038(page:Page,mode:string){
  const radio=page.getByTestId(`tool038-mode-${mode}`);
  if(await radio.isChecked())return;
  const details=page.getByTestId('tool038-options');
  const isOpen=await details.evaluate((el)=>el instanceof HTMLDetailsElement && el.open);
  if(!isOpen)await details.locator('summary').click();
  await radio.check();
}
export async function convert038(page:Page,text:string,mode='upper'){
  await fill038(page,text);
  await selectMode038(page,mode);
  await page.getByTestId('tool038-convert').click();
}
