import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfPageOrganizerPage } from "@/components/pdf-page-organizer-page";
import { locales, type Locale } from "@/lib/site";

const titles: Record<Locale, string> = {
  ko: "PDF 페이지 정리 도구 - 삭제·순서 변경·회전 | FIXLGS TOOLBOX",
  en: "PDF Page Organizer - Delete, Reorder & Rotate | FIXLGS TOOLBOX",
  ja: "PDF ページ整理ツール - 削除・並べ替え・回転 | FIXLGS TOOLBOX",
};
const descriptions: Record<Locale, string> = {
  ko: "PDF 페이지를 삭제하고 순서를 바꾸거나 복제·회전·역순 정렬·빈 페이지 추가 후 새 PDF로 저장하세요.",
  en: "Delete, reorder, duplicate, rotate and reverse PDF pages, add blank pages, and save a new PDF directly in your browser.",
  ja: "PDFページの削除・並べ替え・複製・回転・逆順・空白ページ追加を行い、新しいPDFとして保存できます。",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const l = locale as Locale;
  const canonical = `https://toolbox.fixlgs.com/${l}/pdf-page-organizer`;
  return {
    title: titles[l], description: descriptions[l],
    alternates: { canonical, languages: { ko: "https://toolbox.fixlgs.com/ko/pdf-page-organizer", en: "https://toolbox.fixlgs.com/en/pdf-page-organizer", ja: "https://toolbox.fixlgs.com/ja/pdf-page-organizer", "x-default": "https://toolbox.fixlgs.com/en/pdf-page-organizer" } },
    openGraph: { title: titles[l], description: descriptions[l], url: canonical, type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return <PdfPageOrganizerPage locale={locale as Locale} />;
}
