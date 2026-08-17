import {expect,type Page} from '@playwright/test';

export const route044=(locale='ko')=>`/${locale}/keyword-frequency-duplicate-analyzer`;

export async function setText044(page:Page,text:string){
  const input=page.getByTestId('tool044-input');
  await expect(input).toBeVisible();
  await input.fill(text);
}

export async function injectText044(page:Page,text:string){
  const input=page.getByTestId('tool044-input');
  await expect(input).toBeVisible();
  await input.evaluate((el,value)=>{
    const proto=HTMLTextAreaElement.prototype;
    const setter=Object.getOwnPropertyDescriptor(proto,'value')?.set;
    if(!setter) throw new Error('TEXTAREA_NATIVE_SETTER_MISSING');
    setter.call(el,value);
    el.dispatchEvent(new Event('input',{bubbles:true}));
  },text);
}
