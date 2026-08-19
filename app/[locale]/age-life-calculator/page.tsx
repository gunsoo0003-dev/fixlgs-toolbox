import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgeLifeCalculatorPage } from "@/components/age-life-calculator-page";
import { locales, type Locale } from "@/lib/site";
const meta={ko:{title:"나이·생후기간 계산기 - 만나이·연나이·생후 일수 | FIXLGS TOOLBOX",description:"생년월일과 기준일로 만나이, 연나이, 생후 일수, 다음 생일까지 남은 날짜를 브라우저에서 계산하세요."},en:{title:"Age & Elapsed Life Calculator - Age, Days & Next Birthday | FIXLGS TOOLBOX",description:"Calculate calendar age, year age, days since birth, and days until the next birthday locally in your browser."},ja:{title:"年齢・生後期間計算ツール - 満年齢・生後日数 | FIXLGS TOOLBOX",description:"生年月日と基準日から満年齢、年基準の年齢、生後日数、次の誕生日までをブラウザ内で計算します。"}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const{locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/age-life-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:"/ko/age-life-calculator",en:"/en/age-life-calculator",ja:"/ja/age-life-calculator","x-default":"/ko/age-life-calculator"}}};}
export default async function Page({params}:{params:Promise<{locale:string}>}){const{locale}=await params;if(!locales.includes(locale as Locale))notFound();return <AgeLifeCalculatorPage locale={locale as Locale}/>}
