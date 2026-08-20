import { ToolNavigation } from "@/components/tool-navigation";
import Link from "next/link";
import { SvgBmpTiffConverterTool } from "@/components/svg-bmp-tiff-converter-tool";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const text = {
  ko: {
    back:"이미지 변환·최적화", title1:"SVG·BMP·TIFF", title2:"이미지 변환기", desc:"SVG, BMP, TIFF 이미지를 JPG 또는 PNG로 빠르게 변환합니다.",
    how:"사용 방법", steps:["SVG, BMP 또는 TIFF 이미지를 선택합니다.","파일별 출력 형식과 필요한 옵션을 선택합니다.","변환 후 개별 파일 또는 ZIP으로 다운로드합니다."],
    guideTitle:"SVG·BMP·TIFF 이미지 형식과 변환 기준", guideDesc:"세 형식은 구조와 사용 목적이 서로 다릅니다. SVG는 벡터를 픽셀 이미지로 렌더링하고, BMP는 큰 비압축 이미지를 일반 형식으로 바꾸며, TIFF는 스캔·고품질 이미지를 공유하기 쉬운 형식으로 변환합니다.",
    formats:[
      {name:"SVG",use:"로고·아이콘·벡터 그래픽",strength:"크기를 키워도 선명한 벡터 이미지를 PNG 또는 JPG로 내보낼 수 있습니다.",note:"외부 폰트·외부 이미지·스크립트가 포함된 파일은 원본과 다르게 보일 수 있습니다."},
      {name:"BMP",use:"오래된 이미지·비압축 비트맵",strength:"PNG·JPG·WebP로 바꿔 호환성과 파일 크기를 개선할 수 있습니다.",note:"RLE·특수 헤더·손상된 BMP는 브라우저에서 열리지 않을 수 있습니다."},
      {name:"TIFF",use:"스캔 문서·고품질 원본",strength:"여러 페이지를 각각 PNG 또는 JPG로 변환해 공유하기 쉽게 만들 수 있습니다.",note:"CMYK·16비트·색상 프로필은 RGB 변환 과정에서 색상이 달라질 수 있습니다."}
    ],
    directionTitle:"원본 형식에 따른 변환 방향", directions:[
      {from:"SVG",to:"PNG·JPG",title:"벡터를 일반 이미지로 저장",description:"PNG는 투명 배경을 유지하고, JPG는 선택한 배경색으로 투명 영역을 채웁니다."},
      {from:"BMP",to:"PNG·JPG·WebP",title:"호환성과 용량 개선",description:"PNG는 무손실 저장, JPG와 WebP는 품질 설정을 이용한 용량 절약에 적합합니다."},
      {from:"TIFF",to:"PNG·JPG",title:"스캔·다중 페이지 공유",description:"전체 페이지 또는 선택한 페이지를 각각 번호가 붙은 결과 파일로 저장합니다."}
    ],
    practicalTitle:"변환 결과를 제대로 선택하는 실무 기준", practical:[{title:"SVG는 출력 크기를 먼저 결정",description:"벡터는 픽셀 크기가 정해져 있지 않으므로 실제 사용 위치의 크기에 맞춰 렌더링해야 불필요한 확대와 흐림을 피할 수 있습니다."},{title:"BMP는 이미지 내용에 따라 형식 선택",description:"선명한 그래픽은 PNG, 사진은 JPG나 WebP가 적합합니다. 단순히 가장 작은 형식만 고르면 품질이나 투명도가 달라질 수 있습니다."},{title:"TIFF는 페이지와 색상 특성을 확인",description:"다중 페이지·CMYK·16비트 TIFF는 일반 이미지보다 복잡합니다. 필요한 페이지만 선택하고 RGB 변환에 따른 색상 차이를 확인해야 합니다."},{title:"변환은 원본 품질을 높이지 않음",description:"형식을 바꿔도 이미 손실된 디테일이나 잘못된 색상이 복원되지는 않습니다. 결과 용량과 실제 표시 상태를 함께 확인하세요."}],
    details:[
      {number:"01",title:"SVG 출력 크기",description:"1x·2x·3x 또는 사용자 지정 크기로 렌더링합니다. 원본 비율 유지 여부를 선택할 수 있습니다."},
      {number:"02",title:"투명 배경과 품질",description:"PNG는 투명도를 유지합니다. JPG는 배경색을 적용하며, JPG·WebP는 품질 설정에 따라 용량과 화질이 달라집니다."},
      {number:"03",title:"TIFF 페이지 처리",description:"지원 가능한 일반 TIFF는 페이지 수를 확인하고 전체 또는 원하는 페이지만 선택해 변환할 수 있습니다."},
      {number:"04",title:"개인정보와 제한",description:"파일은 브라우저에서 처리됩니다. 최대 10개, 파일당 20MB, 전체 60MB의 안전 제한을 적용하며 BigTIFF는 제외합니다."}
    ],
    checkBeforeTitle:"변환 전에 확인하세요", faqTitle:"자주 묻는 질문", more:"FAQ 더보기", collapse:"FAQ 접기",
    faqs:[["SVG는 왜 PNG보다 작나요?","SVG는 벡터 정보, PNG는 픽셀 정보를 저장합니다. 출력 크기에 따라 결과 용량이 달라집니다."],["SVG가 원본과 다르게 보입니다.","외부 폰트·외부 이미지·스크립트가 차단되거나 지원되지 않으면 원본과 다르게 보일 수 있습니다."],["BMP를 PNG로 변환하면 화질이 떨어지나요?","PNG는 무손실 형식이므로 일반적으로 추가 화질 손실이 없습니다."],["BMP를 JPG로 변환하면 용량이 줄어드나요?","대부분 줄어들지만 이미지 내용과 품질 설정에 따라 달라집니다."],["TIFF 여러 페이지를 지원하나요?","지원 가능한 일반 TIFF는 각 페이지를 개별 이미지로 변환합니다."],["TIFF 색상이 달라졌습니다.","CMYK·16비트·색상 프로필이 포함된 TIFF는 RGB 변환 과정에서 색상 차이가 발생할 수 있습니다."],["무료인가요?","네. 로그인 없이 무료로 사용할 수 있습니다."],["워터마크가 있나요?","없습니다."]] as const,
    trust:"파일은 브라우저에서 처리되며 서버에 저장되지 않습니다. TIFF 변환 기능 코드는 외부 CDN에서 불러올 수 있습니다."
  },
  en: {
    back:"Image Convert", title1:"SVG, BMP & TIFF", title2:"Image Converter", desc:"Convert SVG, BMP and TIFF images to JPG or PNG quickly.",
    how:"How to use", steps:["Choose SVG, BMP, or TIFF images.","Select an output format and any required options for each file.","Convert, then download files individually or as a ZIP archive."],
    guideTitle:"SVG, BMP, and TIFF: a practical conversion guide", guideDesc:"These formats have different structures and purposes. SVG is rendered from vectors, BMP is usually a large bitmap, and TIFF is common for scans and high-quality source images.",
    formats:[{name:"SVG",use:"Logos, icons, and vector graphics",strength:"Render scalable vector artwork to PNG or JPG at the size you need.",note:"External fonts, images, scripts, and unsupported effects may change the result."},{name:"BMP",use:"Legacy and uncompressed bitmap images",strength:"Convert to PNG, JPG, or WebP for broader compatibility and smaller files.",note:"RLE, unusual headers, palettes, or damaged BMP files may be unsupported."},{name:"TIFF",use:"Scans and high-quality source images",strength:"Convert one or more pages into separate PNG or JPG files.",note:"CMYK, 16-bit colour, and embedded profiles may look different after RGB conversion."}],
    directionTitle:"Choose the route by source format", directions:[{from:"SVG",to:"PNG·JPG",title:"Export vectors as standard images",description:"PNG preserves transparency, while JPG fills transparent areas with the selected background colour."},{from:"BMP",to:"PNG·JPG·WebP",title:"Improve compatibility and size",description:"Use PNG for lossless output or JPG and WebP when reducing file size matters."},{from:"TIFF",to:"PNG·JPG",title:"Share scans and multiple pages",description:"Convert all pages or selected pages into individually numbered output files."}],
    practicalTitle:"Practical criteria for choosing the output", practical:[{title:"Choose SVG output size first",description:"Vectors have no fixed pixel size, so render them at the dimensions required by the final use to avoid unnecessary enlargement or blur."},{title:"Choose BMP output by image content",description:"PNG suits sharp graphics, while JPG or WebP suits photographs. The smallest file is not always the best result for quality or transparency."},{title:"Check TIFF pages and colour characteristics",description:"Multi-page, CMYK, and 16-bit TIFF files are complex. Convert only the pages you need and review colour changes after RGB conversion."},{title:"Conversion does not improve the source",description:"Changing format cannot restore lost detail or incorrect colour. Evaluate file size and the displayed result together."}],
    details:[{number:"01",title:"SVG output size",description:"Choose 1x, 2x, 3x, or a custom size, with optional aspect-ratio locking."},{number:"02",title:"Transparency and quality",description:"PNG preserves transparency. JPG uses a background colour, while JPG and WebP quality settings affect size and detail."},{number:"03",title:"TIFF page handling",description:"Supported standard TIFF files show page counts and allow all or selected pages to be converted."},{number:"04",title:"Privacy and limits",description:"Files are processed in the browser. Safe limits are 10 files, 20 MB per file, and 60 MB total. BigTIFF is excluded."}],
    checkBeforeTitle:"Check before converting", faqTitle:"Frequently asked questions", more:"View more FAQs", collapse:"Show fewer FAQs",
    faqs:[["Why is SVG smaller than PNG?","SVG stores vector instructions while PNG stores pixels. Output dimensions affect the final size."],["Why does my SVG look different?","External fonts, images, scripts, or unsupported effects may be blocked or omitted."],["Does BMP to PNG reduce quality?","PNG is lossless, so it normally adds no further image loss."],["Will BMP to JPG reduce file size?","Usually, although the result depends on image content and quality settings."],["Are multi-page TIFF files supported?","Supported standard TIFF pages are converted into separate image files."],["Why did TIFF colours change?","CMYK, high-bit colour, or embedded profiles can look different after RGB conversion."],["Is it free?","Yes. No login is required."],["Is there a watermark?","No."]] as const,
    trust:"Files are processed in your browser and are not stored on a server. TIFF conversion code may be loaded from an external CDN."
  },
  ja: {
    back:"画像変換・最適化", title1:"SVG・BMP・TIFF", title2:"画像変換ツール", desc:"SVG・BMP・TIFF画像をJPGまたはPNGへすばやく変換します。",
    how:"使い方", steps:["SVG・BMP・TIFF画像を選択します。","各ファイルの出力形式と必要な設定を選択します。","変換後、個別またはZIPで保存します。"],
    guideTitle:"SVG・BMP・TIFF画像形式と変換の基準", guideDesc:"3形式は構造と用途が異なります。SVGはベクターを画像として描画し、BMPは大きなビットマップを一般形式へ、TIFFはスキャンや高画質画像を共有しやすい形式へ変換します。",
    formats:[{name:"SVG",use:"ロゴ・アイコン・ベクター画像",strength:"拡大しても鮮明なベクター画像をPNGまたはJPGとして出力できます。",note:"外部フォント・外部画像・スクリプトを含む場合、元と異なることがあります。"},{name:"BMP",use:"古い画像・非圧縮ビットマップ",strength:"PNG・JPG・WebPへ変換して互換性と容量を改善できます。",note:"RLE・特殊ヘッダー・破損したBMPは対応できない場合があります。"},{name:"TIFF",use:"スキャン文書・高画質原稿",strength:"複数ページを個別のPNGまたはJPGとして保存できます。",note:"CMYK・16bit・カラープロファイルはRGB変換時に色が変わる場合があります。"}],
    directionTitle:"元の形式に合わせた変換方向", directions:[{from:"SVG",to:"PNG・JPG",title:"ベクターを一般画像として保存",description:"PNGは透明背景を維持し、JPGは選択した背景色で透明部分を塗りつぶします。"},{from:"BMP",to:"PNG・JPG・WebP",title:"互換性と容量を改善",description:"PNGは可逆保存、JPGとWebPは画質設定による容量削減に適しています。"},{from:"TIFF",to:"PNG・JPG",title:"スキャンや複数ページを共有",description:"全ページまたは選択したページを番号付きの個別ファイルとして保存します。"}],
    practicalTitle:"変換結果を選ぶための実用基準", practical:[{title:"SVGは出力サイズを先に決める",description:"ベクターには固定ピクセルサイズがないため、最終用途に必要な寸法で描画すると不要な拡大やぼやけを防げます。"},{title:"BMPは画像内容に合わせて形式を選ぶ",description:"輪郭の明確な画像はPNG、写真はJPGやWebPが向いています。最小容量だけで選ぶと画質や透明度が変わる場合があります。"},{title:"TIFFはページ数と色特性を確認",description:"複数ページ・CMYK・16bit TIFFは複雑です。必要なページだけを選び、RGB変換後の色差を確認してください。"},{title:"形式変換で元画質は向上しない",description:"失われたディテールや色は形式を変えても復元されません。容量と実際の表示結果を合わせて確認してください。"}],
    details:[{number:"01",title:"SVG出力サイズ",description:"1x・2x・3xまたは指定サイズで描画し、縦横比を維持するか選択できます。"},{number:"02",title:"透明背景と画質",description:"PNGは透明背景を維持します。JPGは背景色を使用し、JPG・WebPは画質設定で容量と見た目が変わります。"},{number:"03",title:"TIFFページ処理",description:"対応可能な一般TIFFはページ数を確認し、全ページまたは必要なページだけを変換できます。"},{number:"04",title:"プライバシーと制限",description:"ファイルはブラウザ内で処理されます。最大10件、1件20MB、合計60MBまでで、BigTIFFは対象外です。"}],
    checkBeforeTitle:"変換前に確認してください", faqTitle:"よくある質問", more:"FAQをもっと見る", collapse:"FAQを閉じる",
    faqs:[["SVGはなぜPNGより小さいのですか？","SVGはベクター情報、PNGはピクセル情報を保存します。出力サイズによって容量が変わります。"],["SVGの見た目が変わりました。","外部フォント・外部画像・スクリプト・未対応の効果が遮断または省略される場合があります。"],["BMPをPNGへ変換すると画質は落ちますか？","PNGは可逆形式のため、通常は追加の画質劣化はありません。"],["BMPをJPGへ変換すると容量は減りますか？","多くの場合減りますが、画像内容と画質設定によります。"],["複数ページTIFFに対応していますか？","対応可能な一般TIFFは各ページを個別画像へ変換します。"],["TIFFの色が変わりました。","CMYK・高ビット色・カラープロファイルはRGB変換後に色差が出る場合があります。"],["無料ですか？","はい。ログインなしで無料利用できます。"],["透かしは入りますか？","入りません。"]] as const,
    trust:"ファイルはブラウザ内で処理され、サーバーには保存されません。TIFF変換コードは外部CDNから読み込む場合があります。"
  }
} as const;

export function SvgBmpTiffPage({locale}:{locale:Locale}){
  const t=text[locale];
  const appName=locale==="ko"?"SVG·BMP·TIFF 이미지 변환기":locale==="en"?"SVG, BMP & TIFF Image Converter":"SVG・BMP・TIFF画像変換ツール";
  const jsonLd=[{"@context":"https://schema.org","@type":"WebApplication",name:appName,applicationCategory:"MultimediaApplication",operatingSystem:"Any",offers:{"@type":"Offer",price:"0",priceCurrency:"USD"},url:`https://toolbox.fixlgs.com/${locale}/svg-bmp-tiff-image-converter`,description:t.desc},{"@context":"https://schema.org","@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))},{"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"TOOLBOX",item:`https://toolbox.fixlgs.com/${locale}`},{"@type":"ListItem",position:2,name:t.back,item:`https://toolbox.fixlgs.com/${locale}/category/image-convert`},{"@type":"ListItem",position:3,name:appName,item:`https://toolbox.fixlgs.com/${locale}/svg-bmp-tiff-image-converter`}]}];
  const nextTitle=locale==="ko"?"다음 작업":locale==="en"?"Next steps":"次の作業";
  const relatedTitle=locale==="ko"?"관련 도구":locale==="en"?"Related tools":"関連ツール";
  const ready=locale==="ko"?"사용 가능":locale==="en"?"Available":"利用可能";
  const soon=locale==="ko"?"준비 중":locale==="en"?"Coming soon":"準備中";
  const cards=[
    {n:"001",name:locale==="ko"?"JPG·PNG·WebP 이미지 변환기":locale==="en"?"JPG, PNG & WebP Converter":"JPG・PNG・WebP画像変換",href:`/${locale}/jpg-png-webp-image-converter`,ready:true},
    {n:"002",name:locale==="ko"?"HEIC·AVIF 이미지 변환기":locale==="en"?"HEIC & AVIF Converter":"HEIC・AVIF画像変換",href:`/${locale}/heic-avif-image-converter`,ready:true},
    {n:"004",name:locale==="ko"?"이미지 압축기":locale==="en"?"Image Compressor":"画像圧縮ツール"},
    {n:"006",name:locale==="ko"?"이미지 크기 변경기":locale==="en"?"Image Resizer":"画像サイズ変更"},
    {n:"007",name:locale==="ko"?"웹 이미지 최적화기":locale==="en"?"Web Image Optimizer":"Web画像最適化"}
  ];
  return <ToolboxSubpageShell locale={locale} appName={appName}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="toolbox-tool-detail-hero"><Link href={`/${locale}/category/image-convert`} className="toolbox-subpage-back">← {t.back}</Link><p className="toolbox-subpage-eyebrow">003 · IMAGE CONVERT</p><div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title1}</span><span className="toolbox-tool-title-line">{t.title2}</span></h1><p>{t.desc}</p></div><div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{locale==="ko"?"브라우저에서 바로 처리":locale==="en"?"PROCESS IN YOUR BROWSER":"ブラウザ内で処理"}</span></div></section>
    <section className="toolbox-tool-detail-body"><div><SvgBmpTiffConverterTool locale={locale}/>
      <ToolNavigation locale={locale} currentTool={3} />
      
    </div></section>
    <section className="toolbox-tool-guide"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((s,i)=><li key={s}><span>{String(i+1).padStart(2,"0")}</span><p>{s}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide"><div className="toolbox-tool-format-guide-head"><p>IMAGE FORMAT GUIDE</p><h2>{t.guideTitle}</h2><div>{t.guideDesc}</div></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.formats.map(f=><article key={f.name}><div><strong>{f.name}</strong><span>{f.use}</span></div><p>{f.strength}</p><small>{f.note}</small></article>)}</div><div className="toolbox-tool-direction-guide"><div className="toolbox-tool-section-intro"><p>CONVERSION ROUTES</p><h3>{t.directionTitle}</h3></div><div className="toolbox-tool-direction-grid">{t.directions.map(d=><article key={d.title}><div className="toolbox-tool-direction-route"><strong>{d.from}</strong><span>→</span><strong>{d.to}</strong></div><h4>{d.title}</h4><p>{d.description}</p></article>)}</div></div><div className="toolbox-tool-direction-guide"><div className="toolbox-tool-section-intro"><p>PRACTICAL GUIDE</p><h3>{t.practicalTitle}</h3></div><div className="toolbox-tool-direction-grid toolbox-tool-practical-grid">{t.practical.map(d=><article key={d.title}><h4>{d.title}</h4><p>{d.description}</p></article>)}</div></div><div className="toolbox-tool-result-guide"><div className="toolbox-tool-section-intro toolbox-tool-section-intro-compact"><p>CHECK BEFORE USE</p><h3>{t.checkBeforeTitle}</h3></div><div className="toolbox-tool-result-grid">{t.details.map(d=><article key={d.number}><span>{d.number}</span><h4>{d.title}</h4><p>{d.description}</p></article>)}</div></div></div></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs} initialCount={3} moreLabel={t.more} collapseLabel={t.collapse} className="toolbox-tool-faq-list"/></section>
    <section className="toolbox-tool-processing-note"><p>{t.trust}</p></section>
  </ToolboxSubpageShell>;
}
