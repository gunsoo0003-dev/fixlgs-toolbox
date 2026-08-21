import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool074CompoundGrowthPage} from '@/components/tool-074-compound-growth-page';
const meta={ko:{title:'복리·미래자산 계산기 | FIXLGS TOOLBOX',description:'원금·추가 납입·이율·기간으로 복리 미래자산과 목표금액을 계산합니다.'},en:{title:'Compound Growth & Future Value Calculator | FIXLGS TOOLBOX',description:'Calculate compound growth, future value, recurring contributions, and target amounts.'},ja:{title:'複利・将来資産計算ツール | FIXLGS TOOLBOX',description:'元金・追加積立・金利・期間から複利による将来資産と目標金額を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/compound-growth-future-value-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/compound-growth-future-value-calculator',en:'/en/compound-growth-future-value-calculator',ja:'/ja/compound-growth-future-value-calculator','x-default':'/ko/compound-growth-future-value-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool074CompoundGrowthPage locale={locale as Locale}/>}
