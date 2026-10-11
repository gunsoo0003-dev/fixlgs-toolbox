import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppStoreScreenshotMakerPage } from "@/components/app-store-screenshot-maker-page";
import { locales, type Locale } from "@/lib/site";

const title: Record<Locale,string> = { ko: "앱스토어 스크린샷 제작기 - TOOLBOX", en: "App Store Screenshot Maker - TOOLBOX", ja: "アプリストア スクリーンショット作成ツール - TOOLBOX" };
const desc: Record<Locale,string> = { ko: "App Store·Google Play 등록용 앱 스크린샷을 휴대폰 프레임, 제목·설명, 배경과 다국어 문구로 제작하세요.", en: "Create App Store and Google Play screenshots with device frames, titles, descriptions, backgrounds, and localized copy.", ja: "App Store・Google Play登録用スクリーンショットを端末フレーム、タイトル・説明、背景、多言語テキスト付きで作成できます。" };

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  const current=locale as Locale;
  const canonical=`https://toolbox.fixlgs.com/${current}/app-store-screenshot-maker`;
  return { title:title[current], description:desc[current], alternates:{canonical,languages:{ko:"https://toolbox.fixlgs.com/ko/app-store-screenshot-maker",en:"https://toolbox.fixlgs.com/en/app-store-screenshot-maker",ja:"https://toolbox.fixlgs.com/ja/app-store-screenshot-maker","x-default":"https://toolbox.fixlgs.com/ko/app-store-screenshot-maker"}}, openGraph:{title:title[current],description:desc[current],url:canonical,type:"website"} };
}

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  return <AppStoreScreenshotMakerPage locale={locale as Locale}/>;
}
