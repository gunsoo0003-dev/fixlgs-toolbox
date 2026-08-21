import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool081AreaPriceCalculatorPage} from '@/components/tool-081-area-price-calculator-page';
const meta={ko:{title:'평수·평당가격 계산기 | FIXLGS TOOLBOX',description:'㎡와 평을 변환하고 공급·전용면적 기준 평당 가격과 ㎡당 가격을 계산합니다.'},en:{title:'Area & Price per Unit Calculator | FIXLGS TOOLBOX',description:'Convert square meters and pyeong and calculate price per pyeong and per square meter for gross and exclusive areas.'},ja:{title:'面積・坪単価計算ツール | FIXLGS TOOLBOX',description:'㎡と坪を変換し、供給・専有面積基準の坪単価・㎡単価を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/area-price-per-unit-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/area-price-per-unit-calculator',en:'/en/area-price-per-unit-calculator',ja:'/ja/area-price-per-unit-calculator','x-default':'/ko/area-price-per-unit-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool081AreaPriceCalculatorPage locale={locale as Locale}/>}
