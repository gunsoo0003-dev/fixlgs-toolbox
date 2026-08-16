import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TextWhitespaceLinebreakCleanerPage } from "@/components/text-whitespace-linebreak-cleaner-page";
import { locales, type Locale } from "@/lib/site";

const title: Record<Locale,string> = {
  ko:"텍스트 공백·줄바꿈 정리기 | FIXLGS TOOLBOX",
  en:"Text Whitespace & Line Break Cleaner | FIXLGS TOOLBOX",
  ja:"テキスト空白・改行整理ツール | FIXLGS TOOLBOX",
};
const description: Record<Locale,string> = {
  ko:"연속 공백, 각 줄 앞뒤 공백, 탭, 빈 줄을 정리하고 LF·CRLF 줄바꿈 코드를 통일해 결과를 복사하거나 TXT로 저장하세요.",
  en:"Clean repeated spaces, line-edge whitespace, tabs and blank lines, normalize LF or CRLF line endings, then copy or save the result as TXT.",
  ja:"連続スペース、各行の前後空白、タブ、空行を整理し、LF・CRLFの改行コードを統一してコピーまたはTXT保存できます。",
};

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  const l=locale as Locale;
  const canonical=`https://toolbox.fixlgs.com/${l}/text-whitespace-linebreak-cleaner`;
  return {title:title[l],description:description[l],alternates:{canonical,languages:{ko:"https://toolbox.fixlgs.com/ko/text-whitespace-linebreak-cleaner",en:"https://toolbox.fixlgs.com/en/text-whitespace-linebreak-cleaner",ja:"https://toolbox.fixlgs.com/ja/text-whitespace-linebreak-cleaner","x-default":"https://toolbox.fixlgs.com/ko/text-whitespace-linebreak-cleaner"}},openGraph:{title:title[l],description:description[l],url:canonical,type:"website"}};
}

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  return <TextWhitespaceLinebreakCleanerPage locale={locale as Locale}/>;
}
