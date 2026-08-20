import { ToolNavigation } from "@/components/tool-navigation";
import Link from "next/link";
import { TargetSizeCompressorTool } from "@/components/target-size-compressor-tool";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const copy = {
  ko: {
    back: "이미지 변환·최적화", title1: "목표 용량", title2: "이미지 압축기",
    desc: "JPG, PNG, WebP 이미지를 원하는 KB·MB 이하로 가능한 한 높은 화질로 압축합니다.",
    how: "사용 방법", steps: ["JPG, PNG 또는 WebP 이미지를 선택합니다.", "원하는 최대 파일 용량을 KB 또는 MB로 입력합니다.", "원본 크기를 유지할지, 목표 달성을 위해 이미지 크기 축소를 허용할지 선택합니다.", "목표 용량으로 압축을 누르고 결과 상태와 화질을 확인합니다.", "개별 파일 또는 목표 달성 파일만 담긴 ZIP으로 저장합니다."],
    guide: "목표 용량 이하 압축의 원리", guideDesc: "목표값과 정확히 같은 용량이 아니라, 목표를 넘지 않는 범위에서 가능한 가장 높은 품질을 탐색합니다. JPG와 WebP는 품질을 반복 탐색하고, PNG는 무손실 최적화와 색상 최적화를 단계적으로 적용합니다.",
    cards: [
      ["JPG", "품질 이진 탐색", "실제 결과 바이트를 확인하면서 목표 이하의 가장 높은 품질을 찾습니다."],
      ["PNG", "무손실부터 단계 처리", "무손실 최적화 후 필요할 때만 색상 수를 줄이며 투명도는 유지합니다."],
      ["WebP", "정적 이미지 목표 압축", "원본 형식과 투명도를 유지하면서 품질을 반복 탐색합니다."],
    ],
    checks: [["01","목표 이하만 성공","목표보다 조금이라도 크면 목표 달성으로 표시하지 않습니다."],["02","이미 목표 이하","불필요한 재압축 없이 원본 파일을 그대로 유지합니다."],["03","해상도 축소는 선택 사항","사용자가 허용한 경우에만 비율을 유지하며 단계적으로 줄입니다."],["04","결과 변화 공개","실제 용량, 품질값, 원본과 결과 픽셀 크기를 모두 표시합니다."]],
    practicalTitle:"목표 용량을 정할 때 알아둘 실무 기준", practical:[["제출 제한보다 약간 낮게 설정","사이트마다 KB 계산과 반올림 방식이 달라 경계값에서 거절될 수 있습니다. 작은 안전 여유는 오류를 줄이지만 지나치게 낮추면 화질을 불필요하게 잃습니다."],["작은 목표일수록 해상도 허용 여부가 중요","품질만 낮춰 목표를 맞추기 어려운 경우가 있습니다. 해상도 축소를 허용하면 달성 가능성이 높아지지만 픽셀 크기가 줄어듭니다."],["PNG는 사진보다 목표 달성이 어려울 수 있음","투명도와 많은 색상을 유지하는 PNG는 작은 목표에서 한계가 빠르게 옵니다. 형식은 유지되므로 JPG처럼 강하게 줄어들지 않을 수 있습니다."],["결과는 실제 제출처에서 최종 확인","같은 100KB라도 표시 방식과 업로드 검증이 다를 수 있습니다. 결과가 목표 이하인지 확인한 뒤 실제 제출 화면에서도 한 번 검증하는 것이 안전합니다."]],
    faqTitle: "자주 묻는 질문", more: "FAQ 더보기", collapse: "FAQ 접기",
    faqs: [["결과가 입력한 용량과 정확히 같게 나오나요?","아니요. 입력한 용량을 넘지 않는 범위에서 가능한 한 높은 품질로 생성됩니다."],["100KB를 조금 넘을 수도 있나요?","목표 달성 여부는 실제 파일 바이트를 기준으로 확인하며, 작은 안전 여유를 적용합니다."],["이미지 크기도 자동으로 줄어드나요?","기본은 원본 픽셀 크기를 유지합니다. 크기 축소를 허용한 경우에만 줄어듭니다."],["목표 용량을 달성하지 못할 수도 있나요?","네. 목표값이 너무 작거나 PNG처럼 압축이 어려운 형식은 달성하지 못할 수 있습니다."],["원본이 이미 목표보다 작으면 어떻게 되나요?","재압축하지 않고 원본을 유지합니다."],["PNG도 원하는 KB 이하로 줄일 수 있나요?","가능한 범위에서 무손실 최적화와 색상 최적화를 적용합니다. 작은 목표는 달성하기 어려울 수 있습니다."],["PNG를 JPG로 자동 변환하나요?","아니요. 원본 형식을 유지합니다."],["여러 이미지에 같은 목표를 적용할 수 있나요?","네. 전체 적용과 파일별 설정을 모두 지원합니다."],["화질을 비교할 수 있나요?","네. 원본과 결과를 비교 슬라이더와 확대·축소로 확인할 수 있습니다."],["파일이 서버로 업로드되나요?","아니요. 브라우저 내부에서 처리됩니다."],["메타데이터는 유지되나요?","재인코딩되는 결과에서는 기본적으로 제거됩니다. 이미 목표 이하인 원본은 그대로 유지됩니다."],["무료인가요?","네. 로그인, 워터마크, 유료 품질 제한 없이 사용할 수 있습니다."]],
  },
  en: {
    back: "Image Convert", title1: "Target Size", title2: "Image Compressor",
    desc: "Compress JPG, PNG and WebP images below your chosen KB or MB limit with the highest possible quality.",
    how: "How to use", steps: ["Choose JPG, PNG, or WebP images.", "Enter the maximum file size in KB or MB.", "Keep original dimensions or allow resizing to reach the target.", "Run compression and check target status and quality.", "Download individual files or a ZIP containing target-compliant results."],
    guide: "How target-size compression works", guideDesc: "The tool does not aim for an exact byte count. It searches for the highest quality result that stays below the selected limit. JPG and WebP use repeated quality searches; PNG uses lossless and colour-reduction stages.",
    cards: [["JPG","Binary quality search","Each candidate is measured in real bytes to find the highest quality below the target."],["PNG","Lossless-first workflow","Lossless optimisation runs first; colour reduction is used only when needed, while preserving transparency."],["WebP","Static target compression","The original format and transparency are kept while quality is searched repeatedly."]],
    checks: [["01","Only below-target results pass","Even a small overage is never labelled as target reached."],["02","Already below target","The original file is kept to avoid unnecessary quality loss."],["03","Resizing is optional","Dimensions are reduced only when the user explicitly allows it."],["04","Changes stay visible","Actual size, quality, and original/output dimensions are shown." ]],
    practicalTitle:"Practical criteria for choosing a target", practical:[["Set the limit slightly below the submission cap","Sites can calculate KB and round values differently. A small safety margin reduces rejection risk, but an excessive margin sacrifices quality unnecessarily."],["Very small targets may require resizing","Quality reduction alone may not reach a strict limit. Allowing resizing improves the chance of success but reduces pixel dimensions."],["PNG may hit its limit sooner than photos","A PNG that preserves transparency and many colours can be difficult to shrink aggressively. The format is kept, so it may not compress like JPG."],["Verify the result in the actual destination","A displayed 100 KB can be interpreted differently by upload systems. Confirm the final byte size and test it in the real submission form when possible."]],
    faqTitle: "Frequently asked questions", more: "View more FAQs", collapse: "Show fewer FAQs",
    faqs: [["Will the result be exactly the entered size?","No. It is generated below the limit at the highest possible quality."],["Can a 100 KB target be exceeded slightly?","Target status is checked against actual file bytes, with a small safety margin."],["Will dimensions be reduced automatically?","Original dimensions are kept by default. Resizing occurs only when allowed."],["Can the target be impossible?","Yes. Very small limits or hard-to-compress PNG files may not reach the target."],["What if the original is already smaller?","The original file is kept without recompression."],["Can PNG reach a chosen KB limit?","Lossless and colour optimisation are attempted, but very small limits may be impossible."],["Will PNG be changed to JPG?","No. The source format is preserved."],["Can I apply one target to many files?","Yes. Apply one target to all or customise files individually."],["Can I compare quality?","Yes. Use the comparison slider and zoom controls."],["Are files uploaded?","No. Processing happens in your browser."],["Is metadata retained?","Re-encoded results remove metadata by default. Originals already below target are kept unchanged."],["Is it free?","Yes. No sign-in, watermark, or paid quality limit is required."]],
  },
  ja: {
    back: "画像変換・最適化", title1: "目標容量", title2: "画像圧縮ツール",
    desc: "JPG・PNG・WebP画像を指定したKB・MB以下に、できるだけ高い画質で圧縮します。",
    how: "使い方", steps: ["JPG・PNG・WebP画像を選択します。", "最大ファイル容量をKBまたはMBで入力します。", "元のサイズを維持するか、目標達成のため縮小を許可します。", "目標容量に圧縮し、達成状況と画質を確認します。", "個別ファイルまたは目標達成ファイルのZIPを保存します。"],
    guide: "目標容量以下に圧縮する仕組み", guideDesc: "入力値と完全に同じ容量ではなく、上限を超えない範囲で最も高い画質を探します。JPG・WebPは画質を繰り返し探索し、PNGは可逆最適化と色数最適化を段階的に適用します。",
    cards: [["JPG","画質の二分探索","実際のバイト数を確認しながら、目標以下で最も高い画質を探します。"],["PNG","可逆処理を優先","可逆最適化の後、必要な場合のみ色数を減らし、透明度は維持します。"],["WebP","静止画像の目標圧縮","元の形式と透明度を保ちながら画質を繰り返し探索します。"]],
    checks: [["01","目標以下のみ成功","少しでも超えた場合は目標達成と表示しません。"],["02","すでに目標以下","不要な再圧縮を行わず元ファイルを維持します。"],["03","縮小は選択制","ユーザーが許可した場合のみ比率を維持して縮小します。"],["04","変更内容を表示","実際の容量、画質、元と結果のピクセルサイズを表示します。"]],
    practicalTitle:"目標容量を決めるための実用基準", practical:[["提出上限より少し低く設定","サイトごとにKB計算や丸め方が異なり、境界値では拒否される場合があります。小さな余裕は安全ですが、大きすぎる余裕は画質を不必要に下げます。"],["小さい目標では縮小許可が重要","画質を下げるだけでは目標に届かない場合があります。縮小を許可すると達成しやすくなりますが、ピクセルサイズは小さくなります。"],["PNGは写真より目標達成が難しい場合がある","透明度と多くの色を維持するPNGは、小さい目標で限界に達しやすい形式です。形式を維持するためJPGのようには小さくならない場合があります。"],["実際の提出先で最終確認","同じ100KBでも表示や判定方法が異なることがあります。目標以下を確認したうえで、実際の提出画面でも確認すると安全です。"]],
    faqTitle: "よくある質問", more: "FAQをもっと見る", collapse: "FAQを閉じる",
    faqs: [["入力した容量と完全に同じになりますか？","いいえ。上限を超えない範囲で、できるだけ高い画質にします。"],["100KBを少し超えることはありますか？","実際のファイルバイトで判定し、小さな安全余裕を適用します。"],["画像サイズも自動で小さくなりますか？","基本は元のピクセルサイズを維持します。縮小を許可した場合のみ変更されます。"],["目標を達成できない場合がありますか？","はい。非常に小さい目標や圧縮しにくいPNGでは達成できない場合があります。"],["元画像がすでに小さい場合は？","再圧縮せず元ファイルを維持します。"],["PNGも指定KB以下にできますか？","可逆最適化と色数最適化を試しますが、小さい目標は難しい場合があります。"],["PNGを自動でJPGに変換しますか？","いいえ。元の形式を維持します。"],["複数画像に同じ目標を適用できますか？","はい。一括適用と個別設定に対応します。"],["画質を比較できますか？","はい。比較スライダーと拡大・縮小で確認できます。"],["サーバーに送信されますか？","いいえ。ブラウザ内で処理されます。"],["メタデータは維持されますか？","再エンコード結果では基本的に削除されます。すでに目標以下の元画像はそのまま維持されます。"],["無料ですか？","はい。ログイン、透かし、有料画質制限なしで利用できます。"]],
  },
} as const;

export function TargetSizeCompressorPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const appName = locale === "ko" ? "목표 용량 이미지 압축기" : locale === "en" ? "Target Size Image Compressor" : "目標容量画像圧縮ツール";
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: appName, applicationCategory: "MultimediaApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, url: `https://toolbox.fixlgs.com/${locale}/target-size-image-compressor`, description: t.desc },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "TOOLBOX", item: `https://toolbox.fixlgs.com/${locale}` }, { "@type": "ListItem", position: 2, name: appName, item: `https://toolbox.fixlgs.com/${locale}/target-size-image-compressor` }] },
  ];
  const next = locale === "ko" ? "다음 작업" : locale === "en" ? "Next steps" : "次の作業";
  const available = locale === "ko" ? "사용 가능" : locale === "en" ? "Available" : "利用可能";
  const soon = locale === "ko" ? "준비 중" : locale === "en" ? "Coming soon" : "準備中";
  return <ToolboxSubpageShell locale={locale} appName={appName}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="toolbox-tool-detail-hero"><Link href={`/${locale}/category/image-convert`} className="toolbox-subpage-back">← {t.back}</Link><p className="toolbox-subpage-eyebrow">005 · IMAGE CONVERT</p><div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title1}</span><span className="toolbox-tool-title-line">{t.title2}</span></h1><p>{t.desc}</p></div><div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{locale === "ko" ? "브라우저에서 바로 처리" : locale === "en" ? "PROCESS IN YOUR BROWSER" : "ブラウザ内で処理"}</span></div></section>
    <section className="toolbox-tool-detail-body"><div><TargetSizeCompressorTool locale={locale}/><ToolNavigation locale={locale} currentTool={5} /></div></section>
    <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((s,i)=><li key={s}><span>{String(i+1).padStart(2,"0")}</span><p>{s}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide"><div className="toolbox-tool-format-guide-head"><p>TARGET SIZE GUIDE</p><h2>{t.guide}</h2><span>{t.guideDesc}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.cards.map(([n,h,p])=><article key={n}><strong>{n}</strong><h3>{h}</h3><p>{p}</p></article>)}</div><div className="toolbox-tool-direction-guide"><div className="toolbox-tool-section-intro"><p>PRACTICAL GUIDE</p><h3>{t.practicalTitle}</h3></div><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{t.practical.map(([h,p])=><article key={h}><h4>{h}</h4><p>{p}</p></article>)}</div></div><div className="toolbox-tool-result-guide"><div className="toolbox-tool-section-intro toolbox-tool-section-intro-compact"><p>CHECK BEFORE USE</p><h3>{locale==="ko"?"압축 전에 확인하세요":locale==="en"?"Check before compressing":"圧縮前に確認してください"}</h3></div><div className="toolbox-tool-result-grid">{t.checks.map(([n,h,p])=><article key={n}><span>{n}</span><h4>{h}</h4><p>{p}</p></article>)}</div></div></div></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs} initialCount={3} moreLabel={t.more} collapseLabel={t.collapse} className="toolbox-tool-faq-list"/></section>
  </ToolboxSubpageShell>;
}
