import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DateAddSubtractCalculatorPage } from "@/components/date-add-subtract-calculator-page";
import { locales, type Locale } from "@/lib/site";

const meta={
 ko:{title:"날짜 더하기·빼기 계산기 | 일·주·개월·년 날짜 계산",description:"기준 날짜에 일·주·개월·년을 더하거나 빼서 결과 날짜와 요일을 계산하세요. 월말·윤년 보정까지 브라우저에서 처리합니다."},
 en:{title:"Date Add & Subtract Calculator | Days, Weeks, Months, Years",description:"Add or subtract days, weeks, months, or years from a date and get the exact result date and weekday with month-end and leap-year handling."},
 ja:{title:"日付加算・減算計算ツール | 日・週・か月・年",description:"基準日に日・週・か月・年を加算・減算し、結果の日付と曜日を計算します。月末とうるう年の補正にも対応します。"}
} as const;

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
 const {locale}=await params;
 if(!locales.includes(locale as Locale))return{};
 const l=locale as Locale,path=`/${l}/date-add-subtract-calculator`;
 return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:"/ko/date-add-subtract-calculator",en:"/en/date-add-subtract-calculator",ja:"/ja/date-add-subtract-calculator","x-default":"/ko/date-add-subtract-calculator"}}};
}

export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <DateAddSubtractCalculatorPage locale={locale as Locale}/>;}
