import { ToolNavigation } from "@/components/tool-navigation";
import Link from "next/link";
import type { Locale } from "@/lib/site";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { ImageToPdfTool } from "./image-to-pdf-tool";
import { PDF_LIMIT_DISPLAY, PDF_LIMITS } from "@/lib/tool-026-pdf";

const copy = {
  ko: {
    back: "PDF 도구",
    title: "이미지 PDF 변환기",
    desc: "JPG·PNG 이미지 한 장 또는 여러 장을 원하는 순서로 정리해 A4·Letter PDF로 만드세요.",
    local: "이미지와 생성 PDF는 서버로 전송하거나 저장하지 않고 현재 브라우저에서 처리됩니다.",
    how: "사용 방법",
    steps: [
      "JPG·PNG 이미지를 한 장 또는 여러 장 선택합니다.",
      "썸네일 순서를 확인하고 필요하면 드래그 또는 이동 버튼으로 바꿉니다.",
      "A4·Letter, 방향, 여백을 설정하고 페이지 미리보기를 확인합니다.",
      "PDF 만들기를 누른 뒤 페이지 수와 용량을 확인하고 다운로드합니다.",
    ],
    examples: [
      ["영수증 JPG 6장 → A4 PDF", "촬영한 영수증 6장을 실제 문서 순서로 정렬하고 A4·세로 방향으로 한 장당 한 페이지씩 묶어 제출용 PDF 한 파일로 만듭니다."],
      ["PNG 안내 이미지 3장 → Letter + 10mm", "안내 이미지 3장을 US Letter와 10mm 여백으로 배치해 가장자리에 공간을 남기고 인쇄하기 편한 PDF로 만듭니다."],
      ["세로·가로 사진 10장 → Auto", "세로 사진과 가로 사진이 섞인 10장은 Auto 방향을 사용해 이미지 비율에 따라 페이지 방향을 바꾸고 불필요한 빈 공간을 줄입니다."],
    ],
    expertTitle: "이미지를 PDF로 만들때 실전 기준",
    expertLead: "A4·Letter 선택부터 방향·여백·원본 비율·투명 PNG·고해상도 이미지까지, 실제 PDF 결과를 안정적으로 만드는 기준을 작업 흐름에 맞춰 정리했습니다.",
    expert: [
      ["A4와 Letter는 최종 사용처에 맞춰 선택", "A4는 한국·일본을 포함한 많은 지역의 문서 작업에 흔히 쓰이고, US Letter는 Letter 규격을 요구하는 환경에 맞출 때 사용합니다. 단순히 화면에 잘 맞는 쪽이 아니라 제출·인쇄·공유할 문서 규격을 먼저 정한 뒤 페이지 크기를 고르는 것이 안전합니다."],
      ["Portrait·Landscape·Auto의 역할을 구분", "세로 문서 중심이면 Portrait, 가로 이미지 중심이면 Landscape가 단순합니다. 세로·가로 이미지가 섞여 있다면 Auto를 사용해 각 이미지 비율에 따라 페이지 방향을 정하면 회전이나 과도한 빈 공간을 줄이기 쉽습니다."],
      ["여백은 장식이 아니라 인쇄·가독성 공간", "0mm는 이미지를 크게 보여주기 좋지만 프린터의 비인쇄 영역이나 문서 가장자리와 맞닿을 수 있습니다. 5·10·20mm 같은 여백은 출력물의 안정성과 읽기 편한 공간을 만드는 데 유용하며, 사용자 지정값은 실제 페이지 가용 영역을 넘지 않아야 합니다."],
      ["No Stretch와 contain으로 원본 비율 유지", "PDF 페이지 비율과 사진 비율이 달라도 이미지를 강제로 늘이지 않습니다. 가용 영역 안에 contain 방식으로 맞추면 일부 여백이 생길 수 있지만 원본의 사람·문서·그래픽 비율이 찌그러지는 문제를 피할 수 있습니다."],
      ["투명 PNG는 흰 페이지 위 합성 결과 확인", "투명 영역이 있는 PNG는 PDF 처리 과정에서 배경이 예상과 다르게 보일 수 있습니다. 026은 흰 페이지 배경을 기준으로 자연스럽게 합성하는 방향을 사용하므로 로고·도식·캡처 이미지의 투명 영역이 검은색처럼 변하지 않는지 결과를 확인합니다."],
      ["고해상도 이미지는 PDF 용량과 메모리를 함께 증가", "원본 픽셀이 큰 사진을 여러 장 넣으면 페이지 수뿐 아니라 PDF 용량과 브라우저 메모리 사용량도 커집니다. 페이지에 맞춰 표시 크기를 줄여도 원본 데이터 자체가 가벼워지는 전문 압축 기능은 아니므로, 용량을 더 줄여야 하면 PDF 압축 도구를 후속 작업으로 사용하는 편이 맞습니다."],
      ["이미지 PDF와 OCR PDF는 목적이 다름", "이 도구는 이미지 자체를 PDF 페이지에 배치합니다. 사진 속 글자를 검색·선택 가능한 텍스트로 바꾸는 OCR은 수행하지 않으므로, 검색 가능한 문서가 필요하면 OCR 기능이 있는 별도 도구가 필요합니다."],
      ["생성 후에는 순서·페이지 수·용량을 다시 확인", "여러 이미지를 PDF로 묶을 때 가장 흔한 실수는 페이지 순서입니다. 생성 직전 썸네일 순서를 확인하고, 생성 후 실제 페이지 수와 Blob 용량을 확인한 뒤 다운로드하면 순서 오류나 예상보다 큰 결과 파일을 빠르게 발견할 수 있습니다."],
    ],
    caution: "주의사항",
    cautions: [
      "이 도구는 OCR을 수행하지 않으므로 이미지 속 글자는 검색 가능한 PDF 텍스트로 변환되지 않습니다.",
      "큰 고해상도 이미지가 많으면 PDF 용량과 브라우저 메모리 사용량이 증가합니다.",
      "페이지에 맞춰 확대해도 원본 이미지의 실제 해상도가 좋아지는 것은 아닙니다.",
      `한 번에 최대 ${PDF_LIMITS.maxFiles}장, 파일당 ${PDF_LIMIT_DISPLAY.maxFileMiB}MB, 전체 ${PDF_LIMIT_DISPLAY.maxTotalMiB}MB, 이미지당 ${PDF_LIMIT_DISPLAY.maxPixelsMP}MP를 기본 서비스 상한으로 적용합니다.`,
    ],
    faq: "자주 묻는 질문",
    more: "FAQ 더보기",
    less: "FAQ 접기",
    faqs: [
      ["여러 이미지를 PDF 한 파일로 만들 수 있나요?", "예. 선택한 이미지 순서대로 각 이미지를 한 페이지씩 배치해 하나의 PDF로 생성합니다."],
      ["이미지 순서를 바꿀 수 있나요?", "예. PC에서는 드래그, 모바일에서는 이동 버튼으로 순서를 바꿀 수 있습니다."],
      ["A4와 Letter를 지원하나요?", "예. A4와 US Letter, 세로·가로·자동 방향을 지원합니다."],
      ["사진이 찌그러지나요?", "아니요. 원본 비율을 유지한 contain 방식으로 배치합니다."],
      ["이미지가 서버로 올라가나요?", "아니요. 이미지와 결과 PDF는 현재 브라우저에서 처리됩니다."],
      ["PDF 안의 글자를 검색할 수 있나요?", "아니요. 이 도구는 이미지를 PDF 페이지에 배치하며 OCR은 하지 않습니다."],
      ["생성 후 설정을 바꿔 다시 만들 수 있나요?", "예. 이미지 목록과 설정을 유지한 채 순서·페이지 크기·방향·여백을 바꾸고 다시 생성할 수 있습니다."],
    ],
    next: "다음 작업",
    related: "관련 도구",
    coming: "준비 중",
  },
  en: {
    back: "PDF Tools",
    title: "Image to PDF Converter",
    desc: "Arrange one or multiple JPG and PNG images in any order and create an A4 or Letter PDF.",
    local: "Images and generated PDFs are processed in your browser and are not uploaded or stored on our server.",
    how: "How to use",
    steps: [
      "Choose one or multiple JPG or PNG images.",
      "Review the thumbnail order and reorder with drag or move buttons if needed.",
      "Set A4 or Letter, orientation, and margins, then review page previews.",
      "Create the PDF, confirm the page count and size, then download it.",
    ],
    examples: [
      ["6 receipt JPGs → A4 PDF", "Arrange six photographed receipts in document order and place each on its own A4 portrait page to create one submission-ready PDF."],
      ["3 PNG guides → Letter + 10 mm", "Place three instruction images on US Letter pages with 10 mm margins to keep printable space around the edges."],
      ["10 mixed photos → Auto", "For a mix of portrait and landscape photos, use Auto so each page follows the image orientation and avoids unnecessary empty space."],
    ],
    expertTitle: "Practical standards for image quality and page layout when creating PDFs",
    expertLead: "Use these checks for A4 vs Letter, orientation, margins, aspect ratio, transparent PNGs, and large source images before exporting the final PDF.",
    expert: [
      ["Choose A4 or Letter for the final destination", "A4 is common in many document workflows, while US Letter is appropriate where Letter-sized documents are required. Pick the target document standard for submission, printing, or sharing rather than whichever option merely looks better on screen."],
      ["Use Portrait, Landscape, and Auto for different jobs", "Portrait is simple for mostly vertical documents and Landscape for mostly wide images. When orientations are mixed, Auto can select the page direction per image and reduce unnecessary rotation or blank space."],
      ["Margins are functional print and reading space", "A 0 mm margin maximizes image area but can touch page edges or printer non-printable areas. Presets such as 5, 10, and 20 mm create breathing room for printed documents, while custom values must still leave a valid page area."],
      ["Preserve the source ratio with No Stretch and contain", "The PDF page and source image can have different aspect ratios. Contain placement fits the image inside the available area without forcing its width or height, so people, documents, and graphics are not distorted."],
      ["Check transparent PNGs against a white page", "Transparent pixels can appear unexpectedly when images are embedded into documents. Tool 026 uses a white page background policy so logos, diagrams, and screenshots do not turn into black-backed images in the PDF."],
      ["Large images increase both PDF size and memory use", "Many high-pixel photos increase browser memory and generated PDF size. Fitting them visually to the page is not the same as professional PDF compression, so use a dedicated PDF compressor afterward when a smaller file is required."],
      ["Image PDFs and OCR PDFs solve different problems", "This tool places the image itself on a PDF page. It does not convert visible letters into searchable or selectable text, so searchable documents require a separate OCR workflow."],
      ["Recheck order, page count, and file size before saving", "Page order is a common failure point when combining many images. Verify thumbnail order before generation, then confirm the measured page count and Blob size before downloading the final file."],
    ],
    caution: "Important notes",
    cautions: [
      "This tool does not run OCR, so text inside images will not become searchable PDF text.",
      "Many large high-resolution images increase PDF size and browser memory use.",
      "Fitting an image to a page does not increase the real source resolution.",
      `Default service limits are ${PDF_LIMITS.maxFiles} images, ${PDF_LIMIT_DISPLAY.maxFileMiB}MB per file, ${PDF_LIMIT_DISPLAY.maxTotalMiB}MB total, and ${PDF_LIMIT_DISPLAY.maxPixelsMP}MP per image.`,
    ],
    faq: "FAQ",
    more: "Show more FAQ",
    less: "Hide FAQ",
    faqs: [
      ["Can I create one PDF from multiple images?", "Yes. Each image becomes one PDF page in the order shown."],
      ["Can I reorder images?", "Yes. Use drag on desktop or dedicated move buttons on mobile."],
      ["Are A4 and Letter supported?", "Yes. A4 and US Letter are supported with portrait, landscape, and auto orientation."],
      ["Will photos be stretched?", "No. The original aspect ratio is preserved with contain placement."],
      ["Are images uploaded to a server?", "No. Images and the generated PDF are processed in your current browser."],
      ["Can I search text inside the PDF?", "No. This tool does not perform OCR."],
      ["Can I change settings after generating?", "Yes. The edit state stays available so you can change order, page size, orientation, or margins and generate again."],
    ],
    next: "Next work",
    related: "Related tools",
    coming: "Coming soon",
  },
  ja: {
    back: "PDFツール",
    title: "画像 PDF 変換ツール",
    desc: "JPG・PNG画像を1枚または複数枚、好きな順番でA4・Letter PDFに変換できます。",
    local: "画像と生成PDFはサーバーへ送信・保存せず、現在のブラウザ内で処理します。",
    how: "使い方",
    steps: [
      "JPG・PNG画像を1枚または複数枚選択します。",
      "サムネイル順を確認し、必要ならドラッグまたは移動ボタンで変更します。",
      "A4・Letter、向き、余白を設定してページプレビューを確認します。",
      "PDFを作成し、ページ数と容量を確認してダウンロードします。",
    ],
    examples: [
      ["領収書JPG 6枚 → A4 PDF", "撮影した領収書6枚を文書の順番に並べ、A4縦向きで1画像1ページに配置して提出用PDF 1ファイルにまとめます。"],
      ["案内PNG 3枚 → Letter + 10mm", "案内画像3枚をUS Letterと10mm余白で配置し、端に印刷用の空間を残したPDFを作成します。"],
      ["縦横混在10枚 → Auto", "縦写真と横写真が混在する場合はAutoを使い、画像比率に合わせてページ向きを切り替えて不要な空白を減らします。"],
    ],
    expertTitle: "画像をPDF化するときの画質とページ構成を決める実践基準",
    expertLead: "A4・Letter、向き、余白、元画像比率、透過PNG、高解像度画像まで、安定したPDF結果を作るための確認基準をまとめています。",
    expert: [
      ["A4とLetterは最終用途で選ぶ", "A4は多くの文書作業で一般的に使われ、US LetterはLetter規格が必要な環境に合わせるときに使います。画面上の見た目だけでなく、提出・印刷・共有先の文書規格を先に決めて選択します。"],
      ["Portrait・Landscape・Autoを使い分ける", "縦長文書が中心ならPortrait、横長画像が中心ならLandscapeが分かりやすい選択です。縦横が混在する場合はAutoで画像ごとに向きを決めると、不要な回転や空白を減らしやすくなります。"],
      ["余白は印刷と読みやすさのための空間", "0mmは画像を大きく表示できますが、ページ端やプリンターの非印刷領域に近づく場合があります。5・10・20mmの余白は印刷時の安定性と読みやすい空間を作り、カスタム値でも有効な配置領域を残す必要があります。"],
      ["No Stretchとcontainで元の比率を維持", "PDFページと画像の比率が違っても幅や高さを強制的に引き伸ばしません。利用可能領域にcontainで収めることで余白が出る場合はありますが、人物・文書・図形が歪む問題を防げます。"],
      ["透過PNGは白いページ上で確認", "透明部分を含むPNGはPDFへの埋め込み方法によって背景の見え方が変わる場合があります。026は白いページ背景を基準に合成し、ロゴや図の透明部分が黒く見えないよう結果を確認します。"],
      ["高解像度画像はPDF容量とメモリを増やす", "大きなピクセル数の写真を多数使うと、生成PDFの容量とブラウザメモリ使用量が増えます。ページ上の表示サイズを小さくしても専門的なPDF圧縮とは異なるため、さらに容量を減らす場合は後続のPDF圧縮ツールを使います。"],
      ["画像PDFとOCR PDFは目的が異なる", "このツールは画像そのものをPDFページに配置します。画像内の文字を検索・選択可能なテキストに変換するOCRは行わないため、検索可能な文書には別のOCR処理が必要です。"],
      ["保存前に順番・ページ数・容量を再確認", "複数画像をまとめるときはページ順の間違いが起きやすいため、作成前にサムネイル順を確認します。作成後は実際のページ数とBlob容量を確認してからダウンロードすると、順番や容量の問題を早く発見できます。"],
    ],
    caution: "注意事項",
    cautions: [
      "OCRは行わないため、画像内の文字は検索可能なPDFテキストにはなりません。",
      "高解像度画像が多いほどPDF容量とブラウザメモリ使用量が増えます。",
      "ページに合わせて拡大しても元画像の実解像度は向上しません。",
      `基本サービス上限は${PDF_LIMITS.maxFiles}枚、1ファイル${PDF_LIMIT_DISPLAY.maxFileMiB}MB、合計${PDF_LIMIT_DISPLAY.maxTotalMiB}MB、1画像${PDF_LIMIT_DISPLAY.maxPixelsMP}MPです。`,
    ],
    faq: "よくある質問",
    more: "FAQをもっと見る",
    less: "FAQを閉じる",
    faqs: [
      ["複数画像を1つのPDFにできますか？", "はい。表示順に1画像1ページとして1つのPDFを作成します。"],
      ["画像の順番を変更できますか？", "はい。PCはドラッグ、モバイルは移動ボタンで変更できます。"],
      ["A4とLetterに対応していますか？", "はい。A4とUS Letter、縦・横・自動向きに対応します。"],
      ["写真は変形しますか？", "いいえ。contain配置で元の縦横比を維持します。"],
      ["画像はサーバーへ送られますか？", "いいえ。画像と生成PDFは現在のブラウザ内で処理します。"],
      ["PDF内の文字を検索できますか？", "いいえ。OCRは行いません。"],
      ["作成後に設定を変えて再作成できますか？", "はい。編集状態を維持したまま順番・ページサイズ・向き・余白を変更できます。"],
    ],
    next: "次の作業",
    related: "関連ツール",
    coming: "準備中",
  },
} as const;

export function ImageToPdfPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const expertTitle = locale === "ko" ? (
    <>이미지를 PDF로 만들때 실전 기준</>
  ) : locale === "ja" ? (
    <>画像をPDF化するときの画質と<br />{" "}ページ構成を決める実践基準</>
  ) : (
    <>Practical standards for image quality<br />{" "}and page layout when creating PDFs</>
  );
  const url = `https://toolbox.fixlgs.com/${locale}/image-to-pdf`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: t.title,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        url,
        description: t.desc,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: ["JPG to PDF", "PNG to PDF", "Multiple images to PDF", "Image reorder", "A4 and Letter", "Margins", "Portrait Landscape Auto", "Local browser processing"],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` },
          { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/pdf` },
          { "@type": "ListItem", position: 3, name: t.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };
  const related = [
    { n: "018", name: locale === "ko" ? "이미지 정보·메타데이터 검사기" : locale === "en" ? "Image Metadata Checker" : "画像情報・メタデータチェッカー", href: `/${locale}/image-metadata-checker` },
    { n: "013", name: locale === "ko" ? "이미지 합치기" : locale === "en" ? "Image Merger" : "画像結合ツール", href: `/${locale}/image-merger` },
  ];

  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/pdf`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">026 · PDF</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <ImageToPdfTool locale={locale} />
      <ToolNavigation locale={locale} currentTool={26} />
      
    </div></section>
    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((s, i) => <li key={s}><span>{String(i + 1).padStart(2, "0")}</span><p>{s}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide toolbox-tool-use-cases--editorial"><div className="toolbox-tool-format-guide-head"><p>USE CASES</p><h2>{locale === "ko" ? "활용 예시" : locale === "ja" ? "活用例" : "Use cases"}</h2></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.examples.map(([title, description], i) => <article key={title}><strong>{String(i + 1).padStart(2, "0")}</strong><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
    <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy"><div className="toolbox-tool-format-guide-head"><p>EXPERT POST</p><h2>{expertTitle}</h2><span>{t.expertLead}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{t.expert.map(([title, description]) => <article key={title}><h4>{title}</h4><p>{description}</p></article>)}</div></div></section>
    <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head toolbox-tool-info-band--full-divider"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2><span>{t.local}</span></div><ul className="toolbox-tool-info-band-list">{t.cautions.map(x => <li key={x}>{x}</li>)}</ul></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faq}</h2></div><ToolboxFaqList items={t.faqs.map(([q, a]): readonly [string, string] => [q, a])} initialCount={5} moreLabel={t.more} collapseLabel={t.less} className="toolbox-tool-faq-list" /></section>
    <section className="toolbox-tool-processing-note"><p>{t.local}</p></section>
  </ToolboxSubpageShell>;
}
