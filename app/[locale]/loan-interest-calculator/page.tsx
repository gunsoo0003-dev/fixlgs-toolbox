import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool075LoanCalculatorPage} from '@/components/tool-075-loan-calculator-page';
const meta={ko:{title:'대출이자 계산기 | FIXLGS TOOLBOX',description:'원리금 균등·원금 균등·만기일시 상환 방식의 월 납부액과 총이자, 월별 상환표를 계산합니다.'},en:{title:'Loan Interest Calculator | FIXLGS TOOLBOX',description:'Calculate monthly payments, total interest, and amortization schedules for equal-payment, equal-principal, and bullet repayment.'},ja:{title:'ローン利息計算ツール | FIXLGS TOOLBOX',description:'元利均等・元金均等・元金一括返済の月返済額、総利息、月別返済表を計算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/loan-interest-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/loan-interest-calculator',en:'/en/loan-interest-calculator',ja:'/ja/loan-interest-calculator','x-default':'/ko/loan-interest-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool075LoanCalculatorPage locale={locale as Locale}/>}
