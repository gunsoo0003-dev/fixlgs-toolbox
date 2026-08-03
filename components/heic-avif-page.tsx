import Link from "next/link";
import { HeicAvifConverterTool } from "@/components/heic-avif-converter-tool";
import { ToolboxFaqList } from "@/components/toolbox-faq-list";
import { ToolboxSubpageShell } from "@/components/toolbox-subpage-shell";
import type { Locale } from "@/lib/site";

const text = {
  ko: {
    back:"이미지 변환·최적화", title1:"HEIC·AVIF", title2:"이미지 변환기", desc:"HEIC·AVIF 이미지를 JPG·PNG로 변환하거나 JPG·PNG 이미지를 AVIF로 한 번에 변환합니다.",
    how:"사용 방법", steps:["HEIC, HEIF, AVIF, JPG 또는 PNG 이미지를 선택합니다.","각 파일에서 사용할 수 있는 출력 형식을 확인하고 품질을 선택합니다.","변환하기를 누른 뒤 결과를 개별 파일 또는 ZIP으로 저장합니다."],
    guideTitle:"HEIC·HEIF·AVIF 변환 전에 알아둘 기준", guideDesc:"호환성이 낮은 사진 형식을 일반 이미지로 바꾸거나, JPG·PNG를 AVIF로 준비할 때 필요한 차이와 제한을 정리했습니다.",
    formats:[
      {name:"HEIC·HEIF",use:"아이폰 사진과 고효율 이미지",strength:"작은 용량으로 고화질 사진을 저장하는 데 유리합니다.",note:"내부 코덱과 보조 데이터에 따라 일부 파일은 지원되지 않을 수 있습니다."},
      {name:"AVIF",use:"웹용 고효율 이미지",strength:"사진과 투명 이미지를 높은 압축 효율로 저장할 수 있습니다.",note:"인코딩 시간이 길 수 있고 HDR·넓은 색 영역은 변환 후 다르게 보일 수 있습니다."},
      {name:"JPG·PNG",use:"호환성과 편집",strength:"JPG는 범용 사진, PNG는 투명 배경과 선명한 그래픽에 적합합니다.",note:"JPG는 투명도를 지원하지 않으며 형식 변환으로 원본 화질이 향상되지는 않습니다."}
    ],
    directionTitle:"입력 형식에 따른 변환 방향", directions:[
      {from:"HEIC·AVIF",to:"JPG",title:"호환성을 우선할 때",description:"Windows, 일반 편집 프로그램, 업로드 서비스에서 쉽게 열 수 있습니다. 투명 영역은 선택한 배경색으로 채워집니다."},
      {from:"HEIC·AVIF",to:"PNG",title:"투명도와 선명한 경계를 유지할 때",description:"가능한 경우 투명 배경을 유지하지만 사진 파일은 JPG보다 커질 수 있습니다."},
      {from:"JPG·PNG",to:"AVIF",title:"웹 전송 용량을 줄이고 싶을 때",description:"이미지 내용과 품질에 따라 결과 용량이 비슷하거나 더 커질 수도 있습니다."}
    ],
    details:[
      {number:"01",title:"방향과 대표 이미지",description:"촬영 방향은 결과 픽셀에 반영합니다. HEIC·HEIF는 대표 정지 이미지 1장만 처리하며 라이브 포토 영상과 깊이 데이터는 포함하지 않습니다."},
      {number:"02",title:"투명 배경",description:"JPG는 투명도를 지원하지 않습니다. AVIF·PNG의 투명 영역을 JPG로 바꿀 때 선택한 배경색으로 채웁니다."},
      {number:"03",title:"HDR과 색상",description:"HDR·10비트·넓은 색 영역이 포함된 AVIF는 JPG·PNG 변환 후 밝기나 색상이 다르게 보일 수 있습니다."},
      {number:"04",title:"개인정보와 제한",description:"파일은 브라우저에서 처리되고 메타데이터는 기본적으로 제거됩니다. 최대 10개, 파일당 10MB, 전체 50MB의 안전 제한을 적용합니다."}
    ],
    checkBeforeTitle:"변환 전에 확인하세요",
    faqTitle:"자주 묻는 질문", more:"FAQ 더보기", collapse:"FAQ 접기",
    faqs:[
      ["파일이 서버로 업로드되나요?","아니요. 변환 파일은 브라우저 내부에서 처리되며 FIXLGS 서버로 전송되지 않습니다."],
      ["HEIC와 HEIF는 같은 형식인가요?","HEIF는 저장 구조이고 HEIC는 일반적으로 HEVC 방식으로 저장된 HEIF 이미지를 뜻합니다. 내부 방식에 따라 일부 HEIF 파일은 지원되지 않을 수 있습니다."],
      ["아이폰 라이브 포토도 변환되나요?","대표 정지 이미지 1장만 변환합니다. 라이브 포토 영상, 깊이 정보, 보조 이미지는 포함하지 않습니다."],
      ["HEIC 사진이 회전되어 저장되지는 않나요?","가능한 경우 촬영 방향을 읽어 결과 이미지의 실제 픽셀 방향에 반영합니다."],
      ["AVIF를 JPG로 바꾸면 투명 배경이 유지되나요?","JPG는 투명도를 지원하지 않아 선택한 배경색으로 채워집니다."],
      ["JPG나 PNG를 AVIF로 바꾸면 항상 용량이 줄어드나요?","아닙니다. 이미지 내용과 품질 설정에 따라 비슷하거나 더 커질 수 있습니다."],
      ["AVIF 변환이 오래 걸리는 이유는 무엇인가요?","AVIF 인코딩은 계산량이 많아 파일 크기와 기기 성능에 따라 시간이 더 걸릴 수 있습니다."],
      ["HDR AVIF도 변환할 수 있나요?","일부 파일은 변환할 수 있지만 JPG·PNG 결과에서 밝기나 색상이 달라질 수 있으며 HDR 완전 보존은 보장하지 않습니다."],
      ["메타데이터는 유지되나요?","개인정보 보호를 위해 기본적으로 제거합니다. 촬영 방향은 별도로 결과 픽셀에 반영합니다."],
      ["모바일에서도 사용할 수 있나요?","네. 다만 고해상도 이미지나 여러 AVIF 인코딩은 기기 메모리에 따라 제한될 수 있습니다."]
    ] as const,
    trust:"이미지 파일은 서버로 업로드되지 않고 브라우저에서 처리됩니다. 변환 기능 코드는 외부 CDN에서 불러올 수 있습니다."
  },
  en: {
    back:"Image Convert", title1:"HEIC & AVIF", title2:"Image Converter", desc:"Convert HEIC and AVIF images to JPG or PNG, or convert JPG and PNG images to AVIF in batches.",
    how:"How to use", steps:["Choose HEIC, HEIF, AVIF, JPG, or PNG images.","Review the output formats available for each file and choose a quality preset.","Convert the images, then download files individually or together as a ZIP archive."],
    guideTitle:"What to know before converting HEIC, HEIF, and AVIF", guideDesc:"Use these guidelines when opening less compatible photo formats or preparing JPG and PNG images for efficient AVIF delivery.",
    formats:[
      {name:"HEIC & HEIF",use:"iPhone photos and efficient image storage",strength:"Stores high-quality photos at relatively small file sizes.",note:"Some files may be unsupported because HEIF containers can use different codecs and auxiliary data."},
      {name:"AVIF",use:"Efficient web images",strength:"Offers strong compression for photos and transparent images.",note:"Encoding can take longer, and HDR or wide-gamut colour may look different after conversion."},
      {name:"JPG & PNG",use:"Compatibility and editing",strength:"JPG suits widely compatible photos; PNG suits transparency and sharp graphics.",note:"JPG cannot store transparency, and changing formats cannot improve source quality."}
    ],
    directionTitle:"Choose the route by input format", directions:[
      {from:"HEIC·AVIF",to:"JPG",title:"Prioritise compatibility",description:"Use JPG for Windows, general editing software, and upload services. Transparent areas use the selected background colour."},
      {from:"HEIC·AVIF",to:"PNG",title:"Preserve transparency and sharp edges",description:"Transparency is preserved when possible, although photographic PNG files may be larger than JPG."},
      {from:"JPG·PNG",to:"AVIF",title:"Prepare efficient web assets",description:"The result may be smaller, similar, or larger depending on image content and quality settings."}
    ],
    details:[
      {number:"01",title:"Orientation and primary image",description:"Photo orientation is applied to output pixels. For HEIC and HEIF, the tool converts one primary still image and excludes Live Photo video, depth data, and auxiliary images."},
      {number:"02",title:"Transparency",description:"JPG does not support transparency. Transparent AVIF or PNG areas are filled with the selected background colour when exported as JPG."},
      {number:"03",title:"HDR and colour",description:"AVIF files with HDR, 10-bit colour, or a wide colour gamut may look different after conversion to JPG or PNG."},
      {number:"04",title:"Privacy and limits",description:"Files are processed in the browser and metadata is removed by default. Safe limits are 10 files, 10 MB per file, and 50 MB in total."}
    ],
    checkBeforeTitle:"Check before converting",
    faqTitle:"Frequently asked questions", more:"View more FAQs", collapse:"Show fewer FAQs",
    faqs:[
      ["Are files uploaded to a server?","No. Conversion runs in your browser, and files are not sent to the FIXLGS server."],
      ["Are HEIC and HEIF the same format?","HEIF is a container format, while HEIC commonly refers to HEIF images encoded with HEVC. Some HEIF files may use an unsupported internal codec."],
      ["Can the tool convert iPhone Live Photos?","It converts one primary still image only. Live Photo video, depth data, and auxiliary images are excluded."],
      ["Will HEIC photos be saved sideways?","When available, orientation data is applied to the output pixels before the file is saved."],
      ["Does AVIF-to-JPG preserve transparency?","No. JPG cannot store transparency, so transparent areas use the selected background colour."],
      ["Does converting JPG or PNG to AVIF always reduce file size?","No. The output can be smaller, similar, or larger depending on the image and quality setting."],
      ["Why can AVIF conversion take longer?","AVIF encoding requires more computation, so processing time depends on file size and device performance."],
      ["Can HDR AVIF files be converted?","Some can be converted, but brightness and colour may change in JPG or PNG, and full HDR preservation is not guaranteed."],
      ["Is metadata preserved?","Metadata is removed by default for privacy. Orientation is handled separately and applied to the output pixels."],
      ["Does it work on mobile devices?","Yes, although high-resolution images and repeated AVIF encoding may be limited by device memory."]
    ] as const,
    trust:"Image files are processed in your browser and are not uploaded. Conversion code may be loaded from an external CDN."
  },
  ja: {
    back:"画像変換・最適化", title1:"HEIC・AVIF", title2:"画像変換ツール", desc:"HEIC・AVIF画像をJPG・PNGに変換したり、JPG・PNG画像をAVIFにまとめて変換できます。",
    how:"使い方", steps:["HEIC、HEIF、AVIF、JPG、PNG画像を選択します。","各ファイルで利用できる出力形式を確認し、画質を選択します。","変換後、個別ファイルまたはZIPで保存します。"],
    guideTitle:"HEIC・HEIF・AVIFを変換する前に確認すること", guideDesc:"互換性の低い写真形式を一般的な画像に変換したり、JPG・PNGをAVIFに変換したりするときの違いと制限をまとめています。",
    formats:[
      {name:"HEIC・HEIF",use:"iPhone写真と高効率な画像保存",strength:"比較的小さい容量で高画質な写真を保存できます。",note:"内部コーデックや補助データによっては対応できないファイルがあります。"},
      {name:"AVIF",use:"高効率なWeb画像",strength:"写真や透明画像を高い圧縮効率で保存できます。",note:"変換に時間がかかる場合があり、HDRや広色域は変換後に見え方が変わることがあります。"},
      {name:"JPG・PNG",use:"互換性と編集",strength:"JPGは一般的な写真、PNGは透明背景や輪郭のはっきりした画像に適しています。",note:"JPGは透明背景に対応せず、形式を変えても元の画質は向上しません。"}
    ],
    directionTitle:"入力形式に合わせた変換方向", directions:[
      {from:"HEIC・AVIF",to:"JPG",title:"互換性を優先する場合",description:"Windows、一般的な編集ソフト、アップロードサービスで扱いやすくなります。透明部分は選択した背景色で塗りつぶされます。"},
      {from:"HEIC・AVIF",to:"PNG",title:"透明背景や輪郭を保ちたい場合",description:"可能な場合は透明背景を維持しますが、写真ではJPGより容量が大きくなることがあります。"},
      {from:"JPG・PNG",to:"AVIF",title:"Web画像の容量を抑えたい場合",description:"画像内容や画質設定によっては、容量がほぼ同じか大きくなることもあります。"}
    ],
    details:[
      {number:"01",title:"向きと代表画像",description:"撮影方向は出力画像のピクセルに反映します。HEIC・HEIFは代表静止画1枚のみを処理し、Live Photosの動画、深度情報、補助画像は含みません。"},
      {number:"02",title:"透明背景",description:"JPGは透明背景に対応していません。AVIF・PNGの透明部分をJPGに変換すると、選択した背景色で塗りつぶされます。"},
      {number:"03",title:"HDRと色",description:"HDR、10bit、広色域を含むAVIFは、JPG・PNG変換後に明るさや色が異なって見える場合があります。"},
      {number:"04",title:"プライバシーと制限",description:"ファイルはブラウザ内で処理され、メタデータは基本的に削除されます。最大10件、1ファイル10MB、合計50MBの安全制限を適用します。"}
    ],
    checkBeforeTitle:"変換前に確認してください",
    faqTitle:"よくある質問", more:"FAQをもっと見る", collapse:"FAQを閉じる",
    faqs:[
      ["ファイルはサーバーに送信されますか？","いいえ。変換はブラウザ内で行われ、ファイルはFIXLGSサーバーに送信されません。"],
      ["HEICとHEIFは同じ形式ですか？","HEIFは保存構造で、HEICは一般にHEVCで圧縮されたHEIF画像を指します。内部方式によっては対応できないHEIFファイルがあります。"],
      ["iPhoneのLive Photosも変換できますか？","代表静止画1枚のみを変換します。動画、深度情報、補助画像は含みません。"],
      ["HEIC写真が横向きで保存されることはありますか？","取得できる場合は撮影方向を出力画像のピクセルに反映してから保存します。"],
      ["AVIFをJPGに変換しても透明背景は維持されますか？","いいえ。JPGは透明背景に対応していないため、選択した背景色で塗りつぶされます。"],
      ["JPGやPNGをAVIFにすると必ず容量が減りますか？","いいえ。画像内容や画質設定によって、ほぼ同じか大きくなる場合があります。"],
      ["AVIF変換に時間がかかるのはなぜですか？","AVIFのエンコードは計算量が多く、ファイルサイズや端末性能によって処理時間が長くなります。"],
      ["HDR AVIFも変換できますか？","一部は変換できますが、JPG・PNGでは明るさや色が変わることがあり、HDRの完全な維持は保証しません。"],
      ["メタデータは維持されますか？","プライバシー保護のため基本的に削除します。撮影方向は別途、出力画像のピクセルに反映します。"],
      ["モバイルでも使えますか？","はい。ただし高解像度画像や複数のAVIF変換は、端末メモリによって制限される場合があります。"]
    ] as const,
    trust:"画像ファイルはアップロードされず、ブラウザ内で処理されます。変換コードは外部CDNから読み込む場合があります。"
  }
} as const;

export function HeicAvifPage({ locale }:{locale:Locale}) {
  const t=text[locale];
  const appName = locale === "ko" ? "HEIC·AVIF 이미지 변환기" : locale === "en" ? "HEIC & AVIF Image Converter" : "HEIC・AVIF画像変換ツール";
  const jsonLd = [
    {"@context":"https://schema.org","@type":"WebApplication",name:appName,applicationCategory:"MultimediaApplication",operatingSystem:"Any",offers:{"@type":"Offer",price:"0",priceCurrency:"USD"},url:`https://toolbox.fixlgs.com/${locale}/heic-avif-image-converter`,description:t.desc},
    {"@context":"https://schema.org","@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"TOOLBOX",item:`https://toolbox.fixlgs.com/${locale}`},{"@type":"ListItem",position:2,name:t.back,item:`https://toolbox.fixlgs.com/${locale}/category/image-convert`},{"@type":"ListItem",position:3,name:appName,item:`https://toolbox.fixlgs.com/${locale}/heic-avif-image-converter`}]}
  ];
  const nextTitle = locale === "ko" ? "다음 작업" : locale === "en" ? "Next steps" : "次の作業";
  const relatedTitle = locale === "ko" ? "관련 도구" : locale === "en" ? "Related tools" : "関連ツール";
  const ready = locale === "ko" ? "사용 가능" : locale === "en" ? "Available" : "利用可能";
  const soon = locale === "ko" ? "준비 중" : locale === "en" ? "Coming soon" : "準備中";
  const cards = [
    {n:"001",name:locale === "ko" ? "JPG·PNG·WebP 이미지 변환기" : locale === "en" ? "JPG, PNG & WebP Converter" : "JPG・PNG・WebP画像変換",href:`/${locale}/jpg-png-webp-image-converter`,ready:true},
    {n:"004",name:locale === "ko" ? "이미지 압축기" : locale === "en" ? "Image Compressor" : "画像圧縮ツール"},
    {n:"006",name:locale === "ko" ? "이미지 크기 변경기" : locale === "en" ? "Image Resizer" : "画像サイズ変更"},
    {n:"007",name:locale === "ko" ? "웹 이미지 최적화기" : locale === "en" ? "Web Image Optimizer" : "Web画像最適化"},
    {n:"026",name:locale === "ko" ? "이미지 PDF 변환기" : locale === "en" ? "Image to PDF Converter" : "画像PDF変換"}
  ];
  return <ToolboxSubpageShell locale={locale} appName={appName}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="toolbox-tool-detail-hero"><Link href={`/${locale}/category/image-convert`} className="toolbox-tool-detail-back">← {t.back}</Link><div className="toolbox-tool-detail-heading"><div><p>002 · IMAGE CONVERT</p><h1><span className="toolbox-tool-title-line">{t.title1}</span><span className="toolbox-tool-title-line">{t.title2}</span></h1><div>{t.desc}</div></div></div><div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{locale==="ko"?"브라우저에서 바로 처리":locale==="en"?"PROCESS IN YOUR BROWSER":"ブラウザ内で処理"}</span></div></section>
    <section className="toolbox-tool-detail-body"><div><HeicAvifConverterTool locale={locale}/>
      <section className="toolbox-next-work"><div><p>NEXT WORK</p><h2>{nextTitle}</h2></div><div className="toolbox-next-work-grid">{cards.slice(0,3).map(card=>card.ready?<Link key={card.n} href={card.href!} className="toolbox-next-work-card"><span>{card.n}</span><h3>{card.name}</h3><div className="toolbox-next-work-card-foot"><span>{ready}</span><strong>↗</strong></div></Link>:<div key={card.n} className="toolbox-next-work-card is-disabled"><span>{card.n}</span><h3>{card.name}</h3><div className="toolbox-next-work-card-foot"><span>{soon}</span><strong>·</strong></div></div>)}</div></section>
      <section className="toolbox-next-work toolbox-related-tools"><div><p>RELATED TOOLS</p><h2>{relatedTitle}</h2></div><div className="toolbox-next-work-grid">{cards.slice(3).map(card=><div key={card.n} className="toolbox-next-work-card is-disabled"><span>{card.n}</span><h3>{card.name}</h3><div className="toolbox-next-work-card-foot"><span>{soon}</span><strong>·</strong></div></div>)}</div></section>
    </div></section>
    <section className="toolbox-tool-guide"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((s,i)=><li key={s}><span>{String(i+1).padStart(2,"0")}</span><p>{s}</p></li>)}</ol></section>
    <section className="toolbox-tool-format-guide"><div className="toolbox-tool-format-guide-head"><p>IMAGE FORMAT GUIDE</p><h2>{t.guideTitle}</h2><div>{t.guideDesc}</div></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{t.formats.map(f=><article key={f.name}><div><strong>{f.name}</strong><span>{f.use}</span></div><p>{f.strength}</p><small>{f.note}</small></article>)}</div><div className="toolbox-tool-direction-guide"><div className="toolbox-tool-section-intro"><p>CONVERSION ROUTES</p><h3>{t.directionTitle}</h3></div><div className="toolbox-tool-direction-grid">{t.directions.map(d=><article key={d.title}><div className="toolbox-tool-direction-route"><strong>{d.from}</strong><span>→</span><strong>{d.to}</strong></div><h4>{locale === "ko" && d.title === "투명도와 선명한 경계를 유지할 때" ? <>투명도와 선명한<br />경계를 유지할 때</> : locale === "ko" && d.title === "웹 전송 용량을 줄이고 싶을 때" ? <>웹 전송 용량을<br />줄이고 싶을 때</> : d.title}</h4><p>{d.description}</p></article>)}</div></div><div className="toolbox-tool-result-guide"><div className="toolbox-tool-section-intro toolbox-tool-section-intro-compact"><p>CHECK BEFORE USE</p><h3>{t.checkBeforeTitle}</h3></div><div className="toolbox-tool-result-grid">{t.details.map(d=><article key={d.number}><span>{d.number}</span><h4>{locale === "ko" && d.title === "투명도와 선명한 경계를 유지할 때" ? <>투명도와 선명한<br />경계를 유지할 때</> : locale === "ko" && d.title === "웹 전송 용량을 줄이고 싶을 때" ? <>웹 전송 용량을<br />줄이고 싶을 때</> : d.title}</h4><p>{d.description}</p></article>)}</div></div></div></section>
    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs} initialCount={3} moreLabel={t.more} collapseLabel={t.collapse} className="toolbox-tool-faq-list"/></section>
    <section className="toolbox-tool-processing-note"><p>{t.trust}</p></section>
  </ToolboxSubpageShell>;
}
