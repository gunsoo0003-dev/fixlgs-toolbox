export const locales = ["ko", "en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export const localeShort: Record<Locale, string> = {
  ko: "KO",
  en: "EN",
  ja: "JA",
};

export const localePaths: Record<Locale, string> = {
  ko: "/ko",
  en: "/en",
  ja: "/ja",
};

export type Category = {
  slug: string;
  number: string;
  titles: Record<Locale, string>;
  descriptions: Record<Locale, string>;
  toolCountLabel: Record<Locale, string>;
  accent: string;
};

export const categories: Category[] = [
  {
    slug: "image-convert",
    number: "01",
    titles: {
      ko: "이미지 변환·최적화",
      en: "Image Convert",
      ja: "画像変換・最適化",
    },
    descriptions: {
      ko: "형식 변환, 압축, 크기 조정, 웹 최적화의 출발점",
      en: "Format conversion, compression, resizing, and web-ready output.",
      ja: "形式変換、圧縮、サイズ変更、Web最適化の起点。",
    },
    toolCountLabel: { ko: "우선 제작", en: "Starting first", ja: "最初に制作" },
    accent: "#0868D7",
  },
  {
    slug: "image-edit",
    number: "02",
    titles: { ko: "이미지 편집", en: "Image Edit", ja: "画像編集" },
    descriptions: {
      ko: "자르기, 회전, 보정, 모자이크, 합치기",
      en: "Crop, rotate, adjust, blur, and combine images.",
      ja: "切り抜き、回転、補正、ぼかし、合成。",
    },
    toolCountLabel: { ko: "2개 사용 가능", en: "2 available", ja: "2件利用可能" },
    accent: "#0868D7",
  },
  {
    slug: "content-image",
    number: "03",
    titles: { ko: "콘텐츠 이미지 제작", en: "Content Image", ja: "コンテンツ画像" },
    descriptions: {
      ko: "썸네일, 배너, SNS, 스토어용 이미지",
      en: "Thumbnails, banners, social posts, and store visuals.",
      ja: "サムネイル、バナー、SNS、ストア画像。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
  {
    slug: "pdf",
    number: "04",
    titles: { ko: "PDF 도구", en: "PDF Tools", ja: "PDFツール" },
    descriptions: {
      ko: "이미지·PDF 변환, 병합, 분할, 정리",
      en: "Image/PDF conversion, merge, split, and page cleanup.",
      ja: "画像・PDF変換、結合、分割、ページ整理。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
  {
    slug: "text",
    number: "05",
    titles: { ko: "텍스트 도구", en: "Text Tools", ja: "テキストツール" },
    descriptions: {
      ko: "문자 수, 정리, 비교, 변환, 분석",
      en: "Counts, cleanup, compare, convert, and analyze text.",
      ja: "文字数、整形、比較、変換、分析。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
  {
    slug: "date-time",
    number: "06",
    titles: { ko: "날짜·시간 도구", en: "Date & Time", ja: "日付・時間" },
    descriptions: {
      ko: "날짜 차이, 디데이, 시간 계산, 세계시간",
      en: "Date gaps, countdowns, time math, and world time.",
      ja: "日付差、D-day、時間計算、世界時間。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
  {
    slug: "unit-calc",
    number: "07",
    titles: { ko: "단위·일반 계산기", en: "Unit & Calculator", ja: "単位・計算機" },
    descriptions: {
      ko: "길이, 무게, 온도, 퍼센트, 비율, 통계",
      en: "Length, weight, temperature, percent, ratios, and stats.",
      ja: "長さ、重さ、温度、割合、比率、統計。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
  {
    slug: "business-finance",
    number: "08",
    titles: { ko: "사업·금융 계산기", en: "Business & Finance", ja: "事業・金融" },
    descriptions: {
      ko: "부가세, 마진, 손익, 급여, 투자, 대출",
      en: "VAT, margin, break-even, payroll, investing, and loans.",
      ja: "VAT、利益率、損益、給与、投資、融資。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
  {
    slug: "real-estate-build",
    number: "09",
    titles: { ko: "부동산·건축 계산기", en: "Real Estate & Build", ja: "不動産・建築" },
    descriptions: {
      ko: "평수, 자재, 면적, 수량, 냉난방",
      en: "Area, materials, quantities, and heating/cooling.",
      ja: "面積、資材、数量、空調計算。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
  {
    slug: "qr-design-dev-seo",
    number: "10",
    titles: { ko: "QR·디자인·개발·SEO", en: "QR · Design · Dev · SEO", ja: "QR・デザイン・開発・SEO" },
    descriptions: {
      ko: "QR, 색상, JSON, 코드, 인코딩, 메타태그",
      en: "QR, colors, JSON, code, encoding, and metadata.",
      ja: "QR、色、JSON、コード、エンコード、メタタグ。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
  {
    slug: "document-life-health-random",
    number: "11",
    titles: { ko: "문서·생활·건강·랜덤", en: "Document · Life · Health · Random", ja: "文書・生活・健康・ランダム" },
    descriptions: {
      ko: "문서 생성, 생활 계산, 건강 참고, 랜덤",
      en: "Docs, daily tools, health references, and randomizers.",
      ja: "書類、生活計算、健康参考、ランダム。",
    },
    toolCountLabel: { ko: "제작 예정", en: "Planned", ja: "制作予定" },
    accent: "#0868D7",
  },
];

export const tool001Slug = "jpg-png-webp-image-converter" as const;


export const tool002Slug = "heic-avif-image-converter" as const;

export const tool003Slug = "svg-bmp-tiff-image-converter" as const;

export const tool004Slug = "image-compressor" as const;

export const tool005Slug = "target-size-image-compressor" as const;

export const tool006Slug = "image-resizer" as const;

export const tool007Slug = "web-image-optimizer" as const;

export const tool008Slug = "image-cropper-rotator" as const;

export const tool009Slug = "image-brightness-color-adjuster" as const;

export const tool010Slug = "image-mosaic-blur-tool" as const;

export const tool011Slug = "image-padding-background-tool" as const;

export const tool012Slug = "image-border-rounded-corners-tool" as const;

export const tool013Slug = "image-merger" as const;

export const tool009Titles: Record<Locale, string> = { ko: "이미지 밝기·색상 보정기", en: "Image Brightness & Color Adjuster", ja: "画像の明るさ・色補正ツール" };
export const tool009Descriptions: Record<Locale, string> = { ko: "사진의 밝기와 색감을 브라우저에서 빠르게 보정하세요.", en: "Quickly adjust image brightness and colors in your browser.", ja: "画像の明るさや色味をブラウザで簡単に補正できます。" };
export const tool010Titles: Record<Locale, string> = { ko: "이미지 모자이크·블러 도구", en: "Image Mosaic & Blur Tool", ja: "画像モザイク・ぼかしツール" };
export const tool010Descriptions: Record<Locale, string> = { ko: "사진 속 얼굴과 개인정보를 모자이크·블러·단색 가림으로 가리세요.", en: "Hide faces and private information with mosaic, blur, or solid redaction.", ja: "画像内の顔や個人情報をモザイク・ぼかし・塗りつぶしで隠せます。" };
export const tool011Titles: Record<Locale, string> = { ko: "이미지 여백·배경 추가기", en: "Image Padding & Background Tool", ja: "画像余白・背景追加ツール" };
export const tool011Descriptions: Record<Locale, string> = { ko: "이미지를 자르지 않고 여백과 배경을 추가해 원하는 비율로 맞추세요.", en: "Add padding and backgrounds without cropping your image.", ja: "画像を切り取らずに余白や背景を追加し、希望の比率に合わせられます。" };
export const tool012Titles: Record<Locale, string> = { ko: "이미지 테두리·둥근 모서리 도구", en: "Image Border & Rounded Corners Tool", ja: "画像枠線・角丸ツール" };
export const tool012Descriptions: Record<Locale, string> = { ko: "이미지에 테두리, 둥근 모서리, 원형 효과와 그림자를 추가하세요.", en: "Add borders, rounded corners, circular shapes, and shadows to images.", ja: "画像に枠線、角丸、円形効果、影を追加できます。" };
export const tool013Titles: Record<Locale, string> = { ko: "이미지 합치기", en: "Image Merger", ja: "画像結合ツール" };
export const tool013Descriptions: Record<Locale, string> = { ko: "여러 이미지를 원하는 순서대로 세로 또는 가로로 합쳐 한 장으로 만드세요.", en: "Combine multiple images vertically or horizontally in any order.", ja: "複数の画像を好きな順番で縦または横に結合できます。" };

export const tool008Titles: Record<Locale, string> = { ko: "이미지 자르기·회전기", en: "Image Cropper & Rotator", ja: "画像切り抜き・回転ツール" };
export const tool008Descriptions: Record<Locale, string> = { ko: "이미지에서 필요한 영역을 자르고 회전·반전해 원하는 구도로 저장합니다.", en: "Crop the area you need, rotate or flip the image, and save it with your preferred composition.", ja: "画像の必要な範囲を切り抜き、回転・反転して希望する構図で保存します。" };

export const tool007Titles: Record<Locale, string> = { ko: "웹 이미지 최적화기", en: "Web Image Optimizer", ja: "Web画像最適化ツール" };
export const tool007Descriptions: Record<Locale, string> = { ko: "웹사이트와 블로그에 사용할 이미지를 적절한 형식·크기·품질로 한 번에 최적화합니다.", en: "Optimize images for websites and blogs with the right format, dimensions and quality in one batch.", ja: "Webサイトやブログ用の画像を、適切な形式・サイズ・画質にまとめて最適化します。" };

export const tool006Titles: Record<Locale, string> = {
  ko: "이미지 크기 변경기",
  en: "Image Resizer",
  ja: "画像サイズ変更ツール",
};

export const tool006Descriptions: Record<Locale, string> = {
  ko: "JPG, PNG, WebP 이미지의 가로·세로 픽셀을 원하는 크기로 한 번에 변경합니다.",
  en: "Resize JPG, PNG and WebP images to your chosen pixel dimensions in batches.",
  ja: "JPG・PNG・WebP画像の縦横ピクセルを希望するサイズにまとめて変更します。",
};



export const tool005Titles: Record<Locale, string> = {
  ko: "목표 용량 이미지 압축기",
  en: "Target Size Image Compressor",
  ja: "目標容量画像圧縮ツール",
};

export const tool005Descriptions: Record<Locale, string> = {
  ko: "JPG, PNG, WebP 이미지를 원하는 KB·MB 이하로 가능한 한 높은 화질로 압축합니다.",
  en: "Compress JPG, PNG and WebP images below a chosen KB or MB limit with the highest possible quality.",
  ja: "JPG・PNG・WebP画像を指定したKB・MB以下に、できるだけ高い画質で圧縮します。",
};

export const tool004Titles: Record<Locale, string> = {
  ko: "이미지 압축기",
  en: "Image Compressor",
  ja: "画像圧縮ツール",
};

export const tool004Descriptions: Record<Locale, string> = {
  ko: "JPG, PNG, WebP 이미지의 크기와 형식은 유지하면서 파일 용량을 한 번에 줄입니다.",
  en: "Reduce JPG, PNG and WebP file sizes in batches while keeping their original dimensions and formats.",
  ja: "JPG・PNG・WebP画像のサイズと形式を維持したまま、ファイル容量をまとめて削減します。",
};

export const tool003Titles: Record<Locale, string> = {
  ko: "SVG·BMP·TIFF 이미지 변환기",
  en: "SVG, BMP & TIFF Image Converter",
  ja: "SVG・BMP・TIFF画像変換ツール",
};

export const tool003Descriptions: Record<Locale, string> = {
  ko: "SVG, BMP, TIFF 이미지를 JPG 또는 PNG로 빠르게 변환합니다.",
  en: "Convert SVG, BMP and TIFF images to JPG or PNG quickly.",
  ja: "SVG・BMP・TIFF画像をJPGまたはPNGへすばやく変換します。",
};

export const tool002Titles: Record<Locale, string> = {
  ko: "HEIC·AVIF 이미지 변환기",
  en: "HEIC & AVIF Image Converter",
  ja: "HEIC・AVIF画像変換ツール",
};

export const tool002Descriptions: Record<Locale, string> = {
  ko: "HEIC·AVIF 이미지를 JPG·PNG로 변환하거나 JPG·PNG 이미지를 AVIF로 한 번에 변환합니다.",
  en: "Convert HEIC and AVIF images to JPG or PNG, or convert JPG and PNG images to AVIF in batches.",
  ja: "HEIC・AVIF画像をJPG・PNGに変換したり、JPG・PNG画像をAVIFにまとめて変換できます。",
};

export const tool001Titles: Record<Locale, string> = {
  ko: "JPG·PNG·WebP 이미지 변환기",
  en: "JPG, PNG & WebP Image Converter",
  ja: "JPG・PNG・WebP画像変換ツール",
};

export const tool001Descriptions: Record<Locale, string> = {
  ko: "JPG, PNG, WebP 이미지를 원하는 형식으로 한 번에 변환합니다.",
  en: "Convert JPG, PNG and WebP images to your preferred format in one batch.",
  ja: "JPG・PNG・WebP画像を希望する形式にまとめて変換できます。",
};

export const tool001LocalNotes: Record<Locale, string> = {
  ko: "파일은 서버로 전송되지 않고 브라우저에서 처리됩니다.",
  en: "Your files are processed in your browser and are not uploaded to a server.",
  ja: "ファイルはサーバーに送信されず、ブラウザ内で処理されます。",
};

export const homeHero: Record<Locale, { title: string; lead: string }> = {
  ko: {
    title: "검색으로 바로 쓰는 TOOLBOX",
    lead: "도구를 바로 열고, 바로 쓰는 화면.",
  },
  en: {
    title: "TOOLBOX built for search visitors",
    lead: "Open the tool and get to work immediately.",
  },
  ja: {
    title: "検索からすぐ使える TOOLBOX",
    lead: "ツールをすぐ開いて、そのまま使える画面。",
  },
};

export const homeApprovalPanel: Record<Locale, { eyebrow: string; title: string; items: string[] }> = {
  ko: {
    eyebrow: "승인 대비 구조",
    title: "도구가 먼저 보이고, 설명은 짧게 남깁니다.",
    items: ["가입 없이 바로 사용", "브라우저 내부 처리 우선", "사용 방법 · FAQ · 정책 연결"],
  },
  en: {
    eyebrow: "approval-ready structure",
    title: "Tools first, short supporting copy second.",
    items: ["Start without sign-up", "Browser-first processing", "Guides, FAQ, and policy links"],
  },
  ja: {
    eyebrow: "審査を意識した構成",
    title: "ツールを先に見せ、説明は短く置きます。",
    items: ["登録なしですぐ使える", "ブラウザ内で処理", "使い方・FAQ・ポリシーへ接続"],
  },
};

export const homeActions: Record<Locale, { primary: string; secondary: string }> = {
  ko: { primary: "첫 카테고리 보기", secondary: "카테고리 보기" },
  en: { primary: "Open first category", secondary: "Browse categories" },
  ja: { primary: "最初のカテゴリへ", secondary: "カテゴリを見る" },
};

export const homeSections: Record<Locale, { title: string; subtitle: string }> = {
  ko: {
    title: "11개 카테고리",
    subtitle: "카테고리 카드는 3열 PC / 2열 모바일 기준으로 정리합니다.",
  },
  en: {
    title: "11 categories",
    subtitle: "Category cards are organized in 3 columns on desktop and 2 on mobile.",
  },
  ja: {
    title: "11カテゴリ",
    subtitle: "カテゴリカードはPC 3列 / モバイル2列を基本に配置します。",
  },
};

export const toolHighlights: Record<Locale, string[]> = {
  ko: [
    "JPG, JPEG, PNG, WebP 입력",
    "여러 파일 일괄 변환",
    "전체 출력 형식 선택",
    "파일별 출력 형식 변경",
    "JPG 배경색",
    "개별 다운로드 + ZIP",
  ],
  en: [
    "JPG, JPEG, PNG, WebP input",
    "Batch conversion for multiple files",
    "One output format for all",
    "Per-file output overrides",
    "JPG background color",
    "Individual download + ZIP",
  ],
  ja: [
    "JPG、JPEG、PNG、WebP入力",
    "複数ファイルの一括変換",
    "全体の出力形式選択",
    "ファイルごとの形式変更",
    "JPG背景色",
    "個別保存 + ZIP",
  ],
};

export const toolProcessSteps: Record<Locale, string[]> = {
  ko: ["이미지 선택", "출력 형식 선택", "변환하기", "개별 다운로드 또는 ZIP 저장"],
  en: ["Choose images", "Pick an output format", "Convert", "Download individually or as ZIP"],
  ja: ["画像を選ぶ", "出力形式を選ぶ", "変換する", "個別保存またはZIP保存"],
};

export const toolFaq: Record<Locale, { q: string; a: string }[]> = {
  ko: [
    {
      q: "파일이 서버로 업로드되나요?",
      a: "아니요. 파일은 브라우저 내부에서 처리되며 FIXLGS 서버로 전송되지 않습니다.",
    },
    {
      q: "투명 배경은 JPG에서도 유지되나요?",
      a: "아니요. JPG는 투명 배경을 지원하지 않아서 선택한 배경색으로 채워집니다.",
    },
    {
      q: "여러 파일을 한 번에 바꿀 수 있나요?",
      a: "네. 여러 이미지를 선택해서 같은 형식으로 일괄 변환하거나 파일별로 개별 형식을 지정할 수 있습니다.",
    },
  ],
  en: [
    {
      q: "Are my files uploaded to a server?",
      a: "No. Everything runs in your browser and is not sent to the FIXLGS server.",
    },
    {
      q: "Does JPG keep transparency?",
      a: "No. JPG does not support transparency, so transparent areas are filled with the selected background color.",
    },
    {
      q: "Can I convert multiple files at once?",
      a: "Yes. You can batch convert several images or set a different format per file.",
    },
  ],
  ja: [
    {
      q: "ファイルはサーバーに送信されますか？",
      a: "いいえ。処理はブラウザ内で行われ、FIXLGSサーバーには送信されません。",
    },
    {
      q: "JPGでも透明背景は維持されますか？",
      a: "いいえ。JPGは透明背景に対応していないため、選択した背景色で塗りつぶします。",
    },
    {
      q: "複数ファイルを一度に変換できますか？",
      a: "はい。複数画像をまとめて変換したり、ファイルごとに形式を変更したりできます。",
    },
  ],
};

type ToolCardData = {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  href?: string;
  status?: string;
  active?: boolean;
};

const categoryToolPresets: Record<string, ToolCardData[]> = {
  "image-convert": [
    {
      title: tool001Titles,
      description: tool001Descriptions,
      href: `/${"ko"}/${tool001Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: {
        ko: "HEIC·AVIF 이미지 변환기",
        en: "HEIC & AVIF Converter",
        ja: "HEIC・AVIF画像変換ツール",
      },
      description: {
        ko: "",
        en: "",
        ja: "",
      },
      href: `/${"ko"}/${tool002Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: {
        ko: "SVG·BMP·TIFF 이미지 변환기",
        en: "SVG, BMP & TIFF Converter",
        ja: "SVG・BMP・TIFF画像変換ツール",
      },
      description: {
        ko: "",
        en: "",
        ja: "",
      },
      href: `/${"ko"}/${tool003Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: {
        ko: "이미지 압축기",
        en: "Image Compressor",
        ja: "画像圧縮ツール",
      },
      description: {
        ko: "",
        en: "",
        ja: "",
      },
      href: `/${"ko"}/${tool004Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: {
        ko: "목표 용량 이미지 압축기",
        en: "Target Size Compressor",
        ja: "目標容量圧縮ツール",
      },
      description: {
        ko: "",
        en: "",
        ja: "",
      },
      href: `/${"ko"}/${tool005Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: {
        ko: "이미지 크기 변경기",
        en: "Image Resizer",
        ja: "画像サイズ変更ツール",
      },
      description: {
        ko: "",
        en: "",
        ja: "",
      },
      href: `/${"ko"}/${tool006Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: {
        ko: "웹 이미지 최적화기",
        en: "Web Image Optimizer",
        ja: "Web画像最適化ツール",
      },
      description: {
        ko: "",
        en: "",
        ja: "",
      },
      href: `/${"ko"}/${tool007Slug}`,
      status: "LIVE",
      active: true,
    },
  ],
  "image-edit": [
    {
      title: tool008Titles,
      description: tool008Descriptions,
      href: `/${"ko"}/${tool008Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool009Titles,
      description: tool009Descriptions,
      href: `/${"ko"}/${tool009Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool010Titles,
      description: tool010Descriptions,
      href: `/${"ko"}/${tool010Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool011Titles,
      description: tool011Descriptions,
      href: `/${"ko"}/${tool011Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool012Titles,
      description: tool012Descriptions,
      href: `/${"ko"}/${tool012Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool013Titles,
      description: tool013Descriptions,
      href: `/${"ko"}/${tool013Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: { ko: "이미지 콜라주 만들기", en: "Image Collage Maker", ja: "画像コラージュ作成ツール" },
      description: { ko: "분할·격자형 콜라주와 여백·배경 설정", en: "Build split and grid collages with spacing and backgrounds.", ja: "分割・グリッド型コラージュと余白・背景設定。" },
      status: "NEXT",
      active: false,
    },
    {
      title: { ko: "전후 비교 이미지 만들기", en: "Before & After Image Maker", ja: "ビフォー・アフター画像作成ツール" },
      description: { ko: "좌우·상하 비교, 문구와 중앙 구분선 추가", en: "Create side-by-side or top-bottom before-and-after images.", ja: "左右・上下比較、文言、中央区切り線を追加。" },
      status: "NEXT",
      active: false,
    },
    {
      title: { ko: "이미지에 글자 넣기", en: "Add Text to Image", ja: "画像文字入れツール" },
      description: { ko: "제목·본문·날짜·위치 문구를 자유롭게 배치", en: "Place titles, body text, dates, and location labels.", ja: "タイトル、本文、日付、場所の文字を配置。" },
      status: "NEXT",
      active: false,
    },
    {
      title: { ko: "이미지 워터마크 넣기", en: "Image Watermark Tool", ja: "画像ウォーターマークツール" },
      description: { ko: "텍스트·로고·반복 워터마크와 투명도 설정", en: "Add text, logo, or repeated watermarks with opacity controls.", ja: "文字・ロゴ・繰り返し透かしと透明度設定。" },
      status: "NEXT",
      active: false,
    },
    {
      title: { ko: "이미지 정보·메타데이터 검사기", en: "Image Info & Metadata Inspector", ja: "画像情報・メタデータ検査ツール" },
      description: { ko: "픽셀·DPI·EXIF·GPS 확인과 메타데이터 제거", en: "Inspect pixels, DPI, EXIF, GPS, and remove metadata.", ja: "ピクセル・DPI・EXIF・GPS確認とメタデータ削除。" },
      status: "NEXT",
      active: false,
    },
  ],
};

function makePlannedTools(category: Category): ToolCardData[] {
  return [1, 2, 3].map((index) => ({
    title: {
      ko: `${category.titles.ko} 도구 ${index}`,
      en: `${category.titles.en} Tool ${index}`,
      ja: `${category.titles.ja} ツール${index}`,
    },
    description: {
      ko: `${category.titles.ko}의 다음 도구를 순서대로 추가합니다.`,
      en: `More tools for ${category.titles.en} will be added step by step.`,
      ja: `${category.titles.ja} の実際のツールは順番に追加します。`,
    },
    status: "NEXT",
    active: false,
  }));
}

export function getCategoryToolCards(categorySlug: string, locale: Locale): ToolCardData[] {
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return [];

  const preset = categoryToolPresets[categorySlug];
  const cards = (preset ?? makePlannedTools(category)).map((item) => ({
    title: item.title,
    description: item.description,
    href: item.href,
    status: item.status,
    active: item.active,
  }));

  if (categorySlug === "image-convert") {
    return cards.map((item, index) => index === 0 ? { ...item, href: `/${locale}/${tool001Slug}` } : index === 1 ? { ...item, href: `/${locale}/${tool002Slug}` } : index === 2 ? { ...item, href: `/${locale}/${tool003Slug}` } : index === 3 ? { ...item, href: `/${locale}/${tool004Slug}` } : index === 4 ? { ...item, href: `/${locale}/${tool005Slug}` } : index === 5 ? { ...item, href: `/${locale}/${tool006Slug}` } : index === 6 ? { ...item, href: `/${locale}/${tool007Slug}` } : item);
  }

  if (categorySlug === "image-edit") {
    return cards.map((item, index) => index === 0 ? { ...item, href: `/${locale}/${tool008Slug}` } : index === 1 ? { ...item, href: `/${locale}/${tool009Slug}` } : index === 2 ? { ...item, href: `/${locale}/${tool010Slug}` } : index === 3 ? { ...item, href: `/${locale}/${tool011Slug}` } : index === 4 ? { ...item, href: `/${locale}/${tool012Slug}` } : index === 5 ? { ...item, href: `/${locale}/${tool013Slug}` } : item);
  }

  return cards;
}
