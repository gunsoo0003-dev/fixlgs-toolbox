import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { categories, getCategoryToolCards, locales, type Locale } from "@/lib/site";

export function generateStaticParams() {
  return locales.flatMap((locale) => categories.map((category) => ({ locale, categorySlug: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; categorySlug: string }> }): Promise<Metadata> {
  const { locale, categorySlug } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const foundCategory = categories.find((item) => item.slug === categorySlug);
  if (!foundCategory) notFound();
  const category = foundCategory!;
  const current = locale as Locale;
  return {
    title: `${category.titles[current]} - TOOLBOX`,
    description: category.descriptions[current],
    alternates: { canonical: `https://toolbox.fixlgs.com/${current}/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; categorySlug: string }> }) {
  const { locale, categorySlug } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const currentLocale = locale as Locale;
  const foundCategory = categories.find((item) => item.slug === categorySlug);
  if (!foundCategory) notFound();
  const category = foundCategory!;
  const toolCards = getCategoryToolCards(categorySlug, currentLocale);
  const back = currentLocale === "ko" ? "전체 카테고리" : currentLocale === "en" ? "All categories" : "すべてのカテゴリー";
  const label = currentLocale === "ko" ? "카테고리 도구" : currentLocale === "en" ? "CATEGORY TOOLS" : "カテゴリーツール";
  const open = currentLocale === "ko" ? "도구 열기" : currentLocale === "en" ? "OPEN TOOL" : "ツールを開く";
  const preparing = currentLocale === "ko" ? "준비 중" : currentLocale === "en" ? "COMING SOON" : "準備中";
  const guideCopy = currentLocale === "ko" ? {
    eyebrow: "CATEGORY GUIDE",
    title: category.titles[currentLocale],
    description: `${category.descriptions[currentLocale]} 필요한 작업에 맞는 도구를 선택해 바로 사용할 수 있습니다.`,
    points: [
      ["빠른 선택", "목적에 맞는 도구를 한 화면에서 비교하고 선택합니다."],
      ["간단한 사용", "복잡한 설치나 회원가입 없이 각 도구를 바로 시작합니다."],
      ["안전한 처리", "가능한 작업은 브라우저 안에서 처리하며 방식은 도구별로 안내합니다."],
    ] as [string, string][],
  } : currentLocale === "en" ? {
    eyebrow: "CATEGORY GUIDE",
    title: category.titles[currentLocale],
    description: `${category.descriptions[currentLocale]} Choose the tool that matches your task and start right away.`,
    points: [
      ["Choose quickly", "Compare the tools for your task on one clear page."],
      ["Start simply", "Open each tool without complicated setup or registration."],
      ["Process safely", "Whenever possible, work stays in your browser and each tool explains how it is handled."],
    ] as [string, string][],
  } : {
    eyebrow: "CATEGORY GUIDE",
    title: category.titles[currentLocale],
    description: `${category.descriptions[currentLocale]} 目的に合うツールを選び、すぐに利用できます。`,
    points: [
      ["すばやく選択", "目的に合うツールをひとつの画面で比較して選べます。"],
      ["かんたんに開始", "複雑な設定や会員登録なしで各ツールをすぐに使えます。"],
      ["安全に処理", "可能な処理はブラウザ内で行い、詳細は各ツールページで案内します。"],
    ] as [string, string][],
  };

  const faqCopy = currentLocale === "ko" ? {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]} 자주 묻는 질문`, more: "FAQ 더보기", collapse: "FAQ 접기",
    items: [["이 카테고리에는 어떤 도구가 있나요?", `${category.titles[currentLocale]}에 필요한 도구를 한곳에서 확인할 수 있으며, 준비가 끝난 도구부터 순차적으로 사용할 수 있습니다.`], ["카테고리의 도구는 모두 무료인가요?", "현재 제공되는 기본 도구는 무료로 사용할 수 있습니다."], ["회원가입 없이 사용할 수 있나요?", "네. 별도 회원가입 없이 각 도구 페이지에서 바로 사용할 수 있습니다."], ["모바일에서도 사용할 수 있나요?", "네. 휴대전화와 태블릿에서도 사용할 수 있도록 화면이 조정됩니다."], ["파일은 어디에서 처리되나요?", "가능한 도구는 브라우저 내부에서 처리하며, 정확한 처리 방식은 각 도구 페이지에서 안내합니다."], ["원하는 도구가 아직 준비 중이면 어떻게 하나요?", "도구는 순차적으로 추가됩니다. 필요한 기능은 페이지 하단의 문의하기를 통해 제안할 수 있습니다."]] as [string,string][]
  } : currentLocale === "en" ? {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]} FAQs`, more: "View more FAQs", collapse: "Show fewer FAQs",
    items: [["What tools are included in this category?", `This page collects tools related to ${category.titles[currentLocale]}. Available tools can be opened as soon as they are ready.`], ["Are all tools in this category free?", "The basic tools currently provided are free to use."], ["Can I use them without an account?", "Yes. You can open each tool directly without registration."], ["Can I use these tools on mobile devices?", "Yes. The pages adapt to phones and tablets."], ["Where are files processed?", "Whenever possible, files are processed in your browser. Each tool page explains its exact processing method."], ["What if a tool I need is still coming soon?", "Tools are added step by step. You can suggest a needed feature through the contact link in the footer."]] as [string,string][]
  } : {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]}のよくある質問`, more: "FAQをもっと見る", collapse: "FAQを閉じる",
    items: [["このカテゴリーにはどのようなツールがありますか？", `${category.titles[currentLocale]}に関連するツールをまとめて確認でき、準備が完了したものから順次利用できます。`], ["カテゴリー内のツールはすべて無料ですか？", "現在提供している基本ツールは無料で利用できます。"], ["会員登録なしで利用できますか？", "はい。会員登録なしで各ツールページからすぐに利用できます。"], ["モバイルでも利用できますか？", "はい。スマートフォンやタブレットに合わせて画面が調整されます。"], ["ファイルはどこで処理されますか？", "可能なツールはブラウザ内で処理し、詳細な処理方法は各ツールページで案内します。"], ["必要なツールが準備中の場合はどうすればよいですか？", "ツールは順次追加されます。必要な機能はフッターのお問い合わせから提案できます。"]] as [string,string][]
  };

  return (
    <ToolboxSubpageShell locale={currentLocale}>
      <section className="toolbox-subpage-hero">
        <div>
          <Link className="toolbox-subpage-back" href={`/${currentLocale}#categories`}>← {back}</Link>
          <p className="toolbox-subpage-eyebrow">{category.number} · {label}</p>
          <h1>{category.titles[currentLocale]}</h1>
          <p className="toolbox-subpage-lead">{category.descriptions[currentLocale]}</p>
        </div>
        <div className="toolbox-subpage-index" aria-hidden="true"><span>{category.number}</span><small>TOOLBOX</small></div>
      </section>

      <section className="toolbox-subpage-tools">
        <div className="toolbox-subpage-section-head">
          <p>{label}</p>
          <span>{String(toolCards.length).padStart(2, "0")}</span>
        </div>
        <div className="toolbox-subpage-card-grid">
          {toolCards.map((tool, index) => {
            const body = (
              <>
                <div className="toolbox-subpage-card-top"><span>{String(index + 1).padStart(2, "0")}</span><small>{tool.active ? "LIVE" : "NEXT"}</small></div>
                <div><h2>{tool.title[currentLocale]}</h2><p>{tool.description[currentLocale]}</p></div>
                <div className="toolbox-subpage-card-foot"><b>{tool.active ? open : preparing}</b><i>↗</i></div>
              </>
            );
            return tool.active && tool.href ? <Link className="toolbox-subpage-card is-active" href={tool.href} key={tool.title[currentLocale]}>{body}</Link> : <article className="toolbox-subpage-card" key={tool.title[currentLocale]}>{body}</article>;
          })}
        </div>
      </section>

      <section className="toolbox-category-guide" aria-labelledby="category-guide-title">
        <div className="toolbox-category-guide-inner">
          <div className="toolbox-category-guide-head">
            <p>{guideCopy.eyebrow}</p>
            <h2 id="category-guide-title">{guideCopy.title}</h2>
            <span>{guideCopy.description}</span>
          </div>
          <div className="toolbox-category-guide-grid">
            {guideCopy.points.map(([title, description], index) => (
              <article key={title}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="toolbox-faq-section toolbox-category-faq">
        <div className="toolbox-faq-head"><p>{faqCopy.eyebrow}</p><h2>{faqCopy.title}</h2></div>
        <ToolboxFaqList items={faqCopy.items} initialCount={4} moreLabel={faqCopy.more} collapseLabel={faqCopy.collapse} />
      </section>
    </ToolboxSubpageShell>
  );
}
