import { ToolNavigation } from "@/components/tool-navigation";
import Link from "next/link";
import { BeforeAfterImageTool } from "@/components/before-after-image-tool";
import styles from "@/components/before-after-image-tool.module.css";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const copy = {
  ko:{
    back:"이미지 편집",title1:"전후 비교 이미지",title2:"만들기",desc:"두 이미지를 좌우 또는 상하로 배치해 깔끔한 전후 비교 이미지를 만드세요.",
    steps:[
      "Before와 After 이미지를 선택한 뒤 좌우 또는 상하 비교 방향을 정합니다.",
      "필요하면 Before·After 위치를 바꾸고 두 이미지의 채우기·전체 보기 방식을 선택합니다.",
      "각 이미지를 드래그하고 확대율을 조절해 주요 피사체 위치를 비슷하게 맞춥니다.",
      "Before·After 문구와 중앙 구분선, 배경·간격·외곽 여백을 목적에 맞게 조절합니다.",
      "결과 비율과 픽셀 크기, 출력 형식을 확인한 뒤 이미지로 다운로드합니다."
    ],
    faqs:[
      ["사진 두 장의 크기가 달라도 되나요?","예. 각 이미지를 비교 영역에 자동으로 맞추고 위치와 확대율을 별도로 조절할 수 있습니다."],
      ["좌우뿐 아니라 상하 비교도 가능한가요?","예. 좌우 비교와 상하 비교를 모두 지원합니다."],
      ["사진이 잘리지 않게 만들 수 있나요?","예. 전체 보기 방식을 사용하면 이미지 전체를 비교 영역 안에 표시할 수 있습니다."],
      ["Before와 After 위치를 바꿀 수 있나요?","예. 이미지와 해당 이미지의 맞춤·위치·확대 설정을 함께 바꿀 수 있습니다."],
      ["Before와 After 글자를 수정할 수 있나요?","예. 각각 원하는 짧은 문구로 변경하거나 라벨을 숨길 수 있습니다."],
      ["중앙 구분선을 없앨 수 있나요?","예. 구분선을 표시하거나 숨기고 두께와 색상을 조절할 수 있습니다."],
      ["두 사진의 위치를 따로 조절할 수 있나요?","예. Before와 After 이미지를 각각 이동하고 확대할 수 있습니다."],
      ["결과 크기를 정할 수 있나요?","예. 결과 비율과 픽셀 크기를 직접 설정할 수 있습니다."],
      ["투명 배경으로 만들 수 있나요?","예. PNG 또는 투명도를 지원하는 WebP 출력에서 사용할 수 있습니다."],
      ["이미지는 서버로 전송되나요?","아니요. 현재 브라우저 안에서 처리됩니다."],
      ["이미지 차이를 자동으로 분석해 주나요?","아니요. 두 이미지를 비교용 레이아웃으로 만드는 도구이며 변화량을 자동 판정하지 않습니다."],
      ["모바일에서도 사진 위치를 맞출 수 있나요?","예. Before와 After 영역을 선택한 뒤 드래그와 확대율 설정으로 프레이밍을 조절할 수 있습니다."]
    ],more:"FAQ 더보기",collapse:"FAQ 접기"
  },
  en:{
    back:"Image Edit",title1:"Before & After",title2:"Image Maker",desc:"Place two images side by side or vertically to create a clean before-and-after comparison.",
    steps:[
      "Choose Before and After images, then select side-by-side or top-and-bottom comparison.",
      "Swap the images if needed and choose Fill or Fit Entire Image for each frame.",
      "Drag and zoom each image independently to align the important subject areas.",
      "Adjust the labels, center divider, background, gap, and outer padding for the comparison.",
      "Check the result ratio, pixel dimensions, and output format, then download the image."
    ],
    faqs:[
      ["Can the two photos have different sizes?","Yes. Each image is fitted to its comparison area and can be positioned and zoomed independently."],
      ["Can I compare vertically as well as side by side?","Yes. Both side-by-side and top-and-bottom layouts are supported."],
      ["Can I avoid cropping?","Yes. Use Fit Entire Image to keep the full image visible inside its comparison area."],
      ["Can I swap Before and After?","Yes. The images and their framing settings move together."],
      ["Can I edit the Before and After labels?","Yes. Edit each short label or hide labels entirely."],
      ["Can I remove the divider?","Yes. Show or hide it and adjust thickness and color."],
      ["Can I position the two photos separately?","Yes. Before and After can be moved and zoomed independently."],
      ["Can I choose the result size?","Yes. Set the ratio and exact pixel dimensions."],
      ["Can I use a transparent background?","Yes with PNG or transparency-capable WebP output."],
      ["Are images uploaded to a server?","No. Processing stays in your browser."],
      ["Does it automatically analyze differences?","No. It creates a comparison layout and does not measure or judge changes."],
      ["Can I align photos on mobile?","Yes. Select the Before or After area, then drag and adjust zoom for framing."]
    ],more:"Show more FAQs",collapse:"Collapse FAQs"
  },
  ja:{
    back:"画像編集",title1:"ビフォー・アフター",title2:"比較画像作成",desc:"2枚の画像を左右または上下に配置して、比較画像を作成できます。",
    steps:[
      "比較前と比較後の画像を選び、左右比較または上下比較を選択します。",
      "必要に応じて画像を入れ替え、枠いっぱい表示または画像全体表示を選択します。",
      "各画像をドラッグし、拡大率を調整して主要な被写体の位置を合わせます。",
      "ラベル、中央の区切り線、背景、画像間隔、外側余白を調整します。",
      "結果の比率、ピクセルサイズ、出力形式を確認して画像をダウンロードします。"
    ],
    faqs:[
      ["2枚の写真サイズが違っても使えますか？","はい。各画像を比較領域に合わせ、位置と拡大率を個別に調整できます。"],
      ["左右だけでなく上下比較もできますか？","はい。左右比較と上下比較の両方に対応しています。"],
      ["写真を切らずに表示できますか？","はい。画像全体を表示を選ぶと、画像全体を比較領域内に表示できます。"],
      ["比較前と比較後を入れ替えられますか？","はい。画像とその表示設定を一緒に入れ替えられます。"],
      ["ラベル文字を変更できますか？","はい。短い文字に変更したり、ラベルを非表示にできます。"],
      ["中央の区切り線を消せますか？","はい。表示・非表示、太さ、色を調整できます。"],
      ["2枚の位置を別々に調整できますか？","はい。比較前と比較後をそれぞれ移動・拡大できます。"],
      ["結果サイズを指定できますか？","はい。比率とピクセルサイズを設定できます。"],
      ["透明背景にできますか？","はい。PNGまたは透明度対応WebPで利用できます。"],
      ["画像はサーバーに送信されますか？","いいえ。現在のブラウザ内で処理されます。"],
      ["画像の差を自動分析しますか？","いいえ。比較用レイアウトを作成するツールで、変化量を自動判定しません。"],
      ["モバイルでも位置を合わせられますか？","はい。比較前または比較後を選択してドラッグと拡大率で調整できます。"]
    ],more:"FAQをもっと見る",collapse:"FAQを閉じる"
  }
} as const;

export function BeforeAfterImagePage({locale}:{locale:Locale}){
  const t=copy[locale];
  const appName=locale==="ko"?"전후 비교 이미지 만들기":locale==="en"?"Before & After Image Maker":"ビフォー・アフター比較画像作成";
  const url=`https://toolbox.fixlgs.com/${locale}/before-after-image-maker`;
  const jsonLd={"@context":"https://schema.org","@graph":[
    {"@type":"WebApplication",name:appName,applicationCategory:"MultimediaApplication",operatingSystem:"Any",url,description:t.desc,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}},
    {"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"TOOLBOX",item:`https://toolbox.fixlgs.com/${locale}`},{"@type":"ListItem",position:2,name:t.back,item:`https://toolbox.fixlgs.com/${locale}/category/image-edit`},{"@type":"ListItem",position:3,name:appName,item:url}]},
    {"@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}
  ]};
  const nextTitle=locale==="ko"?"다음 작업":locale==="en"?"Next steps":"次の作業";
  const ready=locale==="ko"?"사용 가능":locale==="en"?"Available":"利用可能";
  const soon=locale==="ko"?"준비 중":locale==="en"?"Coming soon":"準備中";
  const cards=[
    {n:"16",name:locale==="ko"?"이미지에 글자 넣기":locale==="en"?"Add Text to Image":"画像に文字を追加",href:null},
    {n:"13",name:locale==="ko"?"이미지 합치기":locale==="en"?"Image Merger":"画像結合ツール",href:`/${locale}/image-merger`},
    {n:"14",name:locale==="ko"?"이미지 콜라주 만들기":locale==="en"?"Image Collage Maker":"画像コラージュ作成",href:`/${locale}/image-collage-maker`},
    {n:"4",name:locale==="ko"?"이미지 압축기":locale==="en"?"Image Compressor":"画像圧縮ツール",href:`/${locale}/image-compressor`},
    {n:"6",name:locale==="ko"?"이미지 크기 변경기":locale==="en"?"Image Resizer":"画像サイズ変更ツール",href:`/${locale}/image-resizer`}
  ];
  return <ToolboxSubpageShell locale={locale} appName={appName}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="toolbox-tool-detail-hero"><Link className="toolbox-subpage-back" href={`/${locale}/category/image-edit`}>← {t.back}</Link><p className="toolbox-subpage-eyebrow">15 · IMAGE EDIT</p><div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title1}</span><span className="toolbox-tool-title-line">{t.title2}</span></h1><p>{t.desc}</p></div><div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{locale==="ko"?"브라우저에서 바로 처리":locale==="en"?"PROCESS IN YOUR BROWSER":"ブラウザ内で処理"}</span></div></section>
    <section className="toolbox-tool-detail-body"><div><BeforeAfterImageTool locale={locale}/><ToolNavigation locale={locale} currentTool={15} /></div></section>

    <section className={`toolbox-tool-guide toolbox-tool-guide--five ${styles.howTo}`}><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{locale==="ko"?"사용 방법":locale==="en"?"How to use":"使い方"}</h2></div><ol>{t.steps.map((s,i)=><li key={s}><span>{String(i+1).padStart(2,"0")}</span><p>{s}</p></li>)}</ol></section>

    <section className="toolbox-tool-format-guide"><div className="toolbox-tool-format-guide-head"><p>USE CASES & NOTES</p><h2>{locale==="ko"?"활용 예시와 주의사항":locale==="en"?"Use cases and important notes":"活用例と注意事項"}</h2><span>{locale==="ko"?"전후 비교 이미지를 실제 작업 사례와 콘텐츠에 사용할 때 알아두면 좋은 범위입니다.":locale==="en"?"Practical uses and limits to keep in mind when publishing before-and-after comparisons.":"ビフォー・アフター画像を実際の事例やコンテンツで使うときの活用範囲と注意点です。"}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid"><article><strong>{locale==="ko"?"활용 예시":locale==="en"?"Use cases":"活用例"}</strong><h3>{locale==="ko"?"시공·청소·보정·운동 변화":locale==="en"?"Renovation, cleaning, editing, and progress":"施工・清掃・補正・変化記録"}</h3><p>{locale==="ko"?"인테리어·리모델링·청소·세차·사진 보정·제품 개선·운동 변화·조경·수리 사례처럼 같은 대상을 전후로 보여줄 때 사용할 수 있습니다.":locale==="en"?"Use it for renovations, cleaning, car detailing, photo edits, product improvements, fitness progress, landscaping, repairs, and similar two-state comparisons.":"リフォーム、清掃、洗車、写真補正、商品改善、運動変化、造園、修理など、同じ対象の前後を見せる用途に使えます。"}</p></article><article><strong>{locale==="ko"?"촬영 조건":locale==="en"?"Capture conditions":"撮影条件"}</strong><h3>{locale==="ko"?"각도·거리·조명을 비슷하게":locale==="en"?"Keep angle, distance, and light similar":"角度・距離・照明を近づける"}</h3><p>{locale==="ko"?"두 사진의 촬영 조건이 크게 다르면 실제 변화보다 차이가 커 보이거나 작아 보일 수 있습니다. 이 도구는 변화량의 객관성을 자동 판정하지 않습니다.":locale==="en"?"Large differences in angle, distance, or lighting can exaggerate or hide change. The tool does not objectively measure the amount of change.":"撮影角度・距離・照明が大きく異なると、実際より差が大きくまたは小さく見えることがあります。本ツールは変化量を自動判定しません。"}</p></article><article><strong>{locale==="ko"?"출력 주의":locale==="en"?"Output note":"出力の注意"}</strong><h3>{locale==="ko"?"작은 원본과 투명 배경 확인":locale==="en"?"Check small sources and transparency":"小さい元画像と透明背景を確認"}</h3><p>{locale==="ko"?"작은 원본을 크게 확대하면 흐려질 수 있습니다. PNG·WebP는 투명 배경을 사용할 수 있지만 JPG는 선택한 배경색으로 합성됩니다.":locale==="en"?"Small source images can look soft when enlarged. PNG and WebP can keep transparency, while JPG composites transparent areas onto the chosen background.":"小さい元画像を大きくするとぼやける場合があります。PNG・WebPは透明背景を使えますが、JPGは選択した背景色で合成されます。"}</p></article></div></div></section>

    <section className="toolbox-tool-format-guide toolbox-tool-expert-post">
      <div className="toolbox-tool-format-guide-head"><p>BEFORE & AFTER GUIDE</p><h2>{locale==="ko"?"전후 사진을 정확하고 자연스럽게 맞추는 실무 기준":locale==="en"?"Practical standards for clean before-and-after comparisons":"ビフォー・アフター画像を自然に整える実用基準"}</h2><span>{locale==="ko"?"두 사진의 비율이 달라도 왜곡하지 않고 프레이밍, 라벨, 구분선과 결과 크기를 같은 좌표 모델로 맞추는 것이 핵심입니다.":locale==="en"?"Keep both photos undistorted and use one shared coordinate model for framing, labels, divider, and final output.":"2枚の比率が異なっても変形させず、フレーミング・ラベル・区切り線・出力サイズを同じ座標モデルで扱うことが重要です。"}</span></div>
      <div className="toolbox-tool-format-body">
        <div className="toolbox-tool-format-grid">{(locale==="ko"?[["좌우 비교","같은 장면을 나란히","Before는 왼쪽, After는 오른쪽에 두고 두 영역을 동일한 높이로 비교합니다.","인테리어·청소·보정 사례처럼 좌우 시선 이동이 자연스러운 콘텐츠에 적합합니다."],["상하 비교","세로 콘텐츠와 모바일","Before를 위, After를 아래에 배치해 좁은 화면에서도 각 사진을 충분히 크게 볼 수 있습니다.","세로 사진이나 모바일 중심 콘텐츠에서 유리합니다."],["채우기와 전체 보기","크롭과 빈 공간의 선택","채우기는 영역을 꽉 채우지만 일부가 잘릴 수 있고, 전체 보기는 원본을 모두 보여주는 대신 배경이 보일 수 있습니다.","피사체가 잘리면 전체 보기 또는 위치 조절을 사용하세요."]]:locale==="en"?[["Side by side","Compare the same scene horizontally","Before sits on the left and After on the right with equal comparison height.","Works well for interiors, cleaning, retouching, and other naturally horizontal comparisons."],["Top & bottom","Vertical and mobile content","Before sits above After so each image can remain larger on narrow screens.","Useful for portrait photos and mobile-first content."],["Fill vs fit entire image","Choose crop or empty space","Fill covers the full frame but may crop; Fit Entire Image preserves the whole source and can reveal background.","If the subject is cropped, switch fit mode or reposition the image."]]:[["左右比較","同じ場面を横に比較","比較前を左、比較後を右に配置し、同じ高さの領域で比較します。","施工・清掃・補正など横方向の視線移動が自然な内容に適しています。"],["上下比較","縦長・モバイル向け","比較前を上、比較後を下に配置し、狭い画面でも各写真を大きく表示できます。","縦写真やモバイル中心のコンテンツに向いています。"],["枠いっぱい・全体表示","切り抜きと余白の選択","枠いっぱいは領域を埋めますが一部が切れる場合があり、全体表示は元画像をすべて見せる代わりに背景が見える場合があります。","被写体が切れる場合は全体表示か位置調整を使います。"]]).map(([a,b,c,d])=><article key={a}><strong>{a}</strong><h3>{b}</h3><p>{c}</p><small>{d}</small></article>)}</div>
        <div className="toolbox-tool-direction-guide"><div className="toolbox-tool-section-intro"><p>ALIGNMENT PRACTICE</p><h3>{locale==="ko"?"사진 크기와 구도가 다를 때 맞추는 방법":locale==="en"?"How to align photos with different sizes and framing":"サイズや構図が異なる写真を合わせる方法"}</h3></div><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{(locale==="ko"?[["피사체 기준","얼굴·건물·제품처럼 비교할 핵심 피사체를 먼저 찾고 각 영역에서 비슷한 위치로 이동합니다."],["확대율 기준","한쪽 사진만 필요한 만큼 확대할 수 있습니다. 확대율 연결은 촬영 구도가 비슷할 때만 사용하는 것이 안전합니다."],["구분선 기준","기본은 정확한 50:50 중앙이며, 이미지 사이 간격이 있어도 구분선은 두 영역 사이의 중앙 기준을 유지합니다."],["라벨 안전영역","Before·After 라벨은 피사체를 가리지 않는 모서리에 두고 짧은 문구를 사용해야 비교 자체가 더 명확합니다."],["출력 크기","미리보기보다 큰 최종 출력에서는 작은 원본이 확대되어 흐려질 수 있으므로 원본 해상도와 결과 크기를 함께 확인합니다."],["투명도","PNG·WebP는 투명 배경을 유지할 수 있지만 JPG는 선택한 배경색으로 합성됩니다."]]:locale==="en"?[["Subject alignment","Find the main subject first—face, building, product—and move it to a similar position in each frame."],["Zoom alignment","Zoom either image independently. Link zoom only when the source framing is already similar."],["Divider alignment","The default split is an exact 50:50 center, and the divider stays centered between the two comparison areas even with a gap."],["Label safe area","Keep short Before/After labels in corners that do not cover the subject."],["Output size","Large final output can enlarge a small source image, so compare source resolution with the target dimensions."],["Transparency","PNG and WebP can preserve transparency; JPG composites transparent areas onto the chosen background."]]:[["被写体基準","顔・建物・商品など比較の中心となる被写体を見つけ、各領域で近い位置に移動します。"],["拡大率基準","片方だけ必要な分だけ拡大できます。拡大率の連動は元の構図が似ている場合に使うのが安全です。"],["区切り線基準","初期値は正確な50:50中央で、画像間隔があっても区切り線は2領域の中央基準を維持します。"],["ラベル安全領域","比較前・比較後のラベルは被写体を隠さない角に置き、短い文字を使います。"],["出力サイズ","大きな最終出力では小さい元画像が拡大されるため、元解像度と結果サイズを一緒に確認します。"],["透明度","PNG・WebPは透明背景を維持できますが、JPGは選択した背景色で合成されます。"]]).map(([h,p])=><article key={h}><h4>{h}</h4><p>{p}</p></article>)}</div></div>
        <div className="toolbox-tool-result-guide"><div className="toolbox-tool-section-intro toolbox-tool-section-intro-compact"><p>CHECK BEFORE USE</p><h3>{locale==="ko"?"전후 비교 이미지를 사용할 때 확인할 점":locale==="en"?"Checks before using a comparison image":"比較画像を使う前の確認事項"}</h3></div><div className="toolbox-tool-result-grid">{(locale==="ko"?[["01","촬영 조건","각도·거리·조명이 크게 다르면 실제 변화보다 차이가 커 보이거나 작아 보일 수 있습니다."],["02","원본 보호","도구는 원본 파일을 수정하지 않고 브라우저 안에서 새 비교 이미지만 만듭니다."],["03","비율 유지","이미지는 강제로 늘어나지 않습니다. 채우기에서는 크롭, 전체 보기에서는 빈 공간이 생길 수 있습니다."],["04","작은 원본","낮은 해상도 이미지를 크게 출력하면 흐려질 수 있습니다."],["05","객관성","피부·체형 등 결과는 촬영 조건 영향을 받으므로 변화의 객관성을 자동으로 보장하지 않습니다."],["06","개인정보","이미지 픽셀과 파일명은 외부 분석으로 전송하지 않는 로컬 처리 구조를 유지합니다."]]:locale==="en"?[["01","Capture conditions","Different angle, distance, or lighting can make changes appear larger or smaller than they are."],["02","Original files","The tool does not modify source files; it creates a new comparison image inside the browser."],["03","Aspect ratio","Images are never stretched. Fill can crop; Fit Entire Image can leave empty background."],["04","Small sources","Low-resolution sources may look soft when exported at a large size."],["05","Objectivity","Skin, body, and similar comparisons depend on capture conditions and the tool does not certify objective change."],["06","Privacy","Image pixels and filenames stay out of external analysis in the local-processing workflow."]]:[["01","撮影条件","角度・距離・照明が大きく違うと、実際の変化より差が大きく、または小さく見える場合があります。"],["02","元ファイル","元画像は変更せず、ブラウザ内で新しい比較画像だけを作成します。"],["03","縦横比","画像を無理に引き伸ばしません。枠いっぱいでは切り抜き、全体表示では余白が生じる場合があります。"],["04","小さい元画像","低解像度画像を大きく出力するとぼやける場合があります。"],["05","客観性","肌・体型などの比較は撮影条件の影響を受け、変化の客観性を自動保証しません。"],["06","プライバシー","画像ピクセルやファイル名を外部分析へ送らないローカル処理を維持します。"]]).map(([n,h,p])=><article key={n}><span>{n}</span><h4>{h}</h4><p>{p}</p></article>)}</div></div>
      </div>
    </section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{locale==="ko"?"자주 묻는 질문":locale==="en"?"Frequently asked questions":"よくある質問"}</h2></div><ToolboxFaqList items={t.faqs} initialCount={5} moreLabel={t.more} collapseLabel={t.collapse} className="toolbox-tool-faq-list"/></section>
    <section className="toolbox-tool-processing-note"><p>{locale==="ko"?"원본 파일은 수정되지 않습니다. 채우기 모드에서는 일부가 잘릴 수 있고, 작은 원본을 크게 확대하면 흐려질 수 있습니다.":locale==="en"?"Source files are not modified. Fill mode can crop parts of an image, and enlarging a small source can reduce apparent sharpness.":"元ファイルは変更されません。枠いっぱい表示では一部が切れる場合があり、小さい元画像を大きく拡大するとぼやけることがあります。"}</p></section>
  </ToolboxSubpageShell>;
}
