import Link from "next/link";
import { ImageWatermarkTool } from "@/components/image-watermark-tool";
import "@/components/image-watermark-tool.css";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const copy = {
  ko: {
    back: "이미지 편집",
    title: "이미지 워터마크 넣기",
    desc: "텍스트나 로고 워터마크를 사진에 넣고 여러 이미지에 한 번에 적용하세요.",
    steps: [
      "워터마크를 넣을 이미지 한 장 또는 여러 장을 선택합니다.",
      "텍스트 워터마크 또는 로고 워터마크를 선택합니다.",
      "문구를 입력하거나 PNG·JPG·WebP 로고 파일을 선택합니다.",
      "크기, 투명도, 회전, 여백과 9방향 위치를 조절합니다.",
      "필요하면 반복 모드에서 간격과 밀도를 조절합니다.",
      "대표 미리보기에서 드래그해 자유 위치를 확인합니다.",
      "다른 비율 이미지를 눌러 같은 상대 설정이 자연스러운지 확인합니다.",
      "출력 형식과 품질을 정한 뒤 전체 이미지에 적용하고, 개별 결과 또는 ZIP을 다운로드합니다.",
    ],
    faqs: [
      ["여러 사진에 같은 워터마크를 한 번에 넣을 수 있나요?", "예. 한 번 설정한 워터마크를 선택한 여러 이미지에 같은 상대 크기와 상대 위치로 적용할 수 있습니다."],
      ["텍스트와 로고 둘 다 지원하나요?", "예. 텍스트 문구와 PNG·JPG·WebP 로고 파일을 워터마크로 사용할 수 있습니다."],
      ["투명 PNG 로고도 가능한가요?", "예. PNG 로고의 투명 영역을 유지해 이미지 위에 합성할 수 있습니다."],
      ["사진 전체에 반복 워터마크를 넣을 수 있나요?", "예. 반복 모드를 켜고 간격, 밀도와 각도를 조절해 사진 전체에 워터마크를 배치할 수 있습니다."],
      ["이미지 크기가 서로 달라도 비슷한 위치에 들어가나요?", "예. 대표 미리보기에서 정한 상대 위치와 상대 크기를 기준으로 여러 이미지에 같은 설정을 적용합니다."],
      ["이미지가 서버로 전송되나요?", "아니요. 이미지와 로고, 텍스트는 모두 현재 브라우저 안에서만 처리됩니다."],
      ["ZIP으로 한 번에 받을 수 있나요?", "예. 여러 결과 파일을 묶어 한 번에 ZIP으로 다운로드할 수 있습니다."],
      ["원본 이미지 크기가 바뀌나요?", "기본적으로 원본 픽셀 크기를 유지한 채 워터마크만 합성합니다."],
      ["일부 이미지 처리에 실패하면 처음부터 다시 해야 하나요?", "아니요. 완료된 결과는 유지되며 실패한 파일만 다시 시도할 수 있습니다."],
      ["이미지에 이미 있는 워터마크를 지울 수 있나요?", "아니요. 이 도구는 워터마크를 추가하는 용도이며 기존 워터마크 제거 기능은 제공하지 않습니다."],
    ],
    more: "FAQ 더보기",
    collapse: "FAQ 접기",
    usageTitle: "활용 예시",
    usageIntro: "저작권 표시, 브랜드 노출, 시안 보호처럼 같은 표시를 여러 이미지에 반복해야 할 때 유용합니다.",
    usages: [
      "작가 사진에 저작권 문구 표시",
      "쇼핑몰 상품 이미지에 상호 또는 로고 삽입",
      "포트폴리오 이미지에 이름과 사이트 주소 표시",
      "고객 검토용 이미지에 SAMPLE 또는 DRAFT 표시",
      "SNS·블로그용 이미지에 계정명 반복 배치",
      "사진 전체에 대각선 반복 워터마크 적용",
    ],
    compareTitle: "텍스트 워터마크와 로고 워터마크의 차이",
    compareCards: [
      ["텍스트 워터마크", "저작권 문구, 사이트 주소, SAMPLE, DRAFT처럼 의미를 직접 전달해야 할 때 적합합니다."],
      ["로고 워터마크", "브랜드 아이덴티티를 자연스럽게 노출하고, 상품 사진이나 포트폴리오에 같은 로고를 반복 적용할 때 적합합니다."],
      ["반복 워터마크", "복사 방지 목적이 강하거나 사진 전체에 약한 보호 레이어를 주고 싶을 때 유용합니다."],
    ],
    noteTitle: "주의사항",
    notes: [
      "원본 파일은 수정되지 않습니다.",
      "여러 이미지에는 상대 위치와 상대 크기를 기준으로 같은 워터마크 설정이 적용됩니다.",
      "이미지 비율이 크게 다르면 대표 미리보기를 바꿔 결과를 확인하는 것이 좋습니다.",
      "작은 로고를 크게 확대하면 흐리게 보일 수 있습니다.",
      "반복 워터마크는 사진 전체를 가릴 수 있으므로 투명도와 밀도를 먼저 확인하세요.",
      "JPG 출력은 투명도를 지원하지 않으며 투명 영역은 흰색 배경으로 합성됩니다.",
      "많은 고해상도 이미지는 브라우저 메모리를 많이 사용할 수 있으므로 처리 진행 상태를 확인하세요.",
      "일부 파일 처리에 실패해도 정상 완료된 결과는 유지되며 실패 파일만 다시 시도할 수 있습니다.",
      "이 도구는 기존 이미지에 있는 워터마크를 제거하는 기능을 제공하지 않습니다.",
    ],
    nextTitle: "다음 작업",
    ready: "사용 가능",
    soon: "준비 중",
  },
  en: {
    back: "Image Edit",
    title: "Add Watermark to Images",
    desc: "Add text or logo watermarks to photos and apply the same settings to multiple images at once.",
    steps: [
      "Select one or more images that need a watermark.",
      "Choose text watermark or logo watermark mode.",
      "Type your text or select a PNG, JPG, or WebP logo file.",
      "Adjust size, opacity, rotation, margin, and one of the 9 position presets.",
      "Use repeat mode when you want the watermark across the full image.",
      "Drag the preview watermark when you need a free position.",
      "Click another image in the list to check the same relative settings on a different aspect ratio.",
      "Choose the output format and quality, process the images, then download individual results or a ZIP file.",
    ],
    faqs: [
      ["Can I apply the same watermark to many images at once?", "Yes. One watermark setup can be applied to multiple images with the same relative size and position."],
      ["Does the tool support both text and logo watermarks?", "Yes. You can use typed text or PNG, JPG, and WebP logo files."],
      ["Can I use transparent PNG logos?", "Yes. Transparent PNG areas are preserved when the logo is composited on the image."],
      ["Can the watermark repeat across the whole image?", "Yes. Use repeat mode and adjust the spacing, density, and angle."],
      ["Will the watermark stay in a similar place on images with different sizes?", "Yes. The tool uses relative size and relative position so the result stays visually consistent."],
      ["Are my files uploaded anywhere?", "No. The images, logos, and watermark settings stay in your current browser."],
      ["Can I download every result in one ZIP file?", "Yes. Multiple processed images can be downloaded together in a ZIP file."],
      ["Does the tool change the original image dimensions?", "By default the tool keeps the original pixel size and only composites the watermark."],
      ["Do I need to restart if some images fail?", "No. Completed results are kept and you can retry only the failed files."],
      ["Can this tool remove a watermark that is already on an image?", "No. This tool only adds watermarks and does not provide existing-watermark removal."],
    ],
    more: "Show more FAQs",
    collapse: "Collapse FAQs",
    usageTitle: "Example uses",
    usageIntro: "Use it when the same watermark must be repeated across many images for copyright, branding, or draft protection.",
    usages: [
      "Add a copyright line to your photographs",
      "Place a store logo on product photos",
      "Show a name and website on portfolio images",
      "Mark review files as SAMPLE or DRAFT",
      "Repeat an account name on blog and social images",
      "Apply a diagonal protection watermark across the full image",
    ],
    compareTitle: "Text watermark vs logo watermark",
    compareCards: [
      ["Text watermark", "Best when the message itself matters, such as copyright text, a website URL, SAMPLE, or DRAFT."],
      ["Logo watermark", "Best for consistent brand identity on product images, client previews, or portfolio assets."],
      ["Repeated watermark", "Useful when you need a lighter protection layer across the whole image rather than a single corner mark."],
    ],
    noteTitle: "Things to keep in mind",
    notes: [
      "The original files are not modified.",
      "The same relative position and relative size are applied to multiple images.",
      "When aspect ratios differ a lot, switch the preview image and check the result.",
      "Very small logos can look soft when enlarged too much.",
      "Repeated watermarks can cover too much of the image, so check opacity and density first.",
      "JPG output does not preserve transparency; transparent areas are composited on white.",
      "Large batches of high-resolution images can use substantial browser memory, so watch the processing status.",
      "If some files fail, completed results remain available and failed files can be retried separately.",
      "This tool does not remove watermarks that already exist on an image.",
    ],
    nextTitle: "Next steps",
    ready: "Available",
    soon: "Coming soon",
  },
  ja: {
    back: "画像編集",
    title: "画像ウォーターマーク追加ツール",
    desc: "テキストまたはロゴのウォーターマークを画像に入れ、同じ設定を複数画像へ一括適用できます。",
    steps: [
      "ウォーターマークを入れたい画像を1枚または複数選択します。",
      "テキストウォーターマークまたはロゴウォーターマークを選択します。",
      "文字列を入力するか、PNG・JPG・WebPロゴを選択します。",
      "サイズ、不透明度、回転、余白、9方向位置を調整します。",
      "画像全体に入れたい場合は繰り返しモードを使います。",
      "自由位置が必要な場合はプレビュー上で直接ドラッグします。",
      "一覧の別画像を選び、同じ相対設定が違う比率でも自然か確認します。",
      "出力形式と品質を決めて画像を処理し、個別結果またはZIPをダウンロードします。",
    ],
    faqs: [
      ["同じウォーターマークを複数画像へ一度に入れられますか？", "はい。1回の設定で、同じ相対サイズと相対位置を複数画像に適用できます。"],
      ["テキストとロゴの両方に対応していますか？", "はい。テキスト入力とPNG・JPG・WebPロゴに対応しています。"],
      ["透過PNGロゴは使えますか？", "はい。透過部分を保ったまま画像の上に合成できます。"],
      ["画像全体に繰り返しウォーターマークを入れられますか？", "はい。繰り返しモードで間隔、密度、角度を調整できます。"],
      ["サイズが違う画像でも似た位置に入りますか？", "はい。相対位置と相対サイズを使うため、見た目を揃えやすくなっています。"],
      ["画像はどこかにアップロードされますか？", "いいえ。画像、ロゴ、設定は現在のブラウザ内だけで処理されます。"],
      ["結果をZIPでまとめて受け取れますか？", "はい。複数の結果画像をZIPファイルとしてまとめてダウンロードできます。"],
      ["元画像のサイズは変わりますか？", "基本的には元のピクセルサイズを維持し、ウォーターマークだけを合成します。"],
      ["一部の画像が失敗した場合は最初からやり直す必要がありますか？", "いいえ。完了済みの結果は保持され、失敗したファイルだけを再試行できます。"],
      ["画像にすでにあるウォーターマークを消せますか？", "いいえ。このツールはウォーターマークを追加するためのもので、既存ウォーターマークの削除機能は提供しません。"],
    ],
    more: "FAQをもっと見る",
    collapse: "FAQを閉じる",
    usageTitle: "活用例",
    usageIntro: "著作権表示、ブランド表示、下書き保護など、同じ表示を複数画像へ繰り返したい場面に向いています。",
    usages: [
      "写真に著作権表記を入れる",
      "商品画像に店舗ロゴを入れる",
      "ポートフォリオ画像に名前とサイトURLを入れる",
      "確認用画像にSAMPLEやDRAFTを表示する",
      "SNSやブログ画像にアカウント名を繰り返し入れる",
      "画像全体に斜めの保護ウォーターマークを適用する",
    ],
    compareTitle: "テキストウォーターマークとロゴウォーターマークの違い",
    compareCards: [
      ["テキストウォーターマーク", "著作権文、サイトURL、SAMPLE、DRAFTのように内容そのものを伝えたいときに向いています。"],
      ["ロゴウォーターマーク", "ブランドらしさを揃えながら、商品画像やポートフォリオへ同じロゴを入れたいときに向いています。"],
      ["繰り返しウォーターマーク", "1か所だけでなく画像全体に薄い保護レイヤーを入れたいときに便利です。"],
    ],
    noteTitle: "注意事項",
    notes: [
      "元ファイルは変更されません。",
      "複数画像には同じ相対位置と相対サイズが適用されます。",
      "縦横比が大きく異なる場合は、代表プレビューを切り替えて結果を確認してください。",
      "小さいロゴを大きく拡大するとぼやけて見える場合があります。",
      "繰り返しウォーターマークは画像を覆いすぎることがあるため、不透明度と密度を先に確認してください。",
      "JPG出力は透明部分を保持できず、透明領域は白背景に合成されます。",
      "高解像度画像を大量に処理するとブラウザメモリを多く使用するため、処理状況を確認してください。",
      "一部のファイルが失敗しても完了済み結果は保持され、失敗ファイルだけを再試行できます。",
      "このツールは画像にすでに存在するウォーターマークを削除する機能を提供しません。",
    ],
    nextTitle: "次の作業",
    ready: "利用可能",
    soon: "準備中",
  },
} as const;

export function ImageWatermarkPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const nextCards = [
    { n: "016", name: locale === "ko" ? "이미지에 글자 넣기" : locale === "en" ? "Add Text to Image" : "画像文字入れツール", href: null },
    { n: "018", name: locale === "ko" ? "이미지 정보·메타데이터 검사기" : locale === "en" ? "Image Info & Metadata Inspector" : "画像情報・メタデータ確認ツール", href: null },
    { n: "004", name: locale === "ko" ? "이미지 압축기" : locale === "en" ? "Image Compressor" : "画像圧縮ツール", href: `/${locale}/image-compressor` },
    { n: "006", name: locale === "ko" ? "이미지 크기 변경기" : locale === "en" ? "Image Resizer" : "画像サイズ変更ツール", href: `/${locale}/image-resizer` },
    { n: "014", name: locale === "ko" ? "이미지 콜라주 만들기" : locale === "en" ? "Image Collage Maker" : "画像コラージュ作成ツール", href: `/${locale}/image-collage-maker` },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: t.title,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        url: `https://toolbox.fixlgs.com/${locale}/image-watermark-tool`,
        description: t.desc,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` },
          { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/image-edit` },
          { "@type": "ListItem", position: 3, name: t.title, item: `https://toolbox.fixlgs.com/${locale}/image-watermark-tool` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };

  return (
    <ToolboxSubpageShell locale={locale} appName={t.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="toolbox-tool-detail-hero tool017-detail-hero">
        <Link className="toolbox-subpage-back" href={`/${locale}/category/image-edit`}>← {t.back}</Link>
        <p className="toolbox-subpage-eyebrow">017 · IMAGE EDIT</p>
        <div className="toolbox-tool-detail-heading">
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>
        <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{locale === "ko" ? "브라우저에서 바로 처리" : locale === "en" ? "PROCESS IN YOUR BROWSER" : "ブラウザ内で処理"}</span></div>
      </section>

      <section className="toolbox-tool-detail-body"><div>
        <ImageWatermarkTool locale={locale} />
        <section className="toolbox-next-work">
          <div><p>NEXT WORK</p><h2>{t.nextTitle}</h2></div>
          <div className="toolbox-next-work-grid">
            {nextCards.map((card) => card.href ? (
              <Link key={card.n} href={card.href} className="toolbox-next-work-card">
                <span>{card.n}</span>
                <h3>{card.name}</h3>
                <div className="toolbox-next-work-card-foot"><span>{t.ready}</span><strong>↗</strong></div>
              </Link>
            ) : (
              <div key={card.n} className="toolbox-next-work-card is-disabled">
                <span>{card.n}</span>
                <h3>{card.name}</h3>
                <div className="toolbox-next-work-card-foot"><span>{t.soon}</span><strong>·</strong></div>
              </div>
            ))}
          </div>
        </section>
      </div></section>

      <section className="toolbox-tool-guide tool017-how-to tool013-how-to-grid">
        <div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{locale === "ko" ? "사용 방법" : locale === "en" ? "How to use" : "使い方"}</h2></div>
        <ol>{t.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
      </section>

      <section className="toolbox-tool-format-guide tool017-examples">
        <div className="toolbox-tool-format-guide-head"><p>EXAMPLES</p><h2>{t.usageTitle}</h2><span>{t.usageIntro}</span></div>
        <div className="tool017-example-grid">{t.usages.map((item) => <article key={item}><strong>017</strong><p>{item}</p></article>)}</div>
      </section>

      <section className="toolbox-tool-format-guide toolbox-tool-expert-post tool017-examples tool017-expert-post">
        <div className="toolbox-tool-format-guide-head">
          <p>EXPERT POST</p>
          <h2>{t.compareTitle}</h2>
          <span>{locale === "ko" ? "워터마크의 목적에 따라 종류·위치·투명도·반복 방식과 출력 형식을 함께 결정하면 여러 이미지에서도 일관성과 가독성을 유지하기 쉽습니다." : locale === "en" ? "Choosing watermark type, placement, opacity, repetition, and output format together helps keep branding and readability consistent across many images." : "目的に合わせて種類・位置・不透明度・繰り返し・出力形式をまとめて決めると、複数画像でも統一感と可読性を保ちやすくなります。"}</span>
        </div>
        <div className="tool017-example-grid">{t.compareCards.map(([title, body]) => <article key={title}><strong>{title}</strong><p>{body}</p></article>)}</div>
        <div className="toolbox-tool-format-body tool017-expert-body"><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">
          {(locale === "ko" ? [
            ["워터마크 목적부터 정하기", "저작권 표시는 식별 가능성이 중요하고, 브랜드 로고는 시선을 방해하지 않는 일관성이 중요합니다. SAMPLE·DRAFT 같은 검토용 표시는 제거하기 어렵도록 화면 중심이나 반복 배치가 더 적합합니다. 목적을 먼저 정하면 위치와 투명도를 과도하게 조정하는 일을 줄일 수 있습니다."],
            ["텍스트와 로고의 선택 기준", "저작권 문구, URL, 계정명처럼 내용 전달이 중요하면 텍스트가 유리합니다. 상품 사진이나 포트폴리오에서 동일한 브랜드 인상을 유지하려면 로고가 적합합니다. 두 가지를 동시에 사용할 때는 서로 겹치지 않도록 크기와 위치를 분리해서 확인하세요."],
            ["상대 크기와 상대 위치", "크기가 다른 여러 이미지에 같은 픽셀값을 적용하면 작은 이미지에서는 워터마크가 너무 커지고 큰 이미지에서는 너무 작아질 수 있습니다. 상대 크기와 상대 위치를 사용하면 해상도와 비율이 달라도 비슷한 시각적 비중을 유지하기 쉽습니다."],
            ["투명도는 배경과 함께 판단", "같은 40% 투명도라도 밝은 하늘, 어두운 실내, 복잡한 상품 사진에서 보이는 정도가 다릅니다. 대표 이미지 하나만 보고 결정하지 말고 밝고 어두운 이미지를 번갈아 미리보기해 최소한의 가독성이 유지되는지 확인하는 편이 좋습니다."],
            ["반복 워터마크의 밀도", "반복 워터마크는 이미지 전체 보호에 유리하지만 간격이 좁고 불투명도가 높으면 원본 내용을 지나치게 가릴 수 있습니다. 먼저 낮은 불투명도에서 시작하고 가로·세로 간격과 밀도를 조정한 뒤 실제 사용 크기로 확인하세요."],
            ["회전과 가장자리 여백", "대각선 회전은 반복 워터마크에서 자연스럽지만 한쪽 모서리 로고에는 작은 각도만으로도 정렬이 불안정해 보일 수 있습니다. 가장자리 여백을 너무 작게 두면 플랫폼의 자동 크롭이나 썸네일 처리에서 일부가 잘릴 수 있으므로 안전 여백을 확보하는 편이 좋습니다."],
            ["미리보기와 원본 출력 차이", "미리보기는 화면에 맞춰 축소되어 보일 수 있지만 최종 저장은 원본 해상도를 기준으로 다시 합성됩니다. 작은 로고를 크게 확대하거나 얇은 외곽선을 사용할 때는 원본 크기에서 흐림이나 계단 현상이 더 눈에 띌 수 있으므로 결과 파일을 한 번 확인하세요."],
            ["출력 형식과 품질", "JPG는 투명도를 유지하지 못하고 품질값에 따라 압축 흔적이 생길 수 있습니다. PNG는 투명도를 유지하지만 사진에서는 용량이 커질 수 있고, WebP는 용량과 화질의 균형이 좋은 경우가 많습니다. 원본 형식을 유지할지 변환할지는 사용처에 맞춰 결정하세요."],
            ["일괄 처리 전 대표 이미지 점검", "세로형·가로형·정사각형 이미지가 섞여 있으면 한 장에서 자연스러운 위치가 다른 비율에서는 어색할 수 있습니다. 비율이 다른 이미지를 몇 장 대표로 바꿔 보면서 위치·크기·반복 밀도를 확인한 뒤 전체 적용하는 것이 안전합니다."],
            ["로컬 처리와 원본 보존", "이미지와 로고는 현재 브라우저에서 처리되며 원본 파일 자체를 덮어쓰지 않습니다. 다만 브라우저 메모리는 대량의 고해상도 이미지를 동시에 처리할 때 증가할 수 있으므로 진행 상태를 확인하고, 실패 파일은 완료된 결과를 유지한 채 별도로 재시도하는 것이 효율적입니다."],
          ] : locale === "en" ? [
            ["Start with the watermark purpose", "Copyright marks need clear identification, brand logos need consistent but unobtrusive placement, and SAMPLE or DRAFT marks are often better near the center or repeated across the image. Defining the purpose first prevents unnecessary adjustments."],
            ["Choose text or logo deliberately", "Text works well for copyright lines, URLs, and account names. Logos are better when consistent brand identity matters. If both are enabled, keep their size and placement independent so the two layers do not compete."],
            ["Use relative size and position", "Fixed pixel values can look oversized on small images and tiny on large ones. Relative sizing and positioning preserve a more consistent visual proportion across mixed resolutions and aspect ratios."],
            ["Judge opacity against the background", "The same 40% opacity can look very different on bright skies, dark interiors, and detailed product photos. Preview both bright and dark representative images before applying the setting to a batch."],
            ["Control repeated-watermark density", "Repeated watermarks protect the whole image but can obscure content when spacing is tight or opacity is high. Start lighter, then adjust horizontal spacing, vertical spacing, and density while checking the image at its intended viewing size."],
            ["Balance rotation and edge margin", "Diagonal rotation suits repeated patterns, while corner logos usually look more stable with little or no rotation. Leave enough edge margin because social platforms and thumbnails may crop near the border."],
            ["Preview versus source-resolution output", "The preview can be reduced to fit the screen, while export is rendered again at source resolution. Small logos, thin outlines, and strong enlargement may reveal softness or aliasing more clearly in the downloaded file."],
            ["Pick format and quality for the destination", "JPG cannot preserve transparency and may show compression artifacts. PNG preserves transparency but can be larger for photos, while WebP often balances size and quality. Choose based on where the image will be used."],
            ["Check representative aspect ratios before batching", "A position that works on a portrait image may feel wrong on a wide landscape image. Switch between a few representative aspect ratios and confirm size, placement, and repeat density before processing all files."],
            ["Understand local processing and source preservation", "Images and logos are processed in the current browser and the original files are not overwritten. Large high-resolution batches can still use significant browser memory, so monitor progress and retry only failed files when needed."],
          ] : [
            ["最初に目的を決める", "著作権表示は識別しやすさ、ブランドロゴは邪魔にならない統一感、SAMPLE・DRAFTは消しにくい中央配置や繰り返しが重要です。目的を先に決めると設定を過度に調整せずに済みます。"],
            ["テキストとロゴを使い分ける", "著作権文、URL、アカウント名にはテキストが適し、商品写真やポートフォリオでブランドを統一したい場合はロゴが向いています。両方を使う場合はサイズと位置を独立して確認してください。"],
            ["相対サイズと相対位置", "固定ピクセル値では小さい画像で大きすぎたり、大きい画像で小さすぎたりします。相対サイズと相対位置を使うと、解像度や縦横比が違っても視覚的な比率を揃えやすくなります。"],
            ["不透明度は背景と一緒に確認", "同じ40%でも明るい空、暗い室内、細部の多い商品写真では見え方が異なります。明暗の異なる代表画像を切り替えて最低限の可読性を確認してください。"],
            ["繰り返しの密度", "繰り返しは画像全体の保護に有効ですが、間隔が狭く不透明度が高いと内容を隠しすぎます。低い不透明度から始め、横・縦間隔と密度を調整して実際の表示サイズで確認します。"],
            ["回転と端の余白", "斜め回転は繰り返しに自然ですが、角のロゴでは小さな回転でも不安定に見えることがあります。SNSやサムネイルの自動クロップを考え、端には安全な余白を残してください。"],
            ["プレビューと元解像度出力", "プレビューは画面に合わせて縮小される場合がありますが、保存時は元解像度で再合成されます。小さなロゴの拡大や細い縁取りは、保存結果でぼやけやギザつきが目立つことがあります。"],
            ["出力形式と品質", "JPGは透明度を保持できず圧縮跡が出る場合があります。PNGは透明度を保持しますが写真では容量が大きくなりやすく、WebPは容量と画質のバランスが良い場合があります。用途に合わせて選択してください。"],
            ["一括処理前に代表比率を確認", "縦長・横長・正方形が混在すると、1枚で自然な位置が別の比率では不自然になる場合があります。異なる比率を数枚切り替え、位置・サイズ・繰り返し密度を確認してから全体へ適用します。"],
            ["ローカル処理と元画像の保持", "画像とロゴは現在のブラウザ内で処理され、元ファイルは上書きされません。ただし高解像度画像を大量に処理するとメモリ使用量が増えるため、進行状況を確認し、失敗したファイルだけ再試行する方法が効率的です。"],
          ]).map(([h, p]) => <article key={h}><h4>{h}</h4><p>{p}</p></article>)}
        </div></div>
      </section>

      <section className="toolbox-tool-format-guide tool017-examples tool017-notes-section">
        <div className="toolbox-tool-format-guide-head"><p>NOTE</p><h2>{t.noteTitle}</h2></div>
        <ul className="tool017-note-list">{t.notes.map((note) => <li key={note}>{note}</li>)}</ul>
      </section>

      <section className="toolbox-tool-faq tool017-faq">
        <div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{locale === "ko" ? "자주 묻는 질문" : locale === "en" ? "Frequently asked questions" : "よくある質問"}</h2></div>
        <ToolboxFaqList items={t.faqs} initialCount={4} moreLabel={t.more} collapseLabel={t.collapse} />
      </section>
    </ToolboxSubpageShell>
  );
}
