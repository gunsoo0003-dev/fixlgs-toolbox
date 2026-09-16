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
      canonical: `https://www.fixlgs.com/tools/${locale}`,
      languages: {
        ko: "https://www.fixlgs.com/tools/ko",
        en: "https://www.fixlgs.com/tools/en",
        ja: "https://www.fixlgs.com/tools/ja",
        "x-default": "https://www.fixlgs.com/tools/ko",
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
