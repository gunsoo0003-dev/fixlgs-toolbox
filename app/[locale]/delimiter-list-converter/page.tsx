import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DelimiterListConverterPage } from "@/components/delimiter-list-converter-page";
import { locales, type Locale } from "@/lib/site";

const title:Record<Locale,string>={ko:"구분자·목록 변환기 | FIXLGS TOOLBOX",en:"Delimiter & List Converter | FIXLGS TOOLBOX",ja:"区切り文字・リスト変換ツール | FIXLGS TOOLBOX"};
const description:Record<Locale,string>={ko:"줄바꿈·쉼표·탭·사용자 구분자를 서로 변환하고 따옴표·번호·글머리표를 브라우저에서 추가하세요.",en:"Convert new lines, commas, tabs, and custom delimiters, then add quotes, numbers, or bullets locally in your browser.",ja:"改行・カンマ・タブ・カスタム区切り文字を変換し、引用符・番号・箇条書きをブラウザ内で追加できます。"};

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))notFound();const l=locale as Locale;const canonical=`https://toolbox.fixlgs.com/${l}/delimiter-list-converter`;return{title:title[l],description:description[l],alternates:{canonical,languages:{ko:"https://toolbox.fixlgs.com/ko/delimiter-list-converter",en:"https://toolbox.fixlgs.com/en/delimiter-list-converter",ja:"https://toolbox.fixlgs.com/ja/delimiter-list-converter","x-default":"https://toolbox.fixlgs.com/ko/delimiter-list-converter"}},openGraph:{title:title[l],description:description[l],url:canonical,type:"website"}};}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <DelimiterListConverterPage locale={locale as Locale}/>;}
