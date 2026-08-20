import Link from "next/link";
import { tool028Slug, type Locale } from "@/lib/site";
import { SplitExtractPdfTool } from "./split-extract-pdf-tool";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";

const copy = {
  ko:{back:"PDF 도구",title:"PDF 분할·페이지 추출기",desc:"PDF를 페이지 범위로 나누거나 필요한 페이지만 골라 새 PDF 또는 개별 PDF로 저장하세요.",local:"페이지 복사·분할·ZIP 생성은 브라우저 안에서 처리됩니다.",how:"사용 방법",steps:["PDF 파일 1개를 선택합니다. 총 페이지 수와 페이지 미리보기를 확인합니다.","페이지 범위 분할, 특정 페이지 추출, 페이지별 개별 PDF, 홀수·짝수 분리 중 원하는 방식을 고릅니다.","범위 또는 페이지 번호를 입력하거나 특정 페이지 추출 모드에서 썸네일을 눌러 선택합니다.","실행 전에 예상 결과 파일 수와 포함 페이지를 확인한 뒤 PDF 분할 또는 페이지 추출을 실행합니다.","결과 PDF를 개별로 받거나 여러 결과를 ZIP으로 한 번에 저장합니다."],guideTitle:"PDF를 나눌 때 실전 기준",guide:[
    ["작업 구분","범위 분할과 페이지 추출을 구분","1-20, 21-40처럼 여러 결과 파일이 필요하면 범위 분할을 사용하고, 1,3,7-9처럼 필요한 페이지만 한 문서로 모으려면 특정 페이지 추출을 사용합니다."],
    ["페이지 번호","화면 번호는 1부터 시작","사용자가 보는 페이지 번호는 1부터 시작합니다. 내부 PDF 인덱스 변환은 도구가 처리하므로 문서에 표시된 페이지 순서 기준으로 입력하면 됩니다."],
    ["선택 정리","특정 페이지는 중복 제거·오름차순","같은 페이지를 여러 번 입력하면 한 번만 포함하고, 선택 결과는 오름차순으로 정리합니다. 썸네일 선택과 직접 입력은 같은 선택 상태를 사용합니다."],
    ["범위 겹침","범위 겹침은 결과마다 유지","1-5와 4-8처럼 범위가 겹치면 4~5페이지는 두 결과 PDF에 각각 포함됩니다. 실행 전에 예상 결과에서 중복 포함 사실을 확인하세요."],
    ["원본 유지","페이지를 이미지로 다시 만들지 않음","결과 PDF는 원본 페이지 객체를 새 PDF로 복사하는 방식으로 생성합니다. 페이지를 이미지로 재렌더링해 PDF로 만드는 방식이 아니므로 분할 과정 자체로 불필요한 화질 저하를 만들지 않습니다."],
    ["ZIP 저장","페이지별 분리는 ZIP이 기본","수십~수백 개 파일을 브라우저에서 연속 자동 다운로드하면 차단될 수 있어 페이지별 개별 PDF는 ZIP으로 한 번에 받는 흐름이 편리합니다."],
    ["로컬 처리","민감 문서는 로컬 처리","계약서·증명서처럼 민감한 PDF도 분할과 추출 과정에서 서버 업로드를 사용하지 않습니다. 탭을 닫으면 작업 중 메모리에 있던 결과도 유지되지 않습니다."],
    ["오류 처리","암호·손상 PDF는 우회하지 않음","비밀번호가 설정되었거나 손상된 PDF를 억지로 우회하지 않습니다. 입력 단계에서 읽기 실패를 구분해 안내하고 정상 PDF로 다시 작업할 수 있게 합니다."]],
    caution:"주의사항",cautions:["이 도구는 브라우저 안정성을 위해 PDF 1개, 최대 50MB·300페이지까지 처리합니다. 범위 항목은 최대 100개, 생성 결과는 최대 300개입니다.","페이지 미리보기 한 장이 실패해도 실제 PDF 페이지 복사 가능 여부와는 별개일 수 있습니다. 미리보기 오류와 결과 PDF 생성 오류를 구분합니다.","범위 분할에서 서로 겹치는 범위는 허용되므로 같은 페이지가 여러 결과에 포함될 수 있습니다.","홀수·짝수 분리는 화면 기준 1, 2, 3… 페이지 번호를 사용합니다. 1페이지 PDF에는 짝수 결과를 빈 PDF로 만들지 않습니다.","PDF 병합·페이지 삭제·재정렬·회전·압축·비밀번호 해제·OCR은 이 도구의 역할이 아닙니다.","브라우저 탭을 새로고침하거나 닫으면 아직 다운로드하지 않은 결과가 사라질 수 있으므로 필요한 결과를 먼저 저장하세요."],
    faqTitle:"자주 묻는 질문",faqMore:"FAQ 더보기",faqLess:"FAQ 접기",faqs:[
      ["페이지 범위는 어떻게 입력하나요?","1-3 / 4-7 / 8-10처럼 각 결과 범위를 구분해 입력합니다. 쉼표, 줄바꿈, / 또는 ;로 구분할 수 있습니다."],
      ["선택한 페이지를 하나의 PDF로 만들 수 있나요?","네. 특정 페이지 추출에서 ‘선택 페이지를 하나의 PDF’를 선택하면 고른 페이지가 오름차순으로 한 PDF에 들어갑니다."],
      ["모든 페이지를 각각 PDF로 저장할 수 있나요?","네. 페이지별 개별 PDF 모드는 각 페이지를 하나의 PDF로 만들고 여러 결과를 ZIP으로 받을 수 있습니다."],
      ["홀수와 짝수 페이지를 따로 저장할 수 있나요?","네. 홀수만, 짝수만, 또는 홀수+짝수 두 결과를 선택할 수 있습니다."],
      ["PDF가 서버에 업로드되나요?","아니요. 현재 구현은 브라우저 로컬에서 PDF를 읽고 새 결과를 만듭니다."],
      ["비밀번호가 걸린 PDF도 분할하나요?","지원하지 않습니다. 암호를 우회하거나 제거하지 않고 비밀번호가 설정되었거나 지원하지 않는 PDF로 안내합니다."],
      ["1,5,3처럼 입력하면 입력 순서대로 나오나요?","아니요. 특정 페이지 추출은 중복을 제거하고 오름차순으로 정리하는 정책을 사용합니다."],
      ["여러 결과는 왜 ZIP으로 받나요?","브라우저의 연속 자동 다운로드 차단을 피하고 결과 파일을 빠뜨리지 않도록 여러 PDF를 ZIP 하나로 묶어 받을 수 있게 합니다."]],
    next:"다음 작업",related:"관련 도구",coming:"통합 후 연결"
  },
  en:{back:"PDF Tools",title:"Split & Extract PDF",desc:"Split a PDF by page range or extract only the pages you need into a new PDF or separate page files.",local:"Page copying, splitting, and ZIP creation run inside your browser.",how:"How to use",steps:["Choose one PDF and review its page count and page thumbnails.","Choose Split by Page Range, Extract Selected Pages, One PDF per Page, or Split Odd / Even Pages.","Enter ranges or page numbers, or click thumbnails in selected-page mode.","Review the expected file count and included pages before running the split or extraction.","Download individual result PDFs or save multiple outputs together as a ZIP."],guideTitle:"Practical rules for splitting PDFs",guide:[
    ["Task type","Choose range split vs extraction","Use range split when you need several sections such as 1-20 and 21-40. Use selected-page extraction when you only need pages such as 1,3,7-9 in a new document."],
    ["Page numbers","Page numbers start at 1","The interface uses human-readable page numbers beginning at 1. Internal zero-based PDF indexes are handled by the tool."],
    ["Selection","Selections are deduplicated and sorted","Repeated selected pages are included once and selected-page output is sorted ascending. Thumbnail clicks and text input share the same selection state."],
    ["Overlap","Overlapping split ranges stay independent","If ranges such as 1-5 and 4-8 overlap, pages 4 and 5 are intentionally included in both output PDFs. Check the expected plan before processing."],
    ["Keep source","Pages are copied, not rasterized","Result PDFs copy original PDF page objects into new documents rather than rebuilding the pages as images, avoiding unnecessary image re-rendering during the split itself."],
    ["ZIP output","ZIP is convenient for per-page output","Browsers may block many automatic downloads, so one-PDF-per-page output can be collected into a single ZIP."],
    ["Local only","Sensitive documents stay local","Contracts and certificates are processed in browser memory without a server-upload workflow. Unsaved results disappear when the page is closed or refreshed."],
    ["Error handling","Encrypted or damaged PDFs are not bypassed","The tool does not bypass passwords or force damaged files through processing. It reports an input error and keeps the workflow recoverable."]],
    caution:"Important notes",cautions:["For browser stability, this tool accepts one PDF up to 50MB and 300 pages, up to 100 range items, and up to 300 output files.","A failed thumbnail does not always mean page copying itself will fail; preview failures and output-generation failures are treated separately.","Overlapping split ranges are allowed, so the same page can appear in multiple results.","Odd/even mode uses visible 1, 2, 3… page numbers. A one-page PDF does not produce an empty even-page PDF.","Merging, deleting/reordering/rotating pages, compression, password removal, and OCR belong to other tools.","Refresh or closing the tab can discard results that have not been downloaded."],
    faqTitle:"FAQ",faqMore:"Show more FAQ",faqLess:"Collapse FAQ",faqs:[["How do I enter page ranges?","Enter independent ranges such as 1-3 / 4-7 / 8-10. Commas, line breaks, /, and ; can separate each output range."],["Can selected pages be combined into one PDF?","Yes. Choose Combine Selected Pages to place the selected pages, sorted ascending, into one PDF."],["Can every page be saved separately?","Yes. One PDF per Page creates a PDF for each page and lets you download the set as a ZIP."],["Can odd and even pages be saved separately?","Yes. Choose odd only, even only, or create both results."],["Is the PDF uploaded to a server?","No. The current implementation reads and creates PDF files locally in the browser."],["Does it split password-protected PDFs?","No. It does not bypass or remove passwords and reports protected or unsupported PDFs clearly."],["Does 1,5,3 preserve that exact order?","No. Selected-page extraction removes duplicates and sorts page numbers ascending."],["Why are multiple results offered as a ZIP?","A ZIP avoids browser blocking of many automatic downloads and makes it less likely that a result file is missed."]],next:"Next work",related:"Related tools",coming:"Connect after integration"},
  ja:{back:"PDFツール",title:"PDF 分割・ページ抽出ツール",desc:"PDFをページ範囲で分けたり、必要なページだけを選んで新しいPDFまたは個別PDFとして保存できます。",local:"ページのコピー・分割・ZIP生成はブラウザ内で処理されます。",how:"使い方",steps:["PDFファイルを1つ選び、総ページ数とページプレビューを確認します。","ページ範囲で分割、指定ページを抽出、ページごとに個別PDF、奇数・偶数ページを分割から方式を選びます。","範囲やページ番号を入力するか、指定ページ抽出ではサムネイルをクリックして選択します。","実行前に予想ファイル数と含まれるページを確認して分割または抽出を実行します。","結果PDFを個別に保存するか、複数結果をZIPでまとめて保存します。"],guideTitle:"PDFを分割するときの実用基準",guide:[
    ["作業区分","範囲分割とページ抽出を使い分ける","1-20、21-40のように複数の区間が必要なら範囲分割、1,3,7-9のように必要なページだけをまとめるなら指定ページ抽出を使います。"],
    ["ページ番号","画面のページ番号は1から","ユーザーが指定するページ番号は1から始まります。内部PDFの0始まりインデックス変換はツール側で処理します。"],
    ["選択整理","重複を除き昇順に整理","同じページを複数回入力しても1回だけ含め、指定ページ抽出は昇順に整理します。サムネイル選択と直接入力は同じ選択状態です。"],
    ["範囲重複","重なる範囲は各結果に残る","1-5と4-8のように範囲が重なる場合、4〜5ページは両方の結果PDFに含まれます。実行前の予想結果を確認してください。"],
    ["原本維持","ページを画像として再生成しない","結果PDFは元のPDFページを新しいPDFへコピーして作成し、画像として再レンダリングしてPDF化する方式ではありません。"],
    ["ZIP保存","ページ別出力はZIPが便利","多数の自動ダウンロードはブラウザに止められる場合があるため、ページごとの個別PDFはZIPでまとめて保存できます。"],
    ["ローカル処理","機密文書もローカル処理","契約書や証明書もサーバーへアップロードせずブラウザ内で処理します。保存前にタブを閉じると結果は保持されません。"],
    ["エラー処理","暗号・破損PDFを無理に処理しない","パスワードを回避したり破損PDFを強制処理せず、入力エラーを明確に表示して正常なPDFで再作業できるようにします。"]],
    caution:"注意事項",cautions:["ブラウザの安定性のため、PDFは1ファイル・最大50MB・300ページまで、範囲指定は最大100件、出力は最大300ファイルです。","1ページのプレビュー失敗と実際のPDFページ抽出失敗は別の問題として扱います。","範囲分割では重なる範囲を許可するため、同じページが複数の結果に含まれる場合があります。","奇数・偶数分割は画面上の1,2,3…ページ番号を基準にします。1ページPDFで空の偶数PDFは作りません。","PDF結合、ページ削除・並べ替え・回転、圧縮、パスワード解除、OCRはこのツールの役割ではありません。","タブを再読み込み・終了すると未保存の結果が失われる場合があります。"],
    faqTitle:"よくある質問",faqMore:"FAQをさらに表示",faqLess:"FAQを閉じる",faqs:[["ページ範囲はどう入力しますか？","1-3 / 4-7 / 8-10のように各結果の範囲を区切ります。カンマ、改行、/、;で区切れます。"],["選択ページを1つのPDFにできますか？","はい。『選択ページを1つのPDFに』を選ぶと、選択したページを昇順で1つのPDFにまとめます。"],["すべてのページを個別PDFにできますか？","はい。ページごとに個別PDFを作成し、複数結果をZIPで保存できます。"],["奇数・偶数ページを別々に保存できますか？","はい。奇数のみ、偶数のみ、または両方を作成できます。"],["PDFはサーバーにアップロードされますか？","いいえ。現在の実装ではブラウザ内でPDFを読み込み、結果を作成します。"],["パスワード付きPDFも分割できますか？","いいえ。パスワードを回避・解除せず、保護または未対応PDFとして案内します。"],["1,5,3と入力するとその順番になりますか？","いいえ。指定ページ抽出は重複を除き、ページ番号を昇順に整理します。"],["複数結果をZIPにする理由は？","多数の自動ダウンロードがブラウザに止められることを避け、結果の取りこぼしを防ぐためです。"]],next:"次の作業",related:"関連ツール",coming:"統合後に接続"}
} as const;

export function SplitExtractPdfPage({locale}:{locale:Locale}){
  const t=copy[locale];
  const jsonLd=[
    {"@context":"https://schema.org","@type":"WebApplication",name:t.title,applicationCategory:"UtilitiesApplication",operatingSystem:"Any",url:`https://toolbox.fixlgs.com/${locale}/split-extract-pdf`,description:t.desc},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"FIXLGS TOOLBOX",item:`https://toolbox.fixlgs.com/${locale}`},{"@type":"ListItem",position:2,name:t.back,item:`https://toolbox.fixlgs.com/${locale}/category/pdf`},{"@type":"ListItem",position:3,name:t.title,item:`https://toolbox.fixlgs.com/${locale}/split-extract-pdf`}]},
    {"@context":"https://schema.org","@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}
  ];
  const disabled=[
    ["028",locale==="ko"?"PDF 합치기":locale==="ja"?"PDF 結合ツール":"Merge PDF"],
    ["030",locale==="ko"?"PDF 페이지 정리 도구":locale==="ja"?"PDF ページ整理ツール":"Organize PDF Pages"],
    ["033",locale==="ko"?"PDF 압축기":locale==="ja"?"PDF 圧縮ツール":"PDF Compressor"]
  ];
  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/pdf`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">029 · PDF</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <SplitExtractPdfTool locale={locale}/>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><div className="toolbox-next-work-card is-disabled"><span>030</span><h3>{disabled[1][1]}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div></div></section>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid"><Link className="toolbox-next-work-card" href={`/${locale}/${tool028Slug}`}><span>028</span><h3>{disabled[0][1]}</h3><div className="toolbox-next-work-card-foot"><span>{locale==="ko"?"바로가기":locale==="ja"?"開く":"Open tool"}</span><strong>→</strong></div></Link>{disabled.slice(1).map(([n,name])=><div key={n} className="toolbox-next-work-card is-disabled"><span>{n}</span><h3>{name}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div>)}</div></section>
    </div></section>
      <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol></section>
      <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy"><div className="toolbox-tool-format-guide-head"><p>PRACTICAL GUIDE</p><h2>{t.guideTitle}</h2><span>{t.desc}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.guide.map(([n,title,desc])=><article key={n}><strong>{n}</strong><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
      <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head toolbox-tool-info-band--full-divider"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2><span>{locale==="ko"?"분할 방식과 예상 결과를 확인한 뒤 다운로드하세요.":locale==="ja"?"分割方法と予想結果を確認してから保存してください。":"Review the split mode and expected outputs before downloading."}</span></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((x)=><li key={x}>{x}</li>)}</ul></section>
      <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs.map(([q,a]):readonly [string,string]=>[q,a])} initialCount={5} moreLabel={t.faqMore} collapseLabel={t.faqLess} className="toolbox-tool-faq-list"/></section>
  </ToolboxSubpageShell>;
}
