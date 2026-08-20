import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/site";
import { Tool070UnitPriceComparisonPage } from "@/components/tool-070-unit-price-comparison-page";

const meta = {
  ko: {
    title: "단가 비교 계산기 | FIXLGS TOOLBOX",
    description: "개당·중량·용량·묶음상품 단가를 같은 기준으로 환산해 A/B 상품의 실제 단가와 절약액을 비교합니다.",
  },
  en: {
    title: "Unit Price Comparison Calculator | FIXLGS TOOLBOX",
    description: "Normalize item, weight, volume, and bundle prices to compare unit prices and savings between products A and B.",
  },
  ja: {
    title: "単価比較計算ツール | FIXLGS TOOLBOX",
    description: "個数・重量・容量・セット商品の単価を同じ基準に換算し、商品A/Bの実質単価と節約額を比較します。",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const l = locale as Locale;
  const path = `/${l}/unit-price-comparison-calculator`;
  return {
    title: meta[l].title,
    description: meta[l].description,
    alternates: {
      canonical: path,
      languages: {
        ko: "/ko/unit-price-comparison-calculator",
        en: "/en/unit-price-comparison-calculator",
        ja: "/ja/unit-price-comparison-calculator",
        "x-default": "/ko/unit-price-comparison-calculator",
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return <Tool070UnitPriceComparisonPage locale={locale as Locale} />;
}
