import Link from "next/link";
import { publicTools, type Locale } from "@/lib/site";

type ToolNavigationProps = {
  locale: Locale;
  currentTool: number;
};

const labels = {
  ko: { next: "다음 작업", related: "관련 도구", open: "도구 열기" },
  en: { next: "Next work", related: "Related tools", open: "Open tool" },
  ja: { next: "次の作業", related: "関連ツール", open: "ツールを開く" },
} as const;

export function ToolNavigation({ locale, currentTool }: ToolNavigationProps) {
  const current = publicTools.find((tool) => tool.number === currentTool);
  if (!current) return null;

  const sameCategory = publicTools.filter((tool) => tool.category === current.category);
  const nextTool = publicTools.find((tool) => tool.number === currentTool + 1);
  const related = sameCategory
    .filter((tool) => tool.number !== currentTool && tool.number !== nextTool?.number)
    .sort((a, b) => Math.abs(a.number - currentTool) - Math.abs(b.number - currentTool) || a.number - b.number)
    .slice(0, 3)
    .sort((a, b) => a.number - b.number);
  const t = labels[locale];

  return (
    <>
      {nextTool ? (
        <section className="toolbox-next-work">
          <div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div>
          <div className="toolbox-next-work-grid">
            <Link className="toolbox-next-work-card" href={`/${locale}/${nextTool.slug}`}>
              <span>{String(nextTool.number).padStart(3, "0")}</span>
              <h3>{nextTool.titles[locale]}</h3>
              <div className="toolbox-next-work-card-foot"><span>{t.open}</span><strong>↗</strong></div>
            </Link>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="toolbox-next-work">
          <div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div>
          <div className="toolbox-next-work-grid">
            {related.map((tool) => (
              <Link className="toolbox-next-work-card" href={`/${locale}/${tool.slug}`} key={tool.number}>
                <span>{String(tool.number).padStart(3, "0")}</span>
                <h3>{tool.titles[locale]}</h3>
                <div className="toolbox-next-work-card-foot"><span>{t.open}</span><strong>↗</strong></div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
