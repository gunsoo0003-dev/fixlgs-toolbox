import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfToImageConverterPage } from "@/components/pdf-to-image-converter-page";
import { locales, type Locale } from "@/lib/site";

const titles: Record<Locale, string> = {
  ko: "PDF 이미지 변환기 - PDF를 JPG·PNG로 변환 | FIXLGS TOOLBOX",
  en: "PDF to Image Converter - PDF to JPG & PNG | FIXLGS TOOLBOX",
  ja: "PDF 画像変換ツール - PDFをJPG・PNGへ | FIXLGS TOOLBOX",
};
const descriptions: Record<Locale, string> = {
  ko: "PDF 페이지를 JPG·PNG 이미지로 변환하고 원하는 페이지와 해상도를 선택해 개별 파일 또는 ZIP으로 저장하세요.",
  en: "Convert PDF pages to JPG or PNG, choose specific pages and render resolution, then download individual images or a ZIP.",
  ja: "PDFページをJPG・PNG画像に変換し、必要なページと解像度を選んで個別ファイルまたはZIPで保存できます。",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const current = locale as Locale;
  const canonical = `https://toolbox.fixlgs.com/${current}/pdf-to-image-converter`;
  return {
    title: titles[current],
    description: descriptions[current],
    alternates: {
      canonical,
      languages: {
        ko: "https://toolbox.fixlgs.com/ko/pdf-to-image-converter",
        en: "https://toolbox.fixlgs.com/en/pdf-to-image-converter",
        ja: "https://toolbox.fixlgs.com/ja/pdf-to-image-converter",
        "x-default": "https://toolbox.fixlgs.com/en/pdf-to-image-converter",
      },
    },
    openGraph: { title: titles[current], description: descriptions[current], url: canonical, type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return <PdfToImageConverterPage locale={locale as Locale} />;
}
