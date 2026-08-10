import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {AppIconFaviconGeneratorPage} from '@/components/app-icon-favicon-generator-page';
import {locales,type Locale} from '@/lib/site';

const titles:Record<Locale,string>={
  ko:'앱 아이콘·파비콘 생성기 - Android·PWA·ICO 만들기 | FIXLGS TOOLBOX',
  en:'App Icon & Favicon Generator - Android, PWA & ICO | FIXLGS TOOLBOX',
  ja:'アプリアイコン・ファビコン生成ツール - Android・PWA・ICO | FIXLGS TOOLBOX',
};
const descriptions:Record<Locale,string>={
  ko:'PNG·JPG·WebP 이미지를 Android 앱 아이콘, PWA 192×192·512×512, maskable 아이콘과 favicon.ico로 변환하고 ZIP으로 다운로드합니다.',
  en:'Convert PNG, JPG and WebP images into Android app icons, PWA 192×192 and 512×512 icons, maskable icons and favicon.ico, then download ZIP bundles.',
  ja:'PNG・JPG・WebP画像からAndroidアプリアイコン、PWA 192×192・512×512、maskableアイコン、favicon.icoを生成し、ZIPで保存できます。',
};

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  const current=locale as Locale;
  const canonical=`https://toolbox.fixlgs.com/${current}/app-icon-favicon-generator`;
  return {
    title:titles[current],
    description:descriptions[current],
    alternates:{
      canonical,
      languages:{
        ko:'https://toolbox.fixlgs.com/ko/app-icon-favicon-generator',
        en:'https://toolbox.fixlgs.com/en/app-icon-favicon-generator',
        ja:'https://toolbox.fixlgs.com/ja/app-icon-favicon-generator',
        'x-default':'https://toolbox.fixlgs.com/ko/app-icon-favicon-generator',
      },
    },
  };
}

export default async function Tool023Route({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!locales.includes(locale as Locale)) notFound();
  return <AppIconFaviconGeneratorPage locale={locale as Locale}/>;
}
