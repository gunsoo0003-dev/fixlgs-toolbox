import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool069BreakEvenCalculatorPage} from '@/components/tool-069-break-even-calculator-page';
const meta={ko:{title:'손익분기점 계산기 | FIXLGS TOOLBOX',description:'고정비·판매가·변동비로 상품당 이익과 손익분기 판매량·매출을 계산합니다.'},en:{title:'Break-even Point Calculator | FIXLGS TOOLBOX',description:'Calculate contribution margin, break-even units, and break-even revenue from fixed costs, selling price, and variable cost.'},ja:{title:'損益分岐点計算ツール | FIXLGS TOOLBOX',description:'固定費・販売価格・変動費から限界利益と損益分岐点の販売数量・売上を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const{locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/break-even-point-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/break-even-point-calculator',en:'/en/break-even-point-calculator',ja:'/ja/break-even-point-calculator','x-default':'/ko/break-even-point-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const{locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool069BreakEvenCalculatorPage locale={locale as Locale}/>}
