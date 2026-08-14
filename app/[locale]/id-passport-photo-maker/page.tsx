import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IdPassportPhotoMakerPage } from "@/components/id-passport-photo-maker-page";
import { locales, type Locale } from "@/lib/site";

const title: Record<Locale,string> = {
  ko: "증명사진·여권사진 제작기 - 국가별 규격·A4 인쇄 | FIXLGS TOOLBOX",
  en: "ID & Passport Photo Maker - Country Sizes & A4 Print | FIXLGS TOOLBOX",
  ja: "証明写真・パスポート写真作成ツール - 国別規格・A4印刷 | FIXLGS TOOLBOX",
};
const desc: Record<Locale,string> = {
  ko: "여권·증명·취업사진을 국가별 규격에 맞춰 자르고 얼굴 위치를 확인한 뒤 디지털 파일 또는 A4 인쇄용으로 배치합니다.",
  en: "Crop passport, ID and employment photos to country presets, check face position, and export a digital file or A4 print layout.",
  ja: "パスポート・証明・就職写真を国別規格に合わせ、顔位置を確認してデジタル画像またはA4印刷配置で出力します。",
};

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  const current=locale as Locale;
  const canonical=`https://toolbox.fixlgs.com/${current}/id-passport-photo-maker`;
  return {title:title[current],description:desc[current],alternates:{canonical,languages:{ko:"https://toolbox.fixlgs.com/ko/id-passport-photo-maker",en:"https://toolbox.fixlgs.com/en/id-passport-photo-maker",ja:"https://toolbox.fixlgs.com/ja/id-passport-photo-maker","x-default":"https://toolbox.fixlgs.com/ko/id-passport-photo-maker"}},openGraph:{title:title[current],description:desc[current],url:canonical,type:"website"}};
}

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  return <IdPassportPhotoMakerPage locale={locale as Locale}/>;
}
