import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { categories, getCategoryToolCards, locales, publicCategorySlugs, type Locale } from "@/lib/site";

export function generateStaticParams() {
  return locales.flatMap((locale) => categories.filter((category) => publicCategorySlugs.includes(category.slug)).map((category) => ({ locale, categorySlug: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; categorySlug: string }> }): Promise<Metadata> {
  const { locale, categorySlug } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const foundCategory = categories.find((item) => item.slug === categorySlug && publicCategorySlugs.includes(item.slug));
  if (!foundCategory) notFound();
  const category = foundCategory!;
  const current = locale as Locale;
  return {
    title: `${category.titles[current]} - TOOLBOX`,
    description: category.descriptions[current],
    alternates: { canonical: `https://toolbox.fixlgs.com/${current}/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; categorySlug: string }> }) {
  const { locale, categorySlug } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const currentLocale = locale as Locale;
  const foundCategory = categories.find((item) => item.slug === categorySlug && publicCategorySlugs.includes(item.slug));
  if (!foundCategory) notFound();
  const category = foundCategory!;
  const toolCards = getCategoryToolCards(categorySlug, currentLocale);
  const back = currentLocale === "ko" ? "전체 카테고리" : currentLocale === "en" ? "All categories" : "すべてのカテゴリー";
  const label = currentLocale === "ko" ? "카테고리 도구" : currentLocale === "en" ? "CATEGORY TOOLS" : "カテゴリーツール";
  const open = currentLocale === "ko" ? "도구 열기" : currentLocale === "en" ? "OPEN TOOL" : "ツールを開く";
  const preparing = currentLocale === "ko" ? "준비 중" : currentLocale === "en" ? "COMING SOON" : "準備中";
  const expertCopy = (() => {
    const guides: Partial<Record<string, Record<Locale, { eyebrow: string; title: string; description: string; points: [string, string][] }>>> = {
      "image-convert": {
        ko: { eyebrow: "EXPERT CATEGORY GUIDE", title: "이미지 변환·최적화의 핵심 원리", description: "이미지 형식, 압축 방식, 픽셀 크기와 메타데이터는 서로 다른 문제입니다. 작업 목적에 따라 변환·압축·크기 변경·웹 최적화 도구를 구분해야 품질과 용량을 동시에 관리할 수 있습니다.", points: [["손실과 무손실 압축","JPEG와 손실 WebP는 용량을 줄이는 대신 일부 화상 정보를 버립니다. PNG는 투명도와 선명한 경계를 유지하기 좋지만 사진에서는 용량이 커질 수 있습니다."],["형식 선택 기준","사진은 JPEG·WebP, 투명 배경과 UI 그래픽은 PNG·WebP, 최신 웹 전달은 AVIF·WebP가 적합할 수 있습니다. 다만 실제 지원 환경을 먼저 확인해야 합니다."],["픽셀과 파일 용량","가로·세로 픽셀 수는 해상도이고 KB·MB는 인코딩 결과입니다. 같은 픽셀 크기라도 형식·품질·색상 복잡도에 따라 용량은 크게 달라집니다."],["재인코딩과 화질","형식 변환이나 크기 변경은 대부분 새로 인코딩합니다. 손실 형식을 반복 저장하면 블록·번짐·경계 손상이 누적될 수 있습니다."],["메타데이터와 색상","EXIF·GPS·ICC 프로필은 화면 픽셀과 별개입니다. 브라우저 재인코딩 과정에서 메타데이터가 제거되거나 색 표현이 달라질 수 있습니다."],["도구 역할 구분","형식만 바꾸려면 변환기, 용량을 줄이려면 압축기, 픽셀을 바꾸려면 크기 변경기, 웹 전달 전체를 정리하려면 웹 최적화기를 사용합니다."]]},
        en: { eyebrow: "EXPERT CATEGORY GUIDE", title: "Core principles of image conversion and optimization", description: "File format, compression, pixel dimensions, and metadata are separate concerns. Choose conversion, compression, resizing, or web optimization according to the actual delivery goal.", points: [["Lossy and lossless compression","JPEG and lossy WebP discard image information to reduce size. PNG preserves transparency and crisp edges but can be inefficient for photographs."],["Choosing a format","JPEG or WebP often suits photos, PNG or WebP suits transparency and interface graphics, and AVIF or WebP can improve web delivery when support is confirmed."],["Pixels versus file size","Dimensions describe resolution; KB and MB are encoding results. Identical dimensions can produce very different sizes depending on format, quality, and image complexity."],["Re-encoding and quality","Conversion and resizing usually re-encode the image. Repeatedly saving lossy formats can accumulate blocking, smearing, and edge damage."],["Metadata and color","EXIF, GPS, and ICC profiles are separate from visible pixels. Browser re-encoding may remove metadata or change color appearance."],["Tool boundaries","Use a converter for format changes, a compressor for file size, a resizer for dimensions, and a web optimizer for a complete delivery workflow."]]},
        ja: { eyebrow: "EXPERT CATEGORY GUIDE", title: "画像変換・最適化の基本原理", description: "画像形式、圧縮方式、ピクセルサイズ、メタデータは別の問題です。目的に応じて変換・圧縮・サイズ変更・Web最適化を使い分ける必要があります。", points: [["非可逆圧縮と可逆圧縮","JPEGや非可逆WebPは情報を一部削除して容量を減らします。PNGは透明度や輪郭を保ちやすい反面、写真では容量が大きくなりやすい形式です。"],["形式の選び方","写真はJPEG・WebP、透明背景やUI素材はPNG・WebP、最新Web配信は対応環境を確認した上でAVIF・WebPが候補になります。"],["ピクセルと容量","縦横ピクセルは解像度、KB・MBはエンコード結果です。同じサイズでも形式・画質・色の複雑さで容量は大きく変わります。"],["再エンコードと画質","形式変換やサイズ変更では多くの場合再エンコードされます。非可逆形式を繰り返し保存すると劣化が蓄積します。"],["メタデータと色","EXIF・GPS・ICCプロファイルは表示ピクセルとは別です。ブラウザでの再保存時に削除されたり色が変わる場合があります。"],["ツールの役割","形式変更は変換、容量削減は圧縮、ピクセル変更はサイズ変更、Web配信全体は最適化ツールを使用します。"]]},
      },
      "image-edit": {
        ko: { eyebrow: "EXPERT CATEGORY GUIDE", title: "브라우저 이미지 편집의 핵심 원리", description: "자르기·회전·색상 보정은 화면에서 보이는 변화뿐 아니라 좌표, 재샘플링, 재인코딩, 투명도와 메타데이터 처리까지 함께 이해해야 결과를 예측할 수 있습니다.", points: [["비파괴 편집과 출력","편집 중에는 원본을 바꾸지 않고 설정값만 유지합니다. 다운로드할 때 새 픽셀 결과를 생성하므로 원본 파일은 그대로 남습니다."],["자르기와 종횡비","자르기는 좌표 영역을 줄이고, 고정 비율은 출력의 가로세로 관계를 제한합니다. 작은 영역을 선택할수록 최종 픽셀 수도 줄어듭니다."],["회전과 EXIF 방향","사진의 표시 방향은 EXIF 태그일 수 있습니다. 편집기는 이를 먼저 정상화한 뒤 회전해야 이중 회전을 막을 수 있습니다."],["보간과 반복 저장","회전·확대·축소는 픽셀을 다시 계산합니다. 반복 편집과 손실 저장은 경계 흐림과 압축 손상을 누적시킬 수 있습니다."],["색상 보정의 차이","밝기는 전체 명도, 대비는 명암 차이, 채도는 색 강도, 색온도는 청색·황색 균형, 선명도는 가장자리 대비를 조절합니다."],["투명도와 메모리","PNG·WebP 투명도는 알파 채널로 유지됩니다. 고해상도 이미지는 디코딩 후 메모리 사용량이 크게 늘어나므로 모바일에서는 안전 한도가 필요합니다."]]},
        en: { eyebrow: "EXPERT CATEGORY GUIDE", title: "Core principles of browser image editing", description: "Cropping, rotation, and color adjustment affect coordinates, resampling, re-encoding, transparency, and metadata—not only what appears on screen.", points: [["Non-destructive editing","The source file stays unchanged while settings are edited. Export creates a new pixel result, preserving the original."],["Crop and aspect ratio","Cropping reduces a coordinate area; a fixed ratio constrains width and height. Smaller crop areas produce fewer output pixels."],["Rotation and EXIF orientation","A photo may rely on EXIF orientation. The editor must normalize it before further rotation to avoid double rotation."],["Resampling and repeated saves","Rotation and scaling recalculate pixels. Repeated edits and lossy saves can accumulate blur and compression artifacts."],["Adjustment differences","Brightness changes overall lightness, contrast changes tonal separation, saturation changes color strength, temperature shifts blue-yellow balance, and sharpness boosts edge contrast."],["Transparency and memory","PNG and WebP transparency uses an alpha channel. High-resolution images consume much more memory after decoding, so mobile limits are necessary."]]},
        ja: { eyebrow: "EXPERT CATEGORY GUIDE", title: "ブラウザ画像編集の基本原理", description: "切り抜き・回転・色補正は見た目だけでなく、座標、再サンプリング、再エンコード、透明度、メタデータにも影響します。", points: [["非破壊編集と出力","編集中は元ファイルを変更せず設定値だけを保持します。保存時に新しいピクセル結果を生成するため、元画像は残ります。"],["切り抜きと縦横比","切り抜きは座標範囲を減らし、固定比率は縦横の関係を制限します。範囲が小さいほど出力ピクセルも減ります。"],["回転とEXIF方向","写真の向きがEXIFタグで指定されている場合があります。先に正規化してから回転しないと二重回転が起こります。"],["再サンプリングと再保存","回転や拡大縮小ではピクセルを再計算します。繰り返し編集と非可逆保存はぼけや圧縮劣化を蓄積します。"],["色補正の違い","明るさは全体の明度、コントラストは明暗差、彩度は色の強さ、色温度は青黄バランス、シャープネスは輪郭のコントラストを調整します。"],["透明度とメモリ","PNG・WebPの透明度はアルファチャンネルで保持されます。高解像度画像は展開後のメモリ使用量が大きいため、モバイルでは安全上限が必要です。"]]},
      },
      "content-image": {
        ko: { eyebrow: "EXPERT CATEGORY GUIDE", title: "콘텐츠 이미지 제작에서 먼저 정해야 할 기준", description: "썸네일·배너·SNS 이미지·앱스토어 이미지는 모두 목적과 노출 위치가 다릅니다. 플랫폼 규격, 안전 영역, 종횡비와 파일 형식을 먼저 정하면 재작업을 줄일 수 있습니다.", points: [["플랫폼 규격","유튜브, SNS, 블로그, 앱스토어는 권장 크기와 종횡비가 다릅니다. 업로드 전에 실제 노출 위치의 최신 규격을 확인하는 것이 기본입니다."],["안전 영역","중요한 제목·로고·인물은 가장자리보다 중앙 안전 영역에 배치해야 크롭이나 UI 오버레이로 가려질 가능성을 줄일 수 있습니다."],["종횡비와 크롭","원본과 목표 비율이 다르면 잘림 또는 여백이 생깁니다. 먼저 비율을 정하고 그 다음 픽셀 크기를 맞추는 편이 예측하기 쉽습니다."],["텍스트 가독성","작은 모바일 화면에서는 긴 문장보다 짧은 제목과 충분한 대비가 유리합니다. 배경과 글자의 명도 차이를 확인해야 합니다."],["파일 형식","사진 중심 이미지는 JPEG·WebP, 투명 배경이나 선명한 그래픽은 PNG·WebP가 적합할 수 있습니다. 플랫폼의 업로드 제한도 함께 확인합니다."],["재사용 설계","한 플랫폼용 이미지를 그대로 복제하기보다 핵심 요소를 안전 영역에 두고 플랫폼별 크기에 맞춰 다시 배치하면 품질을 유지하기 쉽습니다."]]},
        en: { eyebrow: "EXPERT CATEGORY GUIDE", title: "What to decide before creating content images", description: "Thumbnails, banners, social images, and app-store graphics have different placements and goals. Set the platform dimensions, safe area, aspect ratio, and file format before designing to reduce rework.", points: [["Platform dimensions","YouTube, social networks, blogs, and app stores use different recommended sizes and aspect ratios. Check the current requirements of the actual placement before export."],["Safe areas","Keep essential titles, logos, and faces away from edges so cropping and interface overlays are less likely to hide them."],["Aspect ratio and crop","When source and target ratios differ, the result needs cropping or padding. Decide the ratio first, then choose the output dimensions."],["Text readability","On small mobile screens, short headlines and strong contrast are easier to read than long text. Check luminance contrast against the background."],["File format","JPEG or WebP often works for photographic content; PNG or WebP can suit transparency and crisp graphics. Also check the platform's upload limits."],["Reusable layouts","Instead of copying one image unchanged, keep key elements inside a safe area and rearrange them for each platform size."]]},
        ja: { eyebrow: "EXPERT CATEGORY GUIDE", title: "コンテンツ画像作成で先に決める基準", description: "サムネイル、バナー、SNS画像、アプリストア画像は表示場所と目的が異なります。規格、安全領域、縦横比、ファイル形式を先に決めると作り直しを減らせます。", points: [["プラットフォーム規格","YouTube、SNS、ブログ、アプリストアでは推奨サイズと縦横比が異なります。出力前に実際の掲載先の最新仕様を確認します。"],["安全領域","重要なタイトル、ロゴ、人物は端から離し、トリミングやUI表示で隠れにくい位置に置きます。"],["縦横比とトリミング","元画像と目標比率が違う場合は切り抜きや余白が必要です。比率を先に決め、その後ピクセルサイズを合わせます。"],["文字の読みやすさ","小さなスマホ画面では長文より短い見出しと十分なコントラストが有効です。背景との明度差を確認します。"],["ファイル形式","写真中心ならJPEG・WebP、透明背景や輪郭の明確な素材ならPNG・WebPが候補です。アップロード制限も確認します。"],["再利用しやすい設計","1枚をそのまま使い回すより、重要要素を安全領域に置き、各プラットフォームのサイズに合わせて再配置します。"]]},
      },
      "pdf": {
        ko: { eyebrow: "EXPERT CATEGORY GUIDE", title: "PDF 작업을 안전하게 나누는 기준", description: "PDF는 페이지 구조, 이미지·텍스트 객체, 보안 설정을 함께 담는 문서 형식입니다. 병합·분할·변환·압축·서명은 서로 다른 작업이므로 원본 보존과 결과 확인이 중요합니다.", points: [["병합과 분할","병합은 여러 문서를 하나의 페이지 흐름으로 만들고, 분할·추출은 필요한 페이지만 새 문서로 만듭니다. 처리 전 페이지 순서를 먼저 확인합니다."],["변환의 한계","PDF를 이미지로 바꾸면 편집 가능한 텍스트·벡터 정보가 픽셀로 바뀔 수 있습니다. 반대로 이미지 PDF는 원본의 검색 가능한 텍스트를 자동 복원하지 않습니다."],["압축과 품질","PDF 압축은 내부 이미지 재압축, 불필요한 객체 정리 등 방식에 따라 결과가 달라집니다. 작은 용량만 보지 말고 글자와 이미지 품질을 확인해야 합니다."],["서명 구분","화면에 서명 이미지를 배치하는 것과 인증서를 사용하는 디지털 서명은 다릅니다. 제출처가 요구하는 서명 방식인지 확인해야 합니다."],["보안과 메타데이터","비밀번호, 권한, 작성자·제목 같은 메타데이터는 문서 내용과 별도로 관리됩니다. 민감한 문서는 공유 전 설정과 속성을 확인합니다."],["원본 보존","페이지 삭제·재정렬·재인코딩은 새 파일로 저장하고 원본을 별도로 보관하는 편이 안전합니다. 중요한 문서는 결과 파일을 다시 열어 페이지 수와 내용을 확인합니다."]]},
        en: { eyebrow: "EXPERT CATEGORY GUIDE", title: "How to separate PDF tasks safely", description: "PDF files can contain page structure, text, images, vector objects, and security settings. Merging, splitting, converting, compressing, and signing are different operations, so preserve the source and verify the result.", points: [["Merge and split","Merging creates one page sequence from several files, while splitting or extracting creates a new document from selected pages. Confirm page order before processing."],["Conversion limits","Converting PDF pages to images can rasterize editable text and vector content. Creating a PDF from images does not automatically restore searchable source text."],["Compression and quality","PDF compression may recompress images or remove redundant objects. Do not judge only by file size—check text clarity and image quality after processing."],["Signature types","Placing a signature image on a page is different from certificate-based digital signing. Confirm which form of signature the recipient requires."],["Security and metadata","Passwords, permissions, author, and title metadata are managed separately from visible page content. Review them before sharing sensitive documents."],["Preserve the source","Save page deletion, rearrangement, and re-encoding as a new file. Reopen important results and verify page count and content before use."]]},
        ja: { eyebrow: "EXPERT CATEGORY GUIDE", title: "PDF作業を安全に分ける基準", description: "PDFにはページ構造、文字、画像、ベクター、セキュリティ設定が含まれます。結合・分割・変換・圧縮・署名は別の処理なので、元ファイルの保存と結果確認が重要です。", points: [["結合と分割","結合は複数文書を1つのページ順にまとめ、分割・抽出は選んだページから新しい文書を作ります。処理前にページ順を確認します。"],["変換の限界","PDFを画像化すると編集可能な文字やベクターがピクセルになる場合があります。画像からPDFを作っても検索可能な元テキストが自動復元されるわけではありません。"],["圧縮と品質","PDF圧縮は画像の再圧縮や不要オブジェクト整理など方式によって結果が変わります。容量だけでなく文字と画像の品質を確認します。"],["署名の違い","ページ上に署名画像を配置することと、証明書を使うデジタル署名は異なります。提出先が求める方式を確認します。"],["セキュリティとメタデータ","パスワード、権限、作成者、タイトルなどは表示内容と別に管理されます。機密文書は共有前に設定を確認します。"],["元ファイルを保存","ページ削除・並べ替え・再エンコードは新しいファイルとして保存し、重要な結果は再度開いてページ数と内容を確認します。"]]},
      },
      "text": {
        ko: { eyebrow: "EXPERT CATEGORY GUIDE", title: "텍스트 작업에서 결과가 달라지는 기준", description: "글자 수, 공백, 줄바꿈, 구분자, 인코딩은 서로 다른 기준입니다. 원문을 직접 바꾸는 작업은 복사본에서 먼저 실행하고 결과를 비교하는 습관이 중요합니다.", points: [["문자·단어·줄 수","글자 수는 공백 포함 여부에 따라 달라지고 단어 수는 언어와 구분 규칙에 영향을 받습니다. 제출 기준이 무엇인지 먼저 확인합니다."],["공백과 줄바꿈","연속 공백, 탭, 빈 줄, 줄 끝 문자는 눈에는 비슷해도 데이터상 다릅니다. 정리 전에 필요한 서식을 보존해야 합니다."],["찾기와 바꾸기","일괄 치환은 예상치 못한 문장까지 바꿀 수 있습니다. 대소문자·전체 일치·정규식 여부를 확인하고 결과를 비교합니다."],["목록과 구분자","쉼표, 탭, 줄바꿈 사이를 변환할 때 값 내부에 같은 문자가 포함되면 단순 분리로는 의미가 깨질 수 있습니다."],["바이트와 인코딩","문자 수와 UTF-8 바이트 수는 같지 않습니다. 한글·일본어·이모지처럼 여러 바이트를 쓰는 문자는 저장·전송 제한에서 차이가 큽니다."],["분석값 해석","키워드 빈도나 중복 수는 원문 특성을 보여주는 참고값입니다. 문맥, 조사·활용형, 대소문자 처리 기준에 따라 결과가 달라질 수 있습니다."]]},
        en: { eyebrow: "EXPERT CATEGORY GUIDE", title: "Rules that change text-processing results", description: "Character counts, whitespace, line breaks, delimiters, and encoding use different rules. For operations that rewrite text, work on a copy first and compare the result with the source.", points: [["Characters, words, and lines","Character counts change depending on whether spaces are included, and word counts depend on language and tokenization rules. Confirm the requirement first."],["Whitespace and line breaks","Repeated spaces, tabs, blank lines, and line-ending characters can look similar but are different data. Preserve required formatting before cleanup."],["Find and replace","Bulk replacement can alter unintended text. Check case sensitivity, whole-match rules, and regular-expression settings before applying changes."],["Lists and delimiters","When converting commas, tabs, or line breaks, a value that already contains the delimiter may be split incorrectly by a simple rule."],["Bytes and encoding","Character count is not the same as UTF-8 byte count. Korean, Japanese, emoji, and other multi-byte characters matter for storage and transmission limits."],["Interpreting analysis","Keyword frequency and duplicate counts are reference metrics. Context, word forms, case handling, and normalization rules can change the result."]]},
        ja: { eyebrow: "EXPERT CATEGORY GUIDE", title: "テキスト処理の結果が変わる基準", description: "文字数、空白、改行、区切り文字、エンコードはそれぞれ別の基準です。元文を書き換える処理はコピーで試し、結果を比較することが重要です。", points: [["文字・単語・行数","文字数は空白を含むかで変わり、単語数は言語や区切り規則に左右されます。提出条件を先に確認します。"],["空白と改行","連続空白、タブ、空行、改行コードは見た目が似ていてもデータとして異なります。必要な書式を残してから整理します。"],["検索と置換","一括置換は意図しない箇所まで変更する可能性があります。大文字小文字、完全一致、正規表現などの条件を確認します。"],["リストと区切り文字","カンマ、タブ、改行を変換する際、値そのものに区切り文字が含まれると単純分割では意味が崩れることがあります。"],["バイトとエンコード","文字数とUTF-8バイト数は同じではありません。日本語、韓国語、絵文字などは保存・送信制限で差が大きくなります。"],["分析値の解釈","キーワード頻度や重複数は参考値です。文脈、活用、大小文字、正規化の基準によって結果が変わります。"]]},
      },
      "date-time": {
        ko: { eyebrow: "EXPERT CATEGORY GUIDE", title: "날짜·시간 계산에서 기준을 먼저 정하는 이유", description: "날짜 계산은 단순한 숫자 차이처럼 보여도 시작일 포함 여부, 윤년, 영업일, 시간대에 따라 결과가 달라집니다. 계산 목적에 맞는 기준을 먼저 정해야 합니다.", points: [["시작일 포함 여부","두 날짜의 순수 차이와 시작일을 1일째로 세는 기념일 계산은 결과가 하루 다를 수 있습니다. 도구가 어떤 기준을 쓰는지 확인합니다."],["윤년과 월 길이","2월 29일과 월말은 단순히 30일 단위로 계산할 수 없습니다. 달력 기준 계산에서는 실제 연·월·일 규칙을 사용해야 합니다."],["D-Day와 기념일","D-Day는 목표일과의 차이를 표시하는 방식이고, 100일 같은 기념일은 시작일을 포함해 세는 관습이 쓰일 수 있어 목적에 따라 구분합니다."],["영업일 계산","영업일은 주말뿐 아니라 국가별 공휴일과 회사 휴무 규칙에 영향을 받습니다. 중요한 일정은 실제 업무 캘린더와 대조합니다."],["시간대와 세계시간","같은 순간도 지역에 따라 날짜와 시간이 다릅니다. 해외 일정은 UTC 오프셋과 서머타임 적용 여부를 함께 확인합니다."],["기간 표현","‘1개월’은 항상 같은 일수가 아닙니다. 계약·근속·나이처럼 연월일 단위가 중요한 계산은 단순 일수와 별도로 확인해야 합니다."]]},
        en: { eyebrow: "EXPERT CATEGORY GUIDE", title: "Why date and time calculations need clear rules", description: "Date calculations look like simple subtraction, but inclusive counting, leap years, business days, and time zones can change the result. Define the rule that matches the task first.", points: [["Inclusive counting","A pure difference between two dates can differ by one day from an anniversary count that treats the start date as day one. Check the tool's rule."],["Leap years and month lengths","February 29 and month-end dates cannot be handled with a fixed 30-day month assumption. Calendar calculations need actual year, month, and day rules."],["D-Day and anniversaries","D-Day usually expresses distance from a target date, while milestones such as the 100th day may count the start date. Use the rule that matches the purpose."],["Business days","Business-day results depend on weekends, national holidays, and sometimes company-specific closures. Verify critical schedules against the real work calendar."],["Time zones and world time","The same instant can have different local dates and times. For international schedules, check UTC offsets and daylight-saving rules."],["Expressing periods","One month is not a fixed number of days. Contracts, tenure, and age calculations may need calendar years and months rather than a simple day count."]]},
        ja: { eyebrow: "EXPERT CATEGORY GUIDE", title: "日付・時間計算で基準を先に決める理由", description: "日付計算は単純な差に見えても、開始日を含むか、うるう年、営業日、タイムゾーンによって結果が変わります。目的に合う基準を先に確認します。", points: [["開始日を含むか","2つの日付の純粋な差と、開始日を1日目とする記念日計算では1日の差が生じることがあります。"],["うるう年と月の日数","2月29日や月末は固定30日では計算できません。カレンダー計算では実際の年・月・日の規則を使います。"],["Dデイと記念日","Dデイは目標日との差を表し、100日などの記念日は開始日を含めて数える場合があります。目的に応じて区別します。"],["営業日計算","営業日は週末だけでなく国の祝日や会社の休業日にも影響されます。重要な予定は実際の業務カレンダーと照合します。"],["タイムゾーンと世界時刻","同じ瞬間でも地域によって日付と時刻が異なります。海外予定ではUTCオフセットと夏時間の有無を確認します。"],["期間の表現","1か月は常に同じ日数ではありません。契約、勤続、年齢などは単純な日数とは別に年月日単位で確認します。"]]},
      },
      "unit-calc": {
        ko: { eyebrow: "EXPERT CATEGORY GUIDE", title: "단위 변환과 계산 결과를 해석하는 기준", description: "단위 변환은 같은 물리량끼리 변환해야 하고, 퍼센트·비율·평균 같은 계산은 입력 기준에 따라 의미가 달라집니다. 숫자뿐 아니라 단위와 반올림 기준을 함께 확인해야 합니다.", points: [["같은 차원의 단위","길이는 길이끼리, 면적은 면적끼리, 부피는 부피끼리 변환합니다. 이름이 비슷해도 서로 다른 물리량은 단순 환산할 수 없습니다."],["반올림과 정밀도","화면에 표시되는 소수 자릿수는 편의를 위한 반올림일 수 있습니다. 연속 계산이나 정밀 작업에는 중간값을 너무 일찍 반올림하지 않는 편이 좋습니다."],["퍼센트와 증감률","전체의 몇 퍼센트인지와 이전 값에서 몇 퍼센트 변했는지는 다른 계산입니다. 기준값이 무엇인지 먼저 확인해야 합니다."],["비율과 비례","A:B 비율과 ‘A가 B의 몇 배인가’는 표현이 다릅니다. 비례식은 알려진 세 값을 기준으로 나머지 한 값을 계산합니다."],["평균과 통계","평균만으로 데이터 분포를 모두 설명할 수 없습니다. 중앙값, 최솟값·최댓값, 표준편차 등 필요한 지표를 함께 봐야 합니다."],["표준이 다른 항목","신발·의류 사이즈처럼 국가와 브랜드별 표준이 다른 값은 참고용 환산입니다. 실제 구매 전 제조사의 사이즈표를 우선 확인합니다."]]},
        en: { eyebrow: "EXPERT CATEGORY GUIDE", title: "How to interpret unit conversions and calculator results", description: "Unit conversion must stay within the same quantity, while percentages, ratios, and averages depend on the chosen reference. Check the unit and rounding rule as well as the number.", points: [["Same physical quantity","Convert length to length, area to area, and volume to volume. Similar-looking unit names do not make different physical quantities directly convertible."],["Rounding and precision","Displayed decimals may be rounded for readability. For chained or precision-sensitive calculations, avoid rounding intermediate values too early."],["Percent versus percent change","A share of a total and a change from a previous value are different calculations. Identify the reference value first."],["Ratios and proportions","An A:B ratio and saying A is a multiple of B express relationships differently. A proportion solves one unknown from three known corresponding values."],["Averages and statistics","A mean alone does not describe the whole distribution. Median, minimum, maximum, or standard deviation may also matter."],["Non-universal standards","Shoe and clothing sizes vary by country, brand, and product. Treat conversions as references and check the manufacturer's chart before purchasing."]]},
        ja: { eyebrow: "EXPERT CATEGORY GUIDE", title: "単位換算と計算結果を解釈する基準", description: "単位換算は同じ物理量の間で行い、パーセント、比率、平均は基準値によって意味が変わります。数字だけでなく単位と丸め方も確認します。", points: [["同じ次元の単位","長さは長さ、面積は面積、体積は体積の間で換算します。名前が似ていても異なる物理量は単純換算できません。"],["丸めと精度","表示される小数は読みやすさのために丸められる場合があります。連続計算や精密な用途では途中値を早く丸めすぎないようにします。"],["パーセントと増減率","全体に占める割合と、前の値から何％変化したかは別の計算です。基準値を先に確認します。"],["比率と比例","A:Bの比率とAがBの何倍かは表現が異なります。比例式は対応する3つの既知値から1つの未知値を求めます。"],["平均と統計","平均だけでは分布全体を説明できません。中央値、最小・最大、標準偏差など必要な指標も確認します。"],["統一されていない規格","靴や衣類のサイズは国、ブランド、商品で異なります。換算は参考値として、購入前にメーカー表を優先します。"]]},
      },
      "business-finance": {
        ko: { eyebrow: "EXPERT CATEGORY GUIDE", title: "사업 계산에서 기준값을 혼동하지 않는 방법", description: "사업·금융 계산은 같은 숫자라도 세금 포함 여부, 원가 기준인지 판매가 기준인지, 수수료 차감 시점에 따라 결과가 달라집니다. 계산식보다 먼저 입력값의 정의를 맞추는 것이 중요합니다.", points: [["부가세 기준","공급가액에서 세액을 더하는 계산과 부가세 포함 총액에서 공급가액을 역산하는 계산은 방향이 다릅니다. 적용 세율과 과세 여부도 확인합니다."],["마진율과 마크업","마진율은 보통 판매가를 기준으로 이익 비중을 보고, 마크업은 원가 대비 얼마나 올렸는지를 봅니다. 같은 이익이라도 두 비율은 다르게 표시됩니다."],["수수료와 정산금","플랫폼 수수료, 결제 수수료, 배송비, 광고비가 어떤 금액을 기준으로 차감되는지에 따라 실제 정산액이 달라집니다."],["손익분기점","고정비와 단위당 공헌이익을 분리해야 필요한 판매량을 계산할 수 있습니다. 변동비를 고정비에 섞으면 결과가 왜곡됩니다."],["단가 비교","총가격만 비교하지 말고 같은 단위당 가격으로 환산해야 합니다. 묶음 수량, 중량, 용량이 다른 상품 비교에 특히 중요합니다."],["광고 성과","ROAS, ROI, 전환율, CPA는 서로 다른 질문에 답하는 지표입니다. 광고매출만으로 전체 사업의 순이익을 판단하지 않도록 비용 범위를 확인합니다."]]},
        en: { eyebrow: "EXPERT CATEGORY GUIDE", title: "How to avoid mixing reference values in business calculations", description: "Business and finance results change depending on whether tax is included, whether a percentage uses cost or selling price, and when fees are deducted. Define each input before applying a formula.", points: [["VAT basis","Adding tax to a net amount and extracting the net amount from a tax-inclusive total are opposite calculations. Also confirm the applicable tax rate and taxability."],["Margin versus markup","Margin usually measures profit as a share of selling price, while markup measures the increase over cost. The same profit can produce different percentages."],["Fees and settlement","Marketplace fees, payment fees, shipping, and advertising may be deducted from different bases, which changes the actual settlement amount."],["Break-even point","Separate fixed costs from contribution per unit to estimate required sales volume. Mixing variable costs into fixed costs distorts the result."],["Unit-price comparison","Compare products on the same price-per-unit basis rather than total price alone, especially when pack size, weight, or volume differs."],["Advertising metrics","ROAS, ROI, conversion rate, and CPA answer different questions. Check which costs are included before using ad revenue to infer overall profitability."]]},
        ja: { eyebrow: "EXPERT CATEGORY GUIDE", title: "事業計算で基準値を混同しない方法", description: "事業・金融の計算は、税込か税抜か、原価基準か販売価格基準か、手数料をどの時点で引くかによって結果が変わります。式より先に入力値の定義をそろえます。", points: [["消費税の基準","税抜金額に税を加える計算と、税込総額から税抜金額を逆算する計算は方向が異なります。適用税率と課税対象かも確認します。"],["利益率とマークアップ","利益率は一般に販売価格に対する利益の割合、マークアップは原価に対する上乗せ率です。同じ利益でも割合は異なります。"],["手数料と精算額","プラットフォーム、決済、配送、広告などの手数料がどの金額を基準に差し引かれるかで実際の精算額が変わります。"],["損益分岐点","固定費と1単位当たりの限界利益を分けて必要販売量を計算します。変動費を固定費に混ぜると結果がゆがみます。"],["単価比較","総額だけでなく同じ単位当たり価格に換算します。数量、重量、容量が異なる商品を比べるときに重要です。"],["広告指標","ROAS、ROI、コンバージョン率、CPAはそれぞれ別の問いに答える指標です。広告売上だけで全体利益を判断しないよう費用範囲を確認します。"]]},
      },
    };
    return guides[categorySlug]?.[currentLocale] ?? (currentLocale === "ko"
      ? { eyebrow:"CATEGORY GUIDE", title:category.titles[currentLocale], description:`${category.descriptions[currentLocale]} 필요한 작업에 맞는 도구를 선택해 바로 사용할 수 있습니다.`, points:[["빠른 선택","목적에 맞는 도구를 한 화면에서 비교하고 선택합니다."],["간단한 사용","복잡한 설치나 회원가입 없이 각 도구를 바로 시작합니다."],["안전한 처리","가능한 작업은 브라우저 안에서 처리하며 방식은 도구별로 안내합니다."]] as [string,string][] }
      : currentLocale === "en"
        ? { eyebrow:"CATEGORY GUIDE", title:category.titles[currentLocale], description:`${category.descriptions[currentLocale]} Choose the tool that matches your task and start right away.`, points:[["Choose quickly","Compare the tools for your task on one clear page."],["Start simply","Open each tool without complicated setup or registration."],["Process safely","Whenever possible, work stays in your browser and each tool explains how it is handled."]] as [string,string][] }
        : { eyebrow:"CATEGORY GUIDE", title:category.titles[currentLocale], description:`${category.descriptions[currentLocale]} 目的に合うツールを選び、すぐに利用できます。`, points:[["すばやく選択","目的に合うツールをひとつの画面で比較して選べます。"],["かんたんに開始","複雑な設定や会員登録なしで各ツールをすぐに使えます。"],["安全に処理","可能な処理はブラウザ内で行い、詳細は各ツールページで案内します。"]] as [string,string][] });
  })();

  const usageCopy = categorySlug === "image-convert"
    ? currentLocale === "ko"
      ? { eyebrow: "HOW TO USE", title: "이미지 변환·최적화 도구 사용 방법", description: "원하는 결과에 맞춰 형식 변환, 압축, 크기 변경, 웹 최적화 도구를 구분해 사용하세요.", points: [["작업 목적 확인", "파일 형식 변경, 용량 절감, 픽셀 크기 조정, 웹 배포 중 어떤 작업이 필요한지 먼저 확인합니다."], ["도구 선택", "목적에 맞는 도구를 열고 지원 형식과 파일 제한을 확인한 뒤 이미지를 선택합니다."], ["결과 확인과 저장", "미리보기와 원본·결과 정보를 확인하고 필요한 형식과 품질로 다운로드합니다."]] as [string,string][] }
      : currentLocale === "en"
        ? { eyebrow: "HOW TO USE", title: "How to use image conversion and optimization tools", description: "Choose conversion, compression, resizing, or web optimization according to the result you need.", points: [["Identify the task", "Decide whether you need a format change, smaller file size, different pixel dimensions, or complete web delivery optimization."], ["Choose the tool", "Open the matching tool, check supported formats and limits, and select the image."], ["Review and save", "Compare the source and result information, then download with the required format and quality."]] as [string,string][] }
        : { eyebrow: "HOW TO USE", title: "画像変換・最適化ツールの使い方", description: "形式変換、圧縮、サイズ変更、Web最適化から目的に合うツールを選びます。", points: [["目的を確認", "形式変更、容量削減、ピクセル変更、Web配信のどの作業が必要か確認します。"], ["ツールを選択", "目的に合うツールを開き、対応形式と制限を確認して画像を選択します。"], ["結果を確認して保存", "元画像と結果情報を確認し、必要な形式と画質でダウンロードします。"]] as [string,string][] }
    : categorySlug === "image-edit"
      ? currentLocale === "ko"
        ? { eyebrow: "HOW TO USE", title: "이미지 편집 도구 사용 방법", description: "자르기·회전·색상 보정처럼 필요한 편집 목적을 먼저 정하고 해당 도구에서 결과를 확인하세요.", points: [["편집 목적 선택", "구도 변경, 방향 수정, 밝기·색상 보정 등 현재 이미지에 필요한 작업을 구분합니다."], ["이미지 편집", "도구에서 이미지를 선택하고 미리보기와 설정값을 확인하며 필요한 만큼 조정합니다."], ["원본과 비교 후 저장", "원본과 편집 결과를 비교하고 출력 형식과 품질을 확인한 뒤 다운로드합니다."]] as [string,string][] }
        : currentLocale === "en"
          ? { eyebrow: "HOW TO USE", title: "How to use image editing tools", description: "Choose the editing task first—such as cropping, rotation, or color adjustment—then verify the result in the matching tool.", points: [["Choose the edit", "Separate the task into composition, orientation, or brightness and color adjustment."], ["Edit the image", "Select the image and adjust it while checking the preview and current settings."], ["Compare and save", "Compare the original and edited result, confirm output settings, and download the new file."]] as [string,string][] }
          : { eyebrow: "HOW TO USE", title: "画像編集ツールの使い方", description: "切り抜き、回転、色補正など必要な編集目的を決めてから対応ツールを使います。", points: [["編集目的を選択", "構図、向き、明るさ・色味など必要な作業を分けて考えます。"], ["画像を編集", "画像を選択し、プレビューと設定値を確認しながら調整します。"], ["比較して保存", "元画像と編集結果を比較し、出力設定を確認してダウンロードします。"]] as [string,string][] }
      : (() => {
          const usageGuides: Partial<Record<string, Record<Locale, { eyebrow: string; title: string; description: string; points: [string, string][] }>>> = {
            "content-image": {
              ko: { eyebrow:"HOW TO USE", title:"콘텐츠 이미지 제작 도구 사용 방법", description:"먼저 게시 위치와 목표 규격을 정한 뒤, 제작 목적에 맞는 도구에서 안전 영역과 결과 크기를 확인하세요.", points:[["게시 위치 정하기","유튜브·SNS·블로그·앱스토어 등 실제 이미지가 노출될 위치를 먼저 정합니다."],["목표 규격에 맞춰 제작","플랫폼에 맞는 종횡비와 픽셀 크기를 선택하고 제목·로고 같은 핵심 요소를 안전 영역에 배치합니다."],["작은 화면까지 확인","다운로드 전 미리보기에서 크롭, 글자 가독성, 파일 형식과 용량을 확인합니다."]]},
              en: { eyebrow:"HOW TO USE", title:"How to use content image tools", description:"Choose the publishing destination and target dimensions first, then use the matching tool and verify safe areas and output size.", points:[["Choose the destination","Decide where the image will appear—YouTube, social media, a blog, or an app store."],["Build to the target format","Set the correct aspect ratio and pixel dimensions, keeping essential text and logos inside a safe area."],["Check small-screen output","Before download, review cropping, text readability, file format, and file size in the preview."]]},
              ja: { eyebrow:"HOW TO USE", title:"コンテンツ画像作成ツールの使い方", description:"掲載先と目標サイズを先に決め、目的に合うツールで安全領域と出力サイズを確認します。", points:[["掲載先を決める","YouTube、SNS、ブログ、アプリストアなど実際に表示される場所を先に決めます。"],["目標規格に合わせる","適切な縦横比とピクセルサイズを選び、重要な文字やロゴを安全領域に配置します。"],["小さい画面でも確認","保存前にトリミング、文字の読みやすさ、形式、容量をプレビューで確認します."]]},
            },
            "pdf": {
              ko: { eyebrow:"HOW TO USE", title:"PDF 도구 사용 방법", description:"병합·분할·변환·압축처럼 필요한 작업을 먼저 구분하고 원본을 보존한 상태에서 결과 문서를 확인하세요.", points:[["작업 유형 선택","페이지를 합칠지, 나눌지, 변환할지, 압축할지 목적에 맞는 PDF 도구를 선택합니다."],["원본과 페이지 확인","중요한 문서는 원본을 별도로 보관하고 페이지 순서·선택 범위·보안 설정을 확인합니다."],["결과 파일 재확인","저장한 PDF를 다시 열어 페이지 수, 글자·이미지 품질, 파일 크기와 필요한 속성을 확인합니다."]]},
              en: { eyebrow:"HOW TO USE", title:"How to use PDF tools", description:"Separate the task—merge, split, convert, compress, or sign—preserve the source, and verify the resulting document.", points:[["Choose the operation","Select the PDF tool that matches whether you need to merge, split, convert, compress, or modify pages."],["Check source and pages","Keep an original copy of important files and confirm page order, selection ranges, and relevant security settings."],["Reopen the result","Open the saved PDF again and verify page count, text and image quality, file size, and required properties."]]},
              ja: { eyebrow:"HOW TO USE", title:"PDFツールの使い方", description:"結合・分割・変換・圧縮など必要な処理を分け、元ファイルを保存した状態で結果を確認します。", points:[["処理を選ぶ","結合、分割、変換、圧縮、ページ編集など目的に合うPDFツールを選びます。"],["元ファイルとページを確認","重要な文書は元ファイルを別に保存し、ページ順、選択範囲、必要なセキュリティ設定を確認します。"],["結果を開き直す","保存したPDFを再度開き、ページ数、文字・画像品質、容量、必要な属性を確認します."]]},
            },
            "text": {
              ko: { eyebrow:"HOW TO USE", title:"텍스트 도구 사용 방법", description:"원문 보존이 필요한 작업은 복사본에서 시작하고, 글자 수·정리·변환·비교 중 목적에 맞는 도구를 선택하세요.", points:[["목적과 기준 확인","글자 수, 공백 정리, 목록 변환, 비교, 키워드 분석 중 필요한 결과와 기준을 정합니다."],["복사본에서 처리","찾기·바꾸기나 공백 정리처럼 원문을 변경하는 작업은 원본을 남겨둔 상태에서 실행합니다."],["변경 결과 비교","문자 수, 줄바꿈, 구분자, 인코딩 등 예상하지 못한 변화가 없는지 결과를 확인한 뒤 복사합니다."]]},
              en: { eyebrow:"HOW TO USE", title:"How to use text tools", description:"When a task rewrites text, keep the source and work on a copy. Choose the tool for counting, cleanup, conversion, comparison, or analysis.", points:[["Define the rule","Decide whether you need counts, whitespace cleanup, list conversion, comparison, or keyword analysis and what counting rule applies."],["Work on a copy","For find-and-replace or cleanup operations that change content, preserve the source before processing."],["Compare the result","Check character counts, line breaks, delimiters, and encoding-related changes before copying the final text."]]},
              ja: { eyebrow:"HOW TO USE", title:"テキストツールの使い方", description:"元文を変更する処理では原文を残し、文字数・整理・変換・比較・分析から目的に合うツールを選びます。", points:[["目的と基準を確認","文字数、空白整理、リスト変換、比較、キーワード分析のどれが必要か、集計基準も決めます。"],["コピーで処理","検索・置換や空白整理など内容を変更する作業では、原文を保存してから処理します。"],["結果を比較","文字数、改行、区切り文字、エンコードなど意図しない変化がないか確認してから利用します."]]},
            },
            "date-time": {
              ko: { eyebrow:"HOW TO USE", title:"날짜·시간 도구 사용 방법", description:"날짜 차이, D-Day, 나이, 영업일, 세계시간처럼 계산 목적에 맞는 기준을 먼저 선택하세요.", points:[["계산 목적 선택","순수 날짜 차이인지, 시작일을 포함한 기념일인지, 영업일인지 필요한 기준을 정합니다."],["기준 날짜와 지역 확인","연·월·일 입력을 확인하고 세계시간은 지역과 시간대, 영업일은 공휴일 기준을 함께 확인합니다."],["표시 기준 확인","결과의 포함·제외 규칙, 윤년·월말 처리, 시간대 차이를 확인한 뒤 일정에 적용합니다."]]},
              en: { eyebrow:"HOW TO USE", title:"How to use date and time tools", description:"Choose the correct rule first for date differences, D-Day, age, business days, world time, or timers.", points:[["Choose the calculation","Decide whether you need a pure date difference, an inclusive milestone, business days, age, or time-zone conversion."],["Check dates and region","Confirm year, month, and day inputs; for world time check the location and time zone, and for business days check the holiday basis."],["Verify the counting rule","Review inclusive or exclusive counting, leap-year and month-end handling, and time-zone differences before using the result."]]},
              ja: { eyebrow:"HOW TO USE", title:"日付・時間ツールの使い方", description:"日数差、Dデイ、年齢、営業日、世界時刻など目的に合う計算基準を先に選びます。", points:[["計算目的を選ぶ","純粋な日数差、開始日を含む記念日、営業日、年齢、タイムゾーン変換など必要な基準を決めます。"],["日付と地域を確認","年月日の入力を確認し、世界時刻では地域とタイムゾーン、営業日では祝日の基準も確認します。"],["数え方を確認","開始日を含むか、うるう年・月末処理、タイムゾーン差を確認して結果を利用します."]]},
            },
            "unit-calc": {
              ko: { eyebrow:"HOW TO USE", title:"단위·일반 계산기 사용 방법", description:"변환할 단위나 계산 기준값을 먼저 확인하고, 결과의 단위·소수점·기준값을 함께 읽으세요.", points:[["계산 종류 선택","길이·면적·무게 같은 단위 변환인지 퍼센트·비율·평균 같은 일반 계산인지 구분합니다."],["단위와 기준값 입력","서로 같은 종류의 단위를 선택하고 퍼센트·증감률 계산에서는 어떤 값이 기준인지 확인합니다."],["정밀도와 의미 확인","결과 숫자뿐 아니라 단위, 반올림 자릿수, 통계값 또는 환산값의 한계를 확인합니다."]]},
              en: { eyebrow:"HOW TO USE", title:"How to use unit and general calculators", description:"Confirm the units or reference values first, then read the result together with its unit, precision, and calculation basis.", points:[["Choose the calculation","Separate physical unit conversion from general calculations such as percentages, ratios, averages, or fractions."],["Enter units and references","Use compatible units and, for percentage or change calculations, confirm which value is the reference."],["Review precision and meaning","Read the unit, rounding, and the limits of a statistical or converted value along with the result number."]]},
              ja: { eyebrow:"HOW TO USE", title:"単位換算・一般計算ツールの使い方", description:"換算する単位や基準値を先に確認し、結果は単位・小数精度・計算基準と合わせて読みます。", points:[["計算種類を選ぶ","長さ・面積・重さなどの単位換算か、パーセント・比率・平均などの一般計算かを分けます。"],["単位と基準値を入力","互換性のある単位を選び、パーセントや増減率ではどの値が基準か確認します。"],["精度と意味を確認","数値だけでなく単位、丸め桁、統計値や換算値の限界も確認します."]]},
            },
            "business-finance": {
              ko: { eyebrow:"HOW TO USE", title:"사업·금융 계산기 사용 방법", description:"세금·원가·판매가·수수료처럼 계산의 기준이 되는 금액을 먼저 구분한 뒤 결과를 의사결정 참고값으로 사용하세요.", points:[["기준 금액 구분","공급가액·총액, 원가·판매가, 광고비·광고매출 등 서로 다른 입력값의 의미를 먼저 확인합니다."],["비율과 비용 입력","세율, 수수료율, 마진율 등 어떤 금액을 기준으로 적용되는 비율인지 확인해 입력합니다."],["결과를 교차 확인","정산금·손익분기점·광고 성과 등은 실제 계약 조건과 추가 비용을 반영해 최종 판단 전에 다시 확인합니다."]]},
              en: { eyebrow:"HOW TO USE", title:"How to use business and finance calculators", description:"Separate the reference amounts—tax, cost, selling price, fees, or ad spend—before using the calculated result as a decision aid.", points:[["Define each amount","Confirm the meaning of net versus total price, cost versus selling price, and ad spend versus ad revenue before entering values."],["Enter rates and costs","For tax, fees, or margins, verify which amount each percentage is applied to."],["Cross-check the result","For settlements, break-even points, and ad performance, include real contract terms and additional costs before making a final decision."]]},
              ja: { eyebrow:"HOW TO USE", title:"ビジネス・金融計算ツールの使い方", description:"税金、原価、販売価格、手数料など計算の基準となる金額を先に分け、結果は意思決定の参考値として使います。", points:[["基準金額を分ける","税抜・税込、原価・販売価格、広告費・広告売上など入力値の意味を先に確認します。"],["比率と費用を入力","税率、手数料率、利益率など、どの金額を基準に適用する割合か確認して入力します。"],["結果を再確認","精算額、損益分岐点、広告成果は実際の契約条件や追加費用も反映し、最終判断前に確認します."]]},
            },
          };
          return usageGuides[categorySlug]?.[currentLocale] ?? (currentLocale === "ko"
            ? { eyebrow:"HOW TO USE", title:`${category.titles[currentLocale]} 사용 방법`, description:"목적에 맞는 도구를 선택하고 안내 순서에 따라 작업을 완료하세요.", points:[["도구 선택","카테고리 안에서 필요한 기능을 제공하는 도구를 선택합니다."],["작업 실행","도구 페이지의 입력과 설정 안내에 따라 작업합니다."],["결과 확인","처리 결과와 주의사항을 확인한 뒤 저장하거나 다음 작업으로 이동합니다."]] as [string,string][] }
            : currentLocale === "en"
              ? { eyebrow:"HOW TO USE", title:`How to use ${category.titles[currentLocale]}`, description:"Choose the tool for your task and complete the work in the guided order.", points:[["Choose a tool","Select the tool that provides the function you need."],["Run the task","Follow the input and settings shown on the tool page."],["Review the result","Check the result and notes before saving or moving to the next task."]] as [string,string][] }
              : { eyebrow:"HOW TO USE", title:`${category.titles[currentLocale]}の使い方`, description:"目的に合うツールを選び、案内順に作業します。", points:[["ツールを選択","必要な機能を提供するツールを選びます。"],["作業を実行","ツールページの入力と設定案内に従って作業します。"],["結果を確認","結果と注意事項を確認して保存または次の作業へ進みます。"]] as [string,string][] });
        })();

  const faqCopy = currentLocale === "ko" ? {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]} 자주 묻는 질문`, more: "FAQ 더보기", collapse: "FAQ 접기",
    items: [["이 카테고리에는 어떤 도구가 있나요?", `${category.titles[currentLocale]}에 현재 공개된 도구를 한곳에서 확인하고 바로 열 수 있습니다.`], ["카테고리의 도구는 모두 무료인가요?", "현재 제공되는 기본 도구는 무료로 사용할 수 있습니다."], ["회원가입 없이 사용할 수 있나요?", "네. 별도 회원가입 없이 각 도구 페이지에서 바로 사용할 수 있습니다."], ["모바일에서도 사용할 수 있나요?", "네. 휴대전화와 태블릿에서도 사용할 수 있도록 화면이 조정됩니다."], ["파일은 어디에서 처리되나요?", "가능한 도구는 브라우저 내부에서 처리하며, 정확한 처리 방식은 각 도구 페이지에서 안내합니다."], ["필요한 도구를 빠르게 찾으려면 어떻게 하나요?", "메인 검색창이나 카테고리의 도구 목록을 이용해 필요한 기능을 바로 찾을 수 있습니다."]] as [string,string][]
  } : currentLocale === "en" ? {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]} FAQs`, more: "View more FAQs", collapse: "Show fewer FAQs",
    items: [["What tools are included in this category?", `This page collects the currently available tools related to ${category.titles[currentLocale]}, and each one can be opened directly.`], ["Are all tools in this category free?", "The basic tools currently provided are free to use."], ["Can I use them without an account?", "Yes. You can open each tool directly without registration."], ["Can I use these tools on mobile devices?", "Yes. The pages adapt to phones and tablets."], ["Where are files processed?", "Whenever possible, files are processed in your browser. Each tool page explains its exact processing method."], ["How can I find the tool I need quickly?", "Use the search box on the home page or browse the tools listed in this category."]] as [string,string][]
  } : {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]}のよくある質問`, more: "FAQをもっと見る", collapse: "FAQを閉じる",
    items: [["このカテゴリーにはどのようなツールがありますか？", `${category.titles[currentLocale]}に関連する現在公開中のツールをまとめて確認し、すぐに開くことができます。`], ["カテゴリー内のツールはすべて無料ですか？", "現在提供している基本ツールは無料で利用できます。"], ["会員登録なしで利用できますか？", "はい。会員登録なしで各ツールページからすぐに利用できます。"], ["モバイルでも利用できますか？", "はい。スマートフォンやタブレットに合わせて画面が調整されます。"], ["ファイルはどこで処理されますか？", "可能なツールはブラウザ内で処理し、詳細な処理方法は各ツールページで案内します。"], ["必要なツールをすばやく探すには？", "トップページの検索欄またはこのカテゴリーのツール一覧から必要な機能を探せます。"]] as [string,string][]
  };

  return (
    <ToolboxSubpageShell locale={currentLocale}>
      <section className="toolbox-subpage-hero">
        <div>
          <Link className="toolbox-subpage-back" href={`/${currentLocale}#categories`}>← {back}</Link>
          <p className="toolbox-subpage-eyebrow">{category.number} · {label}</p>
          <h1>{category.titles[currentLocale]}</h1>
          <p className="toolbox-subpage-lead">{category.descriptions[currentLocale]}</p>
        </div>
        <div className="toolbox-subpage-index" aria-hidden="true"><span>{category.number}</span><small>TOOLBOX</small></div>
      </section>

      <section className="toolbox-subpage-tools">
        <div className="toolbox-subpage-section-head">
          <p>{label}</p>
          <span>{String(toolCards.length).padStart(2, "0")}</span>
        </div>
        <div className="toolbox-subpage-card-grid">
          {toolCards.map((tool, index) => {
            const toolNumber = categorySlug === "image-edit" ? index + 8 : categorySlug === "content-image" ? index + 19 : categorySlug === "pdf" ? index + 26 : categorySlug === "text" ? index + 36 : categorySlug === "date-time" ? index + 45 : categorySlug === "unit-calc" ? index + 55 : categorySlug === "business-finance" ? index + 66 : categorySlug === "real-estate-build" ? index + 81 : index + 1;
            const imageEditTitleLines: Record<Locale, string[][]> = {
              ko: [
                ["이미지 자르기", "회전 도구"],
                ["이미지 밝기", "색상 보정기"],
                ["이미지 모자이크", "블러 도구"],
                ["이미지 여백", "배경 추가기"],
                ["이미지 테두리", "둥근 모서리 도구"],
                ["이미지 합치기"],
                ["이미지 콜라주", "만들기"],
                ["전후 비교", "이미지 만들기"],
                ["이미지에", "글자 넣기"],
                ["이미지", "워터마크 넣기"],
                ["이미지 정보", "메타데이터 검사기"],
              ],
              en: [
                ["Image Cropper", "& Rotator"],
                ["Image Brightness", "& Color Adjuster"],
                ["Image Mosaic", "& Blur Tool"],
                ["Image Padding", "& Background Tool"],
                ["Image Border", "& Rounded Corners"],
                ["Image Merger"],
                ["Image Collage", "Maker"],
                ["Before & After", "Image Maker"],
                ["Add Text", "to Image"],
                ["Add Watermark", "to Images"],
                ["Image Info", "& Metadata Inspector"],
              ],
              ja: [
                ["画像切り抜き", "・回転ツール"],
                ["画像の明るさ", "・色補正ツール"],
                ["画像モザイク", "・ぼかしツール"],
                ["画像余白", "・背景追加ツール"],
                ["画像枠線", "・角丸ツール"],
                ["画像結合ツール"],
                ["画像コラージュ", "作成ツール"],
                ["ビフォー・アフター", "画像作成ツール"],
                ["画像文字入れ", "ツール"],
                ["画像ウォーターマーク", "追加ツール"],
                ["画像情報", "・メタデータ検査ツール"],
              ],
            };
            const imageEditLines = categorySlug === "image-edit" ? imageEditTitleLines[currentLocale][index] : null;
            const cardTitle = imageEditLines
              ? <>{imageEditLines.map((line) => <span className="toolbox-card-title-line" key={line}>{line}</span>)}</>
              : categorySlug === "content-image" && toolNumber === 24
                ? currentLocale === "ko"
                  ? <>앱스토어 스크린샷<br />제작기</>
                  : currentLocale === "en"
                    ? <>App Store Screenshot<br />Maker</>
                    : <>アプリストア<br />スクリーンショット作成ツール</>
              : categorySlug === "pdf" && toolNumber === 26
                ? currentLocale === "ko"
                  ? <>이미지 PDF<br />변환기</>
                  : currentLocale === "en"
                    ? <>Image to PDF<br />Converter</>
                    : <>画像 PDF<br />変換ツール</>
              : currentLocale === "ko" && categorySlug === "content-image" && toolNumber === 20
                ? <>유튜브 채널<br />배너 제작기</>
              : currentLocale === "ko" && categorySlug === "image-convert" && index === 1
                ? <>HEIC·AVIF<br />이미지 변환기</>
                : currentLocale === "ko" && categorySlug === "image-convert" && index === 2
                  ? <>SVG·BMP·TIFF<br />이미지 변환기</>
                  : currentLocale === "ko" && categorySlug === "image-convert" && index === 4
                    ? <>목표 용량<br />이미지 압축기</>
                    : tool.title[currentLocale];
            const body = (
              <>
                <div className="toolbox-subpage-card-top"><span>{(categorySlug === "content-image" || categorySlug === "pdf" || categorySlug === "text" || categorySlug === "date-time" || categorySlug === "unit-calc" || categorySlug === "business-finance") ? String(toolNumber).padStart(3, "0") : String(toolNumber).padStart(2, "0")}</span><small>{tool.active ? "LIVE" : "NEXT"}</small></div>
                <div><h2>{cardTitle}</h2>{tool.description[currentLocale] ? <p>{tool.description[currentLocale]}</p> : null}</div>
                <div className="toolbox-subpage-card-foot"><b>{tool.active ? open : preparing}</b><i>↗</i></div>
              </>
            );
            const cardClassName = `toolbox-subpage-card ${index === 0 ? "is-featured" : ""} ${categorySlug === "content-image" && index === 0 ? "is-tool019-featured" : ""}`.trim();
            return tool.active && tool.href ? <Link className={cardClassName} href={tool.href} key={tool.title[currentLocale]}>{body}</Link> : <article className={cardClassName} key={tool.title[currentLocale]}>{body}</article>;
          })}
        </div>
      </section>

      <section className="toolbox-category-guide" aria-labelledby="category-guide-title">
        <div className="toolbox-category-guide-inner">
          <div className="toolbox-category-guide-head">
            <p>{usageCopy.eyebrow}</p>
            <h2 id="category-guide-title">{currentLocale === "ko" && categorySlug === "image-convert" ? <>이미지 변환<br />최적화 도구 사용 방법</> : usageCopy.title}</h2>
            <span>{usageCopy.description}</span>
          </div>
          <div className="toolbox-category-guide-grid">
            {usageCopy.points.map(([title, description], index) => (
              <article key={title}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-category-expert-post" aria-labelledby="category-expert-title">
        <div className="toolbox-tool-format-guide-head">
          <p>{expertCopy.eyebrow}</p>
          <h2 id="category-expert-title">{expertCopy.title}</h2>
          <span>{expertCopy.description}</span>
        </div>
        <div className="toolbox-tool-format-body">
          <div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">
            {expertCopy.points.map(([title, description]) => (
              <article key={title}>
                <h4>{title}</h4>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="toolbox-faq-section toolbox-category-faq">
        <div className="toolbox-faq-head"><p>{faqCopy.eyebrow}</p><h2>{faqCopy.title}</h2></div>
        <ToolboxFaqList items={faqCopy.items} initialCount={4} moreLabel={faqCopy.more} collapseLabel={faqCopy.collapse} />
      </section>
    </ToolboxSubpageShell>
  );
}
