import Link from "next/link";
import { CharacterDocumentCounterTool } from "@/components/character-document-counter-tool";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const copy = {
  ko: {
    back:"텍스트 도구", title:"글자 수·문서 통계 계산기", desc:"직접 입력·붙여넣기·TXT/MD/CSV 파일을 불러와 공백 포함·제외 글자 수와 문서 통계를 실시간으로 확인하고 TXT로 저장하세요.", local:"원문은 브라우저 로컬에서만 계산하며 서버로 전송하거나 저장하지 않습니다.",
    next:"다음 작업", related:"관련 도구", available:"사용 가능", coming:"준비 중", how:"사용 방법", guide:"글자 수와 문서 통계를 이렇게 활용하세요", guideDesc:"글자 수 제한 확인부터 문서 구조 점검, 바이트·읽기시간 확인, 파일 편집과 저장까지 실제 사용 상황에 맞춰 정리했습니다.", caution:"주의사항", faq:"자주 묻는 질문",
    steps:["텍스트를 직접 입력·붙여넣거나 TXT·MD·CSV 파일을 선택 또는 드래그앤드롭합니다.","공백 포함·제외 글자 수를 중심으로 단어·문장·문단·줄·바이트·읽기시간을 즉시 확인합니다.","필요하면 목표 글자·단어 수와 읽기 속도를 설정하고 내용을 계속 수정합니다.","통계를 복사하거나 현재 텍스트를 TXT로 다운로드하고, 전체 지우기로 새 작업을 시작합니다."],
    points:[["글자 제한","글자 수 제한 확인","자기소개서, 블로그 원고, 게시글, 광고 문구처럼 글자 수 제한이 있는 작업에서 공백 포함·제외 값을 바로 비교할 수 있습니다. 제출처마다 기준이 다를 수 있으므로 두 값을 함께 확인하는 것이 안전합니다."],["공백 기준","공백 포함·제외 차이","공백 포함은 화면에 입력된 공백까지 포함하고, 공백 제외는 space·tab·줄바꿈 같은 Unicode whitespace를 제외합니다. 같은 글도 기준에 따라 결과가 달라질 수 있습니다."],["문서 구조","문서 구조 통계","단어·문장·문단·줄 수를 함께 보면 단순 분량뿐 아니라 글의 구조도 빠르게 파악할 수 있습니다. 문단이 지나치게 길거나 줄바꿈이 많은 문서를 점검할 때 유용합니다."],["바이트 확인","UTF-8 바이트 확인","글자 수와 저장·전송 용량은 같은 개념이 아닙니다. 한글·영문·이모지는 UTF-8에서 사용하는 바이트 수가 다를 수 있으므로 byte 제한이 있는 시스템에서는 별도로 확인해야 합니다."],["읽기 시간","예상 읽기시간 활용","읽기시간은 선택한 WPM을 기준으로 계산한 참고값입니다. 블로그·안내문·스크립트처럼 독자가 내용을 소비하는 데 걸릴 대략적인 시간을 가늠하는 데 사용할 수 있습니다."],["파일 작업","파일 불러오기와 저장","TXT·MD·CSV 파일을 선택하거나 드래그앤드롭해 바로 계산할 수 있고, 불러온 내용도 입력창에서 수정할 수 있습니다. 작업이 끝나면 현재 텍스트를 UTF-8 TXT 파일로 다시 저장할 수 있습니다."]],
    cautions:["공백 제외는 space뿐 아니라 tab·line break 등 Unicode whitespace를 제외하는 TOOLBOX 정의입니다.","UTF-8 byte는 UTF-16·UTF-32·DB collation 또는 특정 플랫폼의 자체 계산 규칙과 다를 수 있습니다.","읽기시간은 선택한 읽기 속도 기준의 예상치이며 실제 언어·난이도·독자에 따라 달라집니다.","특정 서비스의 공식 글자 제한은 제출 직전 해당 서비스 기준을 다시 확인하세요."],
    faqs:[["공백 제외 글자 수는 무엇을 빼나요?","space, tab, 줄바꿈 등 Unicode whitespace를 제외한 뒤 사용자 인식 문자 수를 계산합니다."],["일본어도 단어 수가 계산되나요?","지원 브라우저에서는 Intl.Segmenter로 공백에만 의존하지 않는 언어별 단어 경계를 사용합니다."],["바이트 수는 어떤 기준인가요?","UTF-8 인코딩 기준이며 화면에도 UTF-8이라고 표시합니다."],["읽기시간은 정확한 시간인가요?","아니요. 선택한 읽기 속도 기준의 예상치입니다."],["입력한 글이나 첨부 파일이 서버로 전송되나요?","아니요. 직접 입력한 텍스트와 TXT·MD·CSV 파일은 브라우저 로컬에서만 읽고 계산하며 원문을 서버나 Analytics로 전송하지 않습니다."],["파일 내용을 수정한 뒤 다시 저장할 수 있나요?","네. 불러온 파일 내용도 입력창에서 수정할 수 있으며 현재 내용을 UTF-8 TXT 파일로 다운로드할 수 있습니다."]],
  },
  en: {
    back:"Text Tools", title:"Character & Document Statistics Counter", desc:"Type, paste, or load TXT/MD/CSV files to check character counts and document statistics in real time, then save the current text as TXT.", local:"Your original text is calculated locally in the browser and is not sent to or stored on a server.",
    next:"Next work", related:"Related tools", available:"Available", coming:"Coming soon", how:"How to use", guide:"Character & document statistics guide", guideDesc:"From checking character limits to reviewing structure, bytes, reading time, file editing, and saving, these notes explain the tool in practical situations.", caution:"Important notes", faq:"Frequently asked questions",
    steps:["Type or paste text, or choose/drop a TXT, MD, or CSV file.","Review characters with and without spaces first, plus words, sentences, paragraphs, lines, bytes, and reading time.","Set character or word goals and reading speed when needed while continuing to edit the text.","Copy the statistics or download the current text as TXT, then use Clear all for a new task."],
    points:[["Length rules","Check character limits","Use the two character counts for resumes, blog drafts, posts, ad copy, and other text with length limits. Because submission rules vary, comparing both with-spaces and without-spaces counts is safer."],["Space rules","With vs. without spaces","The with-spaces count includes whitespace entered in the text. The without-spaces count removes Unicode whitespace such as spaces, tabs, and line breaks, so the same text can produce different totals."],["Structure","Review document structure","Word, sentence, paragraph, and line counts help you see more than total length. They are useful for spotting overly long paragraphs, excessive line breaks, or uneven document structure."],["UTF-8 bytes","Check UTF-8 bytes","Character count and storage or transmission size are different. Korean, English, emoji, and other characters can use different numbers of UTF-8 bytes, so byte-limited systems should be checked separately."],["Reading time","Use reading-time estimates","Reading time is a reference value calculated from the selected WPM. It helps estimate how long readers may need for blog posts, notices, scripts, and other content."],["File workflow","Load, edit, and save files","Choose or drag and drop TXT, MD, or CSV files to calculate them immediately. Loaded text remains editable, and the current content can be saved again as a UTF-8 TXT file."]],
    cautions:["Characters without spaces removes Unicode whitespace, including spaces, tabs, and line breaks, under the TOOLBOX definition.","UTF-8 bytes can differ from UTF-16, UTF-32, database collations, or platform-specific counting rules.","Reading time is only an estimate and varies by language, difficulty, and reader.","For an official platform character limit, check that platform again before submitting."],
    faqs:[["What is removed from the without-spaces count?","Unicode whitespace such as spaces, tabs, and line breaks is removed before grapheme counting."],["Can it count Japanese words?","On supported browsers, Intl.Segmenter provides locale-aware word boundaries that do not rely only on spaces."],["Which byte encoding is used?","The tool counts UTF-8 encoded bytes and labels the value as UTF-8."],["Is the reading time exact?","No. It is an estimate based on the selected reading speed."],["Is my text or uploaded file sent to a server?","No. Typed text and TXT, MD, or CSV files are read and calculated locally in your browser and are not sent to the server or Analytics."],["Can I edit a loaded file and save it again?","Yes. You can edit loaded text in the input area and download the current content as a UTF-8 TXT file."]],
  },
  ja: {
    back:"テキストツール", title:"文字数・文書統計カウンター", desc:"直接入力・貼り付け・TXT/MD/CSVファイル読込で文字数と文書統計をリアルタイム確認し、現在の内容をTXTで保存できます。", local:"原文はブラウザ内だけで計算し、サーバーへ送信・保存しません。",
    next:"次の作業", related:"関連ツール", available:"利用可能", coming:"準備中", how:"使い方", guide:"文字数と文書統計をこう活用します", guideDesc:"文字数制限の確認から文書構造、バイト数、読了時間、ファイル編集・保存まで、実際の利用場面に合わせて整理しました。", caution:"注意事項", faq:"よくある質問",
    steps:["テキストを直接入力・貼り付けるか、TXT・MD・CSVファイルを選択またはドラッグ＆ドロップします。","空白を含む・除く文字数を中心に、単語・文・段落・行・バイト・読了時間をすぐ確認します。","必要に応じて目標文字数・目標単語数と読む速度を設定し、内容を続けて編集します。","統計をコピーするか現在の内容をTXTでダウンロードし、すべてクリアで新しい作業を始めます。"],
    points:[["文字数制限","文字数制限の確認","自己紹介文、ブログ原稿、投稿文、広告文など文字数制限がある作業では、空白を含む・除く文字数を並べて確認できます。提出先によって基準が異なるため、両方を見ると安全です。"],["空白基準","空白を含む・除く違い","空白を含む文字数は入力した空白も数え、空白を除く文字数はspace・tab・改行などUnicode whitespaceを除きます。同じ文章でも基準によって結果が変わります。"],["文書構造","文書構造の確認","単語・文・段落・行数を一緒に見ると、総量だけでなく文章構造も素早く把握できます。長すぎる段落や過剰な改行を確認する際にも役立ちます。"],["バイト確認","UTF-8バイトの確認","文字数と保存・送信サイズは同じではありません。日本語・英語・絵文字などはUTF-8で使用するバイト数が異なる場合があるため、byte制限のあるシステムでは別途確認します。"],["読了時間","読了時間の活用","読了時間は選択したWPMを基準にした参考値です。ブログ、案内文、スクリプトなどを読むのに必要なおおよその時間を把握する用途に使えます。"],["ファイル作業","ファイル読込・編集・保存","TXT・MD・CSVファイルを選択またはドラッグ＆ドロップしてすぐ計算でき、読み込んだ内容も入力欄で編集できます。作業後は現在の文章をUTF-8 TXTとして保存できます。"]],
    cautions:["空白を除く文字数はspaceだけでなくtab・改行などUnicode whitespaceを除くTOOLBOX独自定義です。","UTF-8バイトはUTF-16・UTF-32・DB collation・各サービス独自ルールと異なる場合があります。","読了時間は選択した読む速度による推定値で、言語・難易度・読者によって変わります。","特定サービスの公式文字数制限は送信前にそのサービスの基準を再確認してください。"],
    faqs:[["空白を除く文字数では何を除きますか？","space、tab、改行などUnicode whitespaceを除いたあと、ユーザーが認識する文字数を計算します。"],["日本語も単語数を数えられますか？","対応ブラウザではIntl.Segmenterを使い、空白だけに依存しない言語別の単語境界を利用します。"],["バイト数はどの基準ですか？","UTF-8エンコード基準で、画面にもUTF-8と表示します。"],["読了時間は正確ですか？","いいえ。選択した読む速度を基準にした推定値です。"],["入力した文章や添付ファイルはサーバーへ送られますか？","いいえ。入力テキストとTXT・MD・CSVファイルはブラウザ内だけで読み込み・計算し、サーバーやAnalyticsへ送信しません。"],["読み込んだファイルを編集して保存できますか？","はい。読み込んだ内容を入力欄で編集し、現在の内容をUTF-8 TXTファイルとしてダウンロードできます。"]],
  },
} as const;

export function CharacterDocumentCounterPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/character-document-counter`;
  const related = [
    { n:"037", slug:"text-whitespace-linebreak-cleaner", name:locale === "ko" ? "텍스트 공백·줄바꿈 정리기" : locale === "ja" ? "テキスト空白・改行整理ツール" : "Text Whitespace & Line Break Cleaner" },
    { n:"038", slug:"text-case-sentence-converter", name:locale === "ko" ? "대소문자·문장 형식 변환기" : locale === "ja" ? "大文字・小文字・文形式変換ツール" : "Text Case & Sentence Converter" },
    { n:"042", slug:"text-find-replace", name:locale === "ko" ? "텍스트 찾기·바꾸기" : locale === "ja" ? "テキスト検索・置換" : "Text Find & Replace" },
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
      <p className="toolbox-subpage-eyebrow">036 · TEXT</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <CharacterDocumentCounterTool locale={locale}/>

      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><Link className="toolbox-next-work-card" href={`/${locale}/${related[0].slug}`}><span>037</span><h3>{related[0].name}</h3><div className="toolbox-next-work-card-foot"><span>{t.available}</span><strong>↗</strong></div></Link></div></section>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid">{related.slice(1).map((item)=><div key={item.n} className="toolbox-next-work-card is-disabled"><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div>)}</div></section>
    </div></section>

    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step,index)=><li key={step}><span>{String(index+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol></section>

    <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head"><div className="toolbox-tool-format-guide-head"><p>COUNTING GUIDE</p><h2>{t.guide}</h2><span>{t.guideDesc}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.points.map(([n,h,p])=><article key={n}><strong>{n}</strong><h3>{h}</h3><p>{p}</p></article>)}</div></div></section>

    <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((item)=><li key={item}>{item}</li>)}</ul></section>

    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faq}</h2></div><ToolboxFaqList items={t.faqs.map(([q,a]):readonly[string,string]=>[q,a])} initialCount={5} moreLabel={locale === "ko" ? "FAQ 더보기" : locale === "ja" ? "FAQをもっと見る" : "Show more FAQs"} collapseLabel={locale === "ko" ? "FAQ 접기" : locale === "ja" ? "FAQを閉じる" : "Collapse FAQs"} className="toolbox-tool-faq-list"/></section>
  </ToolboxSubpageShell>;
}
