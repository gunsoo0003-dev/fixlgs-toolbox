import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool073DepositSavingsCalculatorPage} from '@/components/tool-073-deposit-savings-calculator-page';
const meta={
 ko:{title:'예금·적금 계산기 | FIXLGS TOOLBOX',description:'예금과 적금의 총 원금, 세전 이자, 만기금액과 세후 참고값을 계산합니다.'},
 en:{title:'Deposit & Savings Calculator | FIXLGS TOOLBOX',description:'Calculate principal, pre-tax interest, maturity amounts, and reference after-tax values for deposits and savings.'},
 ja:{title:'預金・積立計算ツール | FIXLGS TOOLBOX',description:'預金と積立の元本合計、税引前利息、満期額、税引後参考値を計算します。'}
} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/deposit-savings-calculator`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/deposit-savings-calculator',en:'/en/deposit-savings-calculator',ja:'/ja/deposit-savings-calculator','x-default':'/ko/deposit-savings-calculator'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool073DepositSavingsCalculatorPage locale={locale as Locale}/>}
