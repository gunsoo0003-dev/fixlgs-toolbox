import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool062DiscountPriceCalculatorPage} from '@/components/tool-062-discount-price-calculator-page';
const meta={
 ko:{title:'할인 가격 계산기 | FIXLGS TOOLBOX',description:'할인율과 정가로 할인금액과 최종가격을 계산하고 추가 할인과 실질 할인율까지 확인합니다.'},
 en:{title:'Discount Price Calculator | FIXLGS TOOLBOX',description:'Calculate savings and final prices from an original price and discount, including additional stacked discounts.'},
 ja:{title:'割引価格計算ツール | FIXLGS TOOLBOX',description:'元の価格と割引率から割引額・最終価格を計算し、追加割引と実質割引率も確認できます。'}
} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/discount-price-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/discount-price-calculator',en:'/en/discount-price-calculator',ja:'/ja/discount-price-calculator','x-default':'/ko/discount-price-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool062DiscountPriceCalculatorPage locale={locale as Locale}/>}
