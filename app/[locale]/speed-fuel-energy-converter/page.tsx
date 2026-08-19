import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool057SpeedFuelEnergyConverterPage} from '@/components/tool-057-speed-fuel-energy-converter-page';
const meta={
 ko:{title:'속도·연비·에너지 변환기 | FIXLGS TOOLBOX',description:'속도, 연비, 에너지·전력·마력 단위를 빠르게 변환합니다.'},
 en:{title:'Speed, Fuel Economy & Energy Converter | FIXLGS TOOLBOX',description:'Convert speed, fuel economy, energy, power, and horsepower units quickly.'},
 ja:{title:'速度・燃費・エネルギー変換ツール | FIXLGS TOOLBOX',description:'速度、燃費、エネルギー・電力・馬力の単位をすばやく変換します。'}
} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/speed-fuel-energy-converter`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/speed-fuel-energy-converter',en:'/en/speed-fuel-energy-converter',ja:'/ja/speed-fuel-energy-converter','x-default':'/ko/speed-fuel-energy-converter'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool057SpeedFuelEnergyConverterPage locale={locale as Locale}/>}
