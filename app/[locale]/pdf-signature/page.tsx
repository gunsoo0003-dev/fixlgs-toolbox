import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfSignaturePage } from "@/components/pdf-signature-page";
import { locales, type Locale } from "@/lib/site";

const titles: Record<Locale, string> = {
  ko: "PDF 서명 넣기 - 서명 그리기·이미지 삽입 | FIXLGS TOOLBOX",
  en: "Add Signature to PDF - Draw or Insert Signature | FIXLGS TOOLBOX",
  ja: "PDF 署名追加ツール - 手書き・画像署名 | FIXLGS TOOLBOX",
};
const descriptions: Record<Locale, string> = {
  ko: "PDF에 서명을 직접 그리거나 서명 이미지를 넣고 위치·크기와 적용 페이지를 조절해 브라우저에서 바로 저장하세요.",
  en: "Draw a signature or insert a signature image, adjust its position, size, and target pages, then save the PDF directly in your browser.",
  ja: "PDFに署名を描くか署名画像を追加し、位置・サイズ・適用ページを調整してブラウザ内で保存できます。",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const current = locale as Locale;
  const canonical = `https://toolbox.fixlgs.com/${current}/pdf-signature`;
  return {
    title: titles[current], description: descriptions[current],
    alternates: { canonical, languages: {
      ko: "https://toolbox.fixlgs.com/ko/pdf-signature",
      en: "https://toolbox.fixlgs.com/en/pdf-signature",
      ja: "https://toolbox.fixlgs.com/ja/pdf-signature",
      "x-default": "https://toolbox.fixlgs.com/en/pdf-signature",
    } },
    openGraph: { title: titles[current], description: descriptions[current], url: canonical, type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return <PdfSignaturePage locale={locale as Locale} />;
}
