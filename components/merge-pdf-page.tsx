import Link from "next/link";
import { MergePdfTool } from "./merge-pdf-tool";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const copy = {
  ko: {
    back: "PDF 도구",
    title: "PDF 합치기",
    desc: "여러 PDF를 원하는 파일 순서대로 정렬하고 페이지를 확인한 뒤, 원본 페이지 품질을 불필요하게 바꾸지 않고 하나의 PDF로 합칩니다.",
    local: "PDF 내용은 서버로 업로드하지 않고 현재 브라우저에서 처리합니다.",
    next: "다음 작업",
    coming: "준비 중",
    related: "관련 도구",
    how: "사용 방법",
    steps: [
      "합칠 PDF 파일을 두 개 이상 선택하거나 작업영역에 끌어다 놓습니다.",
      "파일 카드의 첫 페이지 미리보기, 페이지 수, 파일 크기를 확인합니다.",
      "드래그 또는 위·아래·맨앞·맨뒤 이동 버튼으로 최종 병합 순서를 정합니다.",
      "필요한 파일의 페이지 미리보기를 열어 문서가 맞는지 확인하고 결과 파일명을 입력합니다.",
      "PDF 합치기를 실행한 뒤 결과 페이지 수와 파일 크기를 확인하고 완성된 PDF를 다운로드합니다.",
    ],
    guideTitle: "PDF 병합에서 꼭 확인할 기준",
    guide: [
      ["파일 순서", "파일 순서가 곧 결과 순서", "카드에 표시되는 1, 2, 3번 순서가 실제 병합 순서입니다. 이동 직후에도 최신 순서를 기준으로 결과를 만듭니다."],
      ["원본 유지", "원본 페이지를 이미지로 바꾸지 않음", "병합할 때 페이지를 JPG나 Canvas 이미지로 다시 만들지 않고 PDF 페이지 객체를 복사해 불필요한 화질 저하와 재압축을 피합니다."],
      ["페이지 유지", "가로·세로와 페이지 크기 유지", "A4 세로와 가로 문서, 서로 다른 크기의 PDF가 섞여도 각 원본 페이지 크기와 방향을 그대로 이어 붙이는 것을 기본으로 합니다."],
      ["기능 구분", "미리보기와 편집 기능 구분", "미리보기는 문서와 페이지 순서를 확인하기 위한 기능입니다. 페이지 삭제·회전·복제·페이지 단위 재정렬은 별도 PDF 페이지 정리 도구 영역입니다."],
      ["오류 처리", "오류 파일을 조용히 건너뛰지 않음", "손상 PDF, 암호화 PDF, PDF가 아닌 파일은 어떤 파일에서 문제가 생겼는지 표시하고 정상 파일만 몰래 합친 결과를 만들지 않습니다."],
      ["결과 검증", "완성 결과를 다시 확인", "병합 후 결과 PDF를 다시 열어 예상한 총 페이지 수와 실제 결과 페이지 수가 같은지 확인한 뒤 다운로드 상태로 전환합니다."],
    ],
    caution: "주의사항",
    cautions: [
      "암호화되었거나 손상된 PDF는 브라우저 라이브러리에서 열 수 없어 병합 대상에서 제외될 수 있으며, 문제 파일을 명확히 표시합니다.",
      "페이지가 매우 많거나 용량이 큰 PDF 여러 개는 스마트폰 메모리와 브라우저 성능 때문에 서비스 한도를 넘을 수 있습니다.",
      "병합은 페이지를 이어 붙이는 기능입니다. 문서 내부 링크, 북마크, 폼, 디지털 서명 같은 고급 PDF 구조가 병합 후에도 원본과 완전히 동일하다고 보장하지 않습니다.",
      "디지털 서명이 포함된 PDF를 다른 문서와 병합하면 기존 서명의 유효성에 영향을 줄 수 있습니다.",
      "같은 파일을 의도적으로 두 번 추가하면 각각 독립 항목으로 취급해 같은 PDF를 반복 병합할 수 있습니다.",
    ],
    faqTitle: "자주 묻는 질문",
    faqMore: "FAQ 더보기",
    faqLess: "FAQ 접기",
    faqs: [
      ["PDF 순서를 바꿀 수 있나요?", "네. PC에서는 드래그할 수 있고, 모바일·키보드 사용자를 위해 위·아래·맨앞·맨뒤 이동 버튼도 제공합니다."],
      ["페이지 하나만 삭제하거나 회전할 수 있나요?", "아니요. 028은 파일 단위 병합 도구입니다. 페이지 삭제·회전·복제·페이지 단위 재정렬은 030 PDF 페이지 정리 도구 영역입니다."],
      ["파일이 서버에 업로드되나요?", "아니요. PDF 파싱, 미리보기와 병합 결과 생성은 현재 브라우저에서 처리하며 문서 내용을 서버로 보내는 흐름을 사용하지 않습니다."],
      ["병합하면 화질이 떨어지나요?", "페이지를 이미지로 다시 렌더링해 붙이지 않고 원본 PDF 페이지 객체를 복사하는 방식이라 불필요한 래스터화와 재압축을 피합니다."],
      ["가로 PDF와 세로 PDF를 같이 합쳐도 되나요?", "네. 서로 다른 페이지 방향과 크기를 한 결과 PDF 안에 그대로 유지하도록 병합합니다."],
      ["암호가 걸린 PDF도 합칠 수 있나요?", "현재 028은 암호 해제 기능을 제공하지 않습니다. 암호화 PDF가 감지되면 해당 파일을 알려주고 병합을 중단합니다."],
      ["같은 PDF를 두 번 넣을 수 있나요?", "네. 같은 파일도 각각 독립 항목으로 추가할 수 있으며 현재 카드 순서에 따라 반복 병합됩니다."],
      ["결과 파일명을 직접 정할 수 있나요?", "네. 파일명을 입력하면 .pdf 확장자를 자동으로 붙이고, 중복 확장자와 Windows에서 사용할 수 없는 문자를 정리합니다."],
    ],
  },
  en: {
    back: "PDF Tools",
    title: "Merge PDF",
    desc: "Arrange multiple PDFs in the exact file order you want, inspect their pages, and combine them without unnecessarily changing the original page quality.",
    local: "PDF contents stay in this browser and are not uploaded to a server.",
    next: "Next work",
    coming: "Coming soon",
    related: "Related tools",
    how: "How to use",
    steps: [
      "Select at least two PDF files or drop them into the work area.",
      "Check each file card for its first-page preview, page count, and file size.",
      "Set the final merge order with drag-and-drop or the Up, Down, First, and Last controls.",
      "Open page preview when needed, confirm the documents, and enter the result filename.",
      "Run Merge PDF, verify the result page count and size, then download the completed PDF.",
    ],
    guideTitle: "What to verify before merging PDFs",
    guide: [
      ["File order", "Card order is result order", "The visible 1, 2, 3 order is the merge order. A merge started immediately after moving a card uses the latest order."],
      ["Keep source", "Do not rasterize source pages", "The merge copies PDF page objects instead of rebuilding each page as a JPG or canvas image, avoiding unnecessary quality loss and recompression."],
      ["Keep pages", "Keep page size and orientation", "Portrait, landscape, A4, and other page sizes can coexist in one result while retaining each source page's original geometry."],
      ["Feature scope", "Preview is not page editing", "Preview is for confirming documents and pages. Deleting, rotating, duplicating, or reordering individual pages belongs to the separate page organizer tool."],
      ["Error handling", "Never silently skip a bad file", "Corrupt, encrypted, or non-PDF inputs are identified instead of being omitted while the remaining files are merged without warning."],
      ["Verify result", "Re-open the generated result", "After merging, the generated PDF is parsed again and its real page count must match the expected total before the result is presented as complete."],
    ],
    caution: "Important notes",
    cautions: [
      "Encrypted or corrupt PDFs may not be readable by browser PDF libraries. The affected file is identified instead of silently skipped.",
      "Very large or high-page-count documents can exceed browser and smartphone memory limits.",
      "Merging appends pages. Advanced structures such as internal links, bookmarks, forms, and digital signatures are not guaranteed to remain identical after merge.",
      "Combining a digitally signed PDF with other documents can affect the validity of the existing signature.",
      "Adding the same file more than once intentionally creates separate items, so a document can be repeated in the merged result.",
    ],
    faqTitle: "FAQ",
    faqMore: "Show more FAQs",
    faqLess: "Collapse FAQs",
    faqs: [
      ["Can I change PDF order?", "Yes. Use drag-and-drop on desktop or the Up, Down, First, and Last controls, which also work for mobile and keyboard users."],
      ["Can I delete or rotate a single page here?", "No. Tool 028 merges whole files. Page deletion, rotation, duplication, and page-level reordering belong to Tool 030 PDF Page Organizer."],
      ["Are my files uploaded to a server?", "No. PDF parsing, previews, and merged-file generation are designed to run in the current browser without sending document contents to a server."],
      ["Will merging reduce PDF quality?", "The merge copies PDF page objects rather than rasterizing pages into images, avoiding unnecessary image-based quality loss and recompression."],
      ["Can portrait and landscape PDFs be mixed?", "Yes. Different source page dimensions and orientations are retained in the merged document."],
      ["Can I merge password-protected PDFs?", "Tool 028 does not remove passwords. An encrypted PDF is reported as an error and the merge is stopped."],
      ["Can I add the same PDF twice?", "Yes. Duplicate additions are independent items and are merged wherever they appear in the current order."],
      ["Can I choose the output filename?", "Yes. The tool adds .pdf automatically, prevents duplicate extensions, and normalizes characters that are invalid in Windows filenames."],
    ],
  },
  ja: {
    back: "PDFツール",
    title: "PDF 結合ツール",
    desc: "複数のPDFを希望するファイル順に並べ、ページを確認してから、元ページの品質を不要に変えず1つのPDFへ結合します。",
    local: "PDFの内容はサーバーへアップロードせず、このブラウザ内で処理します。",
    next: "次の作業",
    coming: "準備中",
    related: "関連ツール",
    how: "使い方",
    steps: [
      "結合するPDFを2つ以上選択するか、作業エリアへドラッグ＆ドロップします。",
      "各ファイルカードの先頭ページプレビュー、ページ数、ファイルサイズを確認します。",
      "ドラッグ、または上・下・先頭・末尾ボタンで最終的な結合順を決めます。",
      "必要なPDFのページプレビューを開いて内容を確認し、出力ファイル名を入力します。",
      "PDF結合を実行し、結果のページ数とサイズを確認して完成したPDFをダウンロードします。",
    ],
    guideTitle: "PDF結合で確認する重要ポイント",
    guide: [
      ["ファイル順", "カード順がそのまま結果順", "画面の1、2、3の順番が実際の結合順です。移動直後に実行しても最新の順序を使用します。"],
      ["原本維持", "元ページを画像化しない", "結合時に各ページをJPGやCanvas画像へ作り直さず、PDFページオブジェクトをコピーして不要な画質低下や再圧縮を避けます。"],
      ["ページ維持", "縦横とページサイズを維持", "縦・横、A4、その他の異なるページサイズが混在しても、各元ページのサイズと向きを維持して1つにまとめます。"],
      ["機能区分", "プレビューとページ編集を分離", "プレビューは文書確認用です。ページ削除・回転・複製・ページ単位の並べ替えは別のPDFページ整理ツールの役割です。"],
      ["エラー処理", "問題ファイルを黙って飛ばさない", "破損、暗号化、PDFではない入力を特定し、問題ファイルだけを黙って除外した不完全な結果を作りません。"],
      ["結果検証", "生成結果を再確認", "結合後のPDFをもう一度解析し、予想ページ数と実際の結果ページ数が一致してから完了状態にします。"],
    ],
    caution: "注意事項",
    cautions: [
      "暗号化・破損したPDFはブラウザライブラリで開けない場合があり、問題のあるファイルを明示します。",
      "ページ数や容量が非常に大きいPDFを複数処理すると、スマートフォンやブラウザのメモリ上限を超える場合があります。",
      "結合はページを連結する機能です。内部リンク、ブックマーク、フォーム、電子署名などの高度な構造が結合後も完全に同一とは保証しません。",
      "電子署名付きPDFを別文書と結合すると、既存署名の有効性に影響する場合があります。",
      "同じPDFを意図して複数回追加した場合は、それぞれ独立項目として扱い、結果内で繰り返すことができます。",
    ],
    faqTitle: "よくある質問",
    faqMore: "FAQをもっと見る",
    faqLess: "FAQを閉じる",
    faqs: [
      ["PDFの順番を変更できますか？", "はい。PCではドラッグでき、モバイル・キーボード向けに上・下・先頭・末尾の移動ボタンも用意しています。"],
      ["1ページだけ削除・回転できますか？", "いいえ。028はファイル単位の結合ツールです。ページ削除・回転・複製・ページ単位の並べ替えは030 PDFページ整理ツールの範囲です。"],
      ["ファイルはサーバーへアップロードされますか？", "いいえ。PDF解析、プレビュー、結合結果の生成は現在のブラウザ内で行い、文書内容をサーバーへ送信しない設計です。"],
      ["結合すると画質が落ちますか？", "ページを画像化せずPDFページオブジェクトをコピーする方式なので、不要なラスター化や再圧縮を避けます。"],
      ["縦向きと横向きPDFを一緒にできますか？", "はい。異なるページサイズや向きをそれぞれ維持したまま1つのPDFに結合します。"],
      ["パスワード付きPDFも結合できますか？", "028にはパスワード解除機能がありません。暗号化PDFを検出した場合はエラーを表示して結合を停止します。"],
      ["同じPDFを2回追加できますか？", "はい。同じファイルも独立した項目として追加でき、現在のカード順の位置で繰り返し結合されます。"],
      ["結果ファイル名を指定できますか？", "はい。.pdfを自動付与し、拡張子の重複とWindowsで使えない文字を正規化します。"],
    ],
  },
} as const;

export function MergePdfPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/merge-pdf`;
  const related = [
    { n: "026", slug: "image-to-pdf", name: locale === "ko" ? "이미지 PDF 변환기" : locale === "en" ? "Image to PDF Converter" : "画像PDF変換ツール" },
    { n: "027", slug: "pdf-to-image-converter", name: locale === "ko" ? "PDF 이미지 변환기" : locale === "en" ? "PDF to Image Converter" : "PDF画像変換ツール" },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", name: t.title, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", url, description: t.desc, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, featureList: ["Merge multiple PDFs", "Reorder PDF files", "Page preview", "Custom output filename", "Browser-local processing"] },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` }, { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/pdf` }, { "@type": "ListItem", position: 3, name: t.title, item: url }] },
      { "@type": "FAQPage", mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };
  return (
    <ToolboxSubpageShell locale={locale} appName={t.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
        <Link className="toolbox-subpage-back" href={`/${locale}/category/pdf`}>← {t.back}</Link>
        <p className="toolbox-subpage-eyebrow">028 · PDF</p>
        <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
        <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
      </section>
      <section className="toolbox-tool-detail-body"><div>
        <MergePdfTool locale={locale} />
        <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><div className="toolbox-next-work-card is-disabled"><span>029</span><h3>{locale === "ko" ? "PDF 분할·페이지 추출기" : locale === "en" ? "PDF Split & Page Extractor" : "PDF分割・ページ抽出ツール"}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div></div></section>
        <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid">{related.map((item) => <Link key={item.n} className="toolbox-next-work-card" href={`/${locale}/${item.slug}`}><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>{locale === "ko" ? "사용 가능" : locale === "ja" ? "利用可能" : "AVAILABLE"}</span><strong>↗</strong></div></Link>)}</div></section>
      </div></section>
        <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>
        <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy"><div className="toolbox-tool-format-guide-head"><p>WORKFLOW GUIDE</p><h2>{t.guideTitle}</h2><span>{t.desc}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.guide.map(([n, title, desc]) => <article key={n}><strong>{n}</strong><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
        <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head toolbox-tool-info-band--full-divider"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2><span>{locale === "ko" ? "병합 순서와 결과 페이지 수를 확인한 뒤 다운로드하세요." : locale === "ja" ? "結合順と結果ページ数を確認してからダウンロードしてください。" : "Verify the merge order and result page count before downloading."}</span></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs.map(([q, a]): readonly [string, string] => [q, a])} initialCount={5} moreLabel={t.faqMore} collapseLabel={t.faqLess} className="toolbox-tool-faq-list" /></section>
    </ToolboxSubpageShell>
  );
}
