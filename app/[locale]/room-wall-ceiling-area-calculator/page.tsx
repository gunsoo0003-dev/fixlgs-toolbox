import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool083RoomAreaCalculatorPage} from '@/components/tool-083-room-area-calculator-page';
const meta={ko:{title:'방·벽·천장 면적 계산기 | FIXLGS TOOLBOX',description:'방 치수와 문·창문을 입력해 바닥·벽·천장 및 총 시공면적을 계산합니다.'},en:{title:'Room, Wall & Ceiling Area Calculator | FIXLGS TOOLBOX',description:'Calculate floor, wall, ceiling, and total construction area from room dimensions and door/window openings.'},ja:{title:'部屋・壁・天井面積計算ツール | FIXLGS TOOLBOX',description:'部屋寸法とドア・窓の開口部から床・壁・天井・総施工面積を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/room-wall-ceiling-area-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/room-wall-ceiling-area-calculator',en:'/en/room-wall-ceiling-area-calculator',ja:'/ja/room-wall-ceiling-area-calculator','x-default':'/ko/room-wall-ceiling-area-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool083RoomAreaCalculatorPage locale={locale as Locale}/>}
