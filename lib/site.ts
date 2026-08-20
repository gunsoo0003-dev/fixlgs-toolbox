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
    toolCountLabel: { ko: "6개 사용 가능", en: "6 available", ja: "6件利用可能" },
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
    toolCountLabel: { ko: "1개 사용 가능", en: "1 available", ja: "1件利用可能" },
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
    toolCountLabel: { ko: "2개 사용 가능", en: "2 available", ja: "2件利用可能" },
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
    toolCountLabel: { ko: "1개 사용 가능", en: "1 available", ja: "1件利用可能" },
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
    toolCountLabel: { ko: "1개 사용 가능", en: "1 available", ja: "1件利用可能" },
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

export const tool014Slug = "image-collage-maker" as const;

export const tool015Slug = "before-after-image-maker" as const;

export const tool016Slug = "add-text-to-image" as const;

export const tool017Slug = "image-watermark-tool" as const;

export const tool018Slug = "image-metadata-checker" as const;

export const tool019Slug = "youtube-thumbnail-maker" as const;

export const tool020Slug = "youtube-channel-banner-maker" as const;

export const tool021Slug = "social-media-image-maker" as const;

export const tool022Slug = "blog-open-graph-image-maker" as const;

export const tool023Slug = "app-icon-favicon-generator" as const;

export const tool024Slug = "app-store-screenshot-maker" as const;

export const tool025Slug = "id-passport-photo-maker" as const;

export const tool026Slug = "image-to-pdf" as const;

export const tool027Slug = "pdf-to-image-converter" as const;

export const tool028Slug = "merge-pdf" as const;

export const tool029Slug = "split-extract-pdf" as const;

export const tool030Slug = "pdf-page-organizer" as const;

export const tool031Slug = "pdf-page-number-watermark" as const;

export const tool032Slug = "pdf-signature" as const;

export const tool033Slug = "pdf-compressor" as const;

export const tool034Slug = "pdf-password-metadata" as const;

export const tool035Slug = "pdf-text-image-extractor" as const;

export const tool036Slug = "character-document-counter" as const;

export const tool037Slug = "text-whitespace-linebreak-cleaner" as const;

export const tool038Slug = "case-sentence-format-converter" as const;

export const tool039Slug = "list-sorter-duplicate-remover" as const;

export const tool040Slug = "delimiter-list-converter" as const;

export const tool041Slug = "text-extractor" as const;

export const tool042Slug = "text-find-replace" as const;
export const tool043Slug = "text-diff-compare" as const;
export const tool044Slug = "keyword-frequency-duplicate-analyzer" as const;
export const tool045Slug = "date-difference-calculator" as const;
export const tool046Slug = "date-add-subtract-calculator" as const;
export const tool047Slug = "dday-anniversary-calculator" as const;
export const tool048Slug = "age-life-calculator" as const;
export const tool049Slug = "employment-tenure-calculator" as const;
export const tool050Slug = "business-day-calculator" as const;
export const tool051Slug = "time-calculator" as const;
export const tool052Slug = "world-time-timezone-converter" as const;
export const tool053Slug = "unix-timestamp-converter" as const;
export const tool054Slug = "timer-stopwatch" as const;
export const tool055Slug = "length-area-volume-converter" as const;
export const tool056Slug = "weight-temperature-pressure-converter" as const;
export const tool057Slug = "speed-fuel-energy-converter" as const;
export const tool058Slug = "data-cooking-unit-converter" as const;
export const tool059Slug = "pixel-print-size-converter" as const;
export const tool060Slug = "shoe-clothing-size-converter" as const;
export const tool061Slug = "percentage-percent-change-calculator" as const;
export const tool062Slug = "discount-price-calculator" as const;
export const tool063Slug = "ratio-proportion-calculator" as const;
export const tool064Slug = "statistics-calculator" as const;
export const tool065Slug = "fraction-decimal-calculator" as const;

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
export const tool014Titles: Record<Locale, string> = { ko: "이미지 콜라주 만들기", en: "Image Collage Maker", ja: "画像コラージュ作成ツール" };
export const tool014Descriptions: Record<Locale, string> = { ko: "여러 사진을 2·3·4분할과 격자 레이아웃으로 배치해 한 장의 콜라주로 만드세요.", en: "Arrange photos in split and grid layouts to create one collage image.", ja: "複数の写真を分割・グリッドレイアウトに配置し、1枚のコラージュ画像を作成します。" };
export const tool015Titles: Record<Locale, string> = { ko: "전후 비교 이미지 만들기", en: "Before & After Image Maker", ja: "ビフォー・アフター比較画像作成" };
export const tool015Descriptions: Record<Locale, string> = { ko: "두 장의 이미지를 좌우 또는 상하로 비교하고 라벨과 중앙 구분선을 넣어 한 장으로 저장하세요.", en: "Create a side-by-side or top-bottom before-and-after image with labels and a center divider.", ja: "2枚の画像を左右または上下に比較配置し、ラベルと中央の区切り線を加えて1枚に保存できます。" };
export const tool016Titles: Record<Locale, string> = { ko: "이미지에 글자 넣기", en: "Add Text to Image", ja: "画像文字入れツール" };
export const tool016Descriptions: Record<Locale, string> = { ko: "사진에 제목·본문·날짜·위치와 자유 문구를 넣고 스타일과 위치를 조절해 저장하세요.", en: "Add titles, body text, dates, locations, and custom text to photos, then adjust style and position before saving.", ja: "写真にタイトル・本文・日付・場所・自由な文字を追加し、スタイルと位置を調整して保存できます。" };
export const tool017Titles: Record<Locale, string> = { ko: "이미지 워터마크 넣기", en: "Add Watermark to Images", ja: "画像ウォーターマーク追加ツール" };
export const tool017Descriptions: Record<Locale, string> = { ko: "텍스트나 로고 워터마크를 사진에 넣고 여러 이미지에 한 번에 적용하세요.", en: "Add text or logo watermarks and apply the same watermark to multiple images at once.", ja: "テキストやロゴのウォーターマークを画像に追加し、複数画像へ同じ設定を一括適用できます。" };
export const tool018Titles: Record<Locale, string> = { ko: "이미지 정보·메타데이터 검사기", en: "Image Info & Metadata Checker", ja: "画像情報・メタデータチェッカー" };
export const tool018Descriptions: Record<Locale, string> = { ko: "이미지의 해상도, DPI, 촬영 정보, GPS·EXIF 메타데이터를 확인하고 필요하면 제거하세요.", en: "Check image resolution, DPI, camera details, GPS and EXIF metadata, and remove metadata when needed.", ja: "画像の解像度、DPI、撮影情報、GPS・EXIFメタデータを確認し、必要に応じて削除できます。" };
export const tool019Titles: Record<Locale, string> = { ko: "유튜브 썸네일 제작기", en: "YouTube Thumbnail Maker", ja: "YouTubeサムネイル作成ツール" };
export const tool019Descriptions: Record<Locale, string> = { ko: "1280×720 유튜브 썸네일을 만들고 제목·부제·외곽선·그림자·안전영역을 조절하세요.", en: "Create 1280×720 YouTube thumbnails with titles, subtitles, outlines, shadows, and safe-area guides.", ja: "1280×720のYouTubeサムネイルを作成し、タイトル・サブタイトル・縁取り・影・セーフエリアを調整できます。" };
export const tool020Titles: Record<Locale, string> = { ko: "유튜브 채널 배너 제작기", en: "YouTube Channel Banner Maker", ja: "YouTubeチャンネルバナー作成ツール" };
export const tool020Descriptions: Record<Locale, string> = { ko: "PC·모바일·TV 가시영역과 안전영역을 확인하며 2560×1440 유튜브 채널 배너를 만드세요.", en: "Create 2560×1440 YouTube channel banners while checking TV, desktop, mobile and safe-area previews.", ja: "TV・PC・モバイルの表示範囲とセーフエリアを確認しながら2560×1440のYouTubeチャンネルバナーを作成できます。" };
export const tool021Titles: Record<Locale, string> = { ko: "SNS 이미지 제작기", en: "Social Media Image Maker", ja: "SNS 画像作成ツール" };
export const tool021Descriptions: Record<Locale, string> = { ko: "한 번 만든 디자인을 Instagram·Facebook·X·LinkedIn 규격에 맞춰 여러 SNS 이미지로 출력하세요.", en: "Create one design and export it for Instagram, Facebook, X, and LinkedIn sizes.", ja: "1つのデザインをInstagram・Facebook・X・LinkedInの各サイズに合わせて出力できます。" };
export const tool022Titles: Record<Locale, string> = { ko: "블로그·오픈그래프 이미지 제작기", en: "Blog & Open Graph Image Maker", ja: "ブログ・OG画像作成ツール" };
export const tool022Descriptions: Record<Locale, string> = { ko: "네이버 블로그·Google 블로그·웹사이트·Open Graph용 대표 이미지를 한 번에 만들고 JPG·PNG 또는 ZIP으로 저장하세요.", en: "Create featured images for Naver Blog, Google/Blogger, websites and Open Graph, then export JPG, PNG or ZIP.", ja: "NAVERブログ・Googleブログ・Webサイト・Open Graph用の代表画像を作成し、JPG・PNG・ZIPで保存できます。" };
export const tool023Titles: Record<Locale, string> = { ko: "앱 아이콘·파비콘 생성기", en: "App Icon & Favicon Generator", ja: "アプリアイコン・ファビコン生成ツール" };
export const tool023Descriptions: Record<Locale, string> = { ko: "하나의 이미지로 Android·PWA 앱 아이콘과 favicon.ico를 만들고 개별 파일 또는 ZIP으로 저장하세요.", en: "Create Android and PWA app icons plus favicon.ico from one image, then download individual files or ZIP bundles.", ja: "1枚の画像からAndroid・PWAアプリアイコンとfavicon.icoを生成し、個別ファイルまたはZIPで保存できます。" };
export const tool024Titles: Record<Locale, string> = { ko: "앱스토어 스크린샷 제작기", en: "App Store Screenshot Maker", ja: "アプリストア スクリーンショット作成ツール" };
export const tool024Descriptions: Record<Locale, string> = { ko: "실제 앱 화면 여러 장을 App Store·Google Play 등록용 홍보 스크린샷 세트로 제작하세요.", en: "Turn multiple real app screens into promotional screenshot sets for App Store and Google Play.", ja: "実際のアプリ画面を複数追加し、App Store・Google Play登録用のプロモーション画像セットを作成できます。" };
export const tool025Titles: Record<Locale, string> = { ko: "증명사진·여권사진 제작기", en: "ID & Passport Photo Maker", ja: "証明写真・パスポート写真作成ツール" };
export const tool025Descriptions: Record<Locale, string> = { ko: "국가별 규격과 얼굴 위치를 확인해 증명·여권·취업사진과 A4 인쇄 배치를 만드세요.", en: "Create ID, passport and employment photos with country presets, face guides and A4 print layouts.", ja: "国別規格と顔位置を確認し、証明・パスポート・就職写真とA4印刷配置を作成します。" };
export const tool026Titles: Record<Locale, string> = { ko: "이미지 PDF 변환기", en: "Image to PDF Converter", ja: "画像 PDF 変換ツール" };
export const tool026Descriptions: Record<Locale, string> = { ko: "JPG·PNG 이미지를 원하는 순서로 정리해 A4·Letter PDF로 만들고 브라우저에서 바로 저장하세요.", en: "Arrange JPG and PNG images, choose A4 or Letter, and create one PDF directly in your browser.", ja: "JPG・PNG画像を好きな順番に並べ、A4・Letter PDFをブラウザ内で作成・保存できます。" };
export const tool027Titles: Record<Locale, string> = { ko: "PDF 이미지 변환기", en: "PDF to Image Converter", ja: "PDF 画像変換ツール" };
export const tool027Descriptions: Record<Locale, string> = { ko: "PDF 페이지를 선택해 JPG·PNG 이미지로 변환하고 해상도를 조절해 개별 파일 또는 ZIP으로 저장하세요.", en: "Convert selected PDF pages to JPG or PNG, choose the render resolution, and download individual images or a ZIP.", ja: "PDFのページを選択してJPG・PNG画像へ変換し、解像度を調整して個別ファイルまたはZIPで保存できます。" };
export const tool028Titles: Record<Locale, string> = { ko: "PDF 합치기", en: "Merge PDF", ja: "PDF 結合ツール" };
export const tool028Descriptions: Record<Locale, string> = { ko: "여러 PDF를 원하는 파일 순서대로 정리하고 페이지를 확인한 뒤 하나의 PDF로 병합하세요.", en: "Arrange multiple PDFs in the order you want, preview their pages, and merge them into one PDF.", ja: "複数のPDFを希望する順番に並べ、ページを確認して1つのPDFに結合できます。" };
export const tool029Titles: Record<Locale, string> = { ko: "PDF 분할·페이지 추출기", en: "Split & Extract PDF", ja: "PDF 分割・ページ抽出ツール" };
export const tool029Descriptions: Record<Locale, string> = { ko: "PDF를 페이지 범위로 나누거나 필요한 페이지만 선택해 새 PDF 또는 개별 PDF로 저장하세요.", en: "Split a PDF by page ranges or extract selected pages into a new PDF or individual PDFs.", ja: "PDFをページ範囲で分割したり、必要なページだけを新しいPDFまたは個別PDFとして保存できます。" };
export const tool030Titles: Record<Locale, string> = { ko: "PDF 페이지 정리 도구", en: "PDF Page Organizer", ja: "PDF ページ整理ツール" };
export const tool030Descriptions: Record<Locale, string> = { ko: "PDF 페이지를 삭제·순서 변경·복제·회전하고 역순 정렬이나 빈 페이지 추가 후 새 PDF로 저장하세요.", en: "Delete, reorder, duplicate and rotate PDF pages, reverse the order or add blank pages, then save a new PDF.", ja: "PDFページを削除・並べ替え・複製・回転し、逆順や空白ページ追加を行って新しいPDFとして保存できます。" };
export const tool031Titles: Record<Locale, string> = { ko: "PDF 페이지 번호·워터마크 도구", en: "PDF Page Number & Watermark Tool", ja: "PDF ページ番号・透かしツール" };
export const tool031Descriptions: Record<Locale, string> = { ko: "PDF에 페이지 번호, 시작 번호, 머리말·꼬리말, 텍스트·로고 워터마크를 원하는 위치와 범위에 추가하세요.", en: "Add page numbers, starting numbers, headers, footers, and text or logo watermarks to selected PDF pages.", ja: "PDFにページ番号、開始番号、ヘッダー・フッター、テキスト・ロゴ透かしを指定した位置と範囲に追加できます。" };
export const tool032Titles: Record<Locale, string> = { ko: "PDF 서명 넣기", en: "Add Signature to PDF", ja: "PDF 署名追加ツール" };
export const tool032Descriptions: Record<Locale, string> = { ko: "서명을 직접 그리거나 이미지로 불러와 PDF의 원하는 위치와 여러 페이지에 적용하세요.", en: "Draw a signature or use a signature image, then place it on selected PDF pages.", ja: "署名を描くか画像を読み込み、PDFの指定位置と複数ページに適用できます。" };
export const tool033Titles: Record<Locale, string> = { ko: "PDF 압축기", en: "PDF Compressor", ja: "PDF 圧縮ツール" };
export const tool033Descriptions: Record<Locale, string> = { ko: "PDF를 브라우저에서 최고화질·균형·용량 우선·사용자 지정으로 압축하고 실제 전후 용량과 결과 미리보기를 확인하세요.", en: "Compress PDFs locally with quality presets or custom settings and compare actual before/after size with a result preview.", ja: "PDFをブラウザ内で画質プリセットまたはカスタム設定で圧縮し、実際の前後サイズと結果プレビューを確認できます。" };
export const tool034Titles: Record<Locale, string> = { ko: "PDF 비밀번호·메타데이터 도구", en: "PDF Password & Metadata Tool", ja: "PDF パスワード・メタデータツール" };
export const tool034Descriptions: Record<Locale, string> = { ko: "PDF 열기 비밀번호를 설정·제거하고 제목·작성자·주제·키워드 메타데이터를 확인·수정·제거하세요.", en: "Set or remove a PDF opening password and inspect, edit, or remove title, author, subject, and keyword metadata.", ja: "PDFの開封パスワードを設定・解除し、タイトル・作成者・件名・キーワードのメタデータを確認・編集・削除できます。" };
export const tool035Titles: Record<Locale, string> = { ko: "PDF 텍스트·이미지 추출기", en: "PDF Text & Image Extractor", ja: "PDFテキスト・画像抽出ツール" };
export const tool035Descriptions: Record<Locale, string> = { ko: "PDF의 텍스트 레이어와 실제 삽입 이미지를 페이지별로 추출해 TXT·개별 이미지·ZIP으로 저장하세요.", en: "Extract PDF text layers and embedded raster images by page, then save TXT, individual images, or ZIP files.", ja: "PDFのテキストレイヤーと埋め込みラスター画像をページ別に抽出し、TXT・個別画像・ZIPで保存できます。" };
export const tool036Titles: Record<Locale, string> = { ko: "글자 수·문서 통계 계산기", en: "Character & Document Statistics Counter", ja: "文字数・文書統計カウンター" };
export const tool036Descriptions: Record<Locale, string> = { ko: "공백 포함·제외 글자 수, 단어·문장·문단·줄 수, UTF-8 바이트와 예상 읽기시간을 브라우저에서 즉시 확인하세요.", en: "Count characters, words, sentences, paragraphs, lines, UTF-8 bytes, and estimated reading time instantly in your browser.", ja: "空白を含む・除く文字数、単語・文・段落・行数、UTF-8バイト、推定読了時間をブラウザですぐ確認できます。" };
export const tool037Titles: Record<Locale, string> = { ko: "텍스트 공백·줄바꿈 정리기", en: "Text Whitespace & Line Break Cleaner", ja: "テキスト空白・改行整理ツール" };
export const tool037Descriptions: Record<Locale, string> = { ko: "연속 공백, 각 줄 앞뒤 공백, 탭, 빈 줄과 LF·CRLF 줄바꿈 코드를 브라우저에서 선택한 규칙대로 정리하세요.", en: "Clean repeated spaces, line-edge whitespace, tabs, blank lines, and LF/CRLF line endings locally in your browser.", ja: "連続スペース、各行の前後空白、タブ、空行、LF・CRLFの改行コードをブラウザ内で整理できます。" };
export const tool038Titles: Record<Locale, string> = { ko: "대소문자·문장 형식 변환기", en: "Case & Sentence Format Converter", ja: "大文字・小文字・文形式変換ツール" };
export const tool038Descriptions: Record<Locale, string> = { ko: "대문자·소문자·제목형·문장형·첫 글자 대문자를 원문 구조를 유지한 채 브라우저에서 변환하세요.", en: "Convert text to uppercase, lowercase, title case, sentence case, or first-letter uppercase while preserving its structure.", ja: "大文字・小文字・単語先頭大文字・文頭大文字・最初の文字だけ大文字を元の構造を保って変換します。" };
export const tool039Titles: Record<Locale, string> = { ko: "목록 정렬·중복 제거기", en: "List Sorter & Duplicate Remover", ja: "一覧並べ替え・重複削除ツール" };
export const tool039Descriptions: Record<Locale, string> = { ko: "목록의 중복 줄을 제거하고 가나다·알파벳·숫자순, 역순, 무작위 섞기를 브라우저에서 바로 처리하세요.", en: "Remove duplicate lines, sort lists alphabetically or numerically, reverse order, and shuffle locally in your browser.", ja: "重複行を削除し、五十音・アルファベット・数値順、逆順、シャッフルをブラウザ内で処理します。" };
export const tool040Titles: Record<Locale, string> = { ko: "구분자·목록 변환기", en: "Delimiter & List Converter", ja: "区切り文字・リスト変換ツール" };
export const tool040Descriptions: Record<Locale, string> = { ko: "줄바꿈·쉼표·탭·사용자 구분자를 서로 바꾸고 따옴표와 번호·글머리표를 추가하세요.", en: "Convert new lines, commas, tabs, and custom delimiters, then add quotes, numbering, or bullets.", ja: "改行・カンマ・タブ・カスタム区切り文字を変換し、引用符や番号・箇条書きを追加できます。" };
export const tool041Titles: Record<Locale, string> = { ko: "텍스트 추출기", en: "Text Data Extractor", ja: "テキスト抽出ツール" };
export const tool041Descriptions: Record<Locale, string> = { ko: "숫자·한글·영어·이메일·URL·전화번호·해시태그를 긴 텍스트에서 유형별로 추출하세요.", en: "Extract numbers, Korean, English, emails, URLs, phone numbers, and hashtags from long text by type.", ja: "長い文章から数字・韓国語・英語・メール・URL・電話番号・ハッシュタグを種類別に抽出します。" };
export const tool042Titles: Record<Locale, string> = { ko: "텍스트 찾기·바꾸기", en: "Text Find & Replace", ja: "テキスト検索・置換" };
export const tool042Descriptions: Record<Locale, string> = { ko: "하나 또는 여러 검색어를 찾아 원본 기준으로 동시에 바꾸고 변경 횟수를 확인하세요.", en: "Find one or multiple terms, replace them simultaneously from the original text, and review replacement counts.", ja: "1つまたは複数の検索語を原文基準で同時に置換し、置換回数を確認できます。" };
export const tool043Titles: Record<Locale, string> = { ko: "두 텍스트 비교기", en: "Text Diff & Compare", ja: "2つのテキスト比較ツール" };
export const tool043Descriptions: Record<Locale, string> = { ko: "두 텍스트의 추가·삭제·변경을 줄 단위와 단어 단위로 비교하고 결과 보고서를 복사하세요.", en: "Compare two texts by line and word, classify additions, removals, and changes, and copy a diff report.", ja: "2つのテキストの追加・削除・変更を行単位・単語単位で比較し、差分レポートをコピーできます。" };
export const tool044Titles: Record<Locale, string> = { ko: "키워드 빈도·중복 분석기", en: "Keyword Frequency & Duplicate Analyzer", ja: "キーワード頻度・重複分析ツール" };
export const tool044Descriptions: Record<Locale, string> = { ko: "텍스트의 단어 빈도·키워드 밀도·상위 키워드와 반복·중복 문장을 브라우저에서 분석하세요.", en: "Analyze word frequency, keyword density, top keywords, and repeated or duplicate sentences locally in your browser.", ja: "文章の単語頻度・キーワード密度・上位キーワード・反復文と重複文をブラウザ内で分析します。" };
export const tool045Titles: Record<Locale, string> = { ko: "날짜 차이 계산기", en: "Date Difference Calculator", ja: "日付差計算ツール" };
export const tool045Descriptions: Record<Locale, string> = { ko: "두 날짜 사이의 정확한 일수와 달력 기간을 계산하고 시작일 포함 여부, 평일·주말 수를 확인하세요.", en: "Calculate exact days and calendar duration between two dates, with optional start-date inclusion plus weekday and weekend counts.", ja: "2つの日付の日数差とカレンダー期間を計算し、開始日を含める設定や平日・週末の日数を確認できます。" };
export const tool046Titles: Record<Locale, string> = { ko: "날짜 더하기·빼기 계산기", en: "Date Add & Subtract Calculator", ja: "日付加算・減算計算ツール" };
export const tool046Descriptions: Record<Locale, string> = { ko: "기준 날짜에 일·주·개월·년을 더하거나 빼서 결과 날짜와 요일을 확인하세요.", en: "Add or subtract days, weeks, months, or years from a date and see the resulting date and weekday.", ja: "基準日に日・週・か月・年を加算または減算し、結果の日付と曜日を確認できます。" };
export const tool047Titles: Record<Locale, string> = { ko: "디데이·기념일 계산기", en: "D-Day & Anniversary Calculator", ja: "Dデイ・記念日計算ツール" };
export const tool047Descriptions: Record<Locale, string> = { ko: "특정 날짜까지 남은 D-day와 지난 날짜, 다음 생일, 100일·주년 기념일을 계산하세요.", en: "Calculate D-Day, elapsed days, the next birthday, and 100-day or yearly anniversary milestones.", ja: "目標日までのDデイ、経過日数、次の誕生日、100日・周年記念日を計算できます。" };
export const tool048Titles: Record<Locale, string> = { ko: "나이·생후기간 계산기", en: "Age & Elapsed Life Calculator", ja: "年齢・生後期間計算ツール" };
export const tool048Descriptions: Record<Locale, string> = { ko: "생년월일과 기준일로 만나이, 연나이, 생후 일수와 다음 생일까지 남은 날짜를 계산하세요.", en: "Calculate calendar age, year age, days since birth, and time until the next birthday from a birth date and as-of date.", ja: "生年月日と基準日から満年齢、年基準の年齢、生後日数、次の誕生日までを計算できます。" };
export const tool049Titles: Record<Locale, string> = { ko: "근속·재직기간 계산기", en: "Employment Tenure & Service Period Calculator", ja: "勤続・在職期間計算ツール" };
export const tool049Descriptions: Record<Locale, string> = { ko: "입사일과 퇴사일로 근속기간을 연·월·일로 계산하고 여러 경력을 합산하세요.", en: "Calculate employment tenure in years, months and days and add multiple employment periods.", ja: "入社日と退職日から勤続期間を年・月・日で計算し、複数の職歴を合算できます。" };
export const tool050Titles: Record<Locale, string> = { ko: "평일·영업일 계산기", en: "Business Days Calculator", ja: "平日・営業日計算ツール" };
export const tool050Descriptions: Record<Locale, string> = { ko: "주말과 한국·미국·일본 공휴일을 제외해 두 날짜 사이 영업일 수와 N영업일 후·전 날짜를 계산하세요.", en: "Calculate business days between dates or find a date before or after N business days with weekend and holiday exclusions for Korea, the United States, and Japan.", ja: "土日と韓国・米国・日本の祝日を除外して、2つの日付の営業日数やN営業日後・前の日付を計算できます。" };
export const tool051Titles: Record<Locale, string> = { ko: "시간 계산기", en: "Time Calculator", ja: "時間計算ツール" };
export const tool051Descriptions: Record<Locale, string> = { ko: "시간 더하기·빼기, 두 시각 차이, 자정 넘김과 12·24시간 변환을 브라우저에서 계산하세요.", en: "Add or subtract time, calculate time differences across midnight, and convert between 12-hour and 24-hour formats.", ja: "時間の加算・減算、時刻差、日付またぎ、12時間制・24時間制の変換をブラウザで計算します。" };
export const tool052Titles: Record<Locale, string> = { ko: "세계시간·타임존 변환기", en: "World Time & Timezone Converter", ja: "世界時間・タイムゾーン変換ツール" };
export const tool052Descriptions: Record<Locale, string> = { ko: "UTC와 여러 도시의 현지시간을 비교하고 DST를 반영한 변환과 공통 회의시간을 찾으세요.", en: "Compare UTC and multiple city times, convert with DST-aware IANA time zones, and find shared meeting hours.", ja: "UTCと複数都市の現地時刻を比較し、DST対応の変換と共通会議時間を確認できます。" };
export const tool053Titles: Record<Locale, string> = { ko: "Unix Timestamp 변환기", en: "Unix Timestamp Converter", ja: "Unix タイムスタンプ変換ツール" };
export const tool053Descriptions: Record<Locale, string> = { ko: "Unix timestamp를 날짜로, 날짜를 초·밀리초 timestamp로 변환하고 UTC와 현지시간을 함께 확인하세요.", en: "Convert Unix timestamps to dates and dates to seconds or milliseconds while comparing UTC and local time.", ja: "Unixタイムスタンプと日付を相互変換し、秒・ミリ秒、UTC・現地時刻を確認できます。" };
export const tool054Titles: Record<Locale, string> = { ko: "타이머·스톱워치", en: "Timer & Stopwatch", ja: "タイマー・ストップウォッチ" };
export const tool054Descriptions: Record<Locale, string> = { ko: "카운트다운, 스톱워치, Lap·Split 기록과 Work·Rest 반복 타이머를 브라우저에서 사용하세요.", en: "Use a countdown, stopwatch with lap and split records, and a Work/Rest repeat timer in your browser.", ja: "カウントダウン、ストップウォッチ、ラップ記録、作業・休憩の繰り返しタイマーをブラウザで使えます。" };
export const tool055Titles: Record<Locale, string> = { ko: "길이·면적·부피 변환기", en: "Length, Area & Volume Converter", ja: "長さ・面積・体積変換ツール" };
export const tool055Descriptions: Record<Locale, string> = { ko: "길이·면적·부피 단위를 변환하고 평·㎡와 자주 쓰는 단위를 한눈에 비교하세요.", en: "Convert length, area, pyeong/square meters, and volume units while comparing common units at a glance.", ja: "長さ・面積・体積の単位を変換し、坪・平方メートルとよく使う単位を一覧で比較できます。" };
export const tool056Titles: Record<Locale, string> = { ko: "무게·온도·압력 변환기", en: "Weight, Temperature & Pressure Converter", ja: "重量・温度・圧力変換ツール" };
export const tool056Descriptions: Record<Locale, string> = { ko: "무게, 온도, 압력 단위를 빠르게 변환하고 원하는 소수점으로 결과를 확인합니다.", en: "Convert mass, temperature, and pressure units with controllable decimal precision.", ja: "重量、温度、圧力の単位を変換し、小数点の精度を指定して結果を確認できます。" };
export const tool057Titles: Record<Locale, string> = { ko: "속도·연비·에너지 변환기", en: "Speed, Fuel Economy & Energy Converter", ja: "速度・燃費・エネルギー変換ツール" };
export const tool057Descriptions: Record<Locale, string> = { ko: "속도, 연비, 에너지·전력·마력 단위를 빠르게 변환하고 대표 단위를 한눈에 비교합니다.", en: "Convert speed, fuel economy, energy, power, and horsepower units and compare common equivalents.", ja: "速度、燃費、エネルギー・電力・馬力の単位を変換し、代表的な換算値をまとめて比較できます。" };
export const tool058Titles: Record<Locale, string> = { ko: "데이터·요리 단위 변환기", en: "Data & Cooking Unit Converter", ja: "データ・料理単位変換ツール" };
export const tool058Descriptions: Record<Locale, string> = { ko: "bit·byte와 1000·1024 기준의 데이터 단위, 컵·큰술·작은술·mL 요리 단위를 한 페이지에서 변환합니다.", en: "Convert bit/byte data sizes with decimal or binary notation and common cooking measures on one page.", ja: "bit・byteの1000・1024基準と、カップ・大さじ・小さじ・mLの料理単位を1ページで変換します。" };
export const tool059Titles: Record<Locale, string> = { ko: "픽셀·인쇄 크기 변환기", en: "Pixel & Print Size Converter", ja: "ピクセル・印刷サイズ変換ツール" };
export const tool059Descriptions: Record<Locale, string> = { ko: "픽셀 크기와 PPI로 인쇄 크기를 계산하고 필요한 픽셀, 실제 PPI, 종횡비를 확인합니다.", en: "Calculate print size from pixels and PPI, find required pixels, effective PPI, and aspect ratio.", ja: "ピクセルとPPIから印刷サイズを計算し、必要ピクセル・実効PPI・アスペクト比を確認できます。" };
export const tool060Titles: Record<Locale, string> = { ko: "신발·의류 사이즈 변환기", en: "Shoe & Clothing Size Converter", ja: "靴・衣類サイズ変換ツール" };
export const tool060Descriptions: Record<Locale, string> = { ko: "한국·미국·영국·유럽·일본의 신발·의류 사이즈를 남성·여성·아동별로 비교합니다.", en: "Compare shoe and clothing sizes across Korea, US, UK, EU, and Japan for men, women, and kids.", ja: "韓国・米国・英国・EU・日本の靴・衣類サイズをメンズ・レディース・キッズ別に比較します。" };
export const tool061Titles: Record<Locale, string> = { ko: "퍼센트·증감률 계산기", en: "Percentage & Percent Change Calculator", ja: "パーセント・増減率計算機" };
export const tool061Descriptions: Record<Locale, string> = { ko: "전체의 몇 %, 증가율·감소율과 퍼센트 적용 후 값을 계산하고 실제 계산식을 함께 확인합니다.", en: "Calculate percentages, increases, decreases, and values after a percent change with clear formulas.", ja: "割合、増加率・減少率、パーセント適用後の値を計算し、計算式も確認できます。" };
export const tool062Titles: Record<Locale, string> = { ko: "할인 가격 계산기", en: "Discount Price Calculator", ja: "割引価格計算ツール" };
export const tool062Descriptions: Record<Locale, string> = { ko: "정가와 할인율로 할인금액·최종가격·실질 할인율을 계산하고 추가 할인도 순차 적용합니다.", en: "Calculate savings, final price, and effective discount, including sequential additional discounts.", ja: "元の価格と割引率から割引額・最終価格・実質割引率を計算し、追加割引も順番に適用します。" };
export const tool063Titles: Record<Locale, string> = { ko: "비율·비례 계산기", en: "Ratio & Proportion Calculator", ja: "比率・比例計算ツール" };
export const tool063Descriptions: Record<Locale, string> = { ko: "비율 단순화, 비례식의 빈칸, 동치 비율, 배율을 한 페이지에서 계산합니다.", en: "Simplify ratios, solve missing proportion values, check equivalence, and scale ratios on one page.", ja: "比率の簡単化、比例式の未知数、同値比、倍率を1ページで計算します。" };
export const tool064Titles: Record<Locale, string> = { ko: "평균·통계 계산기", en: "Statistics Calculator", ja: "平均・統計計算ツール" };
export const tool064Descriptions: Record<Locale, string> = { ko: "숫자 목록에서 평균·중앙값·최빈값과 합계·개수·최소·최대·범위를 한 번에 계산합니다.", en: "Calculate mean, median, mode, sum, count, minimum, maximum, and range from a list of numbers.", ja: "数値一覧から平均・中央値・最頻値、合計・件数・最小値・最大値・範囲をまとめて計算します。" };
export const tool065Titles: Record<Locale, string> = { ko: "분수·소수 계산기", en: "Fraction & Decimal Calculator", ja: "分数・小数計算ツール" };
export const tool065Descriptions: Record<Locale, string> = { ko: "분수 사칙연산과 약분을 정확하게 계산하고 분수와 소수를 서로 변환합니다.", en: "Calculate exact fraction arithmetic, simplify fractions, and convert between fractions and decimals.", ja: "分数の四則演算と約分を正確に計算し、分数と小数を相互変換します。" };

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
  "content-image": [
    {
      title: tool019Titles,
      description: tool019Descriptions,
      href: `/${"ko"}/${tool019Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool020Titles,
      description: tool020Descriptions,
      href: `/${"ko"}/${tool020Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool021Titles,
      description: tool021Descriptions,
      href: `/${"ko"}/${tool021Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool022Titles,
      description: tool022Descriptions,
      href: `/${"ko"}/${tool022Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool023Titles,
      description: tool023Descriptions,
      href: `/${"ko"}/${tool023Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool024Titles,
      description: tool024Descriptions,
      href: `/${"ko"}/${tool024Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool025Titles,
      description: tool025Descriptions,
      href: `/${"ko"}/${tool025Slug}`,
      status: "LIVE",
      active: true,
    },
  ],
  "pdf": [
    {
      title: tool026Titles,
      description: tool026Descriptions,
      href: `/${"ko"}/${tool026Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool027Titles,
      description: tool027Descriptions,
      href: `/${"ko"}/${tool027Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool028Titles,
      description: tool028Descriptions,
      href: `/${"ko"}/${tool028Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool029Titles,
      description: tool029Descriptions,
      href: `/${"ko"}/${tool029Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool030Titles,
      description: tool030Descriptions,
      href: `/${"ko"}/${tool030Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool031Titles,
      description: tool031Descriptions,
      href: `/${"ko"}/${tool031Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool032Titles,
      description: tool032Descriptions,
      href: `/${"ko"}/${tool032Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool033Titles,
      description: tool033Descriptions,
      href: `/${"ko"}/${tool033Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool034Titles,
      description: tool034Descriptions,
      href: `/${"ko"}/${tool034Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool035Titles,
      description: tool035Descriptions,
      href: `/${"ko"}/${tool035Slug}`,
      status: "LIVE",
      active: true,
    },
  ],
  "text": [
    {
      title: tool036Titles,
      description: tool036Descriptions,
      href: `/${"ko"}/${tool036Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool037Titles,
      description: tool037Descriptions,
      href: `/${"ko"}/${tool037Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool038Titles,
      description: tool038Descriptions,
      href: `/${"ko"}/${tool038Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool039Titles,
      description: tool039Descriptions,
      href: `/${"ko"}/${tool039Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool040Titles,
      description: tool040Descriptions,
      href: `/${"ko"}/${tool040Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool041Titles,
      description: tool041Descriptions,
      href: `/${"ko"}/${tool041Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool042Titles,
      description: tool042Descriptions,
      href: `/${"ko"}/${tool042Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool043Titles,
      description: tool043Descriptions,
      href: `/${"ko"}/${tool043Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool044Titles,
      description: tool044Descriptions,
      href: `/${"ko"}/${tool044Slug}`,
      status: "LIVE",
      active: true,
    },
  ],
  "date-time": [
    {
      title: tool045Titles,
      description: tool045Descriptions,
      href: `/${"ko"}/${tool045Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool046Titles,
      description: tool046Descriptions,
      href: `/${"ko"}/${tool046Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool047Titles,
      description: tool047Descriptions,
      href: `/${"ko"}/${tool047Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool048Titles,
      description: tool048Descriptions,
      href: `/${"ko"}/${tool048Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool049Titles,
      description: tool049Descriptions,
      href: `/${"ko"}/${tool049Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool050Titles,
      description: tool050Descriptions,
      href: `/${"ko"}/${tool050Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool051Titles,
      description: tool051Descriptions,
      href: `/${"ko"}/${tool051Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool052Titles,
      description: tool052Descriptions,
      href: `/${"ko"}/${tool052Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool053Titles,
      description: tool053Descriptions,
      href: `/${"ko"}/${tool053Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool054Titles,
      description: tool054Descriptions,
      href: `/${"ko"}/${tool054Slug}`,
      status: "LIVE",
      active: true,
    },
  ],
  "unit-calc": [
    {
      title: tool055Titles,
      description: tool055Descriptions,
      href: `/${"ko"}/${tool055Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool056Titles,
      description: tool056Descriptions,
      href: `/${"ko"}/${tool056Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool057Titles,
      description: tool057Descriptions,
      href: `/${"ko"}/${tool057Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool058Titles,
      description: tool058Descriptions,
      href: `/${"ko"}/${tool058Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool059Titles,
      description: tool059Descriptions,
      href: `/${"ko"}/${tool059Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool060Titles,
      description: tool060Descriptions,
      href: `/${"ko"}/${tool060Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool061Titles,
      description: tool061Descriptions,
      href: `/${"ko"}/${tool061Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool062Titles,
      description: tool062Descriptions,
      href: `/${"ko"}/${tool062Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool063Titles,
      description: tool063Descriptions,
      href: `/${"ko"}/${tool063Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool064Titles,
      description: tool064Descriptions,
      href: `/${"ko"}/${tool064Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool065Titles,
      description: tool065Descriptions,
      href: `/${"ko"}/${tool065Slug}`,
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
      title: tool014Titles,
      description: tool014Descriptions,
      href: `/${"ko"}/${tool014Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool015Titles,
      description: tool015Descriptions,
      href: `/${"ko"}/${tool015Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool016Titles,
      description: tool016Descriptions,
      href: `/${"ko"}/${tool016Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool017Titles,
      description: tool017Descriptions,
      href: `/${"ko"}/${tool017Slug}`,
      status: "LIVE",
      active: true,
    },
    {
      title: tool018Titles,
      description: tool018Descriptions,
      href: `/${"ko"}/${tool018Slug}`,
      status: "LIVE",
      active: true,
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

  if (categorySlug === "content-image") {
    return cards.map((item, index) => index === 0 ? { ...item, href: `/${locale}/${tool019Slug}` } : index === 1 ? { ...item, href: `/${locale}/${tool020Slug}` } : index === 2 ? { ...item, href: `/${locale}/${tool021Slug}` } : index === 3 ? { ...item, href: `/${locale}/${tool022Slug}` } : index === 4 ? { ...item, href: `/${locale}/${tool023Slug}` } : index === 5 ? { ...item, href: `/${locale}/${tool024Slug}` } : index === 6 ? { ...item, href: `/${locale}/${tool025Slug}` } : item);
  }

  if (categorySlug === "pdf") {
    return cards.map((item, index) => {
      if (index === 0) return { ...item, href: `/${locale}/${tool026Slug}` };
      if (index === 1) return { ...item, href: `/${locale}/${tool027Slug}` };
      if (index === 2) return { ...item, href: `/${locale}/${tool028Slug}` };
      if (index === 3) return { ...item, href: `/${locale}/${tool029Slug}` };
      if (index === 4) return { ...item, href: `/${locale}/${tool030Slug}` };
      if (index === 5) return { ...item, href: `/${locale}/${tool031Slug}` };
      if (index === 6) return { ...item, href: `/${locale}/${tool032Slug}` };
      if (index === 7) return { ...item, href: `/${locale}/${tool033Slug}` };
      if (index === 8) return { ...item, href: `/${locale}/${tool034Slug}` };
      if (index === 9) return { ...item, href: `/${locale}/${tool035Slug}` };
      return item;
    });
  }

  if (categorySlug === "text") {
    return cards.map((item, index) => index === 0 ? { ...item, href: `/${locale}/${tool036Slug}` } : index === 1 ? { ...item, href: `/${locale}/${tool037Slug}` } : index === 2 ? { ...item, href: `/${locale}/${tool038Slug}` } : index === 3 ? { ...item, href: `/${locale}/${tool039Slug}` } : index === 4 ? { ...item, href: `/${locale}/${tool040Slug}` } : index === 5 ? { ...item, href: `/${locale}/${tool041Slug}` } : index === 6 ? { ...item, href: `/${locale}/${tool042Slug}` } : index === 7 ? { ...item, href: `/${locale}/${tool043Slug}` } : index === 8 ? { ...item, href: `/${locale}/${tool044Slug}` } : item);
  }

  if (categorySlug === "date-time") {
    return cards.map((item, index) => index === 0 ? { ...item, href: `/${locale}/${tool045Slug}` } : index === 1 ? { ...item, href: `/${locale}/${tool046Slug}` } : index === 2 ? { ...item, href: `/${locale}/${tool047Slug}` } : index === 3 ? { ...item, href: `/${locale}/${tool048Slug}` } : index === 4 ? { ...item, href: `/${locale}/${tool049Slug}` } : index === 5 ? { ...item, href: `/${locale}/${tool050Slug}` } : index === 6 ? { ...item, href: `/${locale}/${tool051Slug}` } : index === 7 ? { ...item, href: `/${locale}/${tool052Slug}` } : index === 8 ? { ...item, href: `/${locale}/${tool053Slug}` } : index === 9 ? { ...item, href: `/${locale}/${tool054Slug}` } : item);
  }

  if (categorySlug === "unit-calc") {
    return cards.map((item, index) => index === 0 ? { ...item, href: `/${locale}/${tool055Slug}` } : index === 1 ? { ...item, href: `/${locale}/${tool056Slug}` } : index === 2 ? { ...item, href: `/${locale}/${tool057Slug}` } : index === 3 ? { ...item, href: `/${locale}/${tool058Slug}` } : index === 4 ? { ...item, href: `/${locale}/${tool059Slug}` } : index === 5 ? { ...item, href: `/${locale}/${tool060Slug}` } : index === 6 ? { ...item, href: `/${locale}/${tool061Slug}` } : index === 7 ? { ...item, href: `/${locale}/${tool062Slug}` } : index === 8 ? { ...item, href: `/${locale}/${tool063Slug}` } : index === 9 ? { ...item, href: `/${locale}/${tool064Slug}` } : index === 10 ? { ...item, href: `/${locale}/${tool065Slug}` } : item);
  }

  if (categorySlug === "image-edit") {
    return cards.map((item, index) => index === 0 ? { ...item, href: `/${locale}/${tool008Slug}` } : index === 1 ? { ...item, href: `/${locale}/${tool009Slug}` } : index === 2 ? { ...item, href: `/${locale}/${tool010Slug}` } : index === 3 ? { ...item, href: `/${locale}/${tool011Slug}` } : index === 4 ? { ...item, href: `/${locale}/${tool012Slug}` } : index === 5 ? { ...item, href: `/${locale}/${tool013Slug}` } : index === 6 ? { ...item, href: `/${locale}/${tool014Slug}` } : index === 7 ? { ...item, href: `/${locale}/${tool015Slug}` } : index === 8 ? { ...item, href: `/${locale}/${tool016Slug}` } : index === 9 ? { ...item, href: `/${locale}/${tool017Slug}` } : index === 10 ? { ...item, href: `/${locale}/${tool018Slug}` } : item);
  }

  return cards;
}
