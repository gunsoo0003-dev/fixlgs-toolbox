import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool064StatisticsCalculatorPage} from '@/components/tool-064-statistics-calculator-page';
const meta={ko:{title:'평균·통계 계산기 | FIXLGS TOOLBOX',description:'숫자 목록으로 평균, 중앙값, 최빈값과 합계·개수·최소·최대·범위를 빠르게 계산합니다.'},en:{title:'Statistics Calculator | FIXLGS TOOLBOX',description:'Calculate mean, median, mode, sum, count, minimum, maximum, and range from a list of numbers.'},ja:{title:'平均・統計計算ツール | FIXLGS TOOLBOX',description:'数値一覧から平均・中央値・最頻値、合計・件数・最小値・最大値・範囲を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/statistics-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/statistics-calculator',en:'/en/statistics-calculator',ja:'/ja/statistics-calculator','x-default':'/ko/statistics-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool064StatisticsCalculatorPage locale={locale as Locale}/>}
