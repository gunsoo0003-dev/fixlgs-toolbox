import type { Locator, Page } from "@playwright/test";

export const route042=(locale="ko")=>`/${locale}/text-find-replace`;
export const LIMITS={input:1_000_000,rules:100,find:1_000,replacement:10_000,result:5_000_000} as const;

export async function setRule(page:Page,index:number,find:string,replacement:string){
  await page.getByTestId(`tool042-find-${index}`).fill(find);
  await page.getByTestId(`tool042-replace-${index}`).fill(replacement);
}

export async function injectTextLike(locator:Locator,value:string){
  await locator.evaluate((el,v)=>{
    const node=el as HTMLInputElement|HTMLTextAreaElement;
    const proto=node instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
    const setter=Object.getOwnPropertyDescriptor(proto,"value")?.set;
    if(!setter)throw new Error("NATIVE_VALUE_SETTER_NOT_FOUND");
    setter.call(node,v);
    node.dispatchEvent(new Event("input",{bubbles:true}));
  },value);
}
