import type { ReactNode } from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/toolbox/LanguageSwitcher";
import ThemeToggle from "@/components/toolbox/ThemeToggle";
import type { Locale } from "@/lib/site";

const labels = {
  ko: { featured: "주요 도구", categories: "카테고리", home: "TOOLBOX 홈", privacy: "개인정보처리방침", terms: "이용약관", contact: "문의하기" },
  en: { featured: "Featured Tools", categories: "Categories", home: "TOOLBOX HOME", privacy: "Privacy Policy", terms: "Terms of Use", contact: "Contact" },
  ja: { featured: "主要ツール", categories: "カテゴリー", home: "TOOLBOX ホーム", privacy: "プライバシーポリシー", terms: "利用規約", contact: "お問い合わせ" },
} satisfies Record<Locale, Record<string, string>>;

export function ToolboxSubpageShell({ locale, children, appName = "FIXLGS TOOLBOX" }: { locale: Locale; children: ReactNode; appName?: string }) {
  const copy = labels[locale];

  return (
    <main className={`toolbox-site toolbox-locale-${locale} toolbox-subpage-site`}>
      <header className="toolbox-header">
        <Link href={`/${locale}`} className="toolbox-wordmark" aria-label={copy.home}>
          <strong>FIXLGS</strong><span>TOOLBOX</span>
        </Link>
        <nav className="toolbox-nav" aria-label={`${copy.featured} / ${copy.categories}`}>
          <Link href={`/${locale}#popular`}>{copy.featured}</Link>
          <Link href={`/${locale}#categories`}>{copy.categories}</Link>
          <ThemeToggle locale={locale} />
        </nav>
        <div className="toolbox-utilities"><LanguageSwitcher locale={locale} /></div>
      </header>

      {children}

      <footer className="toolbox-footer">
        <Link href={`/${locale}`}>{copy.home}</Link>
        <span>TOOLBOX · 2026</span>
        <div><Link href="https://fixlgs.com/privacy">{copy.privacy}</Link><Link href="https://fixlgs.com/terms">{copy.terms}</Link><Link href={`https://fixlgs.com/contact?app=${encodeURIComponent(appName)}`}>{copy.contact}</Link></div>
      </footer>
    </main>
  );
}
