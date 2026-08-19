import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool056WeightTemperaturePressureConverterPage} from '@/components/tool-056-weight-temperature-pressure-converter-page';
const meta={
 ko:{title:'무게·온도·압력 변환기 | FIXLGS TOOLBOX',description:'무게, 온도, 압력 단위를 빠르게 변환하고 원하는 소수점으로 결과를 확인합니다.'},
 en:{title:'Weight, Temperature & Pressure Converter | FIXLGS TOOLBOX',description:'Convert mass, temperature, and pressure units with controllable decimal precision.'},
 ja:{title:'重量・温度・圧力変換ツール | FIXLGS TOOLBOX',description:'重量、温度、圧力の単位を変換し、小数点の精度を指定して結果を確認できます。'}
} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/weight-temperature-pressure-converter`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/weight-temperature-pressure-converter',en:'/en/weight-temperature-pressure-converter',ja:'/ja/weight-temperature-pressure-converter','x-default':'/ko/weight-temperature-pressure-converter'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool056WeightTemperaturePressureConverterPage locale={locale as Locale}/>}
