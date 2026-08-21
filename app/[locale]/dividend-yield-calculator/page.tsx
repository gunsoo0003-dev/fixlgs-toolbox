import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool079DividendYieldCalculatorPage} from '@/components/tool-079-dividend-yield-calculator-page';
const meta={ko:{title:'배당수익률 계산기 | FIXLGS TOOLBOX',description:'주가와 주당 배당금으로 배당수익률과 예상 연간 배당금을 계산합니다.'},en:{title:'Dividend Yield Calculator | FIXLGS TOOLBOX',description:'Calculate dividend yield and expected annual dividends from share price, dividend per share, and shares held.'},ja:{title:'配当利回り計算ツール | FIXLGS TOOLBOX',description:'株価と1株当たり配当金から配当利回りと予想年間配当金を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/dividend-yield-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/dividend-yield-calculator',en:'/en/dividend-yield-calculator',ja:'/ja/dividend-yield-calculator','x-default':'/ko/dividend-yield-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool079DividendYieldCalculatorPage locale={locale as Locale}/>}
