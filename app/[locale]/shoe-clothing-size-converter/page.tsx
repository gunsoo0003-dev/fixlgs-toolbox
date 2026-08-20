import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool060ShoeClothingSizeConverterPage} from '@/components/tool-060-shoe-clothing-size-converter-page';
const meta={ko:{title:'신발·의류 사이즈 변환기 | FIXLGS TOOLBOX',description:'한국·미국·영국·유럽·일본의 신발·의류 사이즈를 남성·여성·아동별로 비교합니다.'},en:{title:'Shoe & Clothing Size Converter | FIXLGS TOOLBOX',description:'Compare shoe and clothing sizes across Korea, US, UK, EU, and Japan for men, women, and kids.'},ja:{title:'靴・衣類サイズ変換ツール | FIXLGS TOOLBOX',description:'韓国・米国・英国・EU・日本の靴・衣類サイズをメンズ・レディース・キッズ別に比較します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/shoe-clothing-size-converter`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/shoe-clothing-size-converter',en:'/en/shoe-clothing-size-converter',ja:'/ja/shoe-clothing-size-converter','x-default':'/ko/shoe-clothing-size-converter'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool060ShoeClothingSizeConverterPage locale={locale as Locale}/>}
