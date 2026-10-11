import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TextFindReplacePage } from "@/components/text-find-replace-page";
import { locales, type Locale } from "@/lib/site";
const title:Record<Locale,string>={ko:"텍스트 찾기·바꾸기 | FIXLGS TOOLBOX",en:"Find & Replace Text | FIXLGS TOOLBOX",ja:"テキスト検索・置換ツール | FIXLGS TOOLBOX"};
const description:Record<Locale,string>={ko:"긴 텍스트에서 한 번에 여러 단어를 찾아 바꾸고 대소문자 정책과 변경 횟수를 확인하세요.",en:"Find and replace one or many text values at once with explicit case-sensitivity and replacement counts.",ja:"長いテキストから複数の文字列をまとめて検索・置換し、大文字小文字と変更回数を確認できます。"};
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))notFound();const l=locale as Locale;const canonical=`https://toolbox.fixlgs.com/${l}/text-find-replace`;return{title:title[l],description:description[l],alternates:{canonical,languages:{ko:`https://toolbox.fixlgs.com/ko/text-find-replace`,en:`https://toolbox.fixlgs.com/en/text-find-replace`,ja:`https://toolbox.fixlgs.com/ja/text-find-replace`,"x-default":`https://toolbox.fixlgs.com/ko/text-find-replace`}},openGraph:{title:title[l],description:description[l],url:canonical,type:"website"}};}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <TextFindReplacePage locale={locale as Locale}/>;}
