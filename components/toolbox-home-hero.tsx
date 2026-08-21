"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publicTools, type Locale } from "@/lib/site";

type HeroCopy = {
  eyebrow: string;
  title1: string;
  title2: string;
  description: string;
};

type SearchCopy = {
  label: string;
  placeholder: string;
  quick: string;
  links: [string, string, string];
};

type Props = {
  locale: Locale;
  hero: HeroCopy;
  search: SearchCopy;
};

const resultLabels = {
  ko: { eyebrow: "SEARCH RESULTS", title: "검색 결과", empty: "일치하는 도구가 없습니다.", open: "도구 열기" },
  en: { eyebrow: "SEARCH RESULTS", title: "Search results", empty: "No matching tools found.", open: "Open tool" },
  ja: { eyebrow: "SEARCH RESULTS", title: "検索結果", empty: "一致するツールがありません。", open: "ツールを開く" },
} as const;

export function ToolboxHomeHero({ locale, hero, search }: Props) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const results = useMemo(() => {
    if (!normalized) return [];
    const tokens = normalized.split(/\s+/).filter(Boolean);
    return publicTools.filter((tool) => {
      const haystack = `${tool.titles[locale]} ${tool.slug}`.toLocaleLowerCase();
      return tokens.every((token) => haystack.includes(token));
    }).slice(0, 9);
  }, [locale, normalized]);
  const t = resultLabels[locale];

  const setQuickQuery = (value: string) => setQuery(value);

  return (
    <>
      <section className="toolbox-hero">
        <div className="toolbox-hero-copy">
          <p>{hero.eyebrow}</p>
          {locale === "ja" ? (
            <h1 className="toolbox-hero-title toolbox-hero-title-ja">
              <span>必要なときに、</span>
              <strong><span>すぐ使える</span><span>ツール。</span></strong>
            </h1>
          ) : (
            <h1 className="toolbox-hero-title">
              <span>{hero.title1}</span>
              <strong><span>{hero.title2}</span></strong>
            </h1>
          )}
          <span>{hero.description}</span>
        </div>
        <div className="toolbox-search-block">
          <label htmlFor="toolbox-search">{search.label}</label>
          <div className="toolbox-search-shell">
            <input id="toolbox-search" type="search" placeholder={search.placeholder} value={query} onChange={(event) => setQuery(event.target.value)} />
            <button type="button" aria-label={search.label} onClick={() => setQuery((value) => value.trim())}>↗</button>
          </div>
          <div className="toolbox-quick-links"><span>{search.quick}</span>{search.links.map((item) => <button type="button" key={item} onClick={() => setQuickQuery(item)}>{item}</button>)}</div>
        </div>
        <div className="toolbox-hero-blue" aria-hidden="true"><span>71+</span><small>TOOLS SYSTEM</small></div>
      </section>

      {normalized ? (
        <section className="toolbox-section toolbox-popular-section" aria-live="polite">
          <div className="toolbox-section-head"><div><p>{t.eyebrow}</p><h2>{t.title}</h2></div><span>{results.length}</span></div>
          {results.length > 0 ? (
            <div className="toolbox-tool-grid">
              {results.map((tool) => (
                <Link className="toolbox-tool-card" href={`/${locale}/${tool.slug}`} key={tool.number}>
                  <div className="toolbox-tool-card-top"><span>TOOL</span><b>{String(tool.number).padStart(3, "0")}</b></div>
                  <strong className="toolbox-tool-mark">{String(tool.number).padStart(3, "0")}</strong>
                  <div><h3>{tool.titles[locale]}</h3></div>
                  <div className="toolbox-tool-card-action"><span>{t.open}</span><i aria-hidden="true">↗</i></div>
                </Link>
              ))}
            </div>
          ) : <p>{t.empty}</p>}
        </section>
      ) : null}
    </>
  );
}
