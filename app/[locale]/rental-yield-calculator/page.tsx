import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool080RentalYieldCalculatorPage} from '@/components/tool-080-rental-yield-calculator-page';
const meta={ko:{title:'임대수익률 계산기 | FIXLGS TOOLBOX',description:'매입가·보증금·월세·관리비·대출이자를 바탕으로 표면 수익률과 실질 수익률, 실투입자본을 계산합니다.'},en:{title:'Rental Yield Calculator | FIXLGS TOOLBOX',description:'Calculate gross and net rental yield and invested capital from purchase price, deposit, rent, management cost, and loan interest.'},ja:{title:'賃貸利回り計算ツール | FIXLGS TOOLBOX',description:'購入価格・保証金・家賃・管理費・ローン利息から表面利回り・実質利回り・投資額を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/rental-yield-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/rental-yield-calculator',en:'/en/rental-yield-calculator',ja:'/ja/rental-yield-calculator','x-default':'/ko/rental-yield-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool080RentalYieldCalculatorPage locale={locale as Locale}/>}
