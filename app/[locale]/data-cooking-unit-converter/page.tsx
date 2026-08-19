import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool058DataCookingUnitConverterPage} from '@/components/tool-058-data-cooking-unit-converter-page';
const meta={
 ko:{title:'데이터·요리 단위 변환기 | FIXLGS TOOLBOX',description:'bit·byte와 1000·1024 기준의 데이터 단위, 컵·큰술·작은술·mL 요리 단위를 변환합니다.'},
 en:{title:'Data & Cooking Unit Converter | FIXLGS TOOLBOX',description:'Convert data sizes with decimal or binary notation and common cooking measures such as cups, tablespoons, teaspoons, and milliliters.'},
 ja:{title:'データ・料理単位変換ツール | FIXLGS TOOLBOX',description:'bit・byteの1000・1024基準と、カップ・大さじ・小さじ・mLの料理単位を変換します。'}
} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/data-cooking-unit-converter`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/data-cooking-unit-converter',en:'/en/data-cooking-unit-converter',ja:'/ja/data-cooking-unit-converter','x-default':'/ko/data-cooking-unit-converter'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool058DataCookingUnitConverterPage locale={locale as Locale}/>}
