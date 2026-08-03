import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return {
    alternates: {
      canonical: `https://toolbox.fixlgs.com/${locale}`,
      languages: {
        ko: "https://toolbox.fixlgs.com/ko",
        en: "https://toolbox.fixlgs.com/en",
        ja: "https://toolbox.fixlgs.com/ja",
        "x-default": "https://toolbox.fixlgs.com/ko",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return children;
}
