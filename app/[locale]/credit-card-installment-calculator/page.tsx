import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool076CardInstallmentPage} from '@/components/tool-076-card-installment-page';
const meta={ko:{title:'카드 할부 계산기 | FIXLGS TOOLBOX',description:'구매금액·할부개월·총 할부 수수료율로 월 납부액과 총 수수료를 계산합니다.'},en:{title:'Credit Card Installment Calculator | FIXLGS TOOLBOX',description:'Calculate monthly payments and total installment fees from purchase amount, installment months and fee rate.'},ja:{title:'クレジットカード分割払い計算ツール | FIXLGS TOOLBOX',description:'購入金額・分割回数・手数料率から月々の支払額と総手数料を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/credit-card-installment-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/credit-card-installment-calculator',en:'/en/credit-card-installment-calculator',ja:'/ja/credit-card-installment-calculator','x-default':'/ko/credit-card-installment-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool076CardInstallmentPage locale={locale as Locale}/>}
