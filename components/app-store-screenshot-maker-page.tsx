import Link from "next/link";
import { AppStoreScreenshotMakerTool } from "./app-store-screenshot-maker-tool";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const pageCopy = {
  ko: {
    back: "콘텐츠 이미지 제작", title: "앱스토어 스크린샷 제작기",
    desc: "실제 앱 화면 여러 장을 App Store·Google Play 등록용 홍보 스크린샷 세트로 빠르게 제작하세요.",
    local: "앱 화면, 문구와 결과 파일은 브라우저 안에서만 처리되며 서버에 저장되지 않습니다.",
    how: "사용 방법", steps: ["실제 앱 스크린샷을 여러 장 선택하고 순서를 정합니다.", "제목·설명·배경·프레임과 화면 맞춤을 설정합니다.", "KO·EN·JA 문구와 App Store·Google Play 규격을 선택합니다.", "규격별 미리보기에서 crop·위치를 확인하고 개별 또는 ZIP으로 저장합니다."],
    guideTitle: "스토어 제출용 스크린샷을 만들 때 중요한 기준", guide: [
      ["실제 화면", "실제 앱 화면 우선", "앱 UI를 왜곡하거나 존재하지 않는 기능처럼 보이게 만들지 않고 실제 사용자 경험이 명확히 보이도록 구성합니다."],
      ["비율 유지", "No Stretch", "세로 화면을 가로 규격에 억지로 늘리지 않고 원본 비율을 유지한 contain·cover 방식으로 화면을 배치합니다."],
      ["스토어 규격", "스토어별 preset", "Apple의 고정 accepted size와 Google Play의 범위형 규칙을 구분해 기본 preset으로 선택할 수 있게 합니다."],
      ["다국어", "다국어 분리", "이미지와 crop은 공유하고 제목·설명은 한국어·영어·일본어별로 따로 저장해 긴 문구로 인한 잘림을 줄입니다."],
      ["첫 화면", "첫 1~3장 우선", "검색 결과와 제품 페이지 첫 화면에서 핵심 기능이 먼저 보이도록 가장 중요한 화면을 앞쪽에 배치합니다."],
      ["결과 보존", "부분 실패 보존", "여러 규격·언어를 출력할 때 한 결과가 실패해도 성공한 결과는 유지하고 실패 항목만 다시 확인할 수 있게 합니다."],
    ],
    caution: "주의사항", cautions: ["App Store·Google Play 정책과 허용 크기는 변경될 수 있으므로 실제 제출 전 최신 공식 규격을 다시 확인하세요.", "Google Play은 기기 이미지를 피하도록 권장하므로 device frame은 기본 OFF로 두고 필요한 경우에만 사용하세요.", "실제 앱 기능을 부정확하게 표현하거나 UI를 과도하게 가리는 문구·장식은 심사 문제로 이어질 수 있습니다.", "Apple 결과와 Google Play 결과는 투명도 없는 JPG 또는 PNG를 사용하도록 설계하는 것이 안전합니다."],
    faqTitle: "자주 묻는 질문", faqMore: "FAQ 더보기", faqLess: "FAQ 접기", faqs: [
      ["여러 장을 한 번에 만들 수 있나요?", "네. 여러 앱 화면을 순서대로 추가하고 선택한 규격·언어 조합을 ZIP으로 일괄 출력할 수 있습니다."],
      ["한국어·영어·일본어를 따로 만들 수 있나요?", "네. 같은 화면과 crop을 공유하면서 각 언어의 제목·설명을 독립적으로 저장합니다."],
      ["Google Play에도 휴대폰 프레임을 넣어도 되나요?", "기능은 제공하지만 Google Play 권장 가이드를 고려해 기본값은 OFF입니다."],
      ["이미지가 찌그러지나요?", "아니요. No Stretch를 기본으로 하고 contain 또는 cover로 원본 비율을 유지합니다."],
      ["이미지가 서버로 업로드되나요?", "아니요. 입력 이미지와 결과 파일은 현재 브라우저에서만 처리합니다."],
      ["Apple 규격은 하나만 지원하나요?", "아니요. iPhone 대형과 iPad 13의 세로·가로 accepted size preset을 기본 제공하도록 구성합니다."],
    ],
    next: "다음 작업", coming: "준비 중", related: "관련 도구"
  },
  en: {
    back: "Content Image Creation", title: "App Store Screenshot Maker",
    desc: "Turn multiple real app screens into store-ready promotional screenshot sets for App Store and Google Play.",
    local: "App screens, copy, and result files stay in your browser and are not stored on a server.",
    how: "How to use", steps: ["Choose multiple real app screenshots and arrange their order.", "Set title, description, background, frame, and image fit.", "Choose KO, EN, or JA copy plus App Store and Google Play presets.", "Review crop and positioning, then download one result or a ZIP set."],
    guideTitle: "Key standards for store screenshot production", guide: [
      ["Real screens", "Use real app screens", "Show the actual experience clearly without distorting the UI or implying features that do not exist."],
      ["비율 유지", "No Stretch", "Preserve the source aspect ratio with contain or cover instead of stretching portrait screens into landscape output."],
      ["Store presets", "Store-specific presets", "Keep Apple's accepted fixed sizes separate from Google Play's range-based rules and expose simple default presets."],
      ["Localization", "Separate localization", "Share image and crop state while keeping title and description text independent for Korean, English, and Japanese."],
      ["First screens", "Prioritize screenshots 1–3", "Place the most important product features first so the opening store views communicate the app quickly."],
      ["Keep results", "Keep partial success", "When one language or size fails, preserve successful outputs and identify only the failed result for retry."],
    ],
    caution: "Important notes", cautions: ["App Store and Google Play rules can change, so confirm current official requirements before final submission.", "Google Play recommends avoiding device imagery, so the device frame is OFF by default.", "Do not cover the real UI excessively or present nonexistent app functions.", "Use opaque JPG or PNG outputs for store compatibility."],
    faqTitle: "FAQ", faqMore: "Show more FAQ", faqLess: "Hide FAQ", faqs: [
      ["Can I export multiple screenshots at once?", "Yes. Add several screens and export selected language and preset combinations together as a ZIP."],
      ["Can I prepare Korean, English, and Japanese versions?", "Yes. The image and crop can be shared while each language keeps independent title and description text."],
      ["Can I use a phone frame for Google Play?", "The option is available, but it is OFF by default to reflect current Google Play guidance."],
      ["Will my screenshots be stretched?", "No. The tool preserves the source aspect ratio with contain or cover."],
      ["Are images uploaded to a server?", "No. Input and output files are processed in your current browser."],
      ["Does Apple use only one screenshot size?", "No. The tool provides default portrait and landscape presets for large iPhone and iPad 13 accepted sizes."],
    ],
    next: "Next work", coming: "Coming soon", related: "Related tools"
  },
  ja: {
    back: "コンテンツ画像作成", title: "アプリストア スクリーンショット作成ツール",
    desc: "実際のアプリ画面を複数追加し、App Store・Google Play登録用のプロモーション画像セットをすばやく作成できます。",
    local: "アプリ画面、テキスト、結果ファイルはブラウザ内でのみ処理され、サーバーには保存されません。",
    how: "使い方", steps: ["実際のアプリスクリーンショットを複数選択して順番を決めます。", "タイトル・説明・背景・フレーム・画面フィットを設定します。", "KO・EN・JAとApp Store・Google Playの出力規格を選択します。", "規格別プレビューでcropと位置を確認し、個別またはZIPで保存します。"],
    guideTitle: "ストア提出用スクリーンショットの重要基準", guide: [
      ["実画面", "実際のアプリ画面", "UIを歪めたり存在しない機能に見せたりせず、実際のユーザー体験が明確に伝わる構成にします。"],
      ["비율 유지", "No Stretch", "縦画面を横規格へ無理に引き伸ばさず、元画像比率を保ったcontain・coverで配置します。"],
      ["ストア規格", "ストア別preset", "Appleの固定accepted sizeとGoogle Playの範囲ルールを分けて管理します。"],
      ["多言語", "多言語分離", "画像とcropは共有し、韓国語・英語・日本語のタイトルと説明は別々に保存します。"],
      ["最初の画面", "最初の1〜3枚を優先", "最初に主要機能が見えるよう、重要な画面を前方へ配置します。"],
      ["結果保持", "部分失敗を保持", "1件失敗しても成功した結果は保持し、失敗した組み合わせだけ確認できるようにします。"],
    ],
    caution: "注意事項", cautions: ["App Store・Google Playの規格は変更される可能性があるため、提出前に最新公式情報を確認してください。", "Google Playでは端末画像を避けることが推奨されるため、device frameは初期OFFです。", "実際の機能を不正確に表現したりUIを過度に隠したりしないでください。", "ストア互換性のため透過なしJPGまたはPNGを使用します。"],
    faqTitle: "よくある質問", faqMore: "FAQをもっと見る", faqLess: "FAQを閉じる", faqs: [
      ["複数枚をまとめて作成できますか？", "はい。複数の画面を追加し、選択した言語・規格の組み合わせをZIPで一括出力できます。"],
      ["韓国語・英語・日本語を分けて作れますか？", "はい。画像とcropを共有しながら各言語のタイトル・説明を独立して保存します。"],
      ["Google Playで端末フレームを使えますか？", "機能はありますが、現在の推奨を考慮して初期値はOFFです。"],
      ["画像は引き伸ばされますか？", "いいえ。containまたはcoverで元画像比率を維持します。"],
      ["画像はサーバーへ送信されますか？", "いいえ。入力と結果は現在のブラウザ内で処理されます。"],
      ["Appleは1つのサイズだけですか？", "いいえ。大型iPhoneとiPad 13の縦・横accepted size presetを基本提供します。"],
    ],
    next: "次の作業", coming: "準備中", related: "関連ツール"
  }
} as const;

export function AppStoreScreenshotMakerPage({ locale }: { locale: Locale }) {
  const t = pageCopy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/app-store-screenshot-maker`;
  const related = [
    { n: "021", name: locale === "ko" ? "SNS 이미지 제작기" : locale === "en" ? "Social Media Image Maker" : "SNS画像作成ツール", href: `/${locale}/social-media-image-maker` },
    { n: "016", name: locale === "ko" ? "이미지에 글자 넣기" : locale === "en" ? "Add Text to Image" : "画像文字入れツール", href: `/${locale}/add-text-to-image` },
    { n: "017", name: locale === "ko" ? "이미지 워터마크 넣기" : locale === "en" ? "Add Watermark to Images" : "画像ウォーターマーク追加", href: `/${locale}/image-watermark-tool` },
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: t.title, applicationCategory: "MultimediaApplication", operatingSystem: "Any", url, description: t.desc, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, featureList: ["App Store presets", "Google Play presets", "Portrait and landscape", "Korean English Japanese localization", "Multiple screenshot batch export", "Device frame", "No Stretch", "ZIP export"] },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` }, { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/content-image` }, { "@type": "ListItem", position: 3, name: t.title, item: url }] },
    { "@type": "FAQPage", mainEntity: t.faqs.map(([q,a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }
  ]};

  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/content-image`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">024 · CONTENT IMAGE</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <AppStoreScreenshotMakerTool locale={locale} />
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><div className="toolbox-next-work-card is-disabled"><span>025</span><h3>{locale === "ko" ? "증명사진·여권사진 제작기" : locale === "en" ? "ID & Passport Photo Maker" : "証明写真・パスポート写真作成ツール"}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div></div></section>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid">{related.map((item)=><Link key={item.n} href={item.href} className="toolbox-next-work-card"><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>{locale === "ko" ? "사용 가능" : locale === "ja" ? "利用可能" : "AVAILABLE"}</span><strong>↗</strong></div></Link>)}</div></section>
    </div></section>
    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy"><div className="toolbox-tool-format-guide-head"><p>WORKFLOW GUIDE</p><h2>{t.guideTitle}</h2><span>{t.desc}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.guide.map(([n,title,desc])=><article key={n}><strong>{n}</strong><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
    <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2><span>{locale === "ko" ? "스토어 규격과 실제 앱 화면의 정확성을 함께 확인한 뒤 제출용 이미지를 저장하세요." : locale === "ja" ? "ストア規格と実際のアプリ画面の正確性を確認してから提出用画像を保存してください。" : "Check store requirements and the accuracy of the real app screens before exporting submission assets."}</span></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((x)=><li key={x}>{x}</li>)}</ul></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs.map(([q,a]):readonly [string,string]=>[q,a])} initialCount={5} moreLabel={t.faqMore} collapseLabel={t.faqLess} className="toolbox-tool-faq-list" /></section>
    <section className="toolbox-tool-processing-note"><p>{t.local}</p></section>
  </ToolboxSubpageShell>;
}
