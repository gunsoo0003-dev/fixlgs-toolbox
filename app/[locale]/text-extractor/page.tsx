import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TextExtractorPage } from "@/components/text-extractor-page";
import { locales, type Locale } from "@/lib/site";

const title: Record<Locale,string>={ko:"텍스트 추출기 | FIXLGS TOOLBOX",en:"Text Data Extractor | FIXLGS TOOLBOX",ja:"テキスト抽出 | FIXLGS TOOLBOX"};
const description: Record<Locale,string>={ko:"숫자, 한글·영어, 이메일, URL, 전화번호, 해시태그를 브라우저에서 유형별로 빠르게 추출하세요.",en:"Extract numbers, Korean, English, emails, URLs, phone numbers, and hashtags by type in your browser.",ja:"数字、韓国語・英語、メール、URL、電話番号、ハッシュタグをブラウザで種類別に抽出します。"};
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))notFound();const l=locale as Locale;const canonical=`https://toolbox.fixlgs.com/${l}/text-extractor`;return{title:title[l],description:description[l],alternates:{canonical,languages:{ko:"https://toolbox.fixlgs.com/ko/text-extractor",en:"https://toolbox.fixlgs.com/en/text-extractor",ja:"https://toolbox.fixlgs.com/ja/text-extractor","x-default":"https://toolbox.fixlgs.com/ko/text-extractor"}},openGraph:{title:title[l],description:description[l],url:canonical,type:"website"}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <TextExtractorPage locale={locale as Locale}/>}
