import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {locales,type Locale} from '@/lib/site';
import {Tool072SalaryConverterPage} from '@/components/tool-072-salary-converter-page';
const meta={ko:{title:'시급·월급·연봉 환산기 | FIXLGS TOOLBOX',description:'시급·일급·월급·연봉을 근무시간 기준으로 상호 환산하고 적용한 근무시간 가정을 함께 확인합니다.'},en:{title:'Hourly, Monthly & Annual Salary Converter | FIXLGS TOOLBOX',description:'Convert hourly, daily, monthly and annual pay with editable paid-hour assumptions.'},ja:{title:'時給・月給・年収換算ツール | FIXLGS TOOLBOX',description:'時給・日給・月給・年収を編集可能な勤務時間条件で相互換算します。'}} as const;
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale,path=`/${l}/salary-converter`;return{title:meta[l].title,description:meta[l].description,alternates:{canonical:path,languages:{ko:'/ko/salary-converter',en:'/en/salary-converter',ja:'/ja/salary-converter','x-default':'/ko/salary-converter'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <Tool072SalaryConverterPage locale={locale as Locale}/>}
