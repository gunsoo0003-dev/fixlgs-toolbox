import Link from "next/link";
import type { Locale } from "@/lib/site";
import { CaseSentenceFormatConverterTool } from "@/components/case-sentence-format-converter-tool";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import styles from "./case-sentence-format-converter-tool.module.css";

const copy = {
  ko: {
    back:"텍스트 도구", title:"대소문자·문장 형식 변환기", desc:"대문자·소문자·제목형·문장형·첫 글자 대문자를 원문 구조를 유지한 채 선택한 규칙대로 변환하세요.", local:"원문과 결과는 브라우저 로컬에서만 처리하며 서버로 전송하거나 저장하지 않습니다.",
    next:"다음 작업", related:"관련 도구", available:"사용 가능", coming:"준비 중", how:"사용 방법", guide:"대소문자와 문장 형식은 이렇게 변환하세요", guideDesc:"대문자·소문자, 단순 제목형, 문장형, 첫 글자 대문자의 차이와 고유명사·공백 구조에 대한 기준을 정리했습니다.", caution:"주의사항", faq:"자주 묻는 질문",
    steps:["텍스트를 직접 입력·붙여넣거나 TXT·MD·CSV 파일을 선택 또는 드래그앤드롭합니다.","변환 형식에서 대문자, 소문자, 제목형, 문장형, 첫 글자 대문자 중 하나를 선택합니다.","변환하기를 눌러 원문을 기준으로 결과와 변경 문자 수를 확인합니다.","필요하면 결과를 직접 수정한 뒤 복사하거나 UTF-8 TXT로 다운로드합니다.","전체 지우기로 파일·원문·결과·변환 형식을 모두 초기화하고 새 작업을 시작합니다."],
    points:[["대문자","Unicode 기본 대문자 변환","대소문자가 있는 문자를 JavaScript 기본 Unicode case mapping으로 대문자로 바꿉니다. UI 언어에 따라 결과 규칙을 따로 추측하지 않습니다."],["소문자","Unicode 기본 소문자 변환","대소문자가 있는 문자를 기본 Unicode case mapping으로 소문자로 바꿉니다. 한글·일본어처럼 case가 없는 문자는 그대로 유지됩니다."],["제목형","단어 시작 문자를 대문자로","각 단어와 하이픈·apostrophe 뒤의 첫 cased 문자를 대문자로 하고 나머지 cased 문자는 소문자로 만듭니다. AP·APA·Chicago 같은 출판 스타일 판정은 하지 않습니다."],["문장형","문장 시작 문자를 대문자로","전체를 먼저 소문자로 바꾼 뒤 문자열 시작, 줄바꿈, . ! ? 。 ！ ？ 뒤 첫 cased 문자를 대문자로 만듭니다."],["첫 글자","처음 만나는 cased 문자 하나만","원문의 나머지 구조와 문자 상태는 유지하고 처음 만나는 cased 문자 하나만 대문자로 변경합니다."],["원문 구조","공백·탭·개행은 그대로 유지","038은 casing 변환 도구이므로 공백, 탭, NBSP, 전각공백, 줄바꿈, emoji, ZWJ를 정리하거나 삭제하지 않습니다."]],
    cautions:["제목형은 AP·APA·Chicago·MLA 출판 스타일 규칙을 판단하는 기능이 아닙니다.","문장형은 NASA·iPhone 같은 고유명사·약어를 자동 복원하지 않으므로 Nasa처럼 바뀔 수 있습니다.","공백·줄바꿈·탭·NBSP·전각공백·emoji·ZWJ는 casing 목적 외로 변경하지 않습니다.","한글·일본어처럼 casing이 없는 문자는 변하지 않는 것이 정상입니다.","파일 입력은 TXT·MD·CSV 텍스트 파일을 브라우저 로컬에서 읽어 처리합니다."],
    faqs:[["텍스트나 첨부 파일이 서버로 전송되나요?","아니요. 직접 입력한 원문과 TXT·MD·CSV 파일, 변환 결과는 브라우저 로컬에서만 처리합니다."],["제목형이 영어 출판 규칙을 따르나요?","아니요. 각 단어의 첫 cased 문자를 대문자로 하는 단순하고 예측 가능한 규칙입니다."],["문장형에서 NASA가 그대로 유지되나요?","항상 유지되지는 않습니다. 전체 소문자화 후 문장 첫 글자를 올리는 규칙이므로 Nasa처럼 바뀔 수 있습니다."],["공백과 줄바꿈도 정리되나요?","아니요. TOOL038은 casing만 변환하고 공백·탭·개행 구조는 임의로 정리하지 않습니다."],["결과를 수정한 뒤 저장할 수 있나요?","네. 변환 결과를 직접 편집한 뒤 복사하거나 UTF-8 TXT로 다운로드할 수 있습니다."],["한글이나 일본어도 변환되나요?","대소문자가 없는 문자는 그대로 유지되고, 함께 포함된 영문 등 cased 문자만 선택한 규칙에 따라 바뀝니다."]],
  },
  en: {
    back:"Text Tools", title:"Case & Sentence Format Converter", desc:"Convert text to uppercase, lowercase, simple title case, sentence case, or first-letter uppercase while preserving its original structure.", local:"Original and converted text are processed locally in your browser and are not sent to or stored on a server.",
    next:"Next work", related:"Related tools", available:"Available", coming:"Coming soon", how:"How to use", guide:"Case and sentence-format conversion guide", guideDesc:"These notes explain uppercase, lowercase, simple title case, sentence case, first-letter capitalization, and how the tool preserves whitespace structure.", caution:"Important notes", faq:"Frequently asked questions",
    steps:["Type or paste text, or choose/drop a TXT, MD, or CSV file.","Choose Uppercase, Lowercase, Title Case, Sentence case, or First letter uppercase.","Run the converter and review the result and changed-character summary calculated from the original text.","Edit the result if needed, then copy it or download it as a UTF-8 TXT file.","Use Clear all to reset the file, original text, result, and conversion format for a new task."],
    points:[["Uppercase","Default Unicode uppercase","Cased characters are converted with JavaScript's default Unicode case mapping. The UI language does not change the conversion rule."],["Lowercase","Default Unicode lowercase","Cased characters are converted with default Unicode lowercase mapping. Characters without case, such as Korean or Japanese, stay unchanged."],["Title Case","Capitalize word starts","The first cased character of each word and after hyphens or apostrophes is uppercased, while remaining cased characters are lowercased. It is not an AP, APA, or Chicago style engine."],["Sentence case","Capitalize sentence starts","The text is lowercased first, then the first cased character at the start, after line breaks, and after . ! ? 。 ！ ？ is uppercased."],["First letter","Change the first cased character only","Only the first cased character in the original string is uppercased. The rest of the original character state and structure are preserved."],["Source structure","Keep whitespace and separators","Tool 038 changes casing only. Spaces, tabs, NBSP, full-width spaces, line breaks, emoji, and ZWJ sequences are not normalized or removed."]],
    cautions:["Title Case is not an AP, APA, Chicago, or MLA publishing-style engine.","Sentence case does not restore proper nouns or acronyms such as NASA or iPhone and may produce Nasa.","Spaces, line breaks, tabs, NBSP, full-width spaces, emoji, and ZWJ sequences are not changed for non-casing purposes.","Characters without case, including most Korean and Japanese text, correctly remain unchanged.","TXT, MD, and CSV file input is read and processed locally in the browser."],
    faqs:[["Is my text or uploaded file sent to a server?","No. Typed text, TXT/MD/CSV files, and the converted result are processed locally in your browser."],["Does Title Case follow publishing style guides?","No. It uses a simple, predictable first-cased-character-per-word rule."],["Will sentence case preserve NASA?","Not necessarily. Because it lowercases first and then capitalizes sentence starts, NASA may become Nasa."],["Does it also clean whitespace?","No. Tool 038 changes casing only and does not rewrite spaces, tabs, or line breaks."],["Can I edit and save the converted result?","Yes. You can edit the result, then copy it or download it as a UTF-8 TXT file."],["What happens to Korean or Japanese text?","Characters without uppercase/lowercase forms stay unchanged, while cased characters such as Latin letters follow the selected rule."]],
  },
  ja: {
    back:"テキストツール", title:"大文字・小文字・文形式変換ツール", desc:"大文字・小文字・単語先頭大文字・文頭大文字・最初の文字だけ大文字を、元の構造を保ったまま選択ルールで変換します。", local:"元のテキストと変換結果はブラウザ内だけで処理し、サーバーへ送信・保存しません。",
    next:"次の作業", related:"関連ツール", available:"利用可能", coming:"準備中", how:"使い方", guide:"大文字・小文字と文形式の変換ガイド", guideDesc:"大文字・小文字、単純なタイトル形式、文頭形式、最初の文字だけ大文字にする違いと、空白構造の扱いを整理しました。", caution:"注意事項", faq:"よくある質問",
    steps:["テキストを直接入力・貼り付けるか、TXT・MD・CSVファイルを選択またはドラッグ＆ドロップします。","大文字・小文字・単語先頭大文字・文頭大文字・最初の文字だけ大文字から選択します。","変換を実行し、元のテキストを基準に結果と変更文字数を確認します。","必要なら結果を編集してからコピーするかUTF-8 TXTでダウンロードします。","すべてクリアでファイル・原文・結果・変換形式を初期化して新しい作業を始めます。"],
    points:[["大文字","Unicode標準の大文字変換","caseを持つ文字をJavaScript標準Unicode case mappingで大文字へ変換します。UI言語によって変換ルールを推測しません。"],["小文字","Unicode標準の小文字変換","caseを持つ文字を標準Unicode mappingで小文字へ変換します。日本語・韓国語のようにcaseを持たない文字はそのままです。"],["単語先頭","単語開始の文字を大文字に","各単語とハイフン・apostrophe後の最初のcased文字を大文字にし、残りのcased文字を小文字にします。AP・APA・Chicagoなどの出版スタイル判定ではありません。"],["文頭","文の開始文字を大文字に","全体を小文字化した後、文字列開始・改行・. ! ? 。 ！ ？ の後の最初のcased文字を大文字にします。"],["最初の文字","最初のcased文字だけ変更","元の文字列で最初に見つかるcased文字だけを大文字にし、残りの文字状態と構造は維持します。"],["元の構造","空白・タブ・改行を維持","038はcasing変換ツールなので、空白・タブ・NBSP・全角空白・改行・emoji・ZWJを整理または削除しません。"]],
    cautions:["タイトル形式はAP・APA・Chicago・MLAなどの出版スタイル判定ではありません。","文頭変換はNASA・iPhoneなどの固有名詞・略語を自動復元しないため、Nasaのようになる場合があります。","空白・改行・タブ・NBSP・全角空白・emoji・ZWJはcasing以外の目的で変更しません。","日本語・韓国語などcaseを持たない文字が変わらないのは正常です。","TXT・MD・CSVファイルはブラウザ内で読み込み、ローカル処理します。"],
    faqs:[["テキストや添付ファイルはサーバーへ送信されますか？","いいえ。入力テキスト、TXT・MD・CSVファイル、変換結果はブラウザ内だけで処理します。"],["タイトル形式は出版ルールに従いますか？","いいえ。各単語の最初のcased文字を大文字にする単純で予測可能なルールです。"],["文頭変換でNASAは維持されますか？","必ずしも維持されません。全体を小文字化してから文頭を大文字にするため、Nasaのようになる場合があります。"],["空白や改行も整理されますか？","いいえ。TOOL038はcasingだけを変換し、空白・タブ・改行構造は変更しません。"],["結果を編集して保存できますか？","はい。変換結果を編集してからコピーするか、UTF-8 TXTでダウンロードできます。"],["日本語や韓国語はどうなりますか？","大文字・小文字を持たない文字はそのまま維持され、同時に含まれる英字などのcased文字だけが選択ルールで変換されます。"]],
  },
} as const;

export function CaseSentenceFormatConverterPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/case-sentence-format-converter`;
  const related = [
    { n:"036", slug:"character-document-counter", name:locale === "ko" ? "글자 수·문서 통계 계산기" : locale === "ja" ? "文字数・文書統計カウンター" : "Character & Document Statistics Counter", active:true },
    { n:"037", slug:"text-whitespace-linebreak-cleaner", name:locale === "ko" ? "텍스트 공백·줄바꿈 정리기" : locale === "ja" ? "テキスト空白・改行整理ツール" : "Text Whitespace & Line Break Cleaner", active:true },
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
      <p className="toolbox-subpage-eyebrow">038 · TEXT</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <CaseSentenceFormatConverterTool locale={locale}/>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><div className="toolbox-next-work-card is-disabled"><span>039</span><h3>{locale === "ko" ? "목록 정렬·중복 제거기" : locale === "ja" ? "リスト並べ替え・重複削除ツール" : "List Sort & Duplicate Remover"}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div></div></section>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid">{related.map((item) => item.active && item.slug ? <Link key={item.n} className="toolbox-next-work-card" href={`/${locale}/${item.slug}`}><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>{t.available}</span><strong>↗</strong></div></Link> : <div key={item.n} className="toolbox-next-work-card is-disabled"><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div>)}</div></section>
    </div></section>

    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step,index) => <li key={step}><span>{String(index+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol></section>
    <section className={`toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head ${locale === "ja" ? styles.jaFormatGuide : ""}`}><div className="toolbox-tool-format-guide-head"><p>FORMAT GUIDE</p><h2>{t.guide}</h2><span>{t.guideDesc}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.points.map(([n,h,p]) => <article key={n}><strong>{n}</strong><h3>{h}</h3><p>{p}</p></article>)}</div></div></section>
    <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faq}</h2></div><ToolboxFaqList items={t.faqs.map(([q,a]):readonly[string,string] => [q,a])} initialCount={5} moreLabel={locale === "ko" ? "FAQ 더보기" : locale === "ja" ? "FAQをもっと見る" : "Show more FAQs"} collapseLabel={locale === "ko" ? "FAQ 접기" : locale === "ja" ? "FAQを閉じる" : "Collapse FAQs"} className="toolbox-tool-faq-list"/></section>
  </ToolboxSubpageShell>;
}
