import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterDocumentCounterPage } from "@/components/character-document-counter-page";
import { locales, type Locale } from "@/lib/site";

const title: Record<Locale,string> = {
  ko:"글자 수·단어 수·문서 통계 계산기 | FIXLGS TOOLBOX",
  en:"Character & Document Statistics Counter | FIXLGS TOOLBOX",
  ja:"文字数・文書統計カウンター | FIXLGS TOOLBOX",
};
const description: Record<Locale,string> = {
  ko:"공백 포함·제외 글자 수, 단어·문장·문단·줄 수, UTF-8 바이트와 예상 읽기시간을 브라우저에서 즉시 확인하세요.",
  en:"Instantly count characters with and without spaces, words, sentences, paragraphs, lines, UTF-8 bytes, and estimated reading time in your browser.",
  ja:"空白を含む・除く文字数、単語・文・段落・行数、UTF-8バイト、推定読了時間をブラウザですぐ確認できます。",
};

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  const l=locale as Locale;
  const canonical=`https://toolbox.fixlgs.com/${l}/character-document-counter`;
  return {title:title[l],description:description[l],alternates:{canonical,languages:{ko:"https://toolbox.fixlgs.com/ko/character-document-counter",en:"https://toolbox.fixlgs.com/en/character-document-counter",ja:"https://toolbox.fixlgs.com/ja/character-document-counter","x-default":"https://toolbox.fixlgs.com/ko/character-document-counter"}},openGraph:{title:title[l],description:description[l],url:canonical,type:"website"}};
}

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  return <CharacterDocumentCounterPage locale={locale as Locale}/>;
}
