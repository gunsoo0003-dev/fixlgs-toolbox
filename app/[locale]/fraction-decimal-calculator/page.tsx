import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool065FractionDecimalCalculatorPage} from '@/components/tool-065-fraction-decimal-calculator-page';
const meta={ko:{title:'분수·소수 계산기 | FIXLGS TOOLBOX',description:'분수 사칙연산, 약분, 분수→소수, 소수→분수를 정확하게 계산합니다.'},en:{title:'Fraction & Decimal Calculator | FIXLGS TOOLBOX',description:'Calculate fraction operations, simplify fractions, and convert between fractions and decimals.'},ja:{title:'分数・小数計算ツール | FIXLGS TOOLBOX',description:'分数の四則演算、約分、分数と小数の変換をすばやく計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const{locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/fraction-decimal-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/fraction-decimal-calculator',en:'/en/fraction-decimal-calculator',ja:'/ja/fraction-decimal-calculator','x-default':'/ko/fraction-decimal-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const{locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool065FractionDecimalCalculatorPage locale={locale as Locale}/>}
