import Link from "next/link";
import type { Locale } from "@/lib/site";
import { TextWhitespaceLinebreakCleanerTool } from "@/components/text-whitespace-linebreak-cleaner-tool";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import styles from "./text-whitespace-linebreak-cleaner-tool.module.css";

const copy = {
  ko: {
    back:"텍스트 도구", title:"텍스트 공백·줄바꿈 정리기", desc:"복붙으로 흐트러진 연속 공백, 각 줄 앞뒤 공백, 탭, 빈 줄과 LF·CRLF 줄바꿈 코드를 선택한 규칙대로 정리하세요.", local:"원문과 결과는 브라우저 로컬에서만 처리하며 서버로 전송하거나 저장하지 않습니다.",
    next:"다음 작업", related:"관련 도구", available:"사용 가능", coming:"준비 중", how:"사용 방법", guide:"공백과 줄바꿈은 이렇게 정리하세요", guideDesc:"일반 공백과 탭의 차이, 각 줄의 앞뒤 정리, 빈 줄 처리, LF·CRLF 출력까지 실제 복붙 문서에서 헷갈리기 쉬운 기준을 정리했습니다.", caution:"주의사항", faq:"자주 묻는 질문",
    steps:["텍스트를 직접 입력·붙여넣거나 TXT·MD·CSV 파일을 선택 또는 드래그앤드롭합니다.","정리 옵션에서 연속 공백, 각 줄 앞뒤 공백, 탭, 빈 줄과 출력 줄바꿈 형식을 선택합니다.","정리하기를 눌러 결과와 변경 요약을 확인합니다.","필요하면 결과를 직접 수정한 뒤 복사하거나 UTF-8 TXT로 다운로드합니다.","전체 지우기로 파일·원문·결과·설정을 모두 초기화하고 새 작업을 시작합니다."],
    points:[["일반 공백","연속 공백은 U+0020만 축소","연속 공백 제거는 일반 공백 U+0020이 2개 이상 이어진 구간을 1개로 줄입니다. NBSP·전각공백·zero-width space는 기본값에서 임의로 바꾸지 않습니다."],["줄 단위","각 줄의 앞뒤를 따로 정리","문서 전체 trim만 하는 것이 아니라 각 줄의 선두·후미 horizontal whitespace를 제거합니다. 문장 내용과 줄의 상대 순서는 바꾸지 않습니다."],["탭 처리","탭 제거는 실제 삭제","TAB(U+0009)을 제거하므로 탭이 단어·열 구분 역할을 하는 표나 코드에서는 결과를 확인해야 합니다."],["빈 줄","빈 줄 제거는 선택 가능","공백 정리 후 내용이 없는 줄을 삭제합니다. 문단 구분용 빈 줄을 유지하려면 빈 줄 제거 옵션을 끌 수 있습니다."],["줄바꿈","LF·CRLF는 코드 통일","CRLF·CR·LF가 섞인 입력을 내부 LF로 먼저 정규화한 뒤 LF 또는 CRLF로 출력합니다. 줄 자체를 합치거나 삭제하는 기능이 아닙니다."],["정확한 저장","CRLF는 TXT 바이트 기준","브라우저 textarea는 줄바꿈을 LF처럼 보여줄 수 있습니다. Windows식 CRLF가 정확히 필요한 경우 TXT 다운로드 결과를 기준으로 확인하세요."]],
    cautions:["코드·ASCII art·표처럼 공백과 탭 자체가 구조를 의미하는 텍스트는 결과가 달라질 수 있습니다.","줄바꿈 통일은 줄을 합치거나 줄바꿈을 삭제하는 기능이 아닙니다.","NBSP(U+00A0), 전각공백(U+3000), zero-width space(U+200B)는 기본 정리 대상이 아닙니다.","탭 제거는 TAB 문자를 실제 삭제하므로 단어가 붙을 수 있습니다.","서비스 유효상한은 입력 1,000,000자입니다."],
    faqs:[["줄바꿈을 전부 없애나요?","아니요. 줄바꿈 통일은 CRLF·CR·LF 같은 개행 코드를 한 종류로 맞추는 기능입니다."],["빈 줄 제거를 끄면 문단이 유지되나요?","네. 빈 줄 제거를 끄면 다른 옵션이 줄 자체를 삭제하지 않습니다."],["탭 제거 후 단어가 붙을 수 있나요?","네. 탭 제거는 TAB 문자를 실제로 삭제하므로 결과를 확인하세요."],["텍스트나 첨부 파일이 서버로 전송되나요?","아니요. 직접 입력한 원문과 TXT·MD·CSV 파일, 정리 결과는 브라우저 로컬에서만 처리합니다."],["Windows 줄바꿈으로 저장할 수 있나요?","네. CRLF를 선택하고 TXT로 다운로드하면 선택한 줄바꿈 형식으로 저장합니다."],["NBSP나 전각공백도 자동 삭제하나요?","아니요. 비표준 공백은 일반 공백과 구분하여 기본값에서는 유지합니다."]],
  },
  en: {
    back:"Text Tools", title:"Text Whitespace & Line Break Cleaner", desc:"Clean repeated spaces, line-edge whitespace, tabs, blank lines, and mixed LF/CRLF line endings using explicit rules.", local:"Original and cleaned text are processed locally in your browser and are not sent to or stored on a server.",
    next:"Next work", related:"Related tools", available:"Available", coming:"Coming soon", how:"How to use", guide:"Whitespace and line-ending cleanup guide", guideDesc:"These notes explain regular spaces, tabs, per-line trimming, blank lines, and exact LF/CRLF output for pasted text.", caution:"Important notes", faq:"Frequently asked questions",
    steps:["Type or paste text, or choose/drop a TXT, MD, or CSV file.","Choose repeated-space, line-edge, tab, blank-line, and output line-ending options.","Run the cleaner and review the cleaned result and change summary.","Edit the result if needed, then copy it or download it as a UTF-8 TXT file.","Use Clear all to reset the file, original text, result, and options for a new task."],
    points:[["Regular spaces","Collapse U+0020 only","Repeated-space cleanup reduces runs of two or more regular U+0020 spaces to one. NBSP, full-width spaces, and zero-width spaces remain unchanged by default."],["Per line","Trim each line separately","The tool removes leading and trailing horizontal whitespace on every line rather than only trimming the document edges. Text content and line order stay intact."],["Tabs","Tab removal is deletion","TAB (U+0009) characters are deleted, so review tables, code, or text where tabs separate words or columns."],["Blank lines","Blank-line removal is optional","Lines that are empty after cleanup can be removed. Turn this option off when blank lines intentionally separate paragraphs."],["Line endings","LF and CRLF are code formats","Mixed CRLF, CR, and LF input is normalized internally, then emitted as LF or CRLF. This does not join or delete lines."],["Exact output","Verify CRLF in TXT bytes","A browser textarea may visually normalize line endings. When exact Windows-style CRLF matters, use the downloaded TXT result as the reference."]],
    cautions:["Whitespace-sensitive code, ASCII art, and tables can change structure after cleanup.","Normalize line endings does not join or delete lines.","NBSP (U+00A0), full-width space (U+3000), and zero-width space (U+200B) are not changed by default.","Removing tabs can join words because TAB characters are actually deleted.","The service limit is 1,000,000 input characters."],
    faqs:[["Does it remove every line break?","No. Line-ending normalization only makes CRLF, CR, and LF codes consistent."],["Will paragraphs remain if blank-line removal is off?","Yes. Other cleanup options do not delete the lines themselves."],["Can words join after removing tabs?","Yes. TAB characters are deleted, so review the result."],["Is my text or uploaded file sent to a server?","No. Typed text, TXT/MD/CSV files, and the cleaned result are processed locally in your browser."],["Can I save Windows-style line endings?","Yes. Choose CRLF and download the TXT file."],["Are NBSP and full-width spaces removed automatically?","No. Non-standard spaces are kept by default and are not treated as regular U+0020 spaces."]],
  },
  ja: {
    back:"テキストツール", title:"テキスト空白・改行整理ツール", desc:"連続スペース、各行の前後空白、タブ、空行、LF・CRLFの改行コードを選択したルールで整理します。", local:"元のテキストと整理結果はブラウザ内だけで処理し、サーバーへ送信・保存しません。",
    next:"次の作業", related:"関連ツール", available:"利用可能", coming:"準備中", how:"使い方", guide:"空白と改行をこう整理します", guideDesc:"通常スペースとタブの違い、各行の前後、空行、LF・CRLF出力など、貼り付けテキストで迷いやすい基準を整理しました。", caution:"注意事項", faq:"よくある質問",
    steps:["テキストを直接入力・貼り付けるか、TXT・MD・CSVファイルを選択またはドラッグ＆ドロップします。","連続スペース、各行の前後、タブ、空行、出力改行コードを選択します。","整理を実行して結果と変更内容を確認します。","必要なら結果を編集してからコピーするかUTF-8 TXTでダウンロードします。","すべてクリアでファイル・原文・結果・設定を初期化して新しい作業を始めます。"],
    points:[["通常スペース","U+0020だけを縮小","連続スペース整理は通常スペースU+0020が2個以上続く部分を1個にします。NBSP・全角スペース・zero-width spaceは既定では変更しません。"],["行単位","各行の前後を個別に整理","文書全体だけでなく各行の先頭・末尾のhorizontal whitespaceを削除します。本文と行の相対順序は変えません。"],["タブ","タブ削除は実際の削除","TAB(U+0009)を削除するため、表・コード・単語区切りとして使っている文章では結果を確認します。"],["空行","空行削除は選択可能","空白整理後に内容がない行を削除します。段落区切りの空行を残す場合は空行削除をOFFにできます。"],["改行","LF・CRLFはコードの統一","CRLF・CR・LFが混在する入力を内部LFに統一してからLFまたはCRLFで出力します。行を結合・削除する機能ではありません。"],["正確な保存","CRLFはTXTで確認","ブラウザtextareaでは改行の見た目が同じ場合があります。Windows形式CRLFが必要な場合はダウンロードしたTXTを基準に確認してください。"]],
    cautions:["コード・ASCII art・表など空白やタブ自体に意味があるテキストは構造が変わる場合があります。","改行コードの統一は行を結合・削除する機能ではありません。","NBSP(U+00A0)、全角スペース(U+3000)、zero-width space(U+200B)は既定では整理しません。","タブ削除ではTAB文字が実際に消えるため単語がつながる場合があります。","サービス上限は入力1,000,000文字です。"],
    faqs:[["改行を全部削除しますか？","いいえ。CRLF・CR・LFなどの改行コードを1種類に統一する機能です。"],["空行削除をOFFにすると段落は残りますか？","はい。他の整理オプションは行そのものを削除しません。"],["タブ削除で単語がつながることはありますか？","はい。TAB文字を実際に削除するため結果を確認してください。"],["テキストや添付ファイルはサーバーへ送信されますか？","いいえ。入力テキスト、TXT・MD・CSVファイル、整理結果はブラウザ内だけで処理します。"],["Windows形式の改行で保存できますか？","はい。CRLFを選んでTXTをダウンロードしてください。"],["NBSPや全角スペースも自動削除しますか？","いいえ。非標準スペースは通常スペースと区別し、既定では保持します。"],],
  },
} as const;

export function TextWhitespaceLinebreakCleanerPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/text-whitespace-linebreak-cleaner`;
  const related = [
    { n:"036", slug:"character-document-counter", name:locale === "ko" ? "글자 수·문서 통계 계산기" : locale === "ja" ? "文字数・文書統計カウンター" : "Character & Document Statistics Counter", active:true },
    { n:"039", name:locale === "ko" ? "목록 정렬·중복 제거기" : locale === "ja" ? "リスト並べ替え・重複削除" : "List Sort & Duplicate Remover", active:false },
    { n:"040", name:locale === "ko" ? "구분자·목록 변환기" : locale === "ja" ? "区切り文字・リスト変換ツール" : "Delimiter & List Converter", active:false },
  ];
  const jsonLd = { "@context":"https://schema.org", "@graph":[
    { "@type":"WebApplication", name:t.title, applicationCategory:"UtilitiesApplication", operatingSystem:"Any", url, description:t.desc, offers:{"@type":"Offer",price:"0",priceCurrency:"USD"} },
    { "@type":"BreadcrumbList", itemListElement:[{"@type":"ListItem",position:1,name:"TOOLBOX",item:`https://toolbox.fixlgs.com/${locale}`},{"@type":"ListItem",position:2,name:t.back,item:`https://toolbox.fixlgs.com/${locale}/category/text`},{"@type":"ListItem",position:3,name:t.title,item:url}] },
    { "@type":"FAQPage", mainEntity:t.faqs.map(([q,a]) => ({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}})) },
  ]};

  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/text`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">037 · TEXT</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <TextWhitespaceLinebreakCleanerTool locale={locale}/>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><div className="toolbox-next-work-card is-disabled"><span>038</span><h3>{locale === "ko" ? "대소문자·문장 형식 변환기" : locale === "ja" ? "大文字・小文字・文形式変換ツール" : "Text Case & Sentence Converter"}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div></div></section>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid">{related.map((item) => item.active && item.slug ? <Link key={item.n} className="toolbox-next-work-card" href={`/${locale}/${item.slug}`}><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>{t.available}</span><strong>↗</strong></div></Link> : <div key={item.n} className="toolbox-next-work-card is-disabled"><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div>)}</div></section>
    </div></section>

    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step,index) => <li key={step}><span>{String(index+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol></section>
    <section className={`toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head ${locale === "ja" ? styles.jaFormatGuide : ""}`}><div className="toolbox-tool-format-guide-head"><p>CLEANUP GUIDE</p><h2>{t.guide}</h2><span>{t.guideDesc}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.points.map(([n,h,p]) => <article key={n}><strong>{n}</strong><h3>{h}</h3><p>{p}</p></article>)}</div></div></section>
    <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head toolbox-tool-info-band--full-divider"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faq}</h2></div><ToolboxFaqList items={t.faqs.map(([q,a]):readonly[string,string] => [q,a])} initialCount={5} moreLabel={locale === "ko" ? "FAQ 더보기" : locale === "ja" ? "FAQをもっと見る" : "Show more FAQs"} collapseLabel={locale === "ko" ? "FAQ 접기" : locale === "ja" ? "FAQを閉じる" : "Collapse FAQs"} className="toolbox-tool-faq-list"/></section>
  </ToolboxSubpageShell>;
}
