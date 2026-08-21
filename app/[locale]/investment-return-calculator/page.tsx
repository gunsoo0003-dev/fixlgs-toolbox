import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool077InvestmentReturnCalculatorPage} from '@/components/tool-077-investment-return-calculator-page';
const meta={ko:{title:'투자수익률 계산기 | FIXLGS TOOLBOX',description:'매입금액·현재 평가금·보유기간으로 총 수익률과 연환산수익률을 계산합니다.'},en:{title:'Investment Return Calculator | FIXLGS TOOLBOX',description:'Calculate total return and annualized return from purchase amount, current value, and holding period.'},ja:{title:'投資収益率計算ツール | FIXLGS TOOLBOX',description:'購入金額・現在評価額・保有期間から収益率と年率換算収益率を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/investment-return-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/investment-return-calculator',en:'/en/investment-return-calculator',ja:'/ja/investment-return-calculator','x-default':'/ko/investment-return-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool077InvestmentReturnCalculatorPage locale={locale as Locale}/>}
