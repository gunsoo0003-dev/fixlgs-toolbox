import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool090StairRampCalculatorPage} from '@/components/tool-090-stair-ramp-calculator-page';
const meta={ko:{title:'계단·경사로 계산기 | FIXLGS TOOLBOX',description:'전체 높이와 수평거리, 계단 수와 단너비로 경사길이·경사율·경사각·단높이를 계산합니다.'},en:{title:'Stair & Ramp Calculator | FIXLGS TOOLBOX',description:'Calculate stair riser and tread dimensions, horizontal run, sloped length, slope percentage, and slope angle.'},ja:{title:'階段・スロープ計算ツール | FIXLGS TOOLBOX',description:'全高・水平距離・段数・踏面から斜長、勾配率、勾配角、蹴上げを計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/stair-ramp-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/stair-ramp-calculator',en:'/en/stair-ramp-calculator',ja:'/ja/stair-ramp-calculator','x-default':'/ko/stair-ramp-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool090StairRampCalculatorPage locale={locale as Locale}/>}
