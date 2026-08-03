import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageConverterTool } from "@/components/image-converter-tool";
import { HeicAvifPage } from "@/components/heic-avif-page";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { locales, tool001Descriptions, tool001Slug, tool001Titles, tool002Descriptions, tool002Slug, tool002Titles, type Locale } from "@/lib/site";

export function generateStaticParams() { return locales.flatMap((locale) => [tool001Slug, tool002Slug].map((toolSlug) => ({ locale, toolSlug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; toolSlug: string }> }): Promise<Metadata> {
  const { locale, toolSlug } = await params;
  if (!locales.includes(locale as Locale) || (toolSlug !== tool001Slug && toolSlug !== tool002Slug)) notFound();
  const current = locale as Locale;
  const is002 = toolSlug === tool002Slug;
  const titles = is002 ? tool002Titles : tool001Titles;
  const descriptions = is002 ? tool002Descriptions : tool001Descriptions;
  const seoTitle = is002
    ? current === "ko" ? "HEIC·AVIF 이미지 변환기 | JPG·PNG·AVIF 일괄 변환"
      : current === "en" ? "HEIC & AVIF Image Converter | Batch JPG, PNG and AVIF"
      : "HEIC・AVIF画像変換ツール | JPG・PNG・AVIF一括変換"
    : `${titles[current]} - TOOLBOX`;
  return {
    title: seoTitle,
    description: descriptions[current],
    alternates: {
      canonical: `https://toolbox.fixlgs.com/${current}/${toolSlug}`,
      languages: {
        ko: `https://toolbox.fixlgs.com/ko/${toolSlug}`,
        en: `https://toolbox.fixlgs.com/en/${toolSlug}`,
        ja: `https://toolbox.fixlgs.com/ja/${toolSlug}`,
        "x-default": `https://toolbox.fixlgs.com/en/${toolSlug}`,
      },
    },
  };
}

export default async function Tool001Page({ params }: { params: Promise<{ locale: string; toolSlug: string }> }) {
  const { locale, toolSlug } = await params;
  if (!locales.includes(locale as Locale) || (toolSlug !== tool001Slug && toolSlug !== tool002Slug)) notFound();
  const current = locale as Locale;
  if (toolSlug === tool002Slug) return <HeicAvifPage locale={current} />;
  const back = current === "ko" ? "이미지 변환·최적화" : current === "en" ? "Image Convert" : "画像変換・最適化";
  const eyebrow = current === "ko" ? "브라우저에서 바로 처리" : current === "en" ? "PROCESS IN YOUR BROWSER" : "ブラウザ内で処理";
  const info: {
    howTitle: string;
    howEyebrow: string;
    steps: string[];
    faqTitle: string;
    faqEyebrow: string;
    faqMore: string;
    faqCollapse: string;
    faqs: readonly (readonly [string, string])[];
    formatGuide: {
      eyebrow: string;
      title: string;
      description: string;
      formats: readonly { name: string; use: string; strengths: string; note: string }[];
      useTitle: string;
      useItems: readonly string[];
      noteTitle: string;
      noteItems: readonly string[];
      directionTitle: string;
      directionDescription: string;
      directions: readonly { from: string; to: string; title: string; description: string }[];
      detailsTitle: string;
      details: readonly { number: string; title: string; description: string }[];
    };
    trust: string;
  } = current === "ko" ? {
    howTitle: "사용 방법", howEyebrow: "HOW TO USE", steps: ["이미지를 업로드합니다.", "원하는 형식과 옵션을 선택합니다.", "변환이 끝나면 결과 파일을 다운로드합니다."],
    faqTitle: "자주 묻는 질문", faqEyebrow: "FAQ", faqMore: "FAQ 더보기", faqCollapse: "FAQ 접기", faqs: [["어떤 이미지 형식을 지원하나요?", "JPG, PNG, WebP 등 도구 화면에 표시된 형식을 지원합니다."], ["여러 이미지를 한 번에 처리할 수 있나요?", "네. 여러 파일을 선택해 한 번에 변환하거나 압축할 수 있습니다."], ["업로드한 이미지는 서버에 저장되나요?", "아니요. 이미지는 가능한 범위에서 브라우저 내부에서 직접 처리되며 서버에 저장되지 않습니다."], ["변환 후 화질이 달라질 수 있나요?", "출력 형식과 압축 설정에 따라 화질과 파일 크기가 달라질 수 있습니다."], ["파일 크기나 해상도 제한이 있나요?", "브라우저와 기기의 메모리 상태에 따라 매우 큰 파일은 처리 속도가 느려지거나 제한될 수 있습니다."], ["이미지의 가로세로 크기도 변경할 수 있나요?", "도구 화면에서 제공되는 크기 조정 옵션을 사용하면 원하는 해상도로 변경할 수 있습니다."], ["투명 배경은 유지되나요?", "PNG나 WebP처럼 투명도를 지원하는 형식으로 변환하면 유지될 수 있지만, JPG는 투명 배경을 지원하지 않습니다."], ["모바일에서도 사용할 수 있나요?", "네. 휴대전화와 태블릿에서도 파일을 선택하고 결과를 다운로드할 수 있습니다."], ["변환이 되지 않을 때는 어떻게 해야 하나요?", "파일 형식과 크기를 확인한 뒤 다시 시도하고, 계속 문제가 발생하면 다른 최신 브라우저를 사용해 보세요."], ["이 도구는 무료인가요?", "네. 현재 제공되는 기본 이미지 변환 기능은 무료로 사용할 수 있습니다."]],
    formatGuide: {
      eyebrow: "IMAGE FORMAT GUIDE",
      title: "JPG·PNG·WebP 이미지 형식과 변환 기준",
      description: "이미지 형식은 단순한 확장자 차이가 아니라 화질, 투명도, 호환성, 전송 속도에 직접 영향을 줍니다. 사진인지, 투명 배경이 필요한지, 웹 게시가 목적인지를 먼저 판단하면 불필요한 재변환과 용량 증가를 줄일 수 있습니다.",
      formats: [
        { name: "JPG", use: "사진과 색상 변화가 많은 이미지", strengths: "대부분의 기기와 서비스에서 열 수 있고 사진을 비교적 작은 용량으로 저장하기 좋습니다.", note: "손실 압축 형식이며 투명 배경을 저장할 수 없습니다." },
        { name: "PNG", use: "로고·아이콘·스크린샷·투명 이미지", strengths: "선명한 경계와 투명도를 유지하기 좋고 반복 저장에도 품질 손실이 적습니다.", note: "사진에서는 JPG나 WebP보다 파일이 크게 생성될 수 있습니다." },
        { name: "WebP", use: "웹사이트·블로그·상품 페이지 이미지", strengths: "손실·무손실 압축과 투명도를 지원해 웹 전송량을 줄이는 데 유리합니다.", note: "대부분의 최신 브라우저에서 지원되지만 일부 프로그램은 호환성이 낮을 수 있습니다." }
      ],
      useTitle: "이럴 때 변환하세요",
      useItems: ["WebP가 열리지 않는 프로그램에서 JPG가 필요할 때", "로고나 아이콘의 투명 배경을 유지해야 할 때", "웹 업로드용 이미지 용량을 줄이고 싶을 때", "여러 이미지를 같은 형식으로 한 번에 정리할 때"],
      noteTitle: "변환 전 알아두세요",
      noteItems: ["JPG는 투명 영역을 선택한 배경색으로 채웁니다.", "형식을 바꿔도 이미 손실된 화질은 복원되지 않습니다.", "출력 형식과 품질 설정에 따라 결과 용량이 달라집니다.", "이미지는 서버로 전송되지 않고 브라우저 안에서 처리됩니다."],
      directionTitle: "원본과 목적에 따른 변환 방향 선택",
      directionDescription: "변환은 확장자만 바꾸는 작업이 아닙니다. 원본 형식이 가진 특성과 최종 사용 환경을 함께 고려해야 화질 손실, 투명 배경 소실, 불필요한 용량 증가를 피할 수 있습니다.",
      directions: [
        { from: "JPG", to: "PNG", title: "편집용 또는 무손실 재저장", description: "PNG로 저장해도 이미 손실된 화질이나 투명 배경이 새로 복원되지는 않습니다." },
        { from: "PNG", to: "JPG", title: "호환성과 사진 용량 우선", description: "투명 영역은 선택한 배경색으로 채워지며, 사진 중심 이미지의 용량을 줄일 때 적합합니다." },
        { from: "JPG·PNG", to: "WebP", title: "웹 업로드 용량 절약", description: "웹사이트, 블로그, 상품 페이지에서 품질 대비 작은 파일이 필요할 때 활용할 수 있습니다." },
        { from: "WebP", to: "JPG·PNG", title: "프로그램·업로드 호환성 확보", description: "WebP를 열거나 업로드할 수 없는 환경에서는 JPG 또는 PNG로 변환해 사용할 수 있습니다." }
      ],
      detailsTitle: "변환 결과를 판단할 때 확인할 핵심 기준",
      details: [
        { number: "01", title: "화질과 파일 용량", description: "JPG와 WebP는 품질을 낮추면 용량이 줄지만 압축 흔적이 보일 수 있습니다. PNG는 무손실 저장에 적합하지만 결과 용량이 더 커질 수도 있습니다." },
        { number: "02", title: "투명 배경 처리", description: "투명도를 유지하려면 PNG 또는 WebP를 선택하세요. JPG는 투명 배경을 지원하지 않아 선택한 배경색으로 채워집니다." },
        { number: "03", title: "일괄 변환과 다운로드", description: "여러 파일을 한 번에 추가하고 파일별 출력 형식을 선택할 수 있습니다. 결과는 개별 다운로드하거나 성공한 파일을 ZIP으로 받을 수 있습니다." },
        { number: "04", title: "개인정보 보호와 지원 범위", description: "파일은 서버에 업로드되지 않고 브라우저에서 처리됩니다. JPG·JPEG·PNG·WebP를 최대 10개, 파일당 10MB, 전체 50MB까지 지원하며 애니메이션 WebP는 제외됩니다." }
      ]
    },
    trust: "이미지는 브라우저에서 직접 처리되며 서버에 저장되지 않습니다."
  } : current === "en" ? {
    howTitle: "How to use", howEyebrow: "HOW TO USE", steps: ["Upload your image.", "Choose the output format and options.", "Download the converted file when processing is complete."],
    faqTitle: "Frequently asked questions", faqEyebrow: "FAQ", faqMore: "View more FAQs", faqCollapse: "Show fewer FAQs", faqs: [["Which image formats are supported?", "The tool supports formats shown in the interface, including JPG, PNG, and WebP."], ["Can I process multiple images at once?", "Yes. You can select multiple files and convert or compress them in one batch."], ["Are uploaded images stored on a server?", "No. Images are processed directly in your browser whenever possible and are not stored on our server."], ["Can image quality change after conversion?", "Quality and file size may vary depending on the output format and compression settings."], ["Are there file-size or resolution limits?", "Very large files may be slower or limited depending on your browser and device memory."], ["Can I resize image dimensions?", "Use the resize options shown in the tool to set a different output resolution."], ["Will transparent backgrounds be preserved?", "Transparency can be preserved in formats such as PNG or WebP, but JPG does not support transparency."], ["Can I use the tool on mobile devices?", "Yes. You can select files and download results on phones and tablets."], ["What should I do if conversion fails?", "Check the file format and size, try again, and use another up-to-date browser if the issue continues."], ["Is this tool free?", "Yes. The basic image conversion features currently provided are free to use."]],
    formatGuide: {
      eyebrow: "IMAGE FORMAT GUIDE",
      title: "JPG, PNG, and WebP: a practical image-format guide",
      description: "An image format affects quality, transparency, compatibility, and delivery speed—not just the file extension. Start with the intended use: photography, transparent graphics, or web publishing, then choose the format that avoids unnecessary conversion and file growth.",
      formats: [
        { name: "JPG", use: "Photos and images with continuous colour", strengths: "Widely compatible and efficient for photographs with smooth colour transitions.", note: "Uses lossy compression and cannot store transparency." },
        { name: "PNG", use: "Logos, icons, screenshots, and transparent graphics", strengths: "Preserves sharp edges and transparency with lossless compression.", note: "Photographic images can be significantly larger than JPG or WebP." },
        { name: "WebP", use: "Website, blog, and product-page images", strengths: "Supports lossy, lossless, and transparent images while reducing web transfer size.", note: "Supported by modern browsers, though some older software may not accept it." }
      ],
      useTitle: "Convert images when",
      useItems: ["You need JPG for software that cannot open WebP.", "You need to preserve a transparent background in a logo or icon.", "You want to reduce image size before uploading to a website.", "You want to organize multiple images in the same format."],
      noteTitle: "Before you convert",
      noteItems: ["JPG fills transparent areas with the selected background color.", "Changing formats cannot restore image quality that was already lost.", "Output format and quality settings affect the final file size.", "Images are processed in your browser and are not uploaded to a server."],
      directionTitle: "Choose the conversion route by source and purpose",
      directionDescription: "Conversion is more than changing an extension. Consider both the source format and the final destination to avoid quality loss, removed transparency, or unnecessarily large output files.",
      directions: [
        { from: "JPG", to: "PNG", title: "Editing or lossless re-saving", description: "Saving as PNG does not restore quality already lost in JPG or create a transparent background." },
        { from: "PNG", to: "JPG", title: "Compatibility and smaller photo files", description: "Transparent areas are filled with the selected background color. This is useful when transparency is not required." },
        { from: "JPG·PNG", to: "WebP", title: "Smaller images for the web", description: "Use WebP for websites, blogs, and product pages when you need a smaller file at comparable visual quality." },
        { from: "WebP", to: "JPG·PNG", title: "Broader software compatibility", description: "Convert WebP when a program, service, or upload field does not accept the format." }
      ],
      detailsTitle: "Key criteria for evaluating the converted result",
      details: [
        { number: "01", title: "Quality and file size", description: "Lower JPG or WebP quality can reduce file size but may introduce visible compression. PNG is lossless, although the output can be larger than the source." },
        { number: "02", title: "Transparent backgrounds", description: "Choose PNG or WebP to preserve transparency. JPG cannot store transparency and fills transparent areas with the selected background color." },
        { number: "03", title: "Batch conversion and downloads", description: "Add multiple files, choose an output format for each file, download results individually, or download successful conversions together as a ZIP file." },
        { number: "04", title: "Privacy and supported limits", description: "Files stay in your browser and are not uploaded to a server. The tool supports JPG, JPEG, PNG, and WebP: up to 10 files, 10 MB each, 50 MB total. Animated WebP is not supported." }
      ]
    },
    trust: "Images are processed directly in your browser and are not stored on our server."
  } : {
    howTitle: "使い方", howEyebrow: "HOW TO USE", steps: ["画像をアップロードします。", "出力形式とオプションを選択します。", "処理が完了したら変換後のファイルを保存します。"],
    faqTitle: "よくある質問", faqEyebrow: "FAQ", faqMore: "FAQをもっと見る", faqCollapse: "FAQを閉じる", faqs: [["どの画像形式に対応していますか？", "JPG、PNG、WebPなど、ツール画面に表示される形式に対応しています。"], ["複数の画像をまとめて処理できますか？", "はい。複数のファイルを選択して一括で変換または圧縮できます。"], ["アップロードした画像はサーバーに保存されますか？", "いいえ。画像は可能な範囲でブラウザ内で直接処理され、サーバーには保存されません。"], ["変換後に画質が変わることはありますか？", "出力形式や圧縮設定によって画質とファイルサイズが変わる場合があります。"], ["ファイルサイズや解像度に制限はありますか？", "非常に大きなファイルはブラウザや端末のメモリ状況によって処理が遅くなったり制限されたりする場合があります。"], ["画像の縦横サイズも変更できますか？", "ツール画面のサイズ変更オプションを使って出力解像度を変更できます。"], ["透明背景は維持されますか？", "PNGやWebPなど透明度に対応する形式では維持できますが、JPGは透明背景に対応していません。"], ["モバイルでも利用できますか？", "はい。スマートフォンやタブレットでもファイルを選択して結果を保存できます。"], ["変換できない場合はどうすればよいですか？", "ファイル形式とサイズを確認して再試行し、問題が続く場合は別の最新ブラウザをお試しください。"], ["このツールは無料ですか？", "はい。現在提供している基本的な画像変換機能は無料で利用できます。"]],
    formatGuide: {
      eyebrow: "IMAGE FORMAT GUIDE",
      title: "JPG・PNG・WebP画像形式と変換基準",
      description: "画像形式は拡張子だけの違いではなく、画質・透明度・互換性・表示速度に影響します。写真、透明背景、Web掲載など最終用途を先に決めると、不要な再変換や容量増加を抑えられます。",
      formats: [
        { name: "JPG", use: "写真や色の変化が多い画像", strengths: "多くの端末やサービスで利用でき、写真を比較的小さい容量で保存できます。", note: "非可逆圧縮形式で、透明背景は保存できません。" },
        { name: "PNG", use: "ロゴ・アイコン・スクリーンショット・透明画像", strengths: "輪郭と透明度を保ちやすく、可逆圧縮で保存できます。", note: "写真ではJPGやWebPより容量が大きくなる場合があります。" },
        { name: "WebP", use: "Webサイト・ブログ・商品ページ用画像", strengths: "非可逆・可逆・透明画像に対応し、Web転送量を抑えやすい形式です。", note: "最新ブラウザでは広く対応していますが、一部の古いソフトでは使えない場合があります。" }
      ],
      useTitle: "このような場合に変換",
      useItems: ["WebPを開けないソフトでJPGが必要なとき", "ロゴやアイコンの透明背景を維持したいとき", "Webサイトへアップロードする画像容量を減らしたいとき", "複数の画像を同じ形式にまとめたいとき"],
      noteTitle: "変換前に知っておきたいこと",
      noteItems: ["JPGでは透明部分が選択した背景色で塗りつぶされます。", "形式を変更しても、すでに失われた画質は元に戻りません。", "出力形式と画質設定によってファイル容量が変わります。", "画像はサーバーへ送信されず、ブラウザ内で処理されます。"],
      directionTitle: "元形式と用途から選ぶ変換方向",
      directionDescription: "変換は拡張子だけを変更する作業ではありません。元形式の特性と最終利用環境を合わせて判断すると、画質低下・透明背景の消失・不要な容量増加を避けやすくなります。",
      directions: [
        { from: "JPG", to: "PNG", title: "編集用・可逆形式での再保存", description: "PNGに変換しても、JPGですでに失われた画質や透明背景が新しく復元されるわけではありません。" },
        { from: "PNG", to: "JPG", title: "互換性と写真容量を優先", description: "透明部分は選択した背景色で塗りつぶされます。透明度が不要な写真画像の容量削減に適しています。" },
        { from: "JPG・PNG", to: "WebP", title: "Web掲載用の容量削減", description: "Webサイト、ブログ、商品ページで画質に対して小さいファイルが必要な場合に利用できます。" },
        { from: "WebP", to: "JPG・PNG", title: "ソフトや投稿先との互換性", description: "WebPを開けないソフトや受け付けない投稿先では、JPGまたはPNGに変換して利用できます。" }
      ],
      detailsTitle: "変換結果を確認するための重要基準",
      details: [
        { number: "01", title: "画質とファイル容量", description: "JPGとWebPは画質を下げると容量を減らせますが、圧縮跡が見える場合があります。PNGは可逆保存に適していますが、結果容量が大きくなることもあります。" },
        { number: "02", title: "透明背景の扱い", description: "透明度を維持する場合はPNGまたはWebPを選びます。JPGは透明背景に対応していないため、選択した背景色で塗りつぶされます。" },
        { number: "03", title: "一括変換とダウンロード", description: "複数ファイルを追加し、ファイルごとに出力形式を選択できます。結果は個別保存、または成功したファイルをZIPでまとめて保存できます。" },
        { number: "04", title: "プライバシーと対応範囲", description: "ファイルはサーバーへ送信されずブラウザ内で処理されます。JPG・JPEG・PNG・WebPを最大10件、1件10MB、合計50MBまで処理でき、アニメーションWebPは対象外です。" }
      ]
    },
    trust: "画像はブラウザ内で直接処理され、サーバーには保存されません。"
  };

  return (
    <ToolboxSubpageShell locale={current} appName={tool001Titles[current]}>
      <section className="toolbox-tool-detail-hero">
        <Link className="toolbox-subpage-back" href={`/${current}/category/image-convert`}>← {back}</Link>
        <p className="toolbox-subpage-eyebrow">001 · IMAGE CONVERT</p>
        <div className="toolbox-tool-detail-heading">
          <h1>
            {current === "ko" ? (
              <>
                <span className="toolbox-tool-title-line">JPG·PNG·WebP</span>
                <span className="toolbox-tool-title-line">이미지 변환기</span>
              </>
            ) : tool001Titles[current]}
          </h1>
          <p>{tool001Descriptions[current]}</p>
        </div>
        <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{eyebrow}</span></div>
      </section>
      <section className="toolbox-tool-detail-body"><ImageConverterTool locale={current} /></section>
      <section className="toolbox-tool-guide">
        <div className="toolbox-tool-guide-head"><p>{info.howEyebrow}</p><h2>{info.howTitle}</h2></div>
        <ol>{info.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
      </section>
      <section className="toolbox-tool-format-guide">
        <div className="toolbox-tool-format-guide-head">
          <p>{info.formatGuide.eyebrow}</p>
          <h2>{info.formatGuide.title}</h2>
          <span>{info.formatGuide.description}</span>
        </div>
        <div className="toolbox-tool-format-body">
          <div className="toolbox-tool-format-grid">
            {info.formatGuide.formats.map((format) => (
              <article key={format.name}>
                <strong>{format.name}</strong>
                <h3>{format.use}</h3>
                <p>{format.strengths}</p>
                <small>{format.note}</small>
              </article>
            ))}
          </div>
          <div className="toolbox-tool-format-notes">
            <article>
              <h3>{info.formatGuide.useTitle}</h3>
              <ul>{info.formatGuide.useItems.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article>
              <h3>{info.formatGuide.noteTitle}</h3>
              <ul>{info.formatGuide.noteItems.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>
          <div className="toolbox-tool-direction-guide">
            <div className="toolbox-tool-section-intro">
              <p>FORMAT ROUTES</p>
              <h3>{info.formatGuide.directionTitle}</h3>
              <span>{info.formatGuide.directionDescription}</span>
            </div>
            <div className="toolbox-tool-direction-grid">
              {info.formatGuide.directions.map((direction) => (
                <article key={`${direction.from}-${direction.to}`}>
                  <div className="toolbox-tool-direction-route"><strong>{direction.from}</strong><span>→</span><strong>{direction.to}</strong></div>
                  <h4>{direction.title}</h4>
                  <p>{direction.description}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="toolbox-tool-result-guide">
            <div className="toolbox-tool-section-intro toolbox-tool-section-intro-compact">
              <p>PRACTICAL DETAILS</p>
              <h3>{info.formatGuide.detailsTitle}</h3>
            </div>
            <div className="toolbox-tool-result-grid">
              {info.formatGuide.details.map((detail) => (
                <article key={detail.number}>
                  <span>{detail.number}</span>
                  <div><h4>{detail.title}</h4><p>{detail.description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="toolbox-tool-faq">
        <div className="toolbox-tool-guide-head"><p>{info.faqEyebrow}</p><h2>{info.faqTitle}</h2></div>
        <ToolboxFaqList items={info.faqs} initialCount={5} moreLabel={info.faqMore} collapseLabel={info.faqCollapse} className="toolbox-tool-faq-list" />
      </section>
      <section className="toolbox-tool-processing-note"><p>{info.trust}</p></section>
    </ToolboxSubpageShell>
  );
}
