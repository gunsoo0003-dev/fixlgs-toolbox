import Link from "next/link";
import { IdPassportPhotoMakerTool } from "./id-passport-photo-maker-tool";
import { ToolboxFaqList } from "./toolbox-faq-list";
import { ToolboxSubpageShell } from "./toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const copy = {
  ko: {
    back: "콘텐츠 이미지 제작",
    title: "증명사진·여권사진 제작기",
    desc: "국가·문서별 규격에 맞춰 얼굴 위치를 확인하고 원본 비율을 유지한 증명·여권·취업사진과 A4 인쇄 배치를 만드세요.",
    local: "얼굴 사진과 결과 파일은 브라우저 안에서만 처리되며 서버로 전송·저장되지 않습니다.",
    how: "사용 방법",
    steps: [
      "원본 얼굴 사진을 선택한 뒤 여권·증명·취업 목적과 한국·미국·일본·영국·캐나다 또는 일반 규격을 고릅니다.",
      "선택한 preset의 실제 mm·픽셀·얼굴 길이 안내를 확인하고, 제출처가 별도 규격을 요구하면 사용자 지정 크기로 바꿉니다.",
      "확대·축소와 상하좌우 이동으로 얼굴을 가이드에 맞춥니다. 사진은 늘리지 않고 원본 비율을 유지한 채 필요한 부분만 crop합니다.",
      "미리보기에서 얼굴 위치·여백·출력 크기를 다시 확인하고 개별 JPG/PNG를 저장합니다. 한국 온라인 여권사진은 413×531px JPG와 500KB 이하 조건을 적용합니다.",
      "인쇄가 필요하면 A4 실제 크기 배치를 만들고 컷 가이드를 확인한 뒤 저장합니다. 인쇄할 때는 페이지 맞춤을 끄고 100% 또는 실제 크기를 사용합니다."
    ],
    guideTitle: "규격 사진 제작 핵심 기준",
    guide: [
      ["크기 기준", "사진 크기와 얼굴 크기는 따로 확인", "35×45mm처럼 사진 전체 규격이 맞아도 얼굴이 너무 크거나 작으면 제출 규정과 어긋날 수 있습니다. 국가 preset에 얼굴 길이 범위가 있는 경우 전체 사진 크기와 얼굴 위치를 함께 확인합니다."],
      ["비율 유지", "No Stretch로 원본 비율 유지", "세로 사진을 규격에 맞춘다고 가로·세로를 강제로 늘리지 않습니다. 원본 비율을 유지한 채 zoom과 position으로 필요한 영역만 잘라 얼굴 형태가 왜곡되지 않도록 합니다."],
      ["얼굴 가이드", "얼굴 가이드는 미리보기용", "얼굴 위치선과 참고 가이드는 작업 중 정렬을 돕기 위한 화면 표시입니다. 최종 JPG·PNG와 A4 출력에는 가이드가 포함되지 않도록 분리해 사용합니다."],
      ["단위 구분", "인쇄 mm와 온라인 px를 구분", "35×45mm 같은 값은 실제 인화 크기이고 413×531px 같은 값은 온라인 제출용 디지털 크기입니다. 같은 여권사진이라도 인쇄용과 온라인 제출용 조건을 서로 바꾸어 사용하지 않습니다."],
      ["온라인 제출", "한국 온라인 제출 조건 별도 적용", "한국 온라인 여권사진 preset은 413×531px JPG를 기준으로 출력하고 500KB 이하가 되도록 저장합니다. 일반 PNG 출력이나 인쇄용 preset과는 별도 흐름으로 처리합니다."],
      ["국가 규격", "국가별 preset은 서로 다름", "한국·미국·일본·영국·캐나다는 사진 전체 크기와 얼굴 길이 조건이 동일하지 않습니다. 비슷해 보이는 35×45mm 규격이라도 얼굴 범위와 제출 방식이 다를 수 있어 현재 선택한 국가 preset을 다시 확인합니다."],
      ["A4 인쇄", "A4는 210×297mm 실제 크기", "선택한 사진의 실제 mm 크기를 유지하면서 A4 210×297mm 안에 들어가는 수량을 반복 배치합니다. 프린터의 ‘페이지에 맞춤’이나 자동 확대·축소를 사용하면 실제 사진 크기가 달라질 수 있습니다."],
      ["용도 구분", "공식 여권과 일반 증명·취업사진 분리", "국가별 여권 preset은 공식 제출 규격 참고용이고 3×4cm·3.5×4.5cm와 사용자 지정은 일반 증명·취업사진 편의용입니다. 회사·학교·시험기관이 별도 크기를 지정하면 그 요구를 우선합니다."]
    ],
    caution: "주의사항",
    cautions: [
      "이 도구는 크기·비율·얼굴 위치·파일 조건을 맞추는 작업을 돕지만 여권이나 신분증의 최종 수용 여부를 보장하지 않습니다.",
      "여권 사진은 크기 외에도 촬영 시점, 정면 시선, 표정, 머리카락, 안경, 그림자, 조명, 배경 등 별도 촬영 규정을 함께 확인해야 합니다.",
      "얼굴 미용 보정, 피부톤 변경, 얼굴 합성, AI 얼굴 생성이나 규정에 맞추기 위한 과도한 배경 합성은 원본의 적합성을 보장하지 않으므로 제공하지 않습니다.",
      "캐나다 여권사진 preset은 크기와 배치 참고용입니다. 캐나다의 실제 제출 방식은 상업 사진관 촬영 등 별도 요구가 있으므로 해당 기관의 현재 안내를 우선하세요.",
      "공식 규격과 온라인 제출 조건은 변경될 수 있습니다. 실제 제출 직전 발급기관·대사관·회사·학교 등 최종 제출처의 최신 안내를 다시 확인하세요.",
      "A4 출력물을 인쇄할 때는 ‘페이지에 맞춤’, ‘용지에 맞게 축소’ 같은 자동 배율 기능을 끄고 100% 또는 실제 크기를 선택하세요."
    ],
    faqTitle: "자주 묻는 질문",
    faqMore: "FAQ 더보기",
    faqLess: "FAQ 접기",
    faqs: [
      ["이 도구로 만들면 여권사진 심사에 반드시 통과하나요?", "아니요. 사진 크기, 얼굴 위치, 파일 형식과 같은 편집 가능한 조건을 맞추는 데 도움을 주지만 촬영 상태와 최종 수용 여부는 발급기관이 판단합니다."],
      ["사진 전체 크기만 35×45mm로 맞추면 되나요?", "아닙니다. 국가에 따라 얼굴 길이와 머리 위 여백 등 구도 조건도 함께 적용됩니다. 동일한 35×45mm라도 선택한 국가 preset의 얼굴 가이드를 같이 확인하세요."],
      ["한국 여권 온라인용 기본 출력은 무엇인가요?", "한국 온라인 여권사진 preset에서는 413×531px JPG를 만들고 500KB 이하가 되도록 출력합니다. 인쇄용 35×45mm preset과는 별도입니다."],
      ["배경을 자동으로 흰색으로 바꿀 수 있나요?", "여권모드에서는 자동 배경 제거·AI 배경 생성·합성을 제공하지 않습니다. 원본 촬영 조건이 맞지 않으면 제출기관의 규정을 확인한 뒤 새로 촬영하는 편이 안전합니다."],
      ["사진을 확대하면 얼굴이 찌그러지나요?", "아니요. No Stretch 방식으로 원본 종횡비를 유지하고 확대·이동·crop만 적용합니다. 가로 또는 세로를 독립적으로 늘려 얼굴 형태를 바꾸지 않습니다."],
      ["취업사진은 몇 cm로 만들어야 하나요?", "전국 공통 단일 규격이 있는 것은 아닙니다. 3×4cm와 3.5×4.5cm 일반 preset을 제공하지만 회사·학교·시험기관이 별도 크기를 지정하면 그 값을 우선하세요."],
      ["A4에 여러 장을 자동 배치하면 실제 사진 크기도 유지되나요?", "네. 선택한 mm 규격을 기준으로 A4 210×297mm 안에 반복 배치합니다. 다만 실제 인쇄 시 프린터 배율을 100% 또는 실제 크기로 설정해야 최종 크기가 유지됩니다."],
      ["사진과 결과 파일이 서버로 올라가나요?", "아니요. 입력 사진의 처리, 미리보기, JPG·PNG 생성과 A4 배치는 현재 브라우저 안에서 진행되며 서버에 업로드해 저장하는 방식이 아닙니다."]
    ],
    next: "다음 작업", coming: "준비 중", related: "관련 도구"
  },
  en: {
    back: "Content Image Creation",
    title: "ID & Passport Photo Maker",
    desc: "Create passport, ID, and employment photos with country presets, face-position guides, no-stretch cropping, and A4 print layouts.",
    local: "Face photos and result files are processed only in your browser and are not uploaded or stored on a server.",
    how: "How to use",
    steps: [
      "Choose a source portrait, then select a passport, ID, or employment purpose and a Korea, U.S., Japan, U.K., Canada, or general preset.",
      "Review the selected preset's physical size, pixel size, and face-length guidance. Use a custom size when the recipient specifies a different requirement.",
      "Use zoom and position controls to align the face with the guide. The source aspect ratio is preserved and only the necessary area is cropped.",
      "Check face position, margins, and output size in the preview, then save an individual JPG or PNG. The Korean online passport preset applies 413×531px JPG output and a 500KB maximum.",
      "For print copies, create the actual-size A4 layout, review the cut guides, and export it. Print at 100% or Actual Size with Fit to Page disabled."
    ],
    guideTitle: "Key standards for document photos",
    guide: [
      ["Size rules", "Check photo size and face size separately", "A correct overall photo size does not guarantee a correct face scale. When a preset provides a face-length range, check both the full image dimensions and the face position."],
      ["Aspect ratio", "Preserve aspect ratio with No Stretch", "Do not force a portrait into the target size by stretching width or height. Keep the source aspect ratio and use zoom and position to crop only the required area."],
      ["Face guide", "Face guides are preview-only", "Face-position lines and guides help alignment while editing. They are separated from the rendered result and are not intended to appear in the final JPG, PNG, or A4 output."],
      ["Units", "Keep print millimeters and online pixels separate", "Values such as 35×45mm describe physical print size, while values such as 413×531px describe digital submission dimensions. Do not substitute one workflow for the other."],
      ["Online submit", "Apply Korean online rules separately", "The Korean online passport preset outputs a 413×531px JPG and keeps the file at or below 500KB. It is handled separately from general PNG output and print presets."],
      ["Country rules", "Country presets are not interchangeable", "Korea, the U.S., Japan, the U.K., and Canada do not share identical photo and face-size requirements. Even when overall dimensions look similar, composition and submission rules may differ."],
      ["A4 print", "A4 means actual 210×297mm output", "The tool repeats the selected physical photo size on a 210×297mm A4 sheet. Printer scaling such as Fit to Page can change the final photo dimensions."],
      ["Use case", "Separate official passport and general ID sizes", "Country passport presets are official-format references, while 30×40mm, 35×45mm, and custom sizes are general conveniences for ID or employment photos. Always prioritize the recipient's stated requirement."]
    ],
    caution: "Important notes",
    cautions: [
      "The tool helps with dimensions, aspect ratio, face position, and file conditions, but it cannot guarantee passport or identity-document acceptance.",
      "Passport rules also cover photo age, straight-on pose, expression, hair, glasses, shadows, lighting, and background. Check those capture requirements separately.",
      "Beauty retouching, skin-tone changes, face compositing, AI-generated faces, and heavy background compositing are not provided as a way to force a noncompliant source photo into compliance.",
      "The Canada passport preset is a size/layout reference. Actual Canadian submissions have additional requirements such as commercial photographer production, so current official instructions take priority.",
      "Official dimensions and online submission conditions can change. Recheck the issuing authority, embassy, employer, school, or other final recipient before submission.",
      "When printing A4 output, disable Fit to Page or automatic scaling and select 100% or Actual Size so the physical photo dimensions remain correct."
    ],
    faqTitle: "FAQ",
    faqMore: "Show more FAQ",
    faqLess: "Hide FAQ",
    faqs: [
      ["Does this guarantee passport acceptance?", "No. The tool helps match editable requirements such as dimensions, face position, and file format, but capture quality and final acceptance are determined by the issuing authority."],
      ["Is matching 35×45mm enough?", "Not always. Some countries also specify face length and composition. When a country preset includes face guidance, check it together with the overall photo size."],
      ["What does the Korean online passport preset output?", "It creates a 413×531px JPG and keeps the file at or below 500KB. This is separate from the 35×45mm print preset."],
      ["Can the tool automatically replace the background with white?", "Not in passport mode. Automatic background removal, AI background generation, and compositing are not used to make a noncompliant source photo appear compliant."],
      ["Will zooming stretch my face?", "No. No Stretch preserves the source aspect ratio and uses zoom, position, and crop only; width and height are not independently distorted."],
      ["What size should an employment photo be?", "There is no single universal size. Common 30×40mm and 35×45mm presets are provided, but a specific employer, school, or exam requirement should take priority."],
      ["Will A4 auto-layout preserve the physical photo size?", "Yes. The layout is calculated from the selected millimeter size on a 210×297mm A4 page, but the printer must be set to 100% or Actual Size."],
      ["Are my photos uploaded to a server?", "No. Input handling, preview, JPG/PNG generation, and A4 layout are performed in the current browser rather than uploaded for server-side storage."]
    ],
    next: "Next work", coming: "Coming soon", related: "Related tools"
  },
  ja: {
    back: "コンテンツ画像作成",
    title: "証明写真・パスポート写真作成ツール",
    desc: "国・書類別規格、顔位置ガイド、No Stretch、A4実寸配置で証明・パスポート・就職写真を作成します。",
    local: "顔写真と結果ファイルはブラウザ内でのみ処理され、サーバーへ送信・保存されません。",
    how: "使い方",
    steps: [
      "元の顔写真を選択し、パスポート・証明・就職用途と韓国・米国・日本・英国・カナダまたは一般presetを選びます。",
      "選択したpresetの実寸mm・pixel・顔の長さガイドを確認し、提出先が別のサイズを指定する場合はカスタムサイズに変更します。",
      "拡大・縮小と上下左右の移動で顔をガイドに合わせます。写真を引き伸ばさず、元画像比率を保って必要な部分だけcropします。",
      "プレビューで顔位置・余白・出力サイズを確認し、JPGまたはPNGを保存します。韓国オンラインパスポートpresetは413×531px JPG・500KB以下を適用します。",
      "印刷が必要な場合はA4実寸レイアウトとcut guideを確認して保存します。印刷時は用紙に合わせる設定をOFFにして100%または実際のサイズを選択します。"
    ],
    guideTitle: "証明写真作成の重要基準",
    guide: [
      ["サイズ基準", "写真サイズと顔サイズを別々に確認", "35×45mmなど写真全体のサイズが合っていても、顔が大きすぎたり小さすぎたりすると規格から外れる場合があります。顔の長さ範囲があるpresetでは両方を確認します。"],
      ["比率維持", "No Stretchで元画像比率を維持", "目標サイズに合わせるために幅や高さだけを強制的に伸ばしません。元画像比率を保ったままzoomとpositionで必要な範囲をcropします。"],
      ["顔ガイド", "顔ガイドはプレビュー専用", "顔位置線と参考ガイドは編集中の整列を助ける表示です。最終JPG・PNGやA4出力には含まれないよう結果レンダリングと分離します。"],
      ["単位区分", "印刷mmとオンラインpixelを分離", "35×45mmは実際の印刷サイズ、413×531pxはオンライン提出用のデジタルサイズです。同じ写真でも印刷用とオンライン用の条件を入れ替えて使いません。"],
      ["オンライン提出", "韓国オンライン条件を別適用", "韓国オンラインパスポートpresetは413×531px JPGで出力し、500KB以下になるよう保存します。一般PNG出力や印刷presetとは別の処理です。"],
      ["国別規格", "国別presetは同一ではありません", "韓国・米国・日本・英国・カナダでは写真全体サイズと顔の長さ条件が同一ではありません。似た寸法でも構図や提出方法が異なる場合があります。"],
      ["A4印刷", "A4は210×297mmの実寸", "選択した写真の実寸mmを保って210×297mmのA4内に繰り返し配置します。プリンターの自動拡大・縮小や用紙に合わせる設定を使うと最終サイズが変わります。"],
      ["用途区分", "公式パスポートと一般証明サイズを分離", "国別パスポートpresetは公式規格の参考用、30×40mm・35×45mm・カスタムは一般証明・就職写真用です。会社・学校・試験機関の指定がある場合はその値を優先します。"]
    ],
    caution: "注意事項",
    cautions: [
      "このツールはサイズ・比率・顔位置・ファイル条件の調整を支援しますが、パスポートや身分証写真の最終受理を保証するものではありません。",
      "パスポート写真には撮影時期、正面の向き、表情、髪、眼鏡、影、照明、背景などサイズ以外の撮影条件もあります。",
      "美顔補正、肌色変更、顔合成、AI顔生成、規格に合わせるための過度な背景合成は、元写真の適合性を保証できないため提供しません。",
      "カナダのパスポートpresetはサイズ・配置の参考用です。実際の提出には商業写真家による撮影など追加要件があるため、現在の公式案内を優先してください。",
      "公式サイズやオンライン提出条件は変更される可能性があります。提出直前に発行機関・大使館・会社・学校など最終提出先の最新案内を確認してください。",
      "A4出力を印刷するときは「用紙に合わせる」などの自動倍率をOFFにし、100%または実際のサイズを選択してください。"
    ],
    faqTitle: "よくある質問",
    faqMore: "FAQをもっと見る",
    faqLess: "FAQを閉じる",
    faqs: [
      ["このツールで作れば必ずパスポート審査に通りますか？", "いいえ。サイズ、顔位置、ファイル形式など編集可能な条件を合わせる支援をしますが、撮影状態と最終受理は発行機関が判断します。"],
      ["35×45mmだけ合わせれば十分ですか？", "必ずしもそうではありません。国によって顔の長さや構図条件もあります。国別presetに顔ガイドがある場合は写真全体サイズと一緒に確認してください。"],
      ["韓国オンラインパスポートpresetの出力は？", "413×531px JPGを作成し、500KB以下になるよう出力します。35×45mmの印刷presetとは別です。"],
      ["背景を自動で白にできますか？", "パスポートモードでは提供しません。自動背景除去、AI背景生成、合成で不適合な元写真を適合しているように見せる処理は行いません。"],
      ["拡大すると顔が歪みますか？", "いいえ。No Stretchで元画像比率を維持し、zoom・position・cropのみを使用します。幅と高さを別々に引き伸ばしません。"],
      ["就職写真は何cmにすればよいですか？", "全国共通の1サイズではありません。30×40mmと35×45mmの一般presetを提供しますが、会社・学校・試験機関の指定がある場合はそれを優先してください。"],
      ["A4自動配置でも写真の実寸は維持されますか？", "はい。選択したmmサイズを基準に210×297mmのA4へ配置します。ただし印刷時に100%または実際のサイズを指定する必要があります。"],
      ["写真と結果ファイルはサーバーへ送信されますか？", "いいえ。入力処理、プレビュー、JPG・PNG生成、A4配置は現在のブラウザ内で行われ、サーバー保存のためにアップロードする方式ではありません。"]
    ],
    next: "次の作業", coming: "準備中", related: "関連ツール"
  }
} as const;

export function IdPassportPhotoMakerPage({locale}:{locale:Locale}){
  const t=copy[locale];
  const url=`https://toolbox.fixlgs.com/${locale}/id-passport-photo-maker`;
  const related=[
    {n:"006",name:locale==="ko"?"이미지 크기 변경기":locale==="en"?"Image Resizer":"画像サイズ変更ツール",href:`/${locale}/image-resizer`},
    {n:"008",name:locale==="ko"?"이미지 자르기·회전기":locale==="en"?"Image Cropper & Rotator":"画像切り抜き・回転ツール",href:`/${locale}/image-cropper-rotator`},
    {n:"018",name:locale==="ko"?"이미지 정보·메타데이터 검사기":locale==="en"?"Image Info & Metadata Checker":"画像情報・メタデータチェッカー",href:`/${locale}/image-metadata-checker`},
  ];
  const jsonLd={"@context":"https://schema.org","@graph":[{"@type":"WebApplication",name:t.title,applicationCategory:"MultimediaApplication",operatingSystem:"Any",url,description:t.desc,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"},featureList:["Passport photo presets","ID and employment photo presets","Face position guide","No Stretch crop","Digital JPG/PNG export","A4 actual-size print layout"]},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"TOOLBOX",item:`https://toolbox.fixlgs.com/${locale}`},{"@type":"ListItem",position:2,name:t.back,item:`https://toolbox.fixlgs.com/${locale}/category/content-image`},{"@type":"ListItem",position:3,name:t.title,item:url}]},{"@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]};
  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/content-image`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">025 · CONTENT IMAGE</p>
      <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>
    <section className="toolbox-tool-detail-body"><div>
      <IdPassportPhotoMakerTool locale={locale}/>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><div className="toolbox-next-work-card is-disabled"><span>026</span><h3>{locale==="ko"?"이미지 PDF 변환기":locale==="en"?"Image to PDF Converter":"画像PDF変換ツール"}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div></div></section>
      <section className="toolbox-next-work"><div className="toolbox-next-work-head"><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid">{related.map((item)=><Link key={item.n} className="toolbox-next-work-card" href={item.href}><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>OPEN</span><strong>→</strong></div></Link>)}</div></section>
      <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol></section>
      <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head toolbox-tool-expert-post--compact-copy"><div className="toolbox-tool-format-guide-head"><p>WORKFLOW GUIDE</p><h2>{t.guideTitle}</h2><span>{t.desc}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.guide.map(([n,title,desc])=><article key={n}><strong>{n}</strong><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
      <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{t.caution}</h2><span>{locale === "ko" ? "여권·증명사진은 제출처 규격과 원본 촬영 조건을 함께 확인한 뒤 저장하세요." : locale === "ja" ? "パスポート・証明写真は提出先の規格と元写真の撮影条件を確認してから保存してください。" : "Check both the recipient requirements and the source-photo conditions before exporting an ID or passport photo."}</span></div><ul className="toolbox-tool-info-band-list">{t.cautions.map((x)=><li key={x}>{x}</li>)}</ul></section>
      <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs.map(([q,a]):readonly [string,string]=>[q,a])} initialCount={5} moreLabel={t.faqMore} collapseLabel={t.faqLess} className="toolbox-tool-faq-list" /></section>
    </div></section>
  </ToolboxSubpageShell>;
}
