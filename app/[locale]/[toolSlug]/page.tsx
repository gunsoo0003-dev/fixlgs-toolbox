import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageConverterTool } from "@/components/image-converter-tool";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { locales, tool001Descriptions, tool001Slug, tool001Titles, type Locale } from "@/lib/site";

export function generateStaticParams() { return locales.map((locale) => ({ locale, toolSlug: tool001Slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; toolSlug: string }> }): Promise<Metadata> {
  const { locale, toolSlug } = await params;
  if (!locales.includes(locale as Locale) || toolSlug !== tool001Slug) notFound();
  const current = locale as Locale;
  return { title: `${tool001Titles[current]} - TOOLBOX`, description: tool001Descriptions[current], alternates: { canonical: `https://toolbox.fixlgs.com/${current}/${tool001Slug}` } };
}

export default async function Tool001Page({ params }: { params: Promise<{ locale: string; toolSlug: string }> }) {
  const { locale, toolSlug } = await params;
  if (!locales.includes(locale as Locale) || toolSlug !== tool001Slug) notFound();
  const current = locale as Locale;
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
    trust: string;
  } = current === "ko" ? {
    howTitle: "사용 방법", howEyebrow: "HOW TO USE", steps: ["이미지를 업로드합니다.", "원하는 형식과 옵션을 선택합니다.", "변환이 끝나면 결과 파일을 다운로드합니다."],
    faqTitle: "자주 묻는 질문", faqEyebrow: "FAQ", faqMore: "FAQ 더보기", faqCollapse: "FAQ 접기", faqs: [["어떤 이미지 형식을 지원하나요?", "JPG, PNG, WebP 등 도구 화면에 표시된 형식을 지원합니다."], ["여러 이미지를 한 번에 처리할 수 있나요?", "네. 여러 파일을 선택해 한 번에 변환하거나 압축할 수 있습니다."], ["업로드한 이미지는 서버에 저장되나요?", "아니요. 이미지는 가능한 범위에서 브라우저 내부에서 직접 처리되며 서버에 저장되지 않습니다."], ["변환 후 화질이 달라질 수 있나요?", "출력 형식과 압축 설정에 따라 화질과 파일 크기가 달라질 수 있습니다."], ["파일 크기나 해상도 제한이 있나요?", "브라우저와 기기의 메모리 상태에 따라 매우 큰 파일은 처리 속도가 느려지거나 제한될 수 있습니다."], ["이미지의 가로세로 크기도 변경할 수 있나요?", "도구 화면에서 제공되는 크기 조정 옵션을 사용하면 원하는 해상도로 변경할 수 있습니다."], ["투명 배경은 유지되나요?", "PNG나 WebP처럼 투명도를 지원하는 형식으로 변환하면 유지될 수 있지만, JPG는 투명 배경을 지원하지 않습니다."], ["모바일에서도 사용할 수 있나요?", "네. 휴대전화와 태블릿에서도 파일을 선택하고 결과를 다운로드할 수 있습니다."], ["변환이 되지 않을 때는 어떻게 해야 하나요?", "파일 형식과 크기를 확인한 뒤 다시 시도하고, 계속 문제가 발생하면 다른 최신 브라우저를 사용해 보세요."], ["이 도구는 무료인가요?", "네. 현재 제공되는 기본 이미지 변환 기능은 무료로 사용할 수 있습니다."]],
    trust: "이미지는 브라우저에서 직접 처리되며 서버에 저장되지 않습니다."
  } : current === "en" ? {
    howTitle: "How to use", howEyebrow: "HOW TO USE", steps: ["Upload your image.", "Choose the output format and options.", "Download the converted file when processing is complete."],
    faqTitle: "Frequently asked questions", faqEyebrow: "FAQ", faqMore: "View more FAQs", faqCollapse: "Show fewer FAQs", faqs: [["Which image formats are supported?", "The tool supports formats shown in the interface, including JPG, PNG, and WebP."], ["Can I process multiple images at once?", "Yes. You can select multiple files and convert or compress them in one batch."], ["Are uploaded images stored on a server?", "No. Images are processed directly in your browser whenever possible and are not stored on our server."], ["Can image quality change after conversion?", "Quality and file size may vary depending on the output format and compression settings."], ["Are there file-size or resolution limits?", "Very large files may be slower or limited depending on your browser and device memory."], ["Can I resize image dimensions?", "Use the resize options shown in the tool to set a different output resolution."], ["Will transparent backgrounds be preserved?", "Transparency can be preserved in formats such as PNG or WebP, but JPG does not support transparency."], ["Can I use the tool on mobile devices?", "Yes. You can select files and download results on phones and tablets."], ["What should I do if conversion fails?", "Check the file format and size, try again, and use another up-to-date browser if the issue continues."], ["Is this tool free?", "Yes. The basic image conversion features currently provided are free to use."]],
    trust: "Images are processed directly in your browser and are not stored on our server."
  } : {
    howTitle: "使い方", howEyebrow: "HOW TO USE", steps: ["画像をアップロードします。", "出力形式とオプションを選択します。", "処理が完了したら変換後のファイルを保存します。"],
    faqTitle: "よくある質問", faqEyebrow: "FAQ", faqMore: "FAQをもっと見る", faqCollapse: "FAQを閉じる", faqs: [["どの画像形式に対応していますか？", "JPG、PNG、WebPなど、ツール画面に表示される形式に対応しています。"], ["複数の画像をまとめて処理できますか？", "はい。複数のファイルを選択して一括で変換または圧縮できます。"], ["アップロードした画像はサーバーに保存されますか？", "いいえ。画像は可能な範囲でブラウザ内で直接処理され、サーバーには保存されません。"], ["変換後に画質が変わることはありますか？", "出力形式や圧縮設定によって画質とファイルサイズが変わる場合があります。"], ["ファイルサイズや解像度に制限はありますか？", "非常に大きなファイルはブラウザや端末のメモリ状況によって処理が遅くなったり制限されたりする場合があります。"], ["画像の縦横サイズも変更できますか？", "ツール画面のサイズ変更オプションを使って出力解像度を変更できます。"], ["透明背景は維持されますか？", "PNGやWebPなど透明度に対応する形式では維持できますが、JPGは透明背景に対応していません。"], ["モバイルでも利用できますか？", "はい。スマートフォンやタブレットでもファイルを選択して結果を保存できます。"], ["変換できない場合はどうすればよいですか？", "ファイル形式とサイズを確認して再試行し、問題が続く場合は別の最新ブラウザをお試しください。"], ["このツールは無料ですか？", "はい。現在提供している基本的な画像変換機能は無料で利用できます。"]],
    trust: "画像はブラウザ内で直接処理され、サーバーには保存されません。"
  };

  return (
    <ToolboxSubpageShell locale={current}>
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
      <section className="toolbox-tool-faq">
        <div className="toolbox-tool-guide-head"><p>{info.faqEyebrow}</p><h2>{info.faqTitle}</h2></div>
        <ToolboxFaqList items={info.faqs} initialCount={5} moreLabel={info.faqMore} collapseLabel={info.faqCollapse} className="toolbox-tool-faq-list" />
      </section>
      <section className="toolbox-tool-processing-note"><p>{info.trust}</p></section>
    </ToolboxSubpageShell>
  );
}
