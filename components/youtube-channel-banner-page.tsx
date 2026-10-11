import { ToolNavigation } from "@/components/tool-navigation";
import Link from "next/link";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { YoutubeChannelBannerTool } from "./youtube-channel-banner-tool";
import type { Locale } from "@/lib/site";

const copy = {
  ko: {
    title: "유튜브 채널 배너 제작기",
    desc: "PC·모바일·TV 안전영역을 확인하며 유튜브 채널 배너를 브라우저에서 바로 만들어 다운로드하세요.",
    back: "콘텐츠 이미지 제작",
    steps: [
      "배경 이미지를 선택하거나 빈 배너로 시작합니다.",
      "제목과 로고를 배치하고 안전영역 안에 중요한 내용을 맞춥니다.",
      "TV·PC·모바일 미리보기와 파일 크기를 확인한 뒤 배너를 다운로드합니다.",
    ],
    examples: [
      ["개인 유튜브 채널 브랜딩", "채널명과 대표 문구를 중앙 안전영역에 두고, 프로필 이미지와 함께 보았을 때도 브랜드 인상이 유지되도록 배너를 구성할 수 있습니다."],
      ["기업·브랜드 채널 배너", "로고와 핵심 슬로건을 안전영역 안에 정리해 PC·모바일·TV에서 중요한 정보가 잘리지 않는지 확인할 수 있습니다."],
      ["게임 채널", "게임 이미지나 캐릭터를 넓은 배경으로 활용하면서 채널명과 업로드 성격을 중앙에 집중해 다양한 화면에서 가독성을 유지할 수 있습니다."],
      ["여행·브이로그 채널", "풍경 사진을 배경으로 사용하고 제목과 로고 위치를 조정해 사진의 분위기와 채널 정보를 함께 살릴 수 있습니다."],
      ["교육·강의 채널", "과목명·강의 주제·운영 주체를 한 화면에 정리하되 핵심 문구를 안전영역 안에 유지해 작은 화면에서도 읽기 쉽게 구성할 수 있습니다."],
      ["업로드 일정 표시 배너", "정기 업로드 요일이나 콘텐츠 주기를 제목에 포함하고 기기별 미리보기로 실제 노출 범위를 확인할 수 있습니다."],
    ],
    expert: [
      ["2560×1440 작업 캔버스의 의미", "권장 작업 캔버스는 2560×1440의 16:9 비율입니다. 배경 이미지는 이 캔버스를 채우도록 배치되지만 원본 사진 자체가 16:9일 필요는 없습니다. 세로 사진이나 다른 비율의 사진은 원본 비율을 유지한 채 일부가 잘릴 수 있으므로 미리보기에서 주요 피사체 위치를 확인하는 것이 좋습니다."],
      ["안전영역은 제목과 로고의 기준선", "채널 배너는 기기별로 보이는 범위가 달라질 수 있으므로 제목·로고·핵심 문구는 중앙 안전영역 안에 두는 것이 가장 안정적입니다. 배경 장식이나 넓은 사진은 바깥 영역까지 사용할 수 있지만, 반드시 읽혀야 하는 정보는 안전영역을 기준으로 배치하는 편이 좋습니다."],
      ["TV·PC·모바일 미리보기의 역할", "미리보기 모드는 디자인 좌표를 바꾸는 기능이 아니라 같은 원본 배너가 각 화면에서 어느 범위까지 보일 수 있는지 확인하는 보기 기능입니다. 한 모드에서 보기 좋다고 끝내지 말고 PC와 모바일에서 제목이나 로고가 잘리지 않는지 함께 확인하는 것이 좋습니다."],
      ["배경 확대와 위치 이동", "배경 확대는 빈 공간을 없애거나 주요 피사체를 강조할 때 유용하지만 지나치게 확대하면 원본 해상도 부족이 더 눈에 띌 수 있습니다. 먼저 전체 구도를 맞춘 뒤 X·Y 위치를 조정하고, 마지막에 필요한 만큼만 확대하는 순서가 안정적입니다."],
      ["제목은 중앙 배치만이 정답은 아닙니다", "제목 정렬은 배경 피사체와 로고 위치에 따라 달라질 수 있습니다. 중앙 정렬은 안정적이지만 인물이 한쪽에 있거나 로고를 함께 사용할 때는 좌우 정렬이 더 자연스러울 수 있습니다. 중요한 것은 정렬 방식보다 안전영역 안에서 충분한 여백과 대비를 확보하는 것입니다."],
      ["로고 크기와 여백", "로고는 크게 보이는 것보다 작은 화면에서도 형태를 알아볼 수 있고 제목과 경쟁하지 않는 크기가 중요합니다. 로고 주변에 여백을 남기고 제목과 겹치지 않게 배치한 뒤 모바일 미리보기에서 식별 가능한지 확인하는 것이 좋습니다."],
      ["JPG와 PNG 선택 기준", "사진 중심 배너는 JPG가 파일 용량을 줄이기 쉬운 편이고, 단색 그래픽이나 선명한 로고·글자 경계를 중요하게 볼 때는 PNG가 유리할 수 있습니다. PNG는 사진 배경에서 파일이 크게 나올 수 있으므로 실제 생성 용량을 확인해 형식을 선택하세요."],
      ["6MB 제한은 실제 결과로 확인", "파일 용량은 화면 구성만으로 정확히 예측하기 어렵기 때문에 실제로 생성된 Blob 크기를 기준으로 확인해야 합니다. JPG 품질을 조정하거나 6MB 이하 맞추기를 사용한 뒤에도 다운로드 전에 해상도·형식·품질과 최종 파일 크기를 함께 확인하는 것이 안전합니다."],
    ],
    notes: [
      "같은 배너라도 기기와 화면에 따라 서로 다른 범위가 잘려 보일 수 있습니다.",
      "중요한 제목과 로고는 안전영역 안에 배치하는 것이 좋습니다.",
      "YouTube 배너 규격과 업로드 제한은 변경될 수 있으므로 업로드 전 최신 공식 안내를 확인하세요.",
      "배너 전체에 별도의 프레임·테두리 장식을 추가하는 기능은 제공하지 않습니다.",
      "업로드한 이미지와 로고의 저작권·사용 권한은 사용자가 확인해야 합니다.",
      "사진형 배경에서는 PNG가 JPG보다 파일 용량이 커질 수 있습니다.",
    ],
    faqs: [
      ["권장 배너 크기는 얼마인가요?", "현재 작업 캔버스는 2560×1440px이며, YouTube 최소 업로드 규격은 2048×1152px입니다."],
      ["안전영역은 무엇인가요?", "YouTube가 최소 규격에서 안내하는 1235×338px 텍스트·로고 안전영역 비율을 2560×1440 작업 화면에 맞춰 표시합니다."],
      ["왜 TV·PC·모바일 미리보기가 다른가요?", "같은 채널 배너도 기기와 화면에 따라 서로 다른 범위가 잘려 표시될 수 있기 때문입니다."],
      ["이미지가 서버에 업로드되나요?", "아니요. 지원되는 편집과 출력은 브라우저 안에서 처리하며 이미지·로고·제목을 FIXLGS 서버에 저장하지 않습니다."],
      ["6MB를 넘으면 어떻게 하나요?", "JPG 품질을 낮추거나 6MB 이하 맞추기 기능을 사용해 실제 생성 파일 크기를 다시 확인할 수 있습니다."],
      ["세로 사진도 사용할 수 있나요?", "가능합니다. 원본 비율을 늘여 찌그러뜨리지 않고 16:9 배너를 채우도록 잘라 배치합니다."],
      ["다운로드 후 다시 수정할 수 있나요?", "현재 편집 상태를 유지한 채 설정을 바꾸고 다시 다운로드할 수 있습니다."],
    ],
  },
  en: {
    title: "YouTube Channel Banner Maker",
    desc: "Create and download a YouTube channel banner while checking desktop, mobile, TV and safe-area previews.",
    back: "Content Image Creation",
    steps: ["Choose a background image or start with a blank banner.", "Place the title and logo, keeping important content inside the safe area.", "Check TV, desktop and mobile previews and file size, then download the banner."],
    examples: [
      ["Personal channel branding", "Place the channel name and primary message inside the central safe area so the brand remains recognizable alongside the profile image across device views."],
      ["Company and brand channels", "Arrange the logo and core slogan inside the safe area and check that essential information remains visible on desktop, mobile, and TV."],
      ["Gaming channels", "Use game artwork or characters as a wide background while keeping the channel name and content focus centered for reliable readability across screens."],
      ["Travel and vlog channels", "Use a landscape photo as the background and adjust title and logo placement so the image mood and channel identity remain balanced."],
      ["Education and course channels", "Organize the subject, course theme, and publisher in one banner while keeping essential text inside the safe area for smaller displays."],
      ["Upload-schedule banners", "Include recurring upload days or content cadence in the title and verify the actual visible range with device previews."],
    ],
    expert: [
      ["What the 2560×1440 workspace means", "The recommended working canvas is 2560×1440 at 16:9. The source photo itself does not need to be 16:9; portrait or other aspect ratios can be cropped while preserving their original proportions, so check the key subject position in preview."],
      ["Use the safe area for essential content", "Because a channel banner can be cropped differently across devices, titles, logos, and essential messages are most reliable inside the centered safe area. Decorative backgrounds may extend beyond it, but information that must remain readable should stay inside."],
      ["What device previews are for", "TV, desktop, and mobile previews do not change the design coordinates. They show how the same source banner may be cropped in different views. Check more than one preview before export so titles and logos are not unexpectedly clipped."],
      ["Background zoom and positioning", "Zoom is useful for removing empty edges or emphasizing a subject, but excessive enlargement can expose limited source resolution. Set the overall composition first, adjust X and Y position, and then apply only the zoom that is necessary."],
      ["Center alignment is not always best", "Title alignment depends on the subject and logo placement. Center alignment is stable, while left or right alignment can work better when a person or logo occupies one side. The priority is adequate spacing and contrast inside the safe area."],
      ["Logo size and breathing room", "A logo does not need to be large; it needs to remain recognizable on smaller screens without competing with the title. Leave space around it, avoid title overlap, and verify recognition in the mobile preview."],
      ["Choosing JPG or PNG", "JPG is generally more efficient for photo-heavy banners, while PNG can preserve crisp logos, text, and flat graphics. PNG may become much larger with photographic backgrounds, so compare the measured result before choosing the format."],
      ["Verify the 6 MB limit from the result", "File size should be checked from the generated Blob rather than estimated from the design. After adjusting JPG quality or using the fit-under-6-MB helper, confirm resolution, format, quality, and the final measured size before downloading."],
    ],
    notes: [
      "The same banner can be cropped differently depending on the device and view.",
      "Keep important titles and logos inside the safe area.",
      "YouTube banner specifications and upload limits can change, so check the latest official guidance before uploading.",
      "The tool does not add a decorative frame or border around the entire banner.",
      "You are responsible for the rights to uploaded images and logos.",
      "PNG can be much larger than JPG with photographic backgrounds.",
    ],
    faqs: [
      ["What size is recommended?", "The workspace is 2560×1440 px, while YouTube's minimum upload size is 2048×1152 px."],
      ["What is the safe area?", "The tool scales YouTube's 1235×338 px text-and-logo safe area at the minimum canvas to the 2560×1440 workspace."],
      ["Why do device previews differ?", "The same channel banner may be cropped differently depending on the device and view."],
      ["Are images uploaded?", "No. Supported editing and export are processed in your browser, and images, logos and titles are not stored on the FIXLGS server."],
      ["What if the result exceeds 6 MB?", "Lower JPG quality or use the fit-under-6-MB helper, then check the measured generated file size again."],
      ["Can I use a portrait photo?", "Yes. The source aspect ratio is preserved and the photo is cropped to cover the 16:9 banner without stretching."],
      ["Can I edit after downloading?", "Yes. Keep editing the current state and download again after changing settings."],
    ],
  },
  ja: {
    title: "YouTubeチャンネルバナー作成ツール",
    desc: "PC・モバイル・TVの表示範囲とセーフエリアを確認しながらYouTubeチャンネルバナーを作成できます。",
    back: "コンテンツ画像作成",
    steps: ["背景画像を選択するか、空のバナーから開始します。", "タイトルとロゴを配置し、重要な内容をセーフエリア内に収めます。", "テレビ・PC・モバイルのプレビューとファイルサイズを確認してダウンロードします。"],
    examples: [
      ["個人チャンネルのブランディング", "チャンネル名と主要メッセージを中央のセーフエリアに配置し、プロフィール画像と一緒に表示されてもブランドの印象が保たれるように構成できます。"],
      ["企業・ブランドチャンネル", "ロゴと主要なスローガンをセーフエリア内に整理し、PC・モバイル・TVで重要な情報が切れないか確認できます。"],
      ["ゲームチャンネル", "ゲーム画像やキャラクターを広い背景として使いながら、チャンネル名と内容の特徴を中央に集め、さまざまな画面で読みやすくできます。"],
      ["旅行・Vlogチャンネル", "風景写真を背景に使い、タイトルとロゴの位置を調整して写真の雰囲気とチャンネル情報を両立できます。"],
      ["教育・講座チャンネル", "科目名・講座テーマ・運営者を1枚に整理し、重要な文言をセーフエリア内に保って小さい画面でも読みやすくできます。"],
      ["投稿スケジュール用バナー", "定期投稿の曜日やコンテンツ周期をタイトルに含め、端末別プレビューで実際の表示範囲を確認できます。"],
    ],
    expert: [
      ["2560×1440作業キャンバスの意味", "推奨作業キャンバスは2560×1440の16:9です。背景画像そのものが16:9である必要はなく、縦長写真や別比率の画像も元の比率を保ったまま一部を切り取って配置できるため、主要な被写体の位置をプレビューで確認します。"],
      ["重要な内容はセーフエリアを基準にする", "チャンネルバナーは端末によって表示範囲が変わるため、タイトル・ロゴ・主要メッセージは中央のセーフエリア内に置くと安定します。背景装飾は外側まで使えますが、必ず読ませたい情報は内側に配置します。"],
      ["TV・PC・モバイルプレビューの役割", "各プレビューモードはデザイン座標を変更する機能ではなく、同じ元バナーが端末ごとにどの範囲まで表示されるかを確認する表示機能です。保存前に複数の表示でタイトルやロゴが切れないか確認します。"],
      ["背景の拡大と位置調整", "背景の拡大は余白をなくしたり主要な被写体を強調したりするのに便利ですが、拡大しすぎると元画像の解像度不足が目立つ場合があります。構図、X・Y位置、最後に必要な拡大率の順で調整すると安定します。"],
      ["タイトルは中央揃えだけが正解ではありません", "タイトルの配置は背景の被写体やロゴ位置によって変わります。中央揃えは安定していますが、人物やロゴが片側にある場合は左右揃えの方が自然なこともあります。セーフエリア内の余白とコントラストを優先します。"],
      ["ロゴサイズと余白", "ロゴは大きさよりも小さい画面で形を認識でき、タイトルと競合しないことが重要です。周囲に余白を残し、タイトルと重ならないようにしてモバイルプレビューでも確認します。"],
      ["JPGとPNGの選び方", "写真中心のバナーはJPGが容量を抑えやすく、単色グラフィックやロゴ・文字の輪郭を重視する場合はPNGが向いています。写真背景のPNGは大きくなりやすいため、実際の生成容量を確認して選びます。"],
      ["6MB上限は実際の結果で確認", "ファイルサイズはデザインだけでは正確に予測できないため、実際に生成したBlobのサイズで確認します。JPG画質や6MB以下調整を使用した後も、保存前に解像度・形式・画質・最終容量を確認します。"],
    ],
    notes: [
      "同じバナーでも端末や表示方法によって切り取られる範囲が異なる場合があります。",
      "重要なタイトルとロゴはセーフエリア内に配置することをおすすめします。",
      "YouTubeのバナー仕様やアップロード上限は変更される場合があるため、アップロード前に最新の公式案内を確認してください。",
      "バナー全体を囲む装飾フレームや枠線を追加する機能は提供しません。",
      "アップロードする画像やロゴの著作権・使用権は利用者が確認してください。",
      "写真背景ではPNGがJPGより大きくなる場合があります。",
    ],
    faqs: [
      ["推奨サイズは？", "作業キャンバスは2560×1440pxで、YouTubeの最小アップロードサイズは2048×1152pxです。"],
      ["セーフエリアとは？", "最小規格で案内される1235×338pxの文字・ロゴ用セーフエリア比率を2560×1440の作業画面に合わせて表示します。"],
      ["端末ごとにプレビューが違うのはなぜ？", "同じチャンネルバナーでも端末や表示方法によって異なる範囲が切り取られる場合があるためです。"],
      ["画像はサーバーに送信されますか？", "いいえ。対応する編集と出力はブラウザ内で処理し、画像・ロゴ・タイトルをFIXLGSサーバーに保存しません。"],
      ["6MBを超えた場合は？", "JPGの画質を下げるか6MB以下に調整する機能を使い、実際に生成したファイルサイズを再確認できます。"],
      ["縦長の写真も使えますか？", "はい。元画像の比率を変形せず、16:9のバナーを埋めるように切り取って配置します。"],
      ["ダウンロード後も編集できますか？", "はい。現在の編集状態を維持したまま設定を変更し、再度ダウンロードできます。"],
    ],
  },
} as const;

export function YoutubeChannelBannerPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const relatedLabel = locale === "ko" ? "관련 도구" : locale === "ja" ? "関連ツール" : "Related tools";
  const nextLabel = locale === "ko" ? "다음 작업" : locale === "ja" ? "次のツール" : "Next tool";
  const available = locale === "ko" ? "사용 가능" : locale === "ja" ? "利用可能" : "AVAILABLE";
  const related = [
    ["019", locale === "ko" ? "유튜브 썸네일 제작기" : locale === "ja" ? "YouTubeサムネイル作成ツール" : "YouTube Thumbnail Maker", "youtube-thumbnail-maker"],
    ["016", locale === "ko" ? "이미지에 글자 넣기" : locale === "ja" ? "画像文字入れツール" : "Add Text to Image", "add-text-to-image"],
    ["017", locale === "ko" ? "이미지 워터마크 넣기" : locale === "ja" ? "画像ウォーターマーク追加ツール" : "Add Watermark to Images", "image-watermark-tool"],
    ["011", locale === "ko" ? "이미지 여백·배경 추가기" : locale === "ja" ? "画像余白・背景追加ツール" : "Image Padding & Background Tool", "image-padding-background-tool"],
  ] as const;
  const url = `https://toolbox.fixlgs.com/${locale}/youtube-channel-banner-maker`;
  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: t.title, url, applicationCategory: "MultimediaApplication", operatingSystem: "Any", description: t.desc, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` }, { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/content-image` }, { "@type": "ListItem", position: 3, name: t.title, item: url }] }) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }) }} />

    <section className="toolbox-tool-detail-hero tool020-detail-hero">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/content-image`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">020 · CONTENT IMAGE</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{locale === "ko" ? "브라우저에서 바로 처리" : locale === "en" ? "PROCESS IN YOUR BROWSER" : "ブラウザ内で処理"}</span></div>
    </section>

    <section className="toolbox-tool-detail-body"><div>
      <YoutubeChannelBannerTool locale={locale} />
      <ToolNavigation locale={locale} currentTool={20} />
      
    </div></section>

    <section className="toolbox-tool-guide"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{locale === "ko" ? "사용 방법" : locale === "en" ? "How to use" : "使い方"}</h2></div><ol>{t.steps.map((x, i) => <li key={x}><span>{String(i + 1).padStart(2, "0")}</span><p>{x}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide toolbox-tool-use-cases--editorial tool020-use-cases"><div className="toolbox-tool-format-guide-head"><p>USE CASES</p><h2>{locale === "ko" ? "활용 예시" : locale === "en" ? "Use cases" : "活用例"}</h2></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.examples.map(([title, description], i) => <article key={title}><strong>{String(i + 1).padStart(2, "0")}</strong><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
    <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy tool020-expert-post">
      <div className="toolbox-tool-format-guide-head"><p>EXPERT POST</p><h2>{locale === "ko" ? <>유튜브 채널 배너를<br/>안정적으로 만드는 실전 기준</> : locale === "ja" ? "YouTubeチャンネルバナーを安定して作る実践基準" : "Practical standards for reliable YouTube channel banners"}</h2><span>{locale === "ko" ? "기기별 노출 범위부터 안전영역·배경 배치·제목과 로고·출력 형식·실제 파일 용량까지, 채널 배너 결과에 직접 영향을 주는 기준을 실제 작업 흐름에 맞춰 정리했습니다." : locale === "ja" ? "端末別の表示範囲、セーフエリア、背景配置、タイトルとロゴ、出力形式、実際のファイルサイズまで、チャンネルバナーの結果に直接関わる基準を実際の作業フローに沿って整理しています。" : "This section covers device-specific visibility, safe-area placement, background composition, title and logo layout, output format, and measured file size that directly affect channel-banner results."}</span></div>
      <div className="toolbox-tool-format-body"><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{t.expert.map(([title, description]) => <article key={title}><h4>{title}</h4><p>{description}</p></article>)}</div></div>
    </section>
    <section className="toolbox-tool-format-guide toolbox-tool-info-notes-split">
      <div className="toolbox-info-notes-inner">
        <div className="toolbox-tool-format-guide-head toolbox-info-notes-safe-head"><p>SAFE AREA</p><h2>{locale === "ko" ? "배너 규격과 안전영역" : locale === "en" ? "Banner size and safe area" : "バナーサイズとセーフエリア"}</h2></div>
        <div className="toolbox-info-notes-copy">{(locale === "ko" ? ["작업 캔버스는 2560×1440이며 최소 업로드 기준은 2048×1152입니다.", "중요한 제목과 로고는 중앙 안전영역 안에 배치하는 것이 좋습니다.", "배경 사진과 장식 요소는 안전영역 바깥까지 활용할 수 있습니다.", "TV·PC·모바일 미리보기는 기기별로 잘려 보이는 범위를 확인하는 보기 모드입니다.", "미리보기 모드를 바꿔도 실제 배너 위치나 편집 좌표는 변하지 않습니다.", "안전영역 가이드와 표시 마스크는 편집용이며 최종 이미지에는 포함되지 않습니다."] : locale === "en" ? ["The working canvas is 2560×1440 and the minimum upload size is 2048×1152.", "Keep important titles and logos inside the centered safe area.", "Background photography and decorative elements can extend beyond the safe area.", "TV, desktop, and mobile previews show how the banner may be cropped by device.", "Changing preview mode does not move the banner or alter editing coordinates.", "Safe-area guides and device masks are editing aids and are not included in the download."] : ["作業キャンバスは2560×1440で、最小アップロードサイズは2048×1152です。", "重要なタイトルとロゴは中央のセーフエリア内に配置するのがおすすめです。", "背景写真や装飾要素はセーフエリアの外側まで活用できます。", "TV・PC・モバイルプレビューでは端末ごとの切り取り範囲を確認できます。", "プレビューモードを変更しても実際のバナー位置や編集座標は変わりません。", "セーフエリアガイドと表示マスクは編集用で、最終画像には含まれません。"]).map(line => <span key={line}>{line}</span>)}</div>
        <div className="toolbox-tool-format-guide-head toolbox-info-notes-notes-head"><p>IMPORTANT NOTES</p><h2>{locale === "ko" ? "주의사항" : locale === "en" ? "Important notes" : "注意事項"}</h2></div>
        <div className="toolbox-info-notes-divider"/>
        <div className="toolbox-tool-format-notes toolbox-info-notes-list"><article><ul>{t.notes.map(x => <li key={x}>{x}</li>)}</ul></article></div>
      </div>
    </section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{locale === "ko" ? "자주 묻는 질문" : locale === "en" ? "Frequently asked questions" : "よくある質問"}</h2></div><ToolboxFaqList items={t.faqs.map(([q, a]): readonly [string, string] => [q, a])} initialCount={5} moreLabel={locale === "ko" ? "FAQ 더보기" : locale === "ja" ? "FAQをもっと見る" : "More FAQ"} collapseLabel={locale === "ko" ? "FAQ 접기" : locale === "ja" ? "FAQを閉じる" : "Collapse FAQ"} className="toolbox-tool-faq-list" /></section>
    <section className="toolbox-tool-processing-note"><p>{locale === "ko" ? "이미지와 입력한 문구는 서버로 전송되지 않으며 현재 브라우저에서 처리됩니다." : locale === "ja" ? "画像と入力文字はサーバーに送信されず、現在のブラウザ内で処理されます。" : "Your image and text are processed in the current browser and are not uploaded to a server."}</p></section>
  </ToolboxSubpageShell>;
}
