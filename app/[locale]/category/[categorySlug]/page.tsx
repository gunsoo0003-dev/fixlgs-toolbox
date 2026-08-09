import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { categories, getCategoryToolCards, locales, type Locale } from "@/lib/site";

export function generateStaticParams() {
  return locales.flatMap((locale) => categories.map((category) => ({ locale, categorySlug: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; categorySlug: string }> }): Promise<Metadata> {
  const { locale, categorySlug } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const foundCategory = categories.find((item) => item.slug === categorySlug);
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
  const foundCategory = categories.find((item) => item.slug === categorySlug);
  if (!foundCategory) notFound();
  const category = foundCategory!;
  const toolCards = getCategoryToolCards(categorySlug, currentLocale);
  const back = currentLocale === "ko" ? "전체 카테고리" : currentLocale === "en" ? "All categories" : "すべてのカテゴリー";
  const label = currentLocale === "ko" ? "카테고리 도구" : currentLocale === "en" ? "CATEGORY TOOLS" : "カテゴリーツール";
  const open = currentLocale === "ko" ? "도구 열기" : currentLocale === "en" ? "OPEN TOOL" : "ツールを開く";
  const preparing = currentLocale === "ko" ? "준비 중" : currentLocale === "en" ? "COMING SOON" : "準備中";
  const expertCopy = (() => {
    if (categorySlug === "image-convert") {
      return currentLocale === "ko" ? {
        eyebrow: "EXPERT CATEGORY GUIDE", title: "이미지 변환·최적화의 핵심 원리",
        description: "이미지 형식, 압축 방식, 픽셀 크기와 메타데이터는 서로 다른 문제입니다. 작업 목적에 따라 변환·압축·크기 변경·웹 최적화 도구를 구분해야 품질과 용량을 동시에 관리할 수 있습니다.",
        points: [["손실과 무손실 압축","JPEG와 손실 WebP는 용량을 줄이는 대신 일부 화상 정보를 버립니다. PNG는 투명도와 선명한 경계를 유지하기 좋지만 사진에서는 용량이 커질 수 있습니다."],["형식 선택 기준","사진은 JPEG·WebP, 투명 배경과 UI 그래픽은 PNG·WebP, 최신 웹 전달은 AVIF·WebP가 적합할 수 있습니다. 다만 실제 지원 환경을 먼저 확인해야 합니다."],["픽셀과 파일 용량","가로·세로 픽셀 수는 해상도이고 KB·MB는 인코딩 결과입니다. 같은 픽셀 크기라도 형식·품질·색상 복잡도에 따라 용량은 크게 달라집니다."],["재인코딩과 화질","형식 변환이나 크기 변경은 대부분 새로 인코딩합니다. 손실 형식을 반복 저장하면 블록·번짐·경계 손상이 누적될 수 있습니다."],["메타데이터와 색상","EXIF·GPS·ICC 프로필은 화면 픽셀과 별개입니다. 브라우저 재인코딩 과정에서 메타데이터가 제거되거나 색 표현이 달라질 수 있습니다."],["도구 역할 구분","형식만 바꾸려면 변환기, 용량을 줄이려면 압축기, 픽셀을 바꾸려면 크기 변경기, 웹 전달 전체를 정리하려면 웹 최적화기를 사용합니다."]] as [string,string][],
      } : currentLocale === "en" ? {
        eyebrow: "EXPERT CATEGORY GUIDE", title: "Core principles of image conversion and optimization",
        description: "File format, compression, pixel dimensions, and metadata are separate concerns. Choose conversion, compression, resizing, or web optimization according to the actual delivery goal.",
        points: [["Lossy and lossless compression","JPEG and lossy WebP discard image information to reduce size. PNG preserves transparency and crisp edges but can be inefficient for photographs."],["Choosing a format","JPEG or WebP often suits photos, PNG or WebP suits transparency and interface graphics, and AVIF or WebP can improve web delivery when support is confirmed."],["Pixels versus file size","Dimensions describe resolution; KB and MB are encoding results. Identical dimensions can produce very different sizes depending on format, quality, and image complexity."],["Re-encoding and quality","Conversion and resizing usually re-encode the image. Repeatedly saving lossy formats can accumulate blocking, smearing, and edge damage."],["Metadata and color","EXIF, GPS, and ICC profiles are separate from visible pixels. Browser re-encoding may remove metadata or change color appearance."],["Tool boundaries","Use a converter for format changes, a compressor for file size, a resizer for dimensions, and a web optimizer for a complete delivery workflow."]] as [string,string][],
      } : {
        eyebrow: "EXPERT CATEGORY GUIDE", title: "画像変換・最適化の基本原理",
        description: "画像形式、圧縮方式、ピクセルサイズ、メタデータは別の問題です。目的に応じて変換・圧縮・サイズ変更・Web最適化を使い分ける必要があります。",
        points: [["非可逆圧縮と可逆圧縮","JPEGや非可逆WebPは情報を一部削除して容量を減らします。PNGは透明度や輪郭を保ちやすい反面、写真では容量が大きくなりやすい形式です。"],["形式の選び方","写真はJPEG・WebP、透明背景やUI素材はPNG・WebP、最新Web配信は対応環境を確認した上でAVIF・WebPが候補になります。"],["ピクセルと容量","縦横ピクセルは解像度、KB・MBはエンコード結果です。同じサイズでも形式・画質・色の複雑さで容量は大きく変わります。"],["再エンコードと画質","形式変換やサイズ変更では多くの場合再エンコードされます。非可逆形式を繰り返し保存すると劣化が蓄積します。"],["メタデータと色","EXIF・GPS・ICCプロファイルは表示ピクセルとは別です。ブラウザでの再保存時に削除されたり色が変わる場合があります。"],["ツールの役割","形式変更は変換、容量削減は圧縮、ピクセル変更はサイズ変更、Web配信全体は最適化ツールを使用します。"]] as [string,string][],
      };
    }
    if (categorySlug === "image-edit") {
      return currentLocale === "ko" ? {
        eyebrow: "EXPERT CATEGORY GUIDE", title: "브라우저 이미지 편집의 핵심 원리",
        description: "자르기·회전·색상 보정은 화면에서 보이는 변화뿐 아니라 좌표, 재샘플링, 재인코딩, 투명도와 메타데이터 처리까지 함께 이해해야 결과를 예측할 수 있습니다.",
        points: [["비파괴 편집과 출력","편집 중에는 원본을 바꾸지 않고 설정값만 유지합니다. 다운로드할 때 새 픽셀 결과를 생성하므로 원본 파일은 그대로 남습니다."],["자르기와 종횡비","자르기는 좌표 영역을 줄이고, 고정 비율은 출력의 가로세로 관계를 제한합니다. 작은 영역을 선택할수록 최종 픽셀 수도 줄어듭니다."],["회전과 EXIF 방향","사진의 표시 방향은 EXIF 태그일 수 있습니다. 편집기는 이를 먼저 정상화한 뒤 회전해야 이중 회전을 막을 수 있습니다."],["보간과 반복 저장","회전·확대·축소는 픽셀을 다시 계산합니다. 반복 편집과 손실 저장은 경계 흐림과 압축 손상을 누적시킬 수 있습니다."],["색상 보정의 차이","밝기는 전체 명도, 대비는 명암 차이, 채도는 색 강도, 색온도는 청색·황색 균형, 선명도는 가장자리 대비를 조절합니다."],["투명도와 메모리","PNG·WebP 투명도는 알파 채널로 유지됩니다. 고해상도 이미지는 디코딩 후 메모리 사용량이 크게 늘어나므로 모바일에서는 안전 한도가 필요합니다."]] as [string,string][],
      } : currentLocale === "en" ? {
        eyebrow: "EXPERT CATEGORY GUIDE", title: "Core principles of browser image editing",
        description: "Cropping, rotation, and color adjustment affect coordinates, resampling, re-encoding, transparency, and metadata—not only what appears on screen.",
        points: [["Non-destructive editing","The source file stays unchanged while settings are edited. Export creates a new pixel result, preserving the original."],["Crop and aspect ratio","Cropping reduces a coordinate area; a fixed ratio constrains width and height. Smaller crop areas produce fewer output pixels."],["Rotation and EXIF orientation","A photo may rely on EXIF orientation. The editor must normalize it before further rotation to avoid double rotation."],["Resampling and repeated saves","Rotation and scaling recalculate pixels. Repeated edits and lossy saves can accumulate blur and compression artifacts."],["Adjustment differences","Brightness changes overall lightness, contrast changes tonal separation, saturation changes color strength, temperature shifts blue-yellow balance, and sharpness boosts edge contrast."],["Transparency and memory","PNG and WebP transparency uses an alpha channel. High-resolution images consume much more memory after decoding, so mobile limits are necessary."]] as [string,string][],
      } : {
        eyebrow: "EXPERT CATEGORY GUIDE", title: "ブラウザ画像編集の基本原理",
        description: "切り抜き・回転・色補正は見た目だけでなく、座標、再サンプリング、再エンコード、透明度、メタデータにも影響します。",
        points: [["非破壊編集と出力","編集中は元ファイルを変更せず設定値だけを保持します。保存時に新しいピクセル結果を生成するため、元画像は残ります。"],["切り抜きと縦横比","切り抜きは座標範囲を減らし、固定比率は縦横の関係を制限します。範囲が小さいほど出力ピクセルも減ります。"],["回転とEXIF方向","写真の向きがEXIFタグで指定されている場合があります。先に正規化してから回転しないと二重回転が起こります。"],["再サンプリングと再保存","回転や拡大縮小ではピクセルを再計算します。繰り返し編集と非可逆保存はぼけや圧縮劣化を蓄積します。"],["色補正の違い","明るさは全体の明度、コントラストは明暗差、彩度は色の強さ、色温度は青黄バランス、シャープネスは輪郭のコントラストを調整します。"],["透明度とメモリ","PNG・WebPの透明度はアルファチャンネルで保持されます。高解像度画像は展開後のメモリ使用量が大きいため、モバイルでは安全上限が必要です。"]] as [string,string][],
      };
    }
    return currentLocale === "ko" ? { eyebrow:"CATEGORY GUIDE", title:category.titles[currentLocale], description:`${category.descriptions[currentLocale]} 필요한 작업에 맞는 도구를 선택해 바로 사용할 수 있습니다.`, points:[["빠른 선택","목적에 맞는 도구를 한 화면에서 비교하고 선택합니다."],["간단한 사용","복잡한 설치나 회원가입 없이 각 도구를 바로 시작합니다."],["안전한 처리","가능한 작업은 브라우저 안에서 처리하며 방식은 도구별로 안내합니다."]] as [string,string][] } : currentLocale === "en" ? { eyebrow:"CATEGORY GUIDE", title:category.titles[currentLocale], description:`${category.descriptions[currentLocale]} Choose the tool that matches your task and start right away.`, points:[["Choose quickly","Compare the tools for your task on one clear page."],["Start simply","Open each tool without complicated setup or registration."],["Process safely","Whenever possible, work stays in your browser and each tool explains how it is handled."]] as [string,string][] } : { eyebrow:"CATEGORY GUIDE", title:category.titles[currentLocale], description:`${category.descriptions[currentLocale]} 目的に合うツールを選び、すぐに利用できます。`, points:[["すばやく選択","目的に合うツールをひとつの画面で比較して選べます。"],["かんたんに開始","複雑な設定や会員登録なしで各ツールをすぐに使えます。"],["安全に処理","可能な処理はブラウザ内で行い、詳細は各ツールページで案内します。"]] as [string,string][] };
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
      : currentLocale === "ko"
        ? { eyebrow: "HOW TO USE", title: `${category.titles[currentLocale]} 사용 방법`, description: "목적에 맞는 도구를 선택하고 안내 순서에 따라 작업을 완료하세요.", points: [["도구 선택", "카테고리 안에서 필요한 기능을 제공하는 도구를 선택합니다."], ["작업 실행", "도구 페이지의 입력과 설정 안내에 따라 작업합니다."], ["결과 확인", "처리 결과와 주의사항을 확인한 뒤 저장하거나 다음 작업으로 이동합니다."]] as [string,string][] }
        : currentLocale === "en"
          ? { eyebrow: "HOW TO USE", title: `How to use ${category.titles[currentLocale]}`, description: "Choose the tool for your task and complete the work in the guided order.", points: [["Choose a tool", "Select the tool that provides the function you need."], ["Run the task", "Follow the input and settings shown on the tool page."], ["Review the result", "Check the result and notes before saving or moving to the next task."]] as [string,string][] }
          : { eyebrow: "HOW TO USE", title: `${category.titles[currentLocale]}の使い方`, description: "目的に合うツールを選び、案内順に作業します。", points: [["ツールを選択", "必要な機能を提供するツールを選びます。"], ["作業を実行", "ツールページの入力と設定案内に従って作業します。"], ["結果を確認", "結果と注意事項を確認して保存または次の作業へ進みます。"]] as [string,string][] };

  const faqCopy = currentLocale === "ko" ? {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]} 자주 묻는 질문`, more: "FAQ 더보기", collapse: "FAQ 접기",
    items: [["이 카테고리에는 어떤 도구가 있나요?", `${category.titles[currentLocale]}에 필요한 도구를 한곳에서 확인할 수 있으며, 준비가 끝난 도구부터 순차적으로 사용할 수 있습니다.`], ["카테고리의 도구는 모두 무료인가요?", "현재 제공되는 기본 도구는 무료로 사용할 수 있습니다."], ["회원가입 없이 사용할 수 있나요?", "네. 별도 회원가입 없이 각 도구 페이지에서 바로 사용할 수 있습니다."], ["모바일에서도 사용할 수 있나요?", "네. 휴대전화와 태블릿에서도 사용할 수 있도록 화면이 조정됩니다."], ["파일은 어디에서 처리되나요?", "가능한 도구는 브라우저 내부에서 처리하며, 정확한 처리 방식은 각 도구 페이지에서 안내합니다."], ["원하는 도구가 아직 준비 중이면 어떻게 하나요?", "도구는 순차적으로 추가됩니다. 필요한 기능은 페이지 하단의 문의하기를 통해 제안할 수 있습니다."]] as [string,string][]
  } : currentLocale === "en" ? {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]} FAQs`, more: "View more FAQs", collapse: "Show fewer FAQs",
    items: [["What tools are included in this category?", `This page collects tools related to ${category.titles[currentLocale]}. Available tools can be opened as soon as they are ready.`], ["Are all tools in this category free?", "The basic tools currently provided are free to use."], ["Can I use them without an account?", "Yes. You can open each tool directly without registration."], ["Can I use these tools on mobile devices?", "Yes. The pages adapt to phones and tablets."], ["Where are files processed?", "Whenever possible, files are processed in your browser. Each tool page explains its exact processing method."], ["What if a tool I need is still coming soon?", "Tools are added step by step. You can suggest a needed feature through the contact link in the footer."]] as [string,string][]
  } : {
    eyebrow: "CATEGORY FAQ", title: `${category.titles[currentLocale]}のよくある質問`, more: "FAQをもっと見る", collapse: "FAQを閉じる",
    items: [["このカテゴリーにはどのようなツールがありますか？", `${category.titles[currentLocale]}に関連するツールをまとめて確認でき、準備が完了したものから順次利用できます。`], ["カテゴリー内のツールはすべて無料ですか？", "現在提供している基本ツールは無料で利用できます。"], ["会員登録なしで利用できますか？", "はい。会員登録なしで各ツールページからすぐに利用できます。"], ["モバイルでも利用できますか？", "はい。スマートフォンやタブレットに合わせて画面が調整されます。"], ["ファイルはどこで処理されますか？", "可能なツールはブラウザ内で処理し、詳細な処理方法は各ツールページで案内します。"], ["必要なツールが準備中の場合はどうすればよいですか？", "ツールは順次追加されます。必要な機能はフッターのお問い合わせから提案できます。"]] as [string,string][]
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
            const toolNumber = categorySlug === "image-edit" ? index + 8 : categorySlug === "content-image" ? index + 19 : index + 1;
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
              : currentLocale === "ko" && categorySlug === "image-convert" && index === 1
                ? <>HEIC·AVIF<br />이미지 변환기</>
                : currentLocale === "ko" && categorySlug === "image-convert" && index === 2
                  ? <>SVG·BMP·TIFF<br />이미지 변환기</>
                  : currentLocale === "ko" && categorySlug === "image-convert" && index === 4
                    ? <>목표 용량<br />이미지 압축기</>
                    : tool.title[currentLocale];
            const body = (
              <>
                <div className="toolbox-subpage-card-top"><span>{categorySlug === "content-image" ? String(toolNumber).padStart(3, "0") : String(toolNumber).padStart(2, "0")}</span><small>{tool.active ? "LIVE" : "NEXT"}</small></div>
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
