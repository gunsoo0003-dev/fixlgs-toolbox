import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TextDiffComparePage } from "@/components/text-diff-compare-page";
import { locales, type Locale } from "@/lib/site";
const title:Record<Locale,string>={ko:"두 텍스트 비교기 | FIXLGS TOOLBOX",en:"Text Diff & Compare | FIXLGS TOOLBOX",ja:"2つのテキスト比較ツール | FIXLGS TOOLBOX"};
const description:Record<Locale,string>={ko:"두 텍스트의 추가·삭제·변경 내용을 줄 단위와 단어 단위로 비교하고 결과 보고서를 복사하세요.",en:"Compare two texts by line and word, identify additions, removals and changes, and copy a plain-text diff report.",ja:"2つのテキストの追加・削除・変更を行単位・単語単位で比較し、差分レポートをコピーできます。"};
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))notFound();const l=locale as Locale;const canonical=`https://toolbox.fixlgs.com/${l}/text-diff-compare`;return{title:title[l],description:description[l],alternates:{canonical,languages:{ko:`https://toolbox.fixlgs.com/ko/text-diff-compare`,en:`https://toolbox.fixlgs.com/en/text-diff-compare`,ja:`https://toolbox.fixlgs.com/ja/text-diff-compare`,"x-default":`https://toolbox.fixlgs.com/ko/text-diff-compare`}},openGraph:{title:title[l],description:description[l],url:canonical,type:"website"}};}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <TextDiffComparePage locale={locale as Locale}/>;}
