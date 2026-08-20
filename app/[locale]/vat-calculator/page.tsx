import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool066VatCalculatorPage} from '@/components/tool-066-vat-calculator-page';
const meta={
 ko:{title:'부가세 계산기 | FIXLGS TOOLBOX',description:'공급가액과 부가세를 계산하고 부가세 포함 금액에서 공급가액과 세액을 역산합니다.'},
 en:{title:'VAT Calculator | FIXLGS TOOLBOX',description:'Calculate VAT from a net amount and reverse VAT-inclusive totals into net amount and tax.'},
 ja:{title:'消費税計算ツール | FIXLGS TOOLBOX',description:'税抜価格から消費税を計算し、税込価格から税抜価格と税額を逆算します。'}
} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/vat-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/vat-calculator',en:'/en/vat-calculator',ja:'/ja/vat-calculator','x-default':'/ko/vat-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool066VatCalculatorPage locale={locale as Locale}/>}
