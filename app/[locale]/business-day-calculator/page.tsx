import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Tool050BusinessDayCalculatorPage} from '@/components/tool-050-business-day-calculator-page';
import {locales,type Locale} from '@/lib/site';
const meta={ko:{title:'평일·영업일 계산기 | 공휴일 제외·영업일 N일 후',description:'한국·미국·일본 공휴일과 주말을 제외해 두 날짜 사이 영업일 수 또는 N 영업일 후·전 날짜를 계산합니다.'},en:{title:'Business Days Calculator | Holidays & Working Days',description:'Calculate business days between dates or add business days with weekend and holiday exclusion for Korea, the United States, and Japan.'},ja:{title:'平日・営業日計算ツール | 祝日除外・N営業日後',description:'韓国・米国・日本の土日と祝日を除いて、営業日数やN営業日後・前の日付を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/business-day-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/business-day-calculator',en:'/en/business-day-calculator',ja:'/ja/business-day-calculator','x-default':'/ko/business-day-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool050BusinessDayCalculatorPage locale={locale as Locale}/>}
