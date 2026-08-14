import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MergePdfPage } from "@/components/merge-pdf-page";
import { locales, type Locale } from "@/lib/site";

const title: Record<Locale, string> = {
  ko: "PDF 합치기 - 여러 PDF 순서대로 병합 | FIXLGS TOOLBOX",
  en: "Merge PDF - Combine PDFs in Order | FIXLGS TOOLBOX",
  ja: "PDF 結合ツール - 複数PDFを順番どおりに結合 | FIXLGS TOOLBOX",
};

const description: Record<Locale, string> = {
  ko: "여러 PDF를 원하는 순서로 정렬하고 페이지를 미리 확인한 뒤, 브라우저에서 원본 페이지를 재렌더링하지 않고 하나의 PDF로 병합합니다.",
  en: "Arrange multiple PDFs, preview their pages, then combine the original PDF pages into one file locally in your browser without rasterizing them.",
  ja: "複数のPDFを希望の順番に並べ、ページを確認してから、元ページを画像化せずブラウザ内で1つのPDFに結合します。",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const current = locale as Locale;
  const canonical = `https://toolbox.fixlgs.com/${current}/merge-pdf`;
  return {
    title: title[current],
    description: description[current],
    alternates: {
      canonical,
      languages: {
        ko: "https://toolbox.fixlgs.com/ko/merge-pdf",
        en: "https://toolbox.fixlgs.com/en/merge-pdf",
        ja: "https://toolbox.fixlgs.com/ja/merge-pdf",
        "x-default": "https://toolbox.fixlgs.com/ko/merge-pdf",
      },
    },
    openGraph: { title: title[current], description: description[current], url: canonical, type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return <MergePdfPage locale={locale as Locale} />;
}
