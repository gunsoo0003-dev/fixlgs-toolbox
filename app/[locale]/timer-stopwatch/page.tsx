import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {TimerStopwatchPage} from "@/components/timer-stopwatch-page";
import {locales,type Locale} from "@/lib/site";
const meta={ko:{title:"타이머·스톱워치 - 카운트다운·구간 기록 | FIXLGS TOOLBOX",description:"카운트다운, 스톱워치, Lap·Split 구간 기록, Work·Rest 반복 타이머를 브라우저에서 바로 사용하세요."},en:{title:"Timer & Stopwatch - Countdown, Laps & Repeat Timer",description:"Run a countdown, stopwatch with lap timing, and a Work/Rest repeat timer directly in your browser."},ja:{title:"タイマー・ストップウォッチ - ラップ・繰り返し | FIXLGS TOOLBOX",description:"カウントダウン、ストップウォッチ、ラップ記録、作業・休憩の繰り返しタイマーをブラウザですぐ使えます。"}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/timer-stopwatch`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:"/ko/timer-stopwatch",en:"/en/timer-stopwatch",ja:"/ja/timer-stopwatch","x-default":"/ko/timer-stopwatch"}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <TimerStopwatchPage locale={locale as Locale}/>}
