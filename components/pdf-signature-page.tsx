import Link from "next/link";
import type { Locale } from "@/lib/site";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { PdfSignatureTool } from "./pdf-signature-tool";
import { TOOL032_LIMIT_DISPLAY } from "@/lib/tool-032-pdf-signature";

const copy = {
  ko: {
    back: "PDF 도구", title: "PDF 서명 넣기", desc: "서명을 직접 그리거나 이미지를 불러와 PDF의 원하는 위치와 크기로 배치하고 여러 페이지에 적용하세요.",
    local: "PDF와 서명은 서버에 업로드하거나 저장하지 않고 현재 브라우저에서 처리됩니다.",
    how: "사용 방법", steps: ["PDF 파일을 선택합니다.", "서명을 직접 그리거나 PNG·JPG·WebP 서명 이미지를 불러옵니다.", "미리보기에서 서명의 위치와 크기를 조절합니다.", "현재·전체·홀수·짝수·사용자 지정 페이지 중 적용 범위를 정합니다.", "결과 PDF를 생성하고 적용 페이지를 확인한 뒤 다운로드합니다."],
    examples: [["견적서·확인서에 서명 추가", "한 페이지의 지정된 서명란에 직접 그린 서명이나 투명 PNG를 배치해 새 PDF로 저장합니다."], ["여러 페이지의 같은 위치에 반복", "전체·홀수·짝수 또는 직접 지정한 페이지에 같은 상대 위치로 서명을 적용합니다."], ["모바일에서 손가락으로 바로 서명", "터치 서명 캔버스에서 서명을 만든 뒤 드래그 대신 위치 프리셋으로도 배치할 수 있습니다."]],
    expertTitle: "PDF에 서명을 넣을 때 실전 기준", expertLead: "시각 서명과 인증서 서명의 차이, 투명 배경, 페이지 회전, 위치·크기, 여러 페이지 적용과 개인정보 처리 기준입니다.",
    expert: [["시각 서명과 디지털 서명은 다릅니다", "이 도구는 PDF 페이지 위에 보이는 서명 그래픽을 추가합니다. 인증서·PKI 기반 전자서명 검증, 타임스탬프, 신원인증 기능은 제공하지 않습니다."], ["PDF 페이지를 이미지로 다시 만들지 않습니다", "가능한 한 기존 PDF 페이지 객체를 유지하고 서명 이미지만 overlay하여 텍스트·벡터 본문을 통째로 래스터화하지 않습니다."], ["투명 PNG는 문서 내용을 가리지 않습니다", "서명 이미지는 브라우저에서 PNG로 정규화하며 원본이 투명한 경우 alpha를 유지합니다. JPG의 흰 배경은 임의로 자동 제거하지 않습니다."], ["크기는 종횡비를 고정합니다", "서명 폭을 조절하면 원본 비율에 맞춰 높이를 계산합니다. 강제로 늘여 서명 모양이 찌그러지는 방식은 사용하지 않습니다."], ["페이지 크기와 회전을 따로 계산합니다", "가로·세로·회전 페이지가 섞여 있어도 표시 기준의 상대 좌표를 각 PDF 페이지 좌표로 변환해 같은 상대 위치를 유지하도록 설계합니다."], ["여러 페이지는 필요한 범위만 적용합니다", "현재·전체·홀수·짝수·1-3,5 같은 사용자 범위를 구분하고 중복 페이지는 한 번만 처리합니다."], ["민감한 문서와 서명은 로컬 처리합니다", "PDF 파일, 서명 이미지, 그리기 좌표를 서버 저장 대상으로 사용하지 않으며 결과도 브라우저에서 생성합니다."]],
    caution: "주의사항", cautions: ["이 기능은 보이는 서명 그래픽을 추가하는 기능이며 인증서 기반 디지털 서명이 아닙니다.", "계약·행정문서의 요구 서명 방식과 법적 요건은 기관·국가·문서 종류에 따라 다를 수 있으므로 사용자가 직접 확인해야 합니다.", "암호화·권한 제한·손상 PDF는 처리하지 않습니다.", `확정 서비스 한도는 PDF ${TOOL032_LIMIT_DISPLAY.maxPdfMiB}MB · ${TOOL032_LIMIT_DISPLAY.maxPages}페이지, 서명 이미지 ${TOOL032_LIMIT_DISPLAY.maxSignatureMiB}MB · ${TOOL032_LIMIT_DISPLAY.maxSignatureMP}MP, 그리기 ${TOOL032_LIMIT_DISPLAY.maxStrokePoints.toLocaleString()}포인트입니다.`],
    faq: "자주 묻는 질문", more: "FAQ 더보기", less: "FAQ 접기", faqs: [["이 서명은 인증서 기반 디지털 서명인가요?", "아니요. 손으로 그린 서명 또는 서명 이미지를 PDF 페이지 위에 시각적으로 배치합니다. 인증서·PKI 검증 기능은 제공하지 않습니다."], ["서명 이미지와 PDF가 서버에 올라가나요?", "아니요. 현재 브라우저에서 처리하도록 설계하며 PDF·서명 이미지·그리기 데이터는 서버 저장 대상으로 사용하지 않습니다."], ["여러 페이지에 같은 위치로 넣을 수 있나요?", "예. 전체·홀수·짝수·사용자 지정 페이지를 선택해 각 페이지의 상대적 동일 위치에 적용할 수 있습니다."], ["투명 PNG 서명을 사용할 수 있나요?", "예. PNG alpha를 유지하도록 정규화하고 최종 PDF에도 투명 배경으로 삽입합니다."], ["페이지 크기가 서로 달라도 되나요?", "예. 각 페이지 크기와 회전을 기준으로 상대 좌표를 변환해 같은 위치 감각을 유지합니다."], ["서명 크기를 자유롭게 늘일 수 있나요?", "크기는 조절할 수 있지만 원본 종횡비를 유지해 서명이 찌그러지지 않도록 합니다."], ["암호 PDF도 처리하나요?", "아니요. 이 도구는 비밀번호 우회나 권한 제한 해제를 하지 않으며 암호화 PDF는 지원 대상에서 제외합니다."], ["다시 위치를 바꿔 재다운로드할 수 있나요?", "예. 결과 생성 후에도 PDF와 서명 상태를 유지한 채 위치·크기·페이지 범위를 바꿔 다시 생성할 수 있습니다."]],
    related: "관련 도구", next: "다음 작업", available: "사용 가능", coming: "준비 중",
  },
  en: {
    back: "PDF Tools", title: "Add Signature to PDF", desc: "Draw a signature or import an image, place and resize it on a PDF, and apply it to one or multiple pages.",
    local: "Your PDF and signature stay in the current browser and are not uploaded or stored on a server.",
    how: "How to use", steps: ["Choose a PDF file.", "Draw a signature or import a PNG, JPG, or WebP signature image.", "Position and resize the signature on the preview.", "Choose current, all, odd, even, or a custom page range.", "Create the result, verify the applied pages, and download the PDF."],
    examples: [["Sign a quote or acknowledgement", "Place a drawn signature or transparent PNG in the designated signature area and save a new PDF."], ["Repeat one signature on multiple pages", "Apply the same relative placement to all, odd, even, or specifically selected pages."], ["Sign quickly on mobile", "Draw with a finger or stylus and use position presets when precise dragging is inconvenient."]],
    expertTitle: "Practical rules for adding a signature to a PDF", expertLead: "Visible signatures vs certificate signatures, transparency, page rotation, placement, repeated pages, and local privacy handling.",
    expert: [["A visible signature is not a certificate signature", "This tool adds a visible signature graphic. It does not provide PKI certificate validation, timestamps, identity verification, or a guarantee of legal validity."], ["The PDF page is not rasterized", "The original PDF page objects are kept where possible and only the signature image is overlaid, instead of converting every page to a bitmap."], ["Transparent PNG keeps the document readable", "Signature images are normalized to PNG in the browser. Existing transparency is preserved; a white JPG background is not automatically removed."], ["Aspect ratio stays locked", "Changing signature width recalculates height from the original aspect ratio instead of stretching the signature."], ["Mixed page sizes and rotation need coordinate conversion", "Relative preview coordinates are converted for each page size and rotation so placement remains visually consistent."], ["Apply only the pages you need", "Choose current, all, odd, even, or a custom range such as 1-3,5. Duplicate page numbers are applied only once."], ["Sensitive files stay local", "The PDF, signature image, and drawing data are not intended for server storage; the result is generated in the browser."]],
    caution: "Important notes", cautions: ["This tool adds a visible signature graphic and is not a certificate-based digital-signature service.", "Signature requirements and legal rules can differ by institution, country, and document type; confirm the applicable requirement yourself.", "Encrypted, permission-restricted, or damaged PDFs are not processed.", `Approved service limits are ${TOOL032_LIMIT_DISPLAY.maxPdfMiB}MB / ${TOOL032_LIMIT_DISPLAY.maxPages} PDF pages, ${TOOL032_LIMIT_DISPLAY.maxSignatureMiB}MB / ${TOOL032_LIMIT_DISPLAY.maxSignatureMP}MP for a signature image, and ${TOOL032_LIMIT_DISPLAY.maxStrokePoints.toLocaleString()} drawing points.`],
    faq: "FAQ", more: "Show more FAQ", less: "Hide FAQ", faqs: [["Is this a certificate-based digital signature?", "No. It visually places a drawn or image signature on PDF pages and does not validate a PKI certificate."], ["Are my PDF and signature uploaded?", "No. They are designed to be processed in the current browser rather than stored on a server."], ["Can I put the signature in the same place on multiple pages?", "Yes. Apply it to all, odd, even, or a custom page range using the same relative placement."], ["Can I use a transparent PNG?", "Yes. Existing PNG alpha is preserved when the image is normalized and embedded."], ["What if page sizes are different?", "Placement is converted from relative coordinates for each page size and rotation."], ["Can I freely stretch the signature?", "You can resize it, but the original aspect ratio stays locked to avoid distortion."], ["Can I sign an encrypted PDF?", "No. The tool does not bypass passwords or permission restrictions."], ["Can I edit and download again?", "Yes. Keep the PDF and signature loaded, adjust placement or page scope, and create another result."]],
    related: "Related tools", next: "Next work", available: "AVAILABLE", coming: "COMING SOON",
  },
  ja: {
    back: "PDFツール", title: "PDF 署名追加ツール", desc: "署名を描くか画像を読み込み、PDF上で位置・サイズを調整して複数ページへ適用できます。",
    local: "PDFと署名はサーバーへアップロード・保存せず、現在のブラウザ内で処理します。",
    how: "使い方", steps: ["PDFファイルを選択します。", "署名を描くかPNG・JPG・WebPの署名画像を読み込みます。", "プレビュー上で位置とサイズを調整します。", "現在・すべて・奇数・偶数・指定範囲から適用ページを選びます。", "結果PDFを作成し、適用ページを確認してダウンロードします。"],
    examples: [["見積書・確認書に署名", "指定位置へ手書き署名または透過PNGを配置して新しいPDFとして保存します。"], ["複数ページの同じ位置へ反復", "すべて・奇数・偶数・指定ページに同じ相対位置で署名を適用します。"], ["モバイルで指ですぐ署名", "タッチキャンバスで署名を作り、細かいドラッグが難しい場合は配置プリセットも利用できます。"]],
    expertTitle: "PDFに署名を追加するときの実践基準", expertLead: "可視署名と証明書署名の違い、透過、ページ回転、配置・サイズ、複数ページ適用、プライバシーの基準です。",
    expert: [["可視署名とデジタル署名は別物です", "このツールはPDFページ上に見える署名画像を追加します。証明書・PKI検証、タイムスタンプ、本人確認、法的効力の保証は提供しません。"], ["PDFページ全体を画像化しません", "可能な限り既存PDFページを維持し、署名画像だけをoverlayします。本文のテキストやベクターをページごとラスタライズしません。"], ["透過PNGなら本文を隠しにくくなります", "署名画像をブラウザでPNGへ正規化し、元の透明alphaを維持します。JPGの白背景は自動削除しません。"], ["縦横比を固定します", "署名の幅を変更すると元の比率から高さを計算し、無理に引き伸ばしません。"], ["ページサイズと回転を個別に扱います", "縦横・回転・異なるサイズが混在しても、表示上の相対座標を各ページ座標へ変換します。"], ["必要なページだけ適用します", "現在・すべて・奇数・偶数・1-3,5などの指定範囲を使い、重複ページは1回だけ処理します。"], ["機密PDFと署名はローカル処理です", "PDF、署名画像、描画データをサーバー保存対象にせず、結果もブラウザで生成します。"]],
    caution: "注意事項", cautions: ["この機能は見える署名画像を追加するもので、証明書方式のデジタル署名ではありません。", "契約・行政文書の署名方式や法的要件は機関・国・文書によって異なるため、必要条件を確認してください。", "暗号化・権限制限・破損PDFは処理しません。", `確定サービス上限はPDF ${TOOL032_LIMIT_DISPLAY.maxPdfMiB}MB・${TOOL032_LIMIT_DISPLAY.maxPages}ページ、署名画像 ${TOOL032_LIMIT_DISPLAY.maxSignatureMiB}MB・${TOOL032_LIMIT_DISPLAY.maxSignatureMP}MP、描画 ${TOOL032_LIMIT_DISPLAY.maxStrokePoints.toLocaleString()}ポイントです。`],
    faq: "よくある質問", more: "FAQをもっと見る", less: "FAQを閉じる", faqs: [["証明書方式のデジタル署名ですか？", "いいえ。手書き署名または署名画像をPDFページ上に見える形で配置する機能です。"], ["PDFや署名画像はサーバーに送られますか？", "いいえ。現在のブラウザ内で処理する設計です。"], ["複数ページの同じ位置へ入れられますか？", "はい。すべて・奇数・偶数・指定範囲を選び、同じ相対位置へ適用できます。"], ["透過PNGを使えますか？", "はい。PNGのalphaを維持して埋め込みます。"], ["ページサイズが違っても大丈夫ですか？", "各ページのサイズと回転を基準に相対座標を変換します。"], ["署名を自由に引き伸ばせますか？", "サイズは変更できますが、元の縦横比を固定して歪みを防ぎます。"], ["暗号化PDFを処理できますか？", "いいえ。パスワードや権限制限を回避する機能は提供しません。"], ["位置を変えて再ダウンロードできますか？", "はい。PDFと署名を保持したまま配置やページ範囲を変更して再作成できます。"]],
    related: "関連ツール", next: "次の作業", available: "利用可能", coming: "準備中",
  },
} as const;

export function PdfSignaturePage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/pdf-signature`;
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: t.title, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", url, description: t.desc, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
    { "@type": "FAQPage", mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` },
      { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/pdf` },
      { "@type": "ListItem", position: 3, name: t.title, item: url },
    ] },
  ] };

  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/pdf`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">032 · PDF</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <PdfSignatureTool locale={locale} />
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><div className="toolbox-next-work-card is-disabled"><span>033</span><h3>{locale === "ko" ? "PDF 압축기" : locale === "en" ? "PDF Compressor" : "PDF圧縮ツール"}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div></div></section>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid">
        <Link className="toolbox-next-work-card" href={`/${locale}/image-to-pdf`}><span>026</span><h3>{locale === "ko" ? "이미지 PDF 변환기" : locale === "en" ? "Image to PDF Converter" : "画像 PDF 変換ツール"}</h3><div className="toolbox-next-work-card-foot"><span>{t.available}</span><strong>↗</strong></div></Link>
        <Link className="toolbox-next-work-card" href={`/${locale}/pdf-to-image-converter`}><span>027</span><h3>{locale === "ko" ? "PDF 이미지 변환기" : locale === "en" ? "PDF to Image Converter" : "PDF 画像変換ツール"}</h3><div className="toolbox-next-work-card-foot"><span>{t.available}</span><strong>↗</strong></div></Link>
      </div></section>
    </div></section>
    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide toolbox-tool-use-cases--editorial"><div className="toolbox-tool-format-guide-head"><p>USE CASES</p><h2>{locale === "ko" ? "활용 예시" : locale === "ja" ? "活用例" : "Use cases"}</h2></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.examples.map(([title, description], index) => <article key={title}><strong>{String(index + 1).padStart(2, "0")}</strong><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
    <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy"><div className="toolbox-tool-format-guide-head"><p>EXPERT POST</p><h2>{t.expertTitle}</h2><span>{t.expertLead}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{t.expert.map(([title, description]) => <article key={title}><h4>{title}</h4><p>{description}</p></article>)}</div></div></section>
    <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head toolbox-tool-info-band--full-divider"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2><span>{t.local}</span></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faq}</h2></div><ToolboxFaqList items={t.faqs.map(([q, a]): readonly [string, string] => [q, a])} initialCount={5} moreLabel={t.more} collapseLabel={t.less} className="toolbox-tool-faq-list" /></section>
    <section className="toolbox-tool-processing-note"><p>{t.local}</p></section>
  </ToolboxSubpageShell>;
}
