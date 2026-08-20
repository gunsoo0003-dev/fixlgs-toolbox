import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool063RatioProportionCalculatorPage} from '@/components/tool-063-ratio-proportion-calculator-page';
const meta={ko:{title:'비율·비례 계산기 | FIXLGS TOOLBOX',description:'비율 단순화, 비례식의 빈칸, 동치 비율, 배율을 한 페이지에서 빠르게 계산합니다.'},en:{title:'Ratio & Proportion Calculator | FIXLGS TOOLBOX',description:'Simplify ratios, solve missing proportion values, check equivalent ratios, and scale ratios.'},ja:{title:'比率・比例計算ツール | FIXLGS TOOLBOX',description:'比率の簡単化、比例式の未知数、同値比、倍率を1ページですばやく計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/ratio-proportion-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/ratio-proportion-calculator',en:'/en/ratio-proportion-calculator',ja:'/ja/ratio-proportion-calculator','x-default':'/ko/ratio-proportion-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool063RatioProportionCalculatorPage locale={locale as Locale}/>}
