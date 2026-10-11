import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfTextImageExtractorPage } from "@/components/pdf-text-image-extractor-page";
import { locales, type Locale } from "@/lib/site";

const titles: Record<Locale, string> = {
  ko: "PDF 텍스트·이미지 추출기 - TXT·이미지 ZIP 저장 | FIXLGS TOOLBOX",
  en: "PDF Text & Image Extractor - Save TXT & Image ZIP | FIXLGS TOOLBOX",
  ja: "PDFテキスト・画像抽出ツール - TXT・画像ZIP保存 | FIXLGS TOOLBOX",
};
const descriptions: Record<Locale, string> = {
  ko: "PDF의 텍스트 레이어와 실제 임베디드 이미지를 페이지별로 추출하고 TXT, 개별 이미지, ZIP으로 브라우저에서 저장하세요.",
  en: "Extract PDF text layers and embedded images by page, then save TXT, individual images, or ZIP files locally in your browser.",
  ja: "PDFのテキストレイヤーと埋め込み画像をページ別に抽出し、TXT・個別画像・ZIPとしてブラウザ内で保存できます。",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const l = locale as Locale;
  const canonical = `https://toolbox.fixlgs.com/${l}/pdf-text-image-extractor`;
  return {
    title: titles[l], description: descriptions[l],
    alternates: { canonical, languages: { ko: "https://toolbox.fixlgs.com/ko/pdf-text-image-extractor", en: "https://toolbox.fixlgs.com/en/pdf-text-image-extractor", ja: "https://toolbox.fixlgs.com/ja/pdf-text-image-extractor", "x-default": "https://toolbox.fixlgs.com/en/pdf-text-image-extractor" } },
    openGraph: { title: titles[l], description: descriptions[l], url: canonical, type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return <PdfTextImageExtractorPage locale={locale as Locale} />;
}
