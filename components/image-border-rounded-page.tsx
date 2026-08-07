import Link from "next/link";
import { ImageBorderRoundedTool } from "@/components/image-border-rounded-tool";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

type Pair = readonly [string, string];

const copy = {
  ko: {
    back: "이미지 편집",
    title: "이미지 테두리·둥근 모서리 도구",
    titleLines: ["이미지 테두리", "둥근 모서리 도구"],
    desc: "이미지에 테두리, 둥근 모서리, 원형 효과와 그림자를 추가하세요.",
    steps: [
      "이미지를 선택하고 둥근 모서리 또는 원형 형태를 선택합니다.",
      "모서리 반경과 개별 모서리를 조절합니다.",
      "필요하면 테두리 두께·색상·정렬을 설정합니다.",
      "그림자 위치·블러·확산·불투명도와 배경·자동 여백을 확인합니다.",
      "원본과 결과, 결과 픽셀을 비교한 뒤 출력 형식과 품질을 선택해 다운로드합니다.",
    ],
    guideTitle: "둥근 모서리·테두리·그림자를 정확하게 적용하는 기준",
    guideDesc: "화면에서만 둥글게 보이게 하는 CSS 효과가 아니라 실제 다운로드 이미지의 픽셀에 형태와 외곽 효과를 렌더링합니다.",
    guideCards: [
      ["RADIUS", "전체·개별 모서리", "네 모서리를 함께 조절하거나 연결을 해제해 각 모서리를 독립적으로 설정할 수 있습니다.", "큰 반경은 이미지 크기에 맞춰 정상화되어 모서리가 겹치거나 깨지지 않게 처리됩니다."],
      ["BORDER", "안쪽·중앙·바깥쪽 정렬", "테두리는 둥근 모서리와 원형 경로를 따라가며 두께와 정렬에 따라 필요한 외곽 공간을 계산합니다.", "바깥쪽 테두리를 사용하면 결과 캔버스가 원본보다 커질 수 있습니다."],
      ["SHADOW", "잘리지 않는 그림자", "가로·세로 위치, 블러, 확산, 색상과 불투명도를 조절하고 자동 여백으로 그림자 범위를 확보합니다.", "그림자 위치가 한쪽으로 치우쳐도 필요한 방향의 여백을 따로 계산합니다."],
    ] as const,
    useTitle: "어떤 형태를 선택해야 하나요?",
    useItems: [
      "프로필 사진은 원형 모드를 사용하면 원본을 임의로 자르지 않고 정확한 원형 결과를 만들 수 있습니다.",
      "앱 화면이나 카드 이미지는 작은 반경과 얇은 테두리를 조합하면 원본 인상을 크게 바꾸지 않고 외곽만 정리할 수 있습니다.",
      "투명 PNG는 둥근 모서리 바깥의 알파를 유지할 수 있어 웹·앱 자산에 적합합니다.",
    ],
    noteTitle: "저장 전에 확인할 점",
    noteItems: [
      "JPG는 투명도를 저장하지 못하므로 투명 배경 상태에서 JPG로 저장하면 선택한 배경색이 합성됩니다.",
      "바깥쪽 테두리와 큰 그림자는 결과 캔버스를 확장하므로 원본보다 결과 픽셀 크기가 커질 수 있습니다.",
      "원형 모드는 직사각형 원본을 강제로 크롭하지 않고 전체를 보존하는 방식을 사용합니다.",
      "일반 사용자용 서비스 상한은 결과 이미지 한 변 16,000px, 총 80,000,000픽셀입니다. 테두리·그림자·여백으로 확장된 최종 결과도 같은 기준을 적용합니다.",
    ],
    directionTitle: "설정이 결과 크기에 반영되는 순서",
    directionDesc: "형태만 바꾸는 경우와 테두리·그림자까지 사용하는 경우를 구분하면 결과 크기를 예측하기 쉽습니다.",
    directions: [
      ["SHAPE", "BORDER", "형태를 먼저 확정", "둥근 모서리 또는 원형을 먼저 정한 뒤 그 경로를 기준으로 테두리를 계산합니다."],
      ["BORDER", "SHADOW", "외곽 효과 범위 계산", "중앙·바깥 테두리와 그림자의 X·Y·블러·확산 값을 이용해 필요한 외곽 범위를 계산합니다."],
      ["PADDING", "OUTPUT", "캔버스 확장 후 저장", "자동 여백과 추가 여백을 합쳐 최종 캔버스를 만든 뒤 JPG·PNG·WebP로 렌더링합니다."],
    ] as const,
    detailsTitle: "실제 결과 품질을 좌우하는 네 가지",
    details: [
      ["01", "모서리 안티앨리어싱", "작은 이미지나 큰 radius에서도 경계가 톱니처럼 보이지 않도록 실제 캔버스 경로를 사용합니다."],
      ["02", "테두리 두께 균일도", "원형과 둥근 모서리에서도 외곽선이 한쪽만 두껍거나 모서리에서 끊겨 보이지 않도록 경로를 맞춥니다."],
      ["03", "투명 알파", "PNG·WebP의 둥근 모서리와 그림자 주변은 투명 픽셀을 유지하고 미리보기 체크 패턴은 결과 파일에 포함하지 않습니다."],
      ["04", "원본 해상도 출력", "미리보기는 화면에 맞게 축소하지만 다운로드 시에는 원본 해상도를 기준으로 다시 렌더링합니다."],
    ] as const,
    expertTitle: "이미지 외곽 스타일을 깨끗하게 만드는 실무 기준",
    expertDesc: "둥근 모서리, 원형 이미지, 테두리와 그림자는 단순한 장식처럼 보이지만 반경·정렬·알파·캔버스 계산이 어긋나면 저장 결과에서 바로 티가 납니다.",
    expert: [
      ["반경은 이미지 크기와 함께 봐야 합니다", "같은 40px 반경이라도 300px 이미지와 3000px 이미지에서 보이는 정도는 다릅니다. 카드형 이미지는 짧은 변을 기준으로 비율을 생각하고, 개별 모서리를 사용할 때는 네 모서리의 합이 가로·세로 크기와 충돌하지 않도록 정상화된 결과를 확인하는 것이 좋습니다."],
      ["원형 이미지는 50% radius만으로 충분하지 않습니다", "직사각형 이미지에 단순히 50% 반경을 주면 타원이 됩니다. 정확한 원을 만들려면 정사각형 결과 영역이 필요합니다. 이 도구는 원본을 임의로 중앙 크롭하지 않고 전체를 보존하는 정사각형 캔버스에 배치한 뒤 원형 마스크를 적용합니다."],
      ["테두리 정렬에 따라 결과 크기가 달라집니다", "안쪽 테두리는 원본 캔버스 안에 들어가므로 결과 크기를 유지하기 쉽습니다. 중앙과 바깥쪽 테두리는 일부가 원본 바깥으로 나가므로 잘리지 않게 캔버스를 넓혀야 합니다. 같은 두께라도 정렬 방식에 따라 이미지가 차지하는 실제 영역이 달라집니다."],
      ["둥근 모서리와 테두리는 같은 radius를 그대로 쓰면 어색할 수 있습니다", "테두리 중심 경로와 이미지 마스크의 반경을 무조건 같은 값으로 두면 모서리에서 두께가 불균일해 보일 수 있습니다. 테두리 위치와 두께를 고려해 내부·외부 경로가 함께 맞아야 얇은 선부터 두꺼운 선까지 자연스럽습니다."],
      ["그림자 자동 여백은 잘림 방지 기능입니다", "그림자의 블러와 확산만큼 사방에 같은 여백을 더하는 방식은 X·Y 오프셋이 큰 경우 비효율적이거나 한쪽이 잘릴 수 있습니다. 실제 그림자 범위를 상·하·좌·우로 나눠 계산해야 위치를 옮겨도 그림자가 결과 캔버스 밖으로 빠지지 않습니다."],
      ["투명 PNG와 JPG는 결과 기준이 다릅니다", "PNG와 WebP는 둥근 모서리 바깥과 그림자 주변의 알파를 그대로 저장할 수 있습니다. JPG는 알파 채널이 없기 때문에 투명 영역을 특정 배경색과 합성해야 합니다. 같은 미리보기라도 JPG 저장 시 배경색에 따라 경계 인상이 달라질 수 있습니다."],
      ["미리보기와 다운로드를 같은 크기로 렌더링할 필요는 없습니다", "고해상도 원본을 화면 미리보기마다 그대로 다시 그리면 브라우저 메모리와 반응성이 급격히 나빠질 수 있습니다. 미리보기는 화면 크기에 맞춰 가볍게 렌더링하고, 다운로드할 때 원본 해상도로 최종 렌더링하는 편이 품질과 성능을 함께 지키기 좋습니다."],
      ["그림자와 외곽 테두리는 파일 크기보다 픽셀 면적을 먼저 봐야 합니다", "입력 파일이 작아도 큰 여백·바깥 테두리·그림자를 조합하면 결과 캔버스 면적은 크게 늘어날 수 있습니다. 실제 처리 한계는 압축 파일 용량만으로 판단하지 않고 결과 가로·세로와 총 픽셀, 인코딩 시 메모리 사용량을 함께 검수해야 합니다."],
    ] as readonly Pair[],
    faqs: [
      ["이미지 모서리를 둥글게 만들 수 있나요?", "예. 전체 모서리를 동시에 조절하거나 각 모서리를 개별 설정할 수 있습니다."],
      ["원형 이미지도 만들 수 있나요?", "예. 직사각형 원본은 자르지 않고 정사각형 캔버스에 전체를 보존한 뒤 원형 마스크를 적용합니다."],
      ["둥근 이미지에도 테두리를 넣을 수 있나요?", "예. 테두리는 둥근 모서리 경로를 따라 적용됩니다."],
      ["테두리 정렬도 바꿀 수 있나요?", "예. 안쪽, 중앙, 바깥쪽 정렬을 선택할 수 있으며 필요한 경우 결과 캔버스가 확장됩니다."],
      ["그림자를 추가할 수 있나요?", "예. 가로·세로 위치, 블러, 확산, 색상과 불투명도를 조절할 수 있습니다."],
      ["그림자가 잘리지 않나요?", "자동 여백을 켜면 그림자 범위를 계산해 필요한 외곽 공간을 확보합니다."],
      ["모서리 바깥을 투명하게 저장할 수 있나요?", "예. PNG 또는 투명도를 지원하는 WebP를 사용하세요."],
      ["JPG에서도 투명 모서리를 저장할 수 있나요?", "아니요. JPG는 투명도를 지원하지 않아 선택한 배경색을 합성합니다."],
      ["이미지는 서버로 업로드되나요?", "아니요. 현재 브라우저 안에서 처리됩니다."],
      ["모바일에서도 사용할 수 있나요?", "예. 모바일에서도 형태, 테두리, 그림자, 배경과 출력을 조절할 수 있습니다."],
      ["최대 결과 크기는 얼마인가요?", "일반 사용자용 서비스 상한은 한 변 16,000px, 총 80,000,000픽셀입니다. 테두리·그림자·여백으로 결과 캔버스가 커지는 경우에도 같은 상한을 적용합니다."],
    ] as readonly Pair[],
    more: "FAQ 더보기",
    collapse: "FAQ 접기",
  },
  en: {
    back: "Image Edit",
    title: "Image Border & Rounded Corners Tool",
    titleLines: ["Image Border &", "Rounded Corners Tool"],
    desc: "Add borders, rounded corners, circular shapes, and shadows to images.",
    steps: ["Select an image and choose rounded corners or circle mode.", "Adjust the corner radius and individual corners.", "Set border thickness, color, and alignment if needed.", "Adjust shadow offset, blur, spread, opacity, background, and auto padding.", "Compare the original, result, and output pixels, then choose format and quality and download."],
    guideTitle: "How to render rounded corners, borders, and shadows correctly",
    guideDesc: "The shape and outer effects are rendered into the downloaded pixels rather than being shown only as CSS preview effects.",
    guideCards: [
      ["RADIUS", "Linked or individual corners", "Adjust all four corners together or unlink them and set each corner independently.", "Large radii are normalized against image dimensions so paths do not overlap or break."],
      ["BORDER", "Inside, center, or outside", "Borders follow the rounded or circular path and canvas expansion is calculated from thickness and alignment.", "Outside borders can make the result canvas larger than the source."],
      ["SHADOW", "Shadow without clipping", "Adjust X/Y offset, blur, spread, color, and opacity while Auto Padding reserves the required bounds.", "Padding is calculated per side even when the shadow is strongly offset."],
    ] as const,
    useTitle: "Which shape should you choose?",
    useItems: ["Circle mode is useful for profile images because it creates a true circle without forcing a crop of the source.", "Small radii with thin borders work well for app screenshots and card images when you want a cleaner edge without changing the source impression.", "Transparent PNG output is useful for web and app assets because the pixels outside rounded corners can remain transparent."],
    noteTitle: "Check before exporting",
    noteItems: ["JPG cannot store alpha. If the background is transparent, JPG export composites the selected background color.", "Outside borders and large shadows can enlarge the result canvas beyond the source dimensions.", "Circle mode preserves the full rectangular source instead of automatically center-cropping it.", "For general users, the service ceiling is 16,000px per side and 80,000,000 total output pixels, including canvas expansion from borders, shadows, and padding."],
    directionTitle: "How settings affect the result canvas",
    directionDesc: "Separating shape, outer effects, and padding makes the final dimensions easier to predict.",
    directions: [["SHAPE", "BORDER", "Lock the shape first", "Choose rounded or circular geometry first, then calculate the border against that path."], ["BORDER", "SHADOW", "Calculate outer effect bounds", "Center/outside borders and shadow X/Y, blur, and spread determine how far the canvas must expand."], ["PADDING", "OUTPUT", "Expand then export", "Auto padding and extra padding are combined before the final JPG, PNG, or WebP render."]] as const,
    detailsTitle: "Four details that determine real output quality",
    details: [["01", "Corner anti-aliasing", "Canvas paths keep boundaries smoother on small images and large radii."], ["02", "Uniform border thickness", "Circular and rounded paths are aligned so borders do not look thicker on one side or break at corners."], ["03", "Transparent alpha", "PNG and WebP retain transparent pixels around rounded corners and shadows; preview checkerboards are never exported."], ["04", "Source-resolution export", "The preview is scaled for the screen, while downloads are rendered again from the source resolution."]] as const,
    expertTitle: "Practical criteria for clean image edge styling",
    expertDesc: "Rounded corners, circles, borders, and shadows look simple, but incorrect radius, alignment, alpha, or canvas math becomes obvious in the saved file.",
    expert: [
      ["Radius should be judged relative to image size", "The same 40px radius looks very different on a 300px image and a 3000px image. For card-style images, think about the radius relative to the shorter side and verify normalized corner geometry when individual values are used."],
      ["A true circle needs more than 50% radius", "Applying a 50% radius to a rectangle creates an ellipse. A true circle requires a square output area. This tool preserves the full source instead of forcing a center crop, then applies the circular mask on a square canvas."],
      ["Border alignment changes output dimensions", "Inside borders are easier to keep within the source canvas. Center and outside borders extend beyond the source edge, so the output canvas must expand to prevent clipping."],
      ["Border and mask radii should not be treated as identical paths", "Using exactly the same radius for the image mask and border centerline can make thickness look uneven around corners. Border position and thickness must be reflected in the inner and outer geometry."],
      ["Auto padding is a clipping-prevention calculation", "Adding the same margin on every side is not enough when a shadow has a strong X or Y offset. The shadow bounds should be calculated independently for the top, right, bottom, and left."],
      ["Transparent PNG/WebP and JPG follow different rules", "PNG and WebP can preserve alpha around rounded corners and shadows. JPG has no alpha channel, so transparent pixels must be composited over a background color, which can change how edges appear."],
      ["Preview and download do not need the same render size", "Rendering a large source at full resolution on every preview update wastes memory and hurts responsiveness. A scaled preview plus a final source-resolution render is usually the safer balance."],
      ["Watch pixel area, not only file size", "A small compressed source can produce a very large canvas after outside borders, padding, and shadows. Safe limits should consider output width, height, total pixels, and encoding memory rather than compressed bytes alone."],
    ] as readonly Pair[],
    faqs: [["Can I round image corners?", "Yes. Adjust all corners together or set each corner independently."], ["Can I create a circular image?", "Yes. Rectangular sources are preserved inside a square canvas before the circular mask is applied."], ["Can rounded images have borders?", "Yes. The border follows the rounded path."], ["Can I change border alignment?", "Yes. Choose inside, center, or outside; the result canvas expands when required."], ["Can I add a shadow?", "Yes. Adjust horizontal and vertical offsets, blur, spread, color, and opacity."], ["Will the shadow be clipped?", "Auto Padding calculates extra space from the shadow bounds."], ["Can corner areas stay transparent?", "Yes. Use PNG or transparency-capable WebP."], ["Can JPG store transparent corners?", "No. JPG uses the selected background color instead."], ["Are images uploaded?", "No. Processing stays in the browser."], ["Does it work on mobile?", "Yes. Shape, border, shadow, background, and output controls are available on mobile."], ["What is the maximum result size?", "For general users, the service ceiling is 16,000px per side and 80,000,000 total output pixels. Expanded canvas from borders, shadows, and padding follows the same ceiling."]] as readonly Pair[],
    more: "Show more FAQs",
    collapse: "Collapse FAQs",
  },
  ja: {
    back: "画像編集",
    title: "画像枠線・角丸ツール",
    titleLines: ["画像枠線・角丸", "ツール"],
    desc: "画像に枠線、角丸、円形効果、影を追加できます。",
    steps: ["画像を選択し、角丸または円形を選びます。", "角の半径と各コーナーを調整します。", "必要に応じて枠線の太さ・色・配置を設定します。", "影の位置・ぼかし・広がり・不透明度、背景・自動余白を確認します。", "元画像・結果・出力ピクセルを比較し、出力形式と画質を選んで保存します。"],
    guideTitle: "角丸・枠線・影を正確に描画する基準",
    guideDesc: "CSS表示だけでなく、保存画像の実ピクセルに形状と外側効果を描画します。",
    guideCards: [["RADIUS", "一括・個別の角半径", "4つの角を一括調整するか、連動を解除して個別に設定できます。", "大きな半径は画像サイズに合わせて正規化し、形状の重なりや崩れを防ぎます。"], ["BORDER", "内側・中央・外側", "枠線は角丸・円形の経路に沿い、太さと配置に応じて必要な外側領域を計算します。", "外側枠線では結果キャンバスが元画像より大きくなる場合があります。"], ["SHADOW", "切れない影", "X・Y位置、ぼかし、広がり、色、不透明度を調整し、自動余白で必要範囲を確保します。", "影が片側へ大きく移動しても方向ごとに余白を計算します。"]] as const,
    useTitle: "どの形状を選ぶべきですか？",
    useItems: ["プロフィール画像には、元画像を強制的に切り抜かず正確な円を作れる円形モードが適しています。", "アプリ画面やカード画像では、小さめの角丸と細い枠線を組み合わせると自然に外周を整えられます。", "透明PNGは角丸の外側を透明のまま保存できるためWeb・アプリ素材に向いています。"],
    noteTitle: "保存前に確認すること",
    noteItems: ["JPGは透明度を保存できないため、透明背景では選択した背景色を合成して保存します。", "外側枠線や大きな影は結果キャンバスを広げるため、元画像より出力ピクセルが増える場合があります。", "円形モードは長方形画像を自動で中央切り抜きせず、元画像全体を保持します。", "一般ユーザー向けのサービス上限は、結果画像の一辺16,000px・合計80,000,000ピクセルです。枠線・影・余白で拡張された最終結果にも同じ基準を適用します。"],
    directionTitle: "設定が結果サイズへ反映される順序",
    directionDesc: "形状、外側効果、余白を分けて考えると最終サイズを予測しやすくなります。",
    directions: [["SHAPE", "BORDER", "先に形状を決める", "角丸または円形を決め、その経路を基準に枠線を計算します。"], ["BORDER", "SHADOW", "外側効果の範囲を計算", "中央・外側枠線と影のX・Y、ぼかし、広がりから必要な拡張量を求めます。"], ["PADDING", "OUTPUT", "余白を加えて保存", "自動余白と追加余白を反映してからJPG・PNG・WebPとして最終描画します。"]] as const,
    detailsTitle: "実際の出力品質を左右する4項目",
    details: [["01", "角のアンチエイリアス", "小さい画像や大きな半径でも境界がギザギザになりにくいようCanvas経路で描画します。"], ["02", "枠線の均一な太さ", "円形や角丸でも一部だけ太く見えたり角で途切れたりしないよう経路を合わせます。"], ["03", "透明アルファ", "PNG・WebPでは角丸や影の周囲の透明ピクセルを保持し、プレビューの市松模様は保存しません。"], ["04", "元解像度で保存", "プレビューは画面用に縮小し、保存時は元画像の解像度を基準に再描画します。"]] as const,
    expertTitle: "画像の外周スタイルをきれいに仕上げる実務基準",
    expertDesc: "角丸、円形、枠線、影は単純に見えても、半径・配置・透明度・キャンバス計算がずれると保存結果にすぐ現れます。",
    expert: [["半径は画像サイズとの比率で考える", "同じ40pxでも300px画像と3000px画像では見え方が異なります。カード画像では短辺との比率を意識し、個別半径では4つの角が幅・高さと衝突しないよう正規化された結果を確認します。"], ["正確な円は50%の角丸だけでは作れない", "長方形に50%の角丸を適用すると楕円になります。正確な円には正方形の出力領域が必要です。このツールは元画像を強制的に中央切り抜きせず、全体を保持して円形マスクを適用します。"], ["枠線の配置で出力サイズが変わる", "内側枠線は元キャンバス内に収めやすい一方、中央・外側枠線は元画像の外へ出るため、切れないようキャンバスを拡張する必要があります。"], ["マスクと枠線の半径を同じ経路として扱わない", "画像マスクと枠線中心の半径を常に同じにすると角部分で太さが不均一に見えることがあります。枠線位置と太さを反映した内外の形状計算が必要です。"], ["自動余白は影の切れを防ぐ計算", "影がX・Y方向へ偏る場合、四辺に同じ余白を加えるだけでは不十分です。上・右・下・左の影範囲を別々に計算することで位置を変えても切れにくくなります。"], ["透明PNG・WebPとJPGでは保存基準が違う", "PNGとWebPは角丸や影の周囲のアルファを保持できます。JPGにはアルファがないため背景色との合成が必要で、背景色によって境界の印象が変わることがあります。"], ["プレビューと保存を同じ解像度で描画する必要はない", "大きな元画像を設定変更のたびにフル解像度で描画するとメモリと操作性が悪化します。画面用プレビューは縮小し、保存時だけ元解像度で再描画する方法が安全です。"], ["ファイル容量だけでなく結果ピクセル面積を見る", "圧縮された入力ファイルが小さくても外側枠線・余白・影で結果キャンバスは大きくなります。安全限界はファイル容量だけでなく幅・高さ・総ピクセル・エンコード時メモリを合わせて検証します。"]] as readonly Pair[],
    faqs: [["画像の角を丸くできますか？", "はい。すべての角を一括調整するか、各コーナーを個別設定できます。"], ["円形画像も作れますか？", "はい。長方形画像は切り取らず正方形キャンバスに全体を保持してから円形マスクを適用します。"], ["角丸画像にも枠線を付けられますか？", "はい。枠線は角丸の形状に沿って描画されます。"], ["枠線の配置を変更できますか？", "はい。内側・中央・外側を選択でき、必要に応じて結果キャンバスが広がります。"], ["影を追加できますか？", "はい。横位置、縦位置、ぼかし、広がり、色、不透明度を調整できます。"], ["影は切れませんか？", "自動余白を使うと影の範囲から必要な外側スペースを計算します。"], ["角の外側を透明で保存できますか？", "はい。PNGまたは透明度対応WebPを使用します。"], ["JPGで透明な角を保存できますか？", "いいえ。JPGでは選択した背景色を合成します。"], ["画像はサーバーに送信されますか？", "いいえ。ブラウザ内で処理されます。"], ["モバイルでも使えますか？", "はい。形状、枠線、影、背景、出力をモバイルでも調整できます。"], ["最大の結果サイズはどれくらいですか？", "一般ユーザー向けのサービス上限は一辺16,000px・合計80,000,000ピクセルです。枠線・影・余白でキャンバスが広がる場合も同じ上限を適用します。"]] as readonly Pair[],
    more: "FAQをもっと見る",
    collapse: "FAQを閉じる",
  },
} as const;

export function ImageBorderRoundedPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/image-border-rounded-corners-tool`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: t.title, applicationCategory: "MultimediaApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, url, description: t.desc },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` }, { "@type": "ListItem", position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/image-edit` }, { "@type": "ListItem", position: 3, name: t.title, item: url }] },
  ];

  const ready = locale === "ko" ? "사용 가능" : locale === "en" ? "Available" : "利用可能";

  return (
    <ToolboxSubpageShell locale={locale} appName={t.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="toolbox-tool-detail-hero">
        <Link className="toolbox-subpage-back" href={`/${locale}/category/image-edit`}>← {t.back}</Link>
        <p className="toolbox-subpage-eyebrow">012 · IMAGE EDIT</p>
        <div className="toolbox-tool-detail-heading">
          <h1>{t.titleLines.map((line) => <span className="toolbox-tool-title-line" key={line}>{line}</span>)}</h1>
          <p>{t.desc}</p>
        </div>
        <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{locale === "ko" ? "브라우저에서 바로 처리" : locale === "en" ? "PROCESS IN YOUR BROWSER" : "ブラウザ内で処理"}</span></div>
      </section>

      <section className="toolbox-tool-detail-body">
        <div>
          <ImageBorderRoundedTool locale={locale} />
          <section className="toolbox-next-work">
            <div><p>NEXT WORK</p><h2>{locale === "ko" ? "다음 작업" : locale === "en" ? "Next steps" : "次の作業"}</h2></div>
            <div className="toolbox-next-work-grid">
              {[
                ["011", locale === "ko" ? "이미지 여백·배경 추가기" : locale === "en" ? "Image Padding & Background Tool" : "画像余白・背景追加ツール", "image-padding-background-tool"],
                ["004", locale === "ko" ? "이미지 압축기" : locale === "en" ? "Image Compressor" : "画像圧縮ツール", "image-compressor"],
                ["006", locale === "ko" ? "이미지 크기 변경기" : locale === "en" ? "Image Resizer" : "画像サイズ変更ツール", "image-resizer"],
                ["001", locale === "ko" ? "JPG·PNG·WebP 이미지 변환기" : locale === "en" ? "JPG, PNG & WebP Image Converter" : "JPG・PNG・WebP画像変換ツール", "jpg-png-webp-image-converter"],
              ].map(([n, name, slug]) => <Link key={n} href={`/${locale}/${slug}`} className="toolbox-next-work-card"><span>{n}</span><h3>{name}</h3><div className="toolbox-next-work-card-foot"><span>{ready}</span><strong>↗</strong></div></Link>)}
            </div>
          </section>
        </div>
      </section>

      <section className="toolbox-tool-guide toolbox-tool-guide--012-five">
        <div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{locale === "ko" ? "사용 방법" : locale === "en" ? "How to use" : "使い方"}</h2></div>
        <ol>{t.steps.map((s, i) => <li key={s}><span>{String(i + 1).padStart(2, "0")}</span><p>{s}</p></li>)}</ol>
      </section>

      <section className="toolbox-tool-format-guide">
        <div className="toolbox-tool-format-guide-head"><p>EDGE STYLE GUIDE</p><h2>{locale === "ko" ? <>둥근 모서리·테두리·그림자를<br />정확하게 적용하는 기준</> : t.guideTitle}</h2><span>{t.guideDesc}</span></div>
        <div className="toolbox-tool-format-body">
          <div className="toolbox-tool-format-grid">
            {t.guideCards.map(([name, use, strengths, note]) => <article key={name}><strong>{name}</strong><h3>{use}</h3><p>{strengths}</p><small>{note}</small></article>)}
          </div>
          <div className="toolbox-tool-format-notes">
            <article><h3>{t.useTitle}</h3><ul>{t.useItems.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article><h3>{t.noteTitle}</h3><ul>{t.noteItems.map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>
          <div className="toolbox-tool-direction-guide">
            <div className="toolbox-tool-section-intro"><p>RENDER ROUTES</p><h3>{t.directionTitle}</h3><span>{t.directionDesc}</span></div>
            <div className="toolbox-tool-direction-grid">
              {t.directions.map(([from, to, title, description]) => <article key={`${from}-${to}`}><div className="toolbox-tool-direction-route"><strong>{from}</strong><span>→</span><strong>{to}</strong></div><h4>{title}</h4><p>{description}</p></article>)}
            </div>
          </div>
          <div className="toolbox-tool-result-guide">
            <div className="toolbox-tool-section-intro toolbox-tool-section-intro-compact"><p>PRACTICAL DETAILS</p><h3>{t.detailsTitle}</h3></div>
            <div className="toolbox-tool-result-grid">
              {t.details.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h4>{title}</h4><p>{description}</p></div></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--012">
        <div className="toolbox-tool-format-guide-head"><p>EXPERT POST</p><h2>{locale === "ko" ? <>이미지 외곽 스타일을<br />깨끗하게 만드는 실무 기준</> : t.expertTitle}</h2><span>{t.expertDesc}</span></div>
        <div className="toolbox-tool-format-body"><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{t.expert.map(([h, p]) => <article key={h}><h4>{h}</h4><p>{p}</p></article>)}</div></div>
      </section>

      <section className="toolbox-tool-faq">
        <div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{locale === "ko" ? "자주 묻는 질문" : locale === "en" ? "Frequently asked questions" : "よくある質問"}</h2></div>
        <ToolboxFaqList items={[...t.faqs]} initialCount={5} moreLabel={t.more} collapseLabel={t.collapse} className="toolbox-tool-faq-list" />
      </section>
      <section className="toolbox-tool-processing-note"><p>{locale === "ko" ? "원본 파일은 수정되지 않으며 모든 처리는 현재 브라우저 안에서 수행됩니다." : locale === "en" ? "The original file is unchanged and all processing stays in the current browser." : "元ファイルは変更されず、すべての処理は現在のブラウザ内で行われます。"}</p></section>
    </ToolboxSubpageShell>
  );
}
