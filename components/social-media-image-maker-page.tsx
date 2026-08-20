import { ToolNavigation } from "@/components/tool-navigation";
import Link from "next/link";
import { SocialMediaImageMakerTool } from "./social-media-image-maker-tool";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";
import type { Locale } from "@/lib/site";
import pageStyles from "./social-media-image-maker-page.module.css";

const pageCopy = {
  ko: {
    back: "콘텐츠 이미지 제작",
    title: "SNS 이미지 제작기",
    desc: "한 번 만든 디자인을 Instagram·Facebook·X·LinkedIn 규격으로 맞춰 여러 SNS 결과로 한 번에 출력하세요.",
    local: "배경 이미지, 텍스트, 로고와 결과 파일은 브라우저 안에서만 처리되며 서버에 저장되지 않습니다.",
    howTitle: "사용 방법",
    steps: [
      "배경 이미지를 선택하거나 빈 디자인으로 시작합니다.",
      "제목, 설명, 로고와 공통 스타일을 입력해 기본 디자인을 만듭니다.",
      "Instagram, Facebook, X, LinkedIn 규격을 한 화면에서 확인합니다.",
      "필요한 규격만 crop, 텍스트 위치, 로고 위치를 별도로 조정합니다.",
      "현재 규격을 개별 다운로드하거나 선택한 규격을 ZIP으로 한 번에 저장합니다.",
    ],
    guideTitle: "왜 이 도구가 반복 작업을 줄여 주나요?",
    guideDesc: "하나의 디자인을 만들고 각 SNS 규격에 맞게 조정·출력하는 전체 작업 흐름을 확인하세요.",
    guideCards: [
      ["01", "One design, many outputs", "제목·설명·로고·색상·정렬은 공통 디자인으로 먼저 확정하고, 플랫폼마다 꼭 필요한 crop·위치·크기만 override로 분리해 반복 입력을 줄입니다."],
      ["02", "Ratio-safe crop", "Instagram 4:5·Story 9:16·X 16:9·LinkedIn 1:1처럼 화면비가 달라도 원본 비율은 유지하고 cover crop으로 채워 인물·상품이 찌그러지지 않게 합니다."],
      ["03", "Safe composition", "제목과 로고는 플랫폼 업로드 후 추가 crop 가능성을 고려해 가장자리에서 충분히 띄우고, 중요한 피사체는 각 preset 미리보기에서 중심 유지 여부를 확인합니다."],
      ["04", "Preview = Export", "미리보기와 다운로드가 같은 렌더 모델을 사용하므로 crop·텍스트·로고 위치를 화면에서 확인한 상태 그대로 실제 결과에 반영하는 흐름을 유지합니다."],
      ["05", "JPG or PNG", "사진 중심 결과는 JPG로 용량을 줄이고, 로고·텍스트·평면 그래픽처럼 선명도와 무손실 보존이 중요한 결과는 PNG를 선택해 목적에 맞게 출력합니다."],
      ["06", "Selected ZIP", "필요한 규격만 체크해 플랫폼·규격 접미사가 붙은 파일을 ZIP으로 한 번에 저장하고, 급하게 필요한 규격은 개별 다운로드로 바로 전달할 수 있습니다."],
    ],
    expertTitle: "SNS 이미지를 규격마다 다시 만들지 않는 실전 기준",
    expertDesc: "플랫폼별 화면비와 안전영역부터 crop·텍스트·로고 배치, JPG·PNG 선택, 여러 규격 동시 출력까지 실제 제작에서 결과 차이를 만드는 기준을 정리했습니다.",
    expertCards: [
      ["플랫폼별 화면비를 먼저 이해하기", "Instagram 피드 4:5, Story 9:16, X 16:9, LinkedIn 1:1처럼 같은 디자인도 노출 비율이 크게 달라집니다. 처음부터 한 규격만 완성한 뒤 억지로 늘리는 것보다 공통 디자인을 만든 다음 각 preset에서 잘리는 범위를 확인하는 편이 안정적입니다."],
      ["안전영역은 글자와 로고의 보험", "플랫폼은 업로드 후 썸네일·피드·상세 화면에서 추가 crop을 적용할 수 있습니다. 제목, 가격, CTA, 로고처럼 반드시 보여야 하는 요소는 가장자리에서 충분히 띄우고 중요한 피사체도 화면 중앙에 여유를 두는 것이 좋습니다."],
      ["No Stretch와 cover crop의 차이", "서로 다른 화면비를 맞출 때 원본을 가로세로로 늘리면 인물과 상품 형태가 변형됩니다. 이 도구는 원본 비율을 유지한 cover crop을 기준으로 하므로, 필요한 경우 배경 위치와 확대만 조정해 프레임을 채웁니다."],
      ["공통 디자인과 규격별 override 분리", "제목·설명·색상·정렬처럼 모든 규격에 공통인 값은 한 번만 정하고, 특정 플랫폼에서만 필요한 crop·텍스트 위치·로고 위치는 해당 preset에만 override로 남기는 것이 반복 작업을 가장 많이 줄이는 방식입니다."],
      ["Preview와 Export를 같은 기준으로 보기", "미리보기에서 승인한 crop과 텍스트·로고 위치가 실제 출력과 다르면 작업 시간을 다시 써야 합니다. 따라서 각 preset의 실제 화면비를 미리 확인하고, 다운로드 전 선택 규격과 개별 override 상태를 마지막으로 점검하는 흐름이 중요합니다."],
      ["JPG와 PNG 선택 기준", "사진이 중심이고 용량을 줄여야 한다면 JPG가 효율적입니다. 로고·텍스트·평면 그래픽처럼 선명한 경계와 무손실 보존이 중요하면 PNG가 유리하지만, 사진 배경에서는 파일이 커질 수 있으므로 목적에 맞춰 선택하세요."],
      ["여러 SNS를 한 번에 납품하는 파일 관리", "선택한 규격을 ZIP으로 저장할 때 플랫폼과 규격 접미사가 있는 파일명을 유지하면 전달 과정에서 혼동이 줄어듭니다. 급하게 하나만 수정해야 할 때는 개별 다운로드를 사용하고, 최종 납품 전에는 실제 픽셀 크기를 다시 확인하는 것이 좋습니다."],
      ["자주 생기는 실무 실수", "가장 흔한 문제는 가장자리 글자 잘림, 로고 과대 배치, 한 규격의 crop을 다른 규격까지 덮어쓰기, 사진에 불필요한 PNG 사용, 미리보기만 보고 실제 픽셀 규격을 확인하지 않는 것입니다. 공통값과 규격별 값을 분리해 확인하면 대부분 예방할 수 있습니다."],
    ],
    cautionTitle: "주의사항",
    cautions: [
      "플랫폼 업로드 후 자체 압축·자동 crop이 추가될 수 있으므로 가장자리의 중요한 텍스트와 로고는 안전 여백 안에 배치하세요.",
      "Instagram·Facebook·X·LinkedIn은 표시 비율이 달라 같은 배경이라도 인물·상품 중심부가 잘릴 수 있어 규격별 미리보기 확인이 필요합니다.",
      "X와 LinkedIn 일부 preset은 공식 단일 필수 픽셀값이 아니라 실사용 편의를 위한 TOOLBOX 권장값이며, 게시 목적에 따라 공식 가이드를 함께 확인하세요.",
      "타인의 사진·상표·로고 사용 권리는 사용자가 확인해야 하며, 애니메이션 GIF·APNG·Animated WebP는 기본 입력 대상이 아닙니다.",
      "JPG는 사진 중심 결과에, PNG는 로고·텍스트 선명도와 무손실 보존이 중요한 결과에 유리하며 업로드 플랫폼의 재압축 여부도 고려하세요.",
    ],
    faqTitle: "자주 묻는 질문",
    faqMore: "FAQ 더보기",
    faqLess: "FAQ 접기",
    faqs: [
      ["한 디자인을 여러 SNS 크기로 자동 만들 수 있나요?", "네. 공통 디자인을 한 번 만든 뒤 필요한 규격만 crop, 위치, 크기를 따로 조정해서 여러 SNS 결과를 만들 수 있습니다."],
      ["이미지가 찌그러지나요?", "아니요. 원본 비율을 유지한 No Stretch cover crop 방식으로 처리합니다."],
      ["Instagram 게시물 preset이 왜 1080×1350인가요?", "4:5는 현재 Instagram 공식 지원 범위 안에 있고 실제 사용 빈도가 높아서 TOOLBOX 기본 preset으로 사용합니다."],
      ["X와 LinkedIn 크기는 공식 필수값인가요?", "아닙니다. 공식 지원 비율과 최소 조건을 바탕으로 TOOLBOX에서 실사용하기 편한 권장 preset을 제공합니다."],
      ["이미지가 서버로 전송되나요?", "아니요. 이미지, 텍스트, 로고와 결과 파일은 현재 브라우저에서만 처리합니다."],
      ["모든 규격을 한 번에 받을 수 있나요?", "네. 선택한 규격을 ZIP으로 한 번에 받을 수 있고, 각 규격을 개별로도 다운로드할 수 있습니다."],
    ],
    related: "관련 도구",
    available: "사용 가능",
    next: "다음 작업",
    coming: "준비 중",
  },
  en: {
    back: "Content Image Creation",
    title: "Social Media Image Maker",
    desc: "Create one design and export it for Instagram, Facebook, X, and LinkedIn sizes without rebuilding each version from scratch.",
    local: "Background images, text, logos, and result files stay in your browser and are not stored on a server.",
    howTitle: "How to use",
    steps: [
      "Choose a background image or start with a blank design.",
      "Create the common design with a title, description, logo, and shared styling.",
      "Review Instagram, Facebook, X, and LinkedIn outputs on one screen.",
      "Fine-tune crop, text position, or logo placement only for the sizes that need it.",
      "Download the current size or save selected sizes together as a ZIP file.",
    ],
    guideTitle: "Why this tool reduces repetitive work",
    guideDesc: "Review the full workflow for building one design, adapting it to each social size, and exporting the final assets efficiently.",
    guideCards: [
      ["01", "One design, many outputs", "Set title, description, logo, color, and alignment once in the common design, then keep only the crop, position, or size changes that a specific platform actually needs as overrides."],
      ["02", "Ratio-safe crop", "When switching among Instagram 4:5, Story 9:16, X 16:9, and LinkedIn 1:1, the source aspect ratio stays intact and cover crop prevents faces or products from being stretched."],
      ["03", "Safe composition", "Keep critical text and logos away from outer edges, then review the subject center in each preset because platforms may apply additional display cropping after upload."],
      ["04", "Preview = Export", "Preview and download share one render model, so the crop, text, and logo placement you approve on screen is carried into the exported result."],
      ["05", "JPG or PNG", "Use JPG for photographic assets when smaller files matter, and choose PNG when crisp logos, text, flat graphics, or lossless detail are more important."],
      ["06", "Selected ZIP", "Check only the sizes you need and save platform-suffixed files together as a ZIP, while keeping individual download available for urgent handoff."],
    ],
    expertTitle: "Practical standards for one design across social sizes",
    expertDesc: "A practical guide to aspect ratios, safe margins, crop behavior, text and logo placement, JPG versus PNG, and multi-size delivery without rebuilding the same design.",
    expertCards: [
      ["Start with platform aspect ratios", "Instagram Feed 4:5, Story 9:16, X 16:9, and LinkedIn 1:1 can expose very different parts of the same design. Build a common design first, then inspect what each preset crops instead of stretching one finished size into every destination."],
      ["Safe margins protect critical content", "Platforms may apply extra cropping in feeds, thumbnails, or detail views after upload. Keep titles, prices, calls to action, and logos comfortably away from outer edges, and leave breathing room around the main subject."],
      ["No Stretch versus cover crop", "Changing aspect ratio by scaling width and height independently distorts faces and products. The tool preserves the source ratio and fills the frame with cover crop, so composition is adjusted with background position and zoom instead of stretching."],
      ["Separate common design from preset overrides", "Define shared title, description, color, and alignment once. Keep crop, text position, or logo placement that is needed only for one platform inside that preset override so a local fix does not overwrite every output."],
      ["Treat Preview and Export as one approval flow", "A reliable workflow checks the actual preset ratio before download and confirms the selected sizes and override state. The crop and text or logo placement approved in preview should be the same composition delivered in the exported asset."],
      ["Choose JPG or PNG by content", "JPG is efficient for photo-heavy assets when file size matters. PNG is better for crisp logos, text, flat graphics, or lossless edges, but photographic backgrounds can make PNG substantially larger."],
      ["Manage multi-platform delivery cleanly", "When exporting selected sizes as a ZIP, keep platform and size suffixes in filenames to reduce handoff mistakes. Use individual download for urgent one-off revisions and verify the actual pixel dimensions before final delivery."],
      ["Common production mistakes", "Typical mistakes include edge-clipped text, oversized logos, applying one crop to every ratio, using PNG unnecessarily for photos, and approving a preview without checking final pixel dimensions. Separating shared values from preset-specific values prevents most of them."],
    ],
    cautionTitle: "Important notes",
    cautions: [
      "Platforms may apply additional compression or display cropping after upload, so keep critical text and logos inside a comfortable safe margin.",
      "Instagram, Facebook, X, and LinkedIn use different display ratios, so the same background can crop a face or product differently and should be checked in each preset preview.",
      "Some X and LinkedIn presets are practical TOOLBOX recommendations rather than a single mandatory official pixel size; confirm the current platform guide for special placements.",
      "You are responsible for usage rights to photos, trademarks, and logos, and animated GIF, APNG, and animated WebP are outside the default input set.",
      "JPG is efficient for photographic assets, while PNG is better when crisp text, logos, or lossless detail matter; also consider platform recompression.",
    ],
    faqTitle: "Frequently asked questions",
    faqMore: "Show more FAQs",
    faqLess: "Show fewer FAQs",
    faqs: [
      ["Can I make multiple social sizes from one design?", "Yes. Build one common design, then adjust crop or placement only for the sizes that need their own changes."],
      ["Will the image be stretched?", "No. The tool uses a no-stretch cover crop approach that keeps the original aspect ratio."],
      ["Why is the Instagram Post preset 1080×1350?", "Because 4:5 is within Instagram's supported range and works well for many feed posts, it is used as the TOOLBOX default preset."],
      ["Are the X and LinkedIn sizes official mandatory values?", "No. They are practical TOOLBOX recommendations based on official support ranges and minimum conditions."],
      ["Are my files uploaded?", "No. Images, text, logos, and result files stay in your current browser."],
      ["Can I download every size at once?", "Yes. You can save the selected sizes together as a ZIP file, or download each one individually."],
    ],
    related: "Related tools",
    available: "Available",
    next: "Next work",
    coming: "Coming soon",
  },
  ja: {
    back: "コンテンツ画像作成",
    title: "SNS 画像作成ツール",
    desc: "1つのデザインを Instagram・Facebook・X・LinkedIn のサイズへ合わせて、一度に複数のSNS画像として出力できます。",
    local: "背景画像、文字、ロゴ、結果ファイルはブラウザ内のみで処理され、サーバーに保存されません。",
    howTitle: "使い方",
    steps: [
      "背景画像を選択するか、空のデザインから開始します。",
      "タイトル、説明、ロゴ、共通スタイルを設定して基本デザインを作ります。",
      "Instagram、Facebook、X、LinkedIn の結果を1画面で確認します。",
      "必要なサイズだけ crop、文字位置、ロゴ位置を個別に調整します。",
      "現在のサイズを個別にダウンロードするか、選択サイズを ZIP でまとめて保存します。",
    ],
    guideTitle: "このツールが繰り返し作業を減らす理由",
    guideDesc: "1つのデザインを作成し、各SNSサイズに合わせて調整・書き出す全体の作業フローを確認できます。",
    guideCards: [
      ["01", "One design, many outputs", "タイトル・説明・ロゴ・色・整列は共通デザインで先に決め、各プラットフォームで本当に必要な crop・位置・サイズだけを override として分離します。"],
      ["02", "Ratio-safe crop", "Instagram 4:5、Story 9:16、X 16:9、LinkedIn 1:1へ切り替えても元画像比率を保った cover crop で配置し、人物や商品を引き伸ばしません。"],
      ["03", "Safe composition", "重要な文字やロゴは外周から十分に離し、アップロード後の追加 crop を想定して各プリセットで人物・商品の中心位置を確認します。"],
      ["04", "Preview = Export", "プレビューとダウンロードは同じ描画モデルを使うため、画面で確認した crop・文字・ロゴ位置をそのまま書き出し結果へ反映します。"],
      ["05", "JPG or PNG", "写真中心なら容量を抑えやすい JPG、ロゴ・文字・フラット画像など鮮明さや無劣化を優先する場合は PNG を選びます。"],
      ["06", "Selected ZIP", "必要なサイズだけ選択し、プラットフォーム・サイズ接尾辞付きの結果を ZIP でまとめて保存しつつ、個別ダウンロードも利用できます。"],
    ],
    expertTitle: "1つのデザインをSNS各サイズへ展開する実践基準",
    expertDesc: "プラットフォーム別の比率と安全余白、crop、文字・ロゴ配置、JPG・PNGの選択、複数サイズの書き出しまで、実制作で差が出る基準を整理しました。",
    expertCards: [
      ["最初にプラットフォーム比率を理解する", "Instagramフィード4:5、Story 9:16、X 16:9、LinkedIn 1:1では同じデザインでも見える範囲が大きく変わります。1サイズを無理に伸ばすのではなく、共通デザインを作って各presetの切れ方を確認します。"],
      ["安全余白は重要情報を守る", "アップロード後にフィードやサムネイルで追加cropが入る場合があります。タイトル、価格、CTA、ロゴなど必ず見せたい要素は外周から十分に離し、主要被写体にも余裕を持たせます。"],
      ["No Stretchとcover crop", "縦横を別々に拡大すると人物や商品の形が崩れます。このツールは元画像比率を保つcover cropを基準にし、背景位置とズームで構図を合わせます。"],
      ["共通デザインとpreset別overrideを分ける", "タイトル・説明・色・整列は一度だけ共通値として設定し、特定SNSだけに必要なcrop・文字位置・ロゴ位置はそのpresetのoverrideとして残すと、他サイズを壊さずに修正できます。"],
      ["PreviewとExportを同じ確認フローにする", "各presetの実際の比率をプレビューで確認し、ダウンロード前に選択サイズとoverride状態を最終確認します。画面で承認したcrop・文字・ロゴ配置がそのまま出力に反映される流れが重要です。"],
      ["JPGとPNGの選び方", "写真中心で容量を抑えたい場合はJPGが効率的です。ロゴ・文字・フラットグラフィックなど輪郭の鮮明さや無劣化を重視する場合はPNGが向きますが、写真背景では容量が大きくなりやすい点に注意します。"],
      ["複数SNSへの納品ファイルを整理する", "選択サイズをZIPで保存するときはプラットフォームとサイズの接尾辞を維持すると取り違えを減らせます。急ぎの1サイズは個別ダウンロードを使い、最終納品前に実ピクセルサイズを確認します。"],
      ["よくある制作ミス", "外周の文字切れ、ロゴの過大配置、1つのcropを全比率へ適用すること、写真に不要なPNGを使うこと、実ピクセルを確認せずプレビューだけで完了することが代表的です。共通値とpreset別値を分けて確認すると防ぎやすくなります。"],
    ],
    cautionTitle: "注意事項",
    cautions: [
      "アップロード後に追加圧縮や表示 crop が行われる場合があるため、重要な文字やロゴは十分な安全余白の内側に配置してください。",
      "Instagram・Facebook・X・LinkedIn は表示比率が異なるため、同じ背景でも人物や商品の中心が切れる場合があり、各プリセットの確認が必要です。",
      "X と LinkedIn の一部プリセットは公式の単一必須ピクセル値ではなく実用向けの TOOLBOX 推奨値です。特別な用途では最新の公式ガイドも確認してください。",
      "写真・商標・ロゴの利用権はユーザー自身で確認し、アニメーション GIF・APNG・Animated WebP は基本入力対象外です。",
      "写真中心なら JPG、文字やロゴの鮮明さ・無劣化を重視するなら PNG が向いており、各SNS側の再圧縮も考慮してください。",
    ],
    faqTitle: "よくある質問",
    faqMore: "FAQをもっと見る",
    faqLess: "FAQを閉じる",
    faqs: [
      ["1つのデザインから複数のSNSサイズを作れますか？", "はい。共通デザインを1回作成した後、必要なサイズだけ crop や配置を個別調整できます。"],
      ["画像は引き伸ばされますか？", "いいえ。元の比率を保った No Stretch の cover crop 方式です。"],
      ["Instagram 投稿 preset が 1080×1350 なのはなぜですか？", "4:5 は現在の Instagram 公式対応範囲内で、一般的な投稿で使いやすいため TOOLBOX の基本 preset としています。"],
      ["X と LinkedIn のサイズは公式必須値ですか？", "いいえ。公式対応比率と最低条件をもとに、実用しやすい TOOLBOX 推奨 preset を提供しています。"],
      ["画像はサーバーに送信されますか？", "いいえ。画像、文字、ロゴ、結果ファイルは現在のブラウザ内でのみ処理されます。"],
      ["すべてのサイズを一度に保存できますか？", "はい。選択したサイズを ZIP でまとめて保存でき、個別ダウンロードにも対応しています。"],
    ],
    related: "関連ツール",
    available: "利用可能",
    next: "次の作業",
    coming: "準備中",
  },
} as const;

export function SocialMediaImageMakerPage({ locale }: { locale: Locale }) {
  const t = pageCopy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/social-media-image-maker`;
  const related = [
    { n: "017", name: locale === "ko" ? "이미지 워터마크 넣기" : locale === "en" ? "Add Watermark to Images" : "画像ウォーターマーク追加", href: `/${locale}/image-watermark-tool` },
    { n: "016", name: locale === "ko" ? "이미지에 글자 넣기" : locale === "en" ? "Add Text to Image" : "画像文字入れツール", href: `/${locale}/add-text-to-image` },
    { n: "018", name: locale === "ko" ? "이미지 정보·메타데이터 검사기" : locale === "en" ? "Image Metadata Checker" : "画像情報・メタデータチェッカー", href: `/${locale}/image-metadata-checker` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: t.title,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        url,
        description: t.desc,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Instagram Post",
          "Instagram Story",
          "Facebook",
          "X",
          "LinkedIn",
          "Common design state",
          "Size-specific overrides",
          "No-stretch cover crop",
          "Selected ZIP export",
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` },
          { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/content-image` },
          { "@type": "ListItem", position: 3, name: t.title, item: url },
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
      <section className="toolbox-tool-detail-hero">
        <Link className="toolbox-subpage-back" href={`/${locale}/category/content-image`}>← {t.back}</Link>
        <p className="toolbox-subpage-eyebrow">021 · CONTENT IMAGE</p>
        <div className="toolbox-tool-detail-heading">
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>
        <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
      </section>

      <section className="toolbox-tool-detail-body">
        <div>
          <SocialMediaImageMakerTool locale={locale} />

          <ToolNavigation locale={locale} currentTool={21} />

          
        </div>
      </section>

      <section className="toolbox-tool-guide toolbox-tool-guide--five">
        <div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.howTitle}</h2></div>
        <ol>
          {t.steps.map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{locale === "ko" && index === 0 ? <>배경 이미지를 선택하거나<br />빈 디자인으로 시작합니다.</> : step}</p></li>
          ))}
        </ol>
      </section>

      <section className={`toolbox-tool-format-guide toolbox-tool-expert-post ${pageStyles.workflowSection}`}>
        <div className={`toolbox-tool-format-guide-head ${pageStyles.workflowHead}`}><p>WORKFLOW GUIDE</p><h2>{t.guideTitle}</h2><span>{t.guideDesc}</span></div>
        <div className={`toolbox-tool-result-grid ${pageStyles.guideGrid}`}>
          {t.guideCards.map(([num, title, description]) => (
            <article key={num}><span>{num}</span><div><h4>{title}</h4><p>{description}</p></div></article>
          ))}
        </div>
      </section>

      <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head">
        <div className="toolbox-tool-format-guide-head"><p>EXPERT POST</p><h2>{t.expertTitle}</h2><span>{t.expertDesc}</span></div>
        <div className="toolbox-tool-format-body"><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">
          {t.expertCards.map(([title, description]) => <article key={title}><h4>{title}</h4><p>{description}</p></article>)}
        </div></div>
      </section>

      <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start">
        <div className="toolbox-tool-info-band-head">
          <p>IMPORTANT NOTES</p>
          <h2>{t.cautionTitle}</h2>
          <span>{locale === "ko" ? "플랫폼별 표시 차이와 파일 특성을 확인해 중요한 요소가 잘리거나 품질이 예상과 달라지는 일을 줄이세요." : locale === "en" ? "Check platform display differences and file behavior to reduce unexpected cropping or quality changes after upload." : "プラットフォームごとの表示差とファイル特性を確認し、重要要素の切れや想定外の画質変化を減らします。"}</span>
        </div>
        <ul className="toolbox-tool-info-band-list">{t.cautions.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="toolbox-tool-info-band toolbox-tool-info-band--spaced toolbox-tool-info-band--bottom-gap">
        <div className="toolbox-tool-info-band-head">
          <p>RESULT CHECKS</p>
          <h2>{locale === "ko" ? "핵심 결과 기준" : locale === "en" ? "Result checks" : "結果確認の基準"}</h2>
          <span>{locale === "ko" ? "다운로드 전에 미리보기와 실제 규격, 파일명, 개별 override가 의도대로 유지되는지 확인하세요." : locale === "en" ? "Before download, confirm that preview, actual dimensions, filenames, and size-specific overrides remain consistent." : "ダウンロード前に、プレビュー・実サイズ・ファイル名・サイズ別 override が意図どおり維持されているか確認します。"}</span>
        </div>
        <ul className="toolbox-tool-info-band-list">
          {(locale === "ko" ? [
            "공통 디자인과 규격별 override가 분리되어 한 플랫폼의 crop·위치 조정이 다른 규격을 덮어쓰지 않아야 합니다.",
            "Preview와 export는 같은 렌더 모델을 사용하므로 미리보기의 crop·텍스트·로고 위치가 실제 출력에도 동일하게 반영되어야 합니다.",
            "각 결과는 선택한 preset의 실제 픽셀 규격으로 생성되고 파일명에는 플랫폼·규격 접미사가 포함되어 구분되어야 합니다.",
            "여러 규격을 선택하면 성공한 결과를 ZIP으로 한 번에 저장할 수 있고, 필요한 규격은 개별 다운로드도 가능해야 합니다.",
            "Instagram·Facebook·X·LinkedIn 사이에서 화면비가 달라도 배경 원본 비율을 유지하는 No Stretch cover crop 원칙이 유지되어야 합니다.",
          ] : locale === "en" ? [
            "Common design values and size-specific overrides must remain separate so crop or placement changes for one platform do not overwrite another size.",
            "Preview and export share the same render model, so crop, text, and logo placement shown in preview should match the downloaded asset.",
            "Each result must use the selected preset's actual pixel dimensions and include a platform/size suffix in the filename for clear handoff.",
            "Selected presets can be saved together as a ZIP while any required preset remains available as an individual download.",
            "The no-stretch cover-crop rule must preserve the source aspect ratio even when switching among Instagram, Facebook, X, and LinkedIn ratios.",
          ] : [
            "共通デザインとサイズ別 override を分離し、1つのプラットフォームの crop・配置変更が他サイズを上書きしないことが基準です。",
            "プレビューと書き出しは同じ描画モデルを使い、表示中の crop・文字・ロゴ位置がダウンロード結果にも同じように反映される必要があります。",
            "各結果は選択プリセットの実ピクセルサイズで生成し、ファイル名にはプラットフォーム・サイズの接尾辞を付けて識別できるようにします。",
            "複数プリセットは ZIP でまとめて保存でき、必要なサイズは個別ダウンロードもできる状態を維持します。",
            "Instagram・Facebook・X・LinkedIn で比率が変わっても、元画像比率を保つ No Stretch の cover crop を維持します。",
          ]).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="toolbox-tool-faq">
        <div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div>
        <ToolboxFaqList items={t.faqs} initialCount={4} moreLabel={t.faqMore} collapseLabel={t.faqLess} className="toolbox-tool-faq-list" />
      </section>
      <section className="toolbox-tool-processing-note"><p>{t.local}</p></section>
    </ToolboxSubpageShell>
  );
}
