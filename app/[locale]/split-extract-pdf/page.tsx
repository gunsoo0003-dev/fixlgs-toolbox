import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplitExtractPdfPage } from "@/components/split-extract-pdf-page";
import { locales, type Locale } from "@/lib/site";

const title: Record<Locale, string> = {
  ko: "PDF 분할·페이지 추출기 - 페이지 나누기·추출 | FIXLGS TOOLBOX",
  en: "Split & Extract PDF - Page Split & Extraction | FIXLGS TOOLBOX",
  ja: "PDF 分割・ページ抽出ツール - ページ分割・抽出 | FIXLGS TOOLBOX",
};
const description: Record<Locale, string> = {
  ko: "PDF 페이지 범위 분할, 특정 페이지 추출, 페이지별 개별 PDF, 홀수·짝수 분리를 브라우저에서 처리하고 다운로드하세요.",
  en: "Split PDF page ranges, extract selected pages, create one PDF per page, or separate odd and even pages directly in your browser.",
  ja: "PDFのページ範囲分割、指定ページ抽出、ページごとの個別PDF、奇数・偶数ページ分割をブラウザ内で処理して保存できます。",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const current = locale as Locale;
  const canonical = `https://toolbox.fixlgs.com/${current}/split-extract-pdf`;
  return {
    title: title[current], description: description[current],
    alternates: { canonical, languages: { ko: "https://toolbox.fixlgs.com/ko/split-extract-pdf", en: "https://toolbox.fixlgs.com/en/split-extract-pdf", ja: "https://toolbox.fixlgs.com/ja/split-extract-pdf", "x-default": "https://toolbox.fixlgs.com/ko/split-extract-pdf" } },
    openGraph: { title: title[current], description: description[current], url: canonical, type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return <SplitExtractPdfPage locale={locale as Locale} />;
}
