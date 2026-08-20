import { ToolNavigation } from "@/components/tool-navigation";
import Link from "next/link";
import type { Locale } from "@/lib/site";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { PdfToImageConverterTool } from "./pdf-to-image-converter-tool";
import { TOOL027_LIMIT_DISPLAY } from "@/lib/tool-027-pdf-image";

const copy = {
  ko: {
    back: "PDF 도구", title: "PDF 이미지 변환기", desc: "PDF의 원하는 페이지를 JPG·PNG 이미지로 변환하고 선택 결과를 개별 파일 또는 ZIP으로 저장하세요.",
    local: "PDF 원본과 변환 이미지는 서버로 전송하거나 저장하지 않고 현재 브라우저에서 처리됩니다.",
    how: "사용 방법", steps: ["PDF 파일을 선택합니다.", "전체 페이지 또는 필요한 페이지만 선택합니다.", "JPG·PNG 형식과 해상도를 정합니다.", "선택 페이지 변환을 실행하고 실제 픽셀 크기를 확인합니다.", "개별 이미지를 받거나 여러 결과를 ZIP으로 저장합니다."],
    examples: [["PDF 표·도표 → 선명한 PNG", "글자와 선이 많은 보고서 페이지는 PNG와 2.0x 이상 해상도를 사용해 경계를 또렷하게 저장합니다."], ["특정 페이지만 JPG로 공유", "100페이지 문서 전체를 변환하지 않고 2, 4, 7페이지만 선택해 메신저나 게시물에 쓰기 좋은 JPG로 만듭니다."], ["여러 페이지 → ZIP 전달", "필요한 페이지를 순서대로 이미지로 만들고 page-001 형태의 파일명으로 묶어 ZIP 하나로 전달합니다."]],
    expertTitle: "PDF를 이미지로 바꿀 때 실전 기준", expertLead: "페이지 선택, 렌더 배율, JPG·PNG 차이, 회전·비율, 대용량 문서와 모바일 메모리까지 실제 변환 결과를 안정적으로 만드는 기준입니다.",
    expert: [["PDF 페이지는 고정 픽셀 원본이 아닙니다", "PDF는 페이지 크기와 벡터·텍스트 정보를 가진 문서 형식이라 이미지처럼 하나의 원본 픽셀 크기가 정해져 있지 않습니다. 027의 해상도는 PDF 페이지를 몇 배율로 래스터화할지 정하는 값이며 결과 width×height를 함께 확인하는 것이 정확합니다."], ["JPG와 PNG는 용도가 다릅니다", "사진과 일반 공유는 JPG가 용량에 유리하고, 작은 글자·선·표·도표처럼 경계가 중요한 문서는 PNG가 편리합니다. PNG에는 JPG 품질 슬라이더가 적용되지 않습니다."], ["필요한 페이지만 고르면 시간과 메모리를 줄일 수 있습니다", "전체 문서가 필요하지 않다면 썸네일이나 1-3,5 같은 범위로 페이지를 줄이는 것이 좋습니다. 고해상도 페이지를 한꺼번에 많이 렌더하는 것보다 필요한 페이지만 순차 변환하는 편이 모바일에서도 안정적입니다."], ["회전과 종횡비는 PDF 페이지 기준을 따릅니다", "세로·가로 페이지가 섞여 있어도 각 PDF 페이지의 viewport와 회전 정보를 그대로 사용해 렌더합니다. 결과 이미지를 억지로 한 방향으로 늘이지 않으므로 원래 페이지 비율을 유지합니다."], ["고해상도는 선명도와 함께 메모리도 증가합니다", "렌더 배율이 커지면 가로와 세로 픽셀이 함께 늘어 canvas 메모리와 결과 파일 크기가 빠르게 증가합니다. 화면 공유에는 표준, 작은 글자와 표에는 선명, 확대·인쇄 보조에만 고해상도를 우선합니다."], ["ZIP은 다중 자동 다운로드보다 안정적인 묶음 방식입니다", "브라우저가 여러 파일 자동 다운로드를 막을 수 있으므로 여러 결과는 ZIP 한 번으로 받는 흐름을 기본으로 합니다. ZIP 내부 파일명은 페이지 번호를 001처럼 맞춰 탐색기 정렬에서도 문서 순서를 유지합니다."], ["페이지 이미지 변환과 원본 이미지 추출은 다릅니다", "027은 사용자가 보는 PDF 페이지 전체를 픽셀 이미지로 렌더합니다. PDF 안에 포함된 사진 원본이나 텍스트 객체를 직접 추출하는 기능은 별도 PDF 텍스트·이미지 추출기의 역할입니다."]],
    caution: "주의사항", cautions: ["고해상도 변환은 페이지 수와 PDF 복잡도에 따라 메모리를 많이 사용할 수 있습니다.", "PDF의 벡터·텍스트는 이미지로 변환하면 편집 가능한 PDF 객체가 아니라 픽셀 이미지가 됩니다.", "암호·권한·손상 PDF는 브라우저에서 열리지 않거나 일부 페이지가 실패할 수 있습니다.", `현재 작업 후보 상한은 파일 ${TOOL027_LIMIT_DISPLAY.maxFileMiB}MB · ${TOOL027_LIMIT_DISPLAY.maxPages}페이지 · 렌더 ${TOOL027_LIMIT_DISPLAY.maxScale.toFixed(1)}x이며 최종 limit 검수 전 확정됩니다.`],
    faq: "자주 묻는 질문", more: "FAQ 더보기", less: "FAQ 접기", faqs: [["PDF 전체를 JPG로 만들 수 있나요?", "예. 전체 페이지를 선택하면 페이지별 JPG를 만들고 여러 결과를 ZIP으로 저장할 수 있습니다."], ["특정 페이지만 변환할 수 있나요?", "예. 썸네일 선택 또는 1-3,5,8 같은 페이지 범위를 사용할 수 있습니다."], ["JPG와 PNG 중 무엇을 쓰면 되나요?", "일반 공유와 작은 용량은 JPG, 글자·선·도표의 경계를 중요하게 보면 PNG가 편리합니다."], ["파일이 서버에 올라가나요?", "아니요. PDF와 결과 이미지는 현재 브라우저에서 처리합니다."], ["해상도를 높이면 무조건 좋은가요?", "아니요. 결과 픽셀과 파일 크기, 메모리 사용량도 함께 증가하므로 용도에 맞는 배율이 좋습니다."], ["암호 PDF도 열 수 있나요?", "PDF.js가 비밀번호 입력을 요청하는 PDF는 브라우저 안에서 비밀번호를 입력해 열 수 있도록 처리합니다. 손상·권한 제한에 따라 열리지 않는 문서도 있습니다."], ["PDF 안의 사진 원본만 추출할 수 있나요?", "아니요. 이 도구는 페이지 전체를 이미지로 렌더합니다. embedded image 추출은 별도 PDF 텍스트·이미지 추출기의 역할입니다."], ["설정을 바꿔 다시 변환할 수 있나요?", "예. PDF와 페이지 선택 상태를 유지한 채 형식·해상도를 바꾸고 다시 변환할 수 있습니다."]],
    related: "관련 도구", next: "다음 작업", coming: "준비 중",
  },
  en: {
    back: "PDF Tools", title: "PDF to Image Converter", desc: "Convert selected PDF pages to JPG or PNG images and download them individually or together as a ZIP.",
    local: "Your PDF and converted images stay in the current browser and are not uploaded or stored on a server.",
    how: "How to use", steps: ["Choose a PDF file.", "Select all pages or only the pages you need.", "Choose JPG or PNG and a resolution.", "Convert the selected pages and review the actual pixel dimensions.", "Download images individually or save multiple results as a ZIP."],
    examples: [["Tables and charts → crisp PNG", "Use PNG and a 2.0x or higher render scale for report pages where small text, lines, and chart edges matter."], ["Share only selected pages as JPG", "Instead of converting a 100-page document, select pages 2, 4, and 7 and create JPG files for messaging or posts."], ["Multiple pages → one ZIP", "Render the selected pages in document order, keep deterministic page-001 filenames, and deliver them in one ZIP."]],
    expertTitle: "Practical rules for converting PDF pages to images", expertLead: "A practical guide to page selection, render scale, JPG vs PNG, rotation, large documents, and mobile memory use.",
    expert: [["PDF pages do not have one fixed source pixel size", "A PDF stores page geometry plus vector, text, and image content rather than one fixed raster size. Resolution here controls the rasterization scale, so the resulting width × height is the clearest value to check."], ["JPG and PNG serve different jobs", "JPG is efficient for photos and general sharing. PNG is useful when small text, lines, tables, and chart edges need crisp boundaries. JPG quality settings do not apply to PNG."], ["Selecting fewer pages saves time and memory", "If you do not need the whole document, use thumbnails or a range such as 1-3,5. Rendering only needed pages sequentially is much safer on mobile than building many high-resolution canvases at once."], ["Rotation and aspect ratio follow the PDF page", "Mixed portrait and landscape pages are rendered from each page viewport and rotation. The tool does not stretch every result into one orientation, so the original page ratio is preserved."], ["Higher scale also means higher memory use", "Increasing render scale raises both width and height, so canvas memory and output size climb quickly. Standard suits screen sharing, Sharp suits small text and charts, and High is best reserved for zoom or print support."], ["ZIP is safer than many automatic downloads", "Browsers may restrict repeated automatic downloads. A single ZIP is the primary bundle for multiple results, with zero-padded page numbers keeping file-system sorting in document order."], ["Page rendering is different from embedded-image extraction", "Tool 027 rasterizes the complete visible PDF page. Extracting original embedded photos or text objects belongs to the separate PDF Text & Image Extractor."]],
    caution: "Important notes", cautions: ["High-resolution conversion can use significant memory on complex or long PDFs.", "PDF vectors and text become raster pixels after conversion and are no longer editable PDF objects.", "Password-protected, restricted, damaged, or unusual PDFs may fail to open or may fail on individual pages.", `The current candidate ceiling is ${TOOL027_LIMIT_DISPLAY.maxFileMiB}MB · ${TOOL027_LIMIT_DISPLAY.maxPages} pages · ${TOOL027_LIMIT_DISPLAY.maxScale.toFixed(1)}x render scale and remains pending the final limit gate.`],
    faq: "FAQ", more: "Show more FAQ", less: "Hide FAQ", faqs: [["Can I convert the whole PDF to JPG?", "Yes. Select all pages and save the generated JPG files together as a ZIP."], ["Can I convert only specific pages?", "Yes. Use thumbnail selection or a range such as 1-3,5,8."], ["Should I use JPG or PNG?", "JPG is convenient for smaller shared files; PNG is useful for crisp text, lines, tables, and charts."], ["Is my file uploaded to a server?", "No. The PDF and converted images are processed in your current browser."], ["Is higher resolution always better?", "No. Higher scale also increases pixel count, file size, and memory use."], ["Can I open a password-protected PDF?", "When PDF.js requests a password, the tool lets you enter it locally in the browser. Some damaged or permission-restricted files may still fail."], ["Can this extract original photos embedded in the PDF?", "No. This tool renders the complete page. Original embedded-image extraction belongs to the separate PDF Text & Image Extractor."], ["Can I change settings and convert again?", "Yes. The PDF and page selection remain available while you change format or resolution and run another conversion."]],
    related: "Related tools", next: "Next work", coming: "COMING SOON",
  },
  ja: {
    back: "PDFツール", title: "PDF 画像変換ツール", desc: "PDFの必要なページをJPG・PNG画像に変換し、個別ファイルまたはZIPで保存できます。",
    local: "PDF原本と変換後の画像はサーバーへ送信・保存せず、現在のブラウザ内で処理します。",
    how: "使い方", steps: ["PDFファイルを選択します。", "すべてのページまたは必要なページだけを選択します。", "JPG・PNG形式と解像度を選びます。", "選択ページを変換し、実際のピクセルサイズを確認します。", "個別画像を保存するか、複数結果をZIPで保存します。"],
    examples: [["表・グラフ → 鮮明なPNG", "小さい文字や線が多い資料ページはPNGと2.0x以上の倍率で、輪郭を鮮明に保存します。"], ["必要なページだけJPGで共有", "100ページすべてではなく2・4・7ページだけを選び、メッセージや投稿向けのJPGに変換します。"], ["複数ページ → ZIPで共有", "必要なページを文書順に変換し、page-001形式のファイル名で1つのZIPにまとめます。"]],
    expertTitle: "PDFを画像に変換するときの実践基準", expertLead: "ページ選択、描画倍率、JPG・PNGの違い、回転・比率、大きい文書とモバイルのメモリまで安定した変換の基準です。",
    expert: [["PDFページには固定の原本ピクセル数がありません", "PDFはページサイズとベクター・テキスト・画像情報を持つ文書形式です。ここでの解像度はページを何倍でラスタライズするかを決めるため、結果のwidth×heightを確認するのが正確です。"], ["JPGとPNGは用途が異なります", "写真や一般共有ではJPGが容量面で便利です。小さい文字、線、表、グラフの輪郭を重視する場合はPNGが向いています。PNGにはJPG品質設定を適用しません。"], ["必要なページだけ選ぶと時間とメモリを節約できます", "文書全体が不要ならサムネイルや1-3,5のような範囲でページを絞ります。高解像度ページを同時に大量生成せず、必要なページを順番に処理する方がモバイルでも安定します。"], ["回転と縦横比はPDFページに従います", "縦横が混在したPDFでも各ページのviewportと回転情報を使います。すべてを同じ向きに引き伸ばさないため、元のページ比率を維持します。"], ["高倍率はメモリ使用量も増やします", "倍率を上げると縦横のピクセルが同時に増えるため、canvasメモリとファイルサイズが急増します。画面共有は標準、小さい文字や表は鮮明、拡大・印刷補助だけ高解像度を優先します。"], ["ZIPは複数自動ダウンロードより安定します", "ブラウザは連続自動ダウンロードを制限することがあります。複数結果は1つのZIPを基本とし、001形式のページ番号でファイル順も維持します。"], ["ページ画像化と埋め込み画像抽出は別機能です", "027は表示されるPDFページ全体をピクセル画像にします。PDF内の元画像やテキストオブジェクトを直接抽出する機能は別のPDFテキスト・画像抽出ツールの役割です。"]],
    caution: "注意事項", cautions: ["高解像度変換はページ数やPDFの複雑さによってメモリ使用量が増えます。", "PDFのベクターやテキストは変換後に編集可能なPDFオブジェクトではなくピクセル画像になります。", "パスワード・権限・破損・特殊なPDFは開けない、または一部ページだけ失敗する場合があります。", `現在の候補上限は${TOOL027_LIMIT_DISPLAY.maxFileMiB}MB・${TOOL027_LIMIT_DISPLAY.maxPages}ページ・描画${TOOL027_LIMIT_DISPLAY.maxScale.toFixed(1)}xで、最終limit検証前に確定します。`],
    faq: "よくある質問", more: "FAQをもっと見る", less: "FAQを閉じる", faqs: [["PDF全体をJPGにできますか？", "はい。すべてのページを選択して、生成したJPGをZIPで保存できます。"], ["特定ページだけ変換できますか？", "はい。サムネイルまたは1-3,5,8のような範囲入力を使えます。"], ["JPGとPNGはどちらが良いですか？", "小さい共有ファイルはJPG、文字・線・表・グラフの輪郭を重視する場合はPNGが便利です。"], ["ファイルはサーバーへ送信されますか？", "いいえ。PDFと変換後の画像は現在のブラウザ内で処理します。"], ["解像度は高いほど良いですか？", "いいえ。ピクセル数、ファイルサイズ、メモリ使用量も増えるため、用途に合う倍率を選びます。"], ["パスワード付きPDFも開けますか？", "PDF.jsがパスワードを要求するPDFはブラウザ内で入力して開けるようにします。破損や権限制限により開けない文書もあります。"], ["PDF内の元画像だけ抽出できますか？", "いいえ。このツールはページ全体を画像化します。埋め込み元画像の抽出は別のPDFテキスト・画像抽出ツールの役割です。"], ["設定を変更して再変換できますか？", "はい。PDFとページ選択を維持したまま形式・解像度を変更して再変換できます。"]],
    related: "関連ツール", next: "次の作業", coming: "準備中",
  },
} as const;

export function PdfToImageConverterPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/pdf-to-image-converter`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", name: t.title, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", url, description: t.desc, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
      { "@type": "FAQPage", mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` },
        { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/pdf` },
        { "@type": "ListItem", position: 3, name: t.title, item: url },
      ] },
    ],
  };

  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/pdf`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">027 · PDF</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <PdfToImageConverterTool locale={locale} />
      <ToolNavigation locale={locale} currentTool={27} />
      
    </div></section>
    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide toolbox-tool-use-cases--editorial"><div className="toolbox-tool-format-guide-head"><p>USE CASES</p><h2>{locale === "ko" ? "활용 예시" : locale === "ja" ? "活用例" : "Use cases"}</h2></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.examples.map(([title, description], index) => <article key={title}><strong>{String(index + 1).padStart(2, "0")}</strong><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
    <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy"><div className="toolbox-tool-format-guide-head"><p>EXPERT POST</p><h2>{t.expertTitle}</h2><span>{t.expertLead}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{t.expert.map(([title, description]) => <article key={title}><h4>{title}</h4><p>{description}</p></article>)}</div></div></section>
    <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head toolbox-tool-info-band--full-divider"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2><span>{t.local}</span></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faq}</h2></div><ToolboxFaqList items={t.faqs.map(([q, a]): readonly [string, string] => [q, a])} initialCount={5} moreLabel={t.more} collapseLabel={t.less} className="toolbox-tool-faq-list" /></section>
    <section className="toolbox-tool-processing-note"><p>{t.local}</p></section>
  </ToolboxSubpageShell>;
}
