import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool055LengthAreaVolumeConverterPage} from '@/components/tool-055-length-area-volume-converter-page';
const meta={
 ko:{title:'길이·면적·부피 변환기 | FIXLGS TOOLBOX',description:'길이, 면적, 평·㎡, 부피 단위를 빠르게 변환하고 자주 쓰는 단위를 한눈에 비교합니다.'},
 en:{title:'Length, Area & Volume Converter | FIXLGS TOOLBOX',description:'Convert length, area, pyeong/square meters, and volume units and compare common units at a glance.'},
 ja:{title:'長さ・面積・体積変換ツール | FIXLGS TOOLBOX',description:'長さ、面積、坪・平方メートル、体積の単位を変換し、よく使う単位を一覧で比較します。'}
} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/length-area-volume-converter`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/length-area-volume-converter',en:'/en/length-area-volume-converter',ja:'/ja/length-area-volume-converter','x-default':'/ko/length-area-volume-converter'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool055LengthAreaVolumeConverterPage locale={locale as Locale}/>}
