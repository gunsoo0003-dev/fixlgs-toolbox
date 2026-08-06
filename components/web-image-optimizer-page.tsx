import Link from "next/link";
import { WebImageOptimizerTool } from "@/components/web-image-optimizer-tool";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const copy={
ko:{back:"이미지 변환·최적화",title:"웹 이미지 최적화기",desc:"웹사이트와 블로그에 사용할 이미지를 적절한 형식·크기·품질로 한 번에 최적화합니다.",how:"사용 방법",steps:["JPG, PNG, WebP 또는 AVIF 이미지를 선택합니다.","일반 웹, 블로그, 쇼핑몰 등 사용 목적을 선택합니다.","자동 추천 또는 원하는 최적화 수준을 선택합니다.","웹용으로 최적화를 누릅니다.","자동 선택된 형식·픽셀 크기·파일 용량을 확인합니다.","결과를 개별 파일 또는 ZIP으로 저장합니다."],guide:"웹 이미지 최적화가 단순 압축과 다른 이유",guideDesc:"이미지 형식과 픽셀 크기, 품질을 함께 비교하고 원본보다 실질적으로 나은 결과만 선택합니다. 모든 파일을 같은 형식으로 강제하지 않으며 투명도와 작은 글자를 보호합니다.",cards:[["자동 형식 선택","WebP·AVIF·PNG·원본 비교","이미지 성격과 사용 목적에 맞는 후보를 실제로 생성해 비교합니다."],["웹용 크기 추천","필요한 이미지만 축소","이미 적절한 크기이거나 작은 이미지는 확대하지 않고 원본 크기를 유지합니다."],["원본 유지","개선 효과가 없으면 재인코딩하지 않음","후보가 더 크거나 절감 효과가 작으면 원본 바이트를 그대로 결과에 포함합니다."]],checks:[["01","투명도 보호","투명 이미지는 JPG로 자동 변환하지 않고 알파 채널을 유지할 수 있는 후보만 비교합니다."],["02","자동 판단 수정","이미지 유형 자동 추정이 맞지 않으면 파일별로 사진·그래픽·스크린샷 등을 직접 선택할 수 있습니다."],["03","선택 이유 표시","형식 변경, 원본 유지, 투명도 보호 등 주요 판단 이유를 파일별로 확인할 수 있습니다."],["04","로컬 처리와 안전 한도","원본과 후보 결과는 브라우저 메모리에서만 처리됩니다. 최대 10개, 파일당 15MB, 전체 50MB, 파일당 및 전체 2천만 픽셀, 최대 한 변 16,384px까지 처리합니다."]],practicalTitle:"실제 사용에서 확인할 기준",practical:[["AVIF가 항상 정답은 아닙니다","AVIF는 더 작을 수 있지만 처리 시간이 길고 이미지에 따라 WebP보다 유리하지 않을 수 있습니다."],["절감률과 화질을 함께 봅니다","파일이 작아져도 작은 글자나 얇은 선이 흐려지면 좋은 결과가 아닙니다. 비교 화면으로 실제 품질을 확인하세요."],["메타데이터 처리","재인코딩 결과는 메타데이터가 제거됩니다. 원본 유지 결과는 원본 바이트를 사용하므로 메타데이터도 유지됩니다."],["실제 웹 성능","용량 절감은 전송량을 줄이는 데 도움이 되지만 로딩 시간과 검색 순위의 정확한 향상을 보장하지는 않습니다."]],faqTitle:"자주 묻는 질문",more:"FAQ 더보기",collapse:"FAQ 접기",faqs:[["일반 이미지 압축기와 무엇이 다른가요?","일반 압축기는 현재 형식과 크기를 유지하며 용량을 줄입니다. 웹 이미지 최적화기는 형식, 픽셀 크기와 품질을 함께 비교합니다."],["모든 이미지가 WebP나 AVIF로 변환되나요?","아니요. 실제 후보 결과가 원본보다 실질적으로 나을 때만 형식을 변경하며 이미 최적화된 파일은 원본을 유지합니다."],["AVIF가 항상 WebP보다 좋은가요?","아닙니다. 이미지 종류, 품질, 처리 시간과 브라우저 환경에 따라 달라집니다."],["투명 PNG도 최적화할 수 있나요?","네. 투명도를 유지할 수 있는 PNG, WebP 또는 AVIF 후보를 비교하며 JPG로 자동 변환하지 않습니다."],["작은 이미지가 확대되나요?","아니요. 기본 설정에서는 원본보다 작은 이미지를 확대하지 않습니다."],["자동으로 선택한 이유를 확인할 수 있나요?","네. 파일별로 형식 선택, 투명도 보호, 원본 유지 등 주요 판단 이유를 표시합니다."],["원본보다 결과가 커질 수도 있나요?","후보가 더 크거나 개선 효과가 작으면 최적화본을 채택하지 않고 원본을 유지합니다."],["메타데이터는 유지되나요?","재인코딩 결과는 기본적으로 제거되고, 원본 유지 파일은 원본 바이트가 유지됩니다."],["애니메이션 이미지도 지원하나요?","아니요. 애니메이션 WebP·AVIF, APNG와 GIF는 지원하지 않으며 첫 프레임만 처리하지 않습니다."],["목표 KB나 MB를 입력할 수 있나요?","특정 용량 이하로 맞추려면 목표 용량 이미지 압축기를 사용하세요."],["파일이 서버로 업로드되나요?","아니요. 파일은 브라우저 내부에서 처리됩니다."],["무료로 사용할 수 있나요?","네. 로그인, 워터마크, 유료 기능 제한 없이 사용할 수 있습니다."]]},
en:{back:"Image Convert",title:"Web Image Optimizer",desc:"Optimize images for websites and blogs with the right format, dimensions and quality in one batch.",how:"How to use",steps:["Choose JPG, PNG, WebP, or AVIF images.","Select a use case such as general web, blog, online store, or portfolio.","Use Auto Recommended or choose an optimization level.","Select Optimize for Web.","Review the selected format, dimensions, file size, and reason.","Download files individually or as ZIP."],guide:"Why web optimization is more than compression",guideDesc:"The tool compares format, dimensions, and quality together and selects a result only when it meaningfully improves on the original.",cards:[["Automatic format selection","Compare WebP, AVIF, PNG, and original","Only useful candidates are generated and compared for each image."],["Web-size recommendation","Resize only when needed","Images that are already suitable or smaller are not enlarged."],["Keep original","Avoid unnecessary re-encoding","The original bytes are retained when candidates are larger or offer too little benefit."]],checks:[["01","Protect transparency","Transparent images are never automatically changed to JPG."],["02","Correct auto detection","Change the detected photo, graphic, or screenshot type per file when needed."],["03","Explain the choice","Each file shows why a format was selected or why the original was kept."],["04","Local processing and safe limits","Originals and candidates remain in browser memory. Safe limits are 10 files, 15 MB each, 50 MB total, 20 million pixels per file and in total, with a maximum side of 16,384 px."]],practicalTitle:"What to verify in real use",practical:[["AVIF is not always best","It can be smaller but slower, and WebP may be the better balance for some images."],["Check quality with savings","A smaller file is not better when text or thin lines become unclear."],["Metadata behavior","Re-encoded results remove metadata. Original-kept results retain the original bytes and metadata."],["Real web performance","Lower transfer size can help, but exact loading-time or ranking gains are not guaranteed."]],faqTitle:"Frequently asked questions",more:"View more FAQs",collapse:"Show fewer FAQs",faqs:[["How is this different from a compressor?","A compressor keeps format and dimensions. This optimizer evaluates format, dimensions, and quality together."],["Are all images converted to WebP or AVIF?","No. The format changes only when a generated candidate meaningfully improves on the original."],["Is AVIF always better than WebP?","No. Results vary by image type, quality, processing time, and browser environment."],["Can transparent PNG files be optimized?","Yes. PNG, transparent WebP, and AVIF candidates can be compared without automatic JPG conversion."],["Are small images enlarged?","No. Upscaling is blocked by default."],["Can I see why a result was selected?","Yes. Each file shows the main selection reason."],["What if the result is larger?","The original is kept when a candidate is larger or not meaningfully better."],["Is metadata retained?","Re-encoded files remove metadata; original-kept files preserve their original bytes."],["Are animated images supported?","No. Animated WebP, AVIF, APNG, and GIF are not processed."],["Can I enter an exact KB or MB target?","Use the Target Size Image Compressor for an exact upper limit."],["Are files uploaded?","No. Processing happens locally in your browser."],["Is it free?","Yes. No sign-in, watermark, or paid feature limit is required."]]},
ja:{back:"画像変換・最適化",title:"Web画像最適化ツール",desc:"Webサイトやブログ用の画像を、適切な形式・サイズ・画質にまとめて最適化します。",how:"使い方",steps:["JPG・PNG・WebP・AVIF画像を選択します。","一般Web、ブログ、ショップ、ポートフォリオなどの使用目的を選択します。","自動おすすめ、または希望する最適化レベルを選択します。","Web用に最適化を押します。","選択された形式・サイズ・容量と理由を確認します。","個別またはZIPで保存します。"],guide:"Web画像最適化が単純な圧縮と異なる理由",guideDesc:"形式、ピクセルサイズ、画質をまとめて比較し、元画像より有効な結果だけを選択します。",cards:[["形式を自動選択","WebP・AVIF・PNG・元画像を比較","画像ごとに必要な候補だけを生成して比較します。"],["Web用サイズを提案","必要な画像だけ縮小","すでに適切な画像や小さい画像は拡大しません。"],["元画像を維持","不要な再エンコードを回避","候補が大きい、または効果が小さい場合は元のバイトを維持します。"]],checks:[["01","透明度を保護","透明画像をJPGへ自動変換しません。"],["02","自動判定を修正","必要に応じて写真・グラフィック・スクリーンショットを個別に変更できます。"],["03","選択理由を表示","形式選択や元画像維持の理由をファイルごとに確認できます。"],["04","ローカル処理と安全上限","元画像と候補はブラウザ内だけで処理されます。最大10件、1件15MB、合計50MB、1件および合計2,000万画素、最大辺16,384pxまで処理します。"]],practicalTitle:"実際の利用で確認する基準",practical:[["AVIFが常に最適とは限りません","小さくなる場合がありますが処理が遅く、画像によってはWebPが適切です。"],["削減率と画質を一緒に確認","文字や細い線が不鮮明になる場合は良い結果ではありません。"],["メタデータの扱い","再エンコード結果では削除され、元画像を維持する場合は元のバイトとメタデータが残ります。"],["実際のWeb性能","転送量削減には役立ちますが、読み込み時間や検索順位の改善を保証しません。"]],faqTitle:"よくある質問",more:"FAQをもっと見る",collapse:"FAQを閉じる",faqs:[["一般的な圧縮ツールとの違いは何ですか？","一般圧縮は形式とサイズを維持します。このツールは形式、サイズ、画質をまとめて比較します。"],["すべてWebPやAVIFに変換されますか？","いいえ。元画像より有効な改善がある場合だけ形式を変更します。"],["AVIFは常にWebPより良いですか？","いいえ。画像タイプ、画質、処理時間、ブラウザ環境によって異なります。"],["透明PNGも最適化できますか？","はい。透明度を維持できる候補を比較し、JPGへ自動変換しません。"],["小さい画像は拡大されますか？","いいえ。初期設定では拡大しません。"],["自動選択の理由を確認できますか？","はい。ファイルごとに主要な判断理由を表示します。"],["結果が元画像より大きい場合は？","候補が大きい、または改善が小さい場合は元画像を維持します。"],["メタデータは維持されますか？","再エンコードでは削除され、元画像維持では元のバイトが残ります。"],["アニメーション画像に対応していますか？","いいえ。アニメーションWebP・AVIF、APNG、GIFは処理しません。"],["目標KB・MBを入力できますか？","正確な上限は目標容量画像圧縮ツールを使用してください。"],["サーバーへアップロードされますか？","いいえ。ブラウザ内で処理されます。"],["無料ですか？","はい。登録、透かし、有料機能制限なしで利用できます。"]]}
} as const;

export function WebImageOptimizerPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t.title,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: `https://toolbox.fixlgs.com/${locale}/web-image-optimizer`,
      description: t.desc,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faqs.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` },
        { "@type": "ListItem", position: 2, name: t.title, item: `https://toolbox.fixlgs.com/${locale}/web-image-optimizer` },
      ],
    },
  ];
  const ready = locale === "ko" ? "사용 가능" : locale === "en" ? "Available" : "利用可能";

  return (
    <ToolboxSubpageShell locale={locale} appName={t.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="toolbox-tool-detail-hero">
        <Link className="toolbox-subpage-back" href={`/${locale}/category/image-convert`}>← {t.back}</Link>
        <p className="toolbox-subpage-eyebrow">007 · IMAGE CONVERT</p>
        <div className="toolbox-tool-detail-heading"><h1>{t.title}</h1><p>{t.desc}</p></div>
        <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{locale === "ko" ? "브라우저에서 바로 처리" : locale === "en" ? "PROCESS IN YOUR BROWSER" : "ブラウザ内で処理"}</span></div>
      </section>

      <section className="toolbox-tool-detail-body"><div>
        <WebImageOptimizerTool locale={locale} />
        <section className="toolbox-next-work">
          <div><p>NEXT WORK</p><h2>{locale === "ko" ? "다음 작업" : locale === "en" ? "Next steps" : "次の作業"}</h2></div>
          <div className="toolbox-next-work-grid">
            {[
              ["004", locale === "ko" ? "이미지 압축기" : locale === "en" ? "Image Compressor" : "画像圧縮ツール", "image-compressor"],
              ["005", locale === "ko" ? "목표 용량 이미지 압축기" : locale === "en" ? "Target Size Compressor" : "目標容量圧縮ツール", "target-size-image-compressor"],
              ["006", locale === "ko" ? "이미지 크기 변경기" : locale === "en" ? "Image Resizer" : "画像サイズ変更ツール", "image-resizer"],
            ].map(([n, name, slug]) => <Link key={n} href={`/${locale}/${slug}`} className="toolbox-next-work-card"><span>{n}</span><h3>{name}</h3><div className="toolbox-next-work-card-foot"><span>{ready}</span><strong>↗</strong></div></Link>)}
          </div>
        </section>
      </div></section>

      <section className="toolbox-tool-guide toolbox-tool-guide--six">
        <div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div>
        <ol>{t.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
      </section>

      <section className="toolbox-tool-format-guide">
        <div className="toolbox-tool-format-guide-head"><p>WEB IMAGE OPTIMIZATION GUIDE</p><h2>{t.guide}</h2><span>{t.guideDesc}</span></div>
        <div className="toolbox-tool-format-body">
          <div className="toolbox-tool-format-grid">
            {t.cards.map(([title, subtitle, description]) => <article key={title}><strong>{title}</strong><h3>{subtitle}</h3><p>{description}</p></article>)}
          </div>
          <div className="toolbox-tool-result-guide">
            <div className="toolbox-tool-section-intro toolbox-tool-section-intro-compact"><p>PRACTICAL DETAILS</p><h3>{t.practicalTitle}</h3></div>
            <div className="toolbox-tool-result-grid">{t.checks.map(([n, title, description]) => <article key={n}><span>{n}</span><div><h4>{title}</h4><p>{description}</p></div></article>)}</div>
            <div className="toolbox-tool-result-grid">{t.practical.map(([title, description], index) => <article key={title}><span>{String(index + 5).padStart(2, "0")}</span><div><h4>{title}</h4><p>{description}</p></div></article>)}</div>
          </div>
        </div>
      </section>

      <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs} initialCount={5} moreLabel={t.more} collapseLabel={t.collapse} className="toolbox-tool-faq-list" /></section>
      <section className="toolbox-tool-processing-note"><p>{locale === "ko" ? "파일은 서버로 전송되지 않고 브라우저에서 처리됩니다." : locale === "en" ? "Your files are processed in your browser and are not uploaded to a server." : "ファイルはサーバーに送信されず、ブラウザ内で処理されます。"}</p></section>
    </ToolboxSubpageShell>
  );
}
