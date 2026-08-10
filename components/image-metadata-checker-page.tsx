import Link from 'next/link';
import { ImageMetadataCheckerTool } from '@/components/image-metadata-checker-tool';
import styles from './image-metadata-checker-tool.module.css';
import { ToolboxFaqList } from '@/components/toolbox-faq-list';
import { ToolboxSubpageShell } from '@/components/toolbox-subpage-shell';
import type { Locale } from '@/lib/site';

const copy = {
  ko: {
    back: '이미지 편집', title: '이미지 정보·메타데이터 검사기', desc: '이미지의 해상도, DPI, 촬영 정보, GPS·EXIF 메타데이터를 확인하고 필요하면 제거하세요.',
    local: '이미지와 메타데이터는 서버로 전송되지 않으며 현재 브라우저에서만 확인합니다.',
    steps: ['정보를 확인할 이미지 한 장 또는 여러 장을 선택합니다.','파일을 선택하면 이미지 크기, 해상도와 기본 정보가 자동으로 표시됩니다.','DPI·PPI 정보가 저장되어 있으면 해당 값을 확인합니다.','원하는 PPI 기준에서 예상 인쇄 크기를 확인합니다.','촬영일, 카메라, 렌즈와 촬영 설정을 확인합니다.','GPS 위치 정보가 포함되어 있는지 확인합니다.','필요한 경우 전체 EXIF·메타데이터를 펼쳐 세부 태그를 확인합니다.','사진을 공유하기 전에 개인정보성 정보가 필요하지 않다면 메타데이터 제거를 실행합니다.','제거된 결과를 다시 검사해 GPS·EXIF 등이 실제로 제거됐는지 확인합니다.','확인이 끝난 새 이미지를 다운로드합니다.','여러 파일을 처리했다면 개별 다운로드 또는 ZIP 다운로드를 사용합니다.'],
    faqs: [
      ['사진의 픽셀 크기를 확인할 수 있나요?','예. 이미지의 가로·세로 픽셀, 전체 픽셀 수와 메가픽셀을 확인할 수 있습니다.'],
      ['사진 DPI를 확인할 수 있나요?','예. 파일에 DPI·PPI 관련 해상도 메타데이터가 저장되어 있으면 해당 값을 표시합니다.'],
      ['DPI 정보가 없다고 나오는데 문제가 있는 사진인가요?','아닙니다. 많은 웹 이미지에는 DPI·PPI 정보가 저장되어 있지 않습니다. 실제 이미지 픽셀 수와는 별개의 정보입니다.'],
      ['사진을 몇 cm까지 인쇄할 수 있는지 알 수 있나요?','선택한 PPI를 기준으로 예상 인쇄 크기를 cm와 inch로 계산할 수 있습니다.'],
      ['사진을 찍은 날짜를 확인할 수 있나요?','EXIF에 DateTimeOriginal 등의 촬영 날짜가 저장되어 있으면 확인할 수 있습니다.'],
      ['어떤 카메라로 찍었는지 알 수 있나요?','카메라 제조사와 모델 정보가 EXIF에 저장되어 있으면 표시합니다.'],
      ['ISO와 셔터 속도도 볼 수 있나요?','해당 촬영 정보가 EXIF에 존재하면 ISO, 셔터 속도, 조리개, 초점 거리 등을 확인할 수 있습니다.'],
      ['사진에 GPS 위치가 들어 있는지 확인할 수 있나요?','예. GPS 메타데이터가 있으면 위도와 경도 등 위치 정보를 표시합니다.'],
      ['사진의 위치 정보를 지울 수 있나요?','지원되는 파일에서는 메타데이터 제거를 통해 GPS를 포함한 개인정보성 메타데이터를 제거할 수 있습니다.'],
      ['메타데이터를 지우면 원본 사진도 바뀌나요?','아니요. 원본은 그대로 유지하고 메타데이터를 제거한 새 파일을 생성합니다.'],
      ['메타데이터를 제거하면 화질이 바뀌나요?','JPG·PNG·WebP는 가능한 범위에서 이미지 압축 데이터를 다시 만들지 않고 메타데이터 구조만 제거합니다. 파일 형식과 원본 구조에 따라 결과 파일의 부가 정보는 달라질 수 있습니다.'],
      ['메타데이터를 완전히 제거했는지 어떻게 알 수 있나요?','제거한 결과 파일을 다시 분석하여 GPS, EXIF와 기타 메타데이터가 남아 있는지 확인합니다.'],
      ['이미지가 서버에 업로드되나요?','아니요. 이미지와 메타데이터는 현재 브라우저 안에서 처리합니다.'],
      ['메타데이터로 사진이 조작됐는지 확인할 수 있나요?','메타데이터는 참고 정보일 뿐이며 사진의 진위나 조작 여부를 확정할 수 없습니다.'],
    ], more: 'FAQ 더보기', collapse: 'FAQ 접기', how: '사용 방법', faqTitle: '자주 묻는 질문', related: '관련 도구', available: '사용 가능', next: '다음 작업', coming: '준비 중',
    guideTitle: '사진 메타데이터를 확인할 때 알아둘 기준', guideDesc: '픽셀 수, DPI·PPI, 촬영 정보와 GPS는 서로 다른 성격의 정보입니다. 이미지에 실제 저장된 값과 계산용 값을 구분하면 잘못된 해석을 줄일 수 있습니다.',
    examplesTitle: '실제 활용 예시', examples: [['SNS 공유 전','SNS에 사진을 올리기 전에 GPS 위치 정보가 남아 있는지 확인합니다.'],['중고 거래·블로그','중고 거래나 블로그에 사진을 공유하기 전에 촬영일·카메라·작성자 정보 등 개인정보성 메타데이터를 확인합니다.'],['회사 외부 전달','회사 이미지를 외부로 전달하기 전에 EXIF와 GPS를 검사하고 필요하면 메타데이터를 제거한 새 파일을 내려받습니다.']],
  },
  en: {
    back: 'Image Edit', title: 'Image Info & Metadata Checker', desc: 'Check image resolution, DPI, camera details, GPS and EXIF metadata, and remove metadata when needed.',
    local: 'Your images and metadata are analyzed only in this browser and are not uploaded to a server.',
    steps: ['Select one or more images to inspect.','Basic image size and resolution information appears automatically.','Check stored DPI / PPI information when it exists.','Review the estimated print size at your chosen PPI.','Check date taken, camera, lens, and shooting settings.','Check whether GPS location data is included.','Open all EXIF and metadata when you need individual tags.','Before sharing, remove privacy-related metadata if you do not need it.','The cleaned result is analyzed again to verify what was removed.','Download the checked clean image.','For multiple files, use individual downloads or ZIP download.'],
    faqs: [
      ['Can I check image pixel dimensions?','Yes. Width, height, total pixels, and megapixels are shown.'],['Can I check photo DPI?','Yes. Stored DPI / PPI resolution metadata is shown when the file contains it.'],['Is a photo broken if no DPI is shown?','No. Many web images do not store DPI / PPI metadata. Pixel dimensions are separate information.'],['Can I estimate print size?','Yes. Estimated print size is calculated in centimeters and inches from the selected PPI.'],['Can I check when a photo was taken?','Yes, when EXIF contains DateTimeOriginal or related capture-date information.'],['Can I see which camera took the photo?','Camera make and model are shown when those EXIF tags exist.'],['Are ISO and shutter speed available?','Yes, when the file contains ISO, exposure time, aperture, or focal-length metadata.'],['Can I see whether a photo has GPS data?','Yes. GPS latitude and longitude are shown when location metadata exists.'],['Can I remove location data?','Supported files can be cleaned to remove GPS and other privacy-related metadata.'],['Does metadata removal change my original?','No. The original stays untouched and a new clean file is created.'],['Will metadata removal change image quality?','For JPG, PNG, and WebP, the tool removes supported metadata without intentionally re-encoding image pixels. Other auxiliary information may differ by file structure.'],['How do I know metadata was removed?','The result file is analyzed again and compared with the original.'],['Are images uploaded to a server?','No. Images and metadata are processed in your current browser.'],['Can metadata prove a photo was edited?','No. Metadata is reference information and cannot prove authenticity or manipulation.'],
    ], more: 'Show more FAQs', collapse: 'Show fewer FAQs', how: 'How to use', faqTitle: 'Frequently asked questions', related: 'Related tools', available: 'Available', next: 'Next work', coming: 'Coming soon',
    guideTitle: 'What to know when checking photo metadata', guideDesc: 'Pixel dimensions, DPI / PPI, capture details, and GPS describe different things. Keeping stored values separate from calculation values helps avoid incorrect conclusions.',
    examplesTitle: 'Practical examples', examples: [['Before social sharing','Check whether GPS location data remains before posting a photo to social media.'],['Marketplace or blog','Review capture date, camera, author, and other privacy-related metadata before sharing images in a marketplace or blog.'],['External company sharing','Before sending company images outside the organization, inspect EXIF and GPS and download a cleaned copy when needed.']],
  },
  ja: {
    back: '画像編集', title: '画像情報・メタデータチェッカー', desc: '画像の解像度、DPI、撮影情報、GPS・EXIFメタデータを確認し、必要に応じて削除できます。',
    local: '画像とメタデータはサーバーに送信されず、このブラウザ内でのみ解析されます。',
    steps: ['情報を確認する画像を1枚または複数選択します。','選択すると画像サイズ、解像度、基本情報が自動で表示されます。','DPI・PPI情報が保存されている場合はその値を確認します。','希望するPPI基準で推定印刷サイズを確認します。','撮影日時、カメラ、レンズ、撮影設定を確認します。','GPS位置情報が含まれているか確認します。','必要に応じてEXIF・メタデータ全体を開き、個別タグを確認します。','共有前に不要な個人情報性メタデータを削除します。','削除後のファイルを再解析し、GPS・EXIFなどの状態を確認します。','確認が終わった新しい画像をダウンロードします。','複数ファイルの場合は個別またはZIPでダウンロードします。'],
    faqs: [
      ['画像のピクセルサイズを確認できますか？','はい。幅・高さ、総ピクセル数、メガピクセルを確認できます。'],['写真のDPIを確認できますか？','はい。DPI・PPI関連の解像度情報がファイルに保存されている場合に表示します。'],['DPI情報がない写真は問題がありますか？','いいえ。Web画像にはDPI・PPI情報が保存されていないことがあります。実際のピクセル数とは別の情報です。'],['何cmまで印刷できるか分かりますか？','選択したPPIを基準にcmとinchで推定印刷サイズを計算できます。'],['撮影日時を確認できますか？','EXIFにDateTimeOriginalなどが保存されている場合に確認できます。'],['どのカメラで撮影したか分かりますか？','カメラメーカーとモデルがEXIFに保存されている場合に表示します。'],['ISOやシャッタースピードも確認できますか？','該当情報が存在する場合、ISO、シャッタースピード、絞り値、焦点距離などを確認できます。'],['GPS位置情報が入っているか分かりますか？','はい。GPSメタデータがある場合、緯度と経度などを表示します。'],['位置情報を削除できますか？','対応ファイルではGPSを含む個人情報性メタデータを削除できます。'],['削除すると元画像も変わりますか？','いいえ。元画像はそのまま保持し、新しい結果ファイルを作成します。'],['削除すると画質が変わりますか？','JPG・PNG・WebPでは可能な範囲で画像ピクセルを再エンコードせず、対応するメタデータ構造を削除します。'],['完全に削除されたか確認できますか？','結果ファイルを再解析し、GPS、EXIF、その他のメタデータが残っているか確認します。'],['画像はサーバーにアップロードされますか？','いいえ。画像とメタデータは現在のブラウザ内で処理します。'],['メタデータで写真の加工を判定できますか？','いいえ。メタデータは参考情報であり、真偽や加工の有無を確定できません。'],
    ], more: 'FAQをもっと見る', collapse: 'FAQを閉じる', how: '使い方', faqTitle: 'よくある質問', related: '関連ツール', available: '利用可能', next: '次の作業', coming: '準備中',
    guideTitle: '写真メタデータを確認するときの基準', guideDesc: 'ピクセル数、DPI・PPI、撮影情報、GPSはそれぞれ別の情報です。保存された値と計算用の値を区別すると誤解を防げます。',
    examplesTitle: '活用例', examples: [['SNS投稿前','SNSに写真を投稿する前にGPS位置情報が残っていないか確認します。'],['フリマ・ブログ共有','フリマやブログで画像を共有する前に、撮影日時・カメラ・作成者など個人情報性のあるメタデータを確認します。'],['社外への画像共有','会社の画像を外部へ渡す前にEXIFとGPSを確認し、必要に応じてメタデータを削除した新しいファイルを保存します。']],
  },
} as const;

export function ImageMetadataCheckerPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const url = `https://toolbox.fixlgs.com/${locale}/image-metadata-checker`;
  const related = [
    { n: '007', name: locale === 'ko' ? '웹 이미지 최적화기' : locale === 'en' ? 'Web Image Optimizer' : 'Web画像最適化ツール', href: `/${locale}/web-image-optimizer` },
    { n: '004', name: locale === 'ko' ? '이미지 압축기' : locale === 'en' ? 'Image Compressor' : '画像圧縮ツール', href: `/${locale}/image-compressor` },
    { n: '006', name: locale === 'ko' ? '이미지 크기 변경기' : locale === 'en' ? 'Image Resizer' : '画像サイズ変更ツール', href: `/${locale}/image-resizer` },
  ];
  const jsonLd = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebApplication', name: t.title, applicationCategory: 'MultimediaApplication', operatingSystem: 'Any', url, description: t.desc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, featureList: ['Image metadata','EXIF','GPS','DPI / PPI','Print size','Metadata removal','Browser local processing'] },
      { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'TOOLBOX', item: `https://toolbox.fixlgs.com/${locale}` }, { '@type': 'ListItem', position: 2, name: t.back, item: `https://toolbox.fixlgs.com/${locale}/category/image-edit` }, { '@type': 'ListItem', position: 3, name: t.title, item: url } ] },
      { '@type': 'FAQPage', mainEntity: t.faqs.map(([q,a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
  };
  const cautions = locale === 'ko' ? [
    'GPS 위치 정보가 포함된 사진을 공유하면 촬영 위치가 노출될 수 있으므로 공유 전에 위치 정보 존재 여부를 확인하세요.',
    'DPI·PPI 값은 실제 픽셀 수와 별개의 정보이며, 예상 인쇄 크기는 선택한 PPI를 기준으로 계산한 참고값입니다.',
    '메타데이터 제거 결과는 파일 형식과 원본 구조에 따라 남는 비개인정보성 정보가 있을 수 있으므로 결과 재검사 상태를 확인하세요.',
    'Software·EXIF 유무만으로 AI 생성 여부나 사진의 진위·조작 여부를 판단할 수 없습니다.',
  ] : locale === 'en' ? [
    'A photo with GPS metadata can reveal where it was taken, so check for location data before sharing.',
    'DPI / PPI is separate from pixel dimensions, and estimated print size is only a reference calculated from the selected PPI.',
    'Depending on file format and structure, non-privacy metadata may remain after cleaning, so review the recheck result.',
    'Software tags or the presence or absence of EXIF cannot prove AI generation, authenticity, or manipulation.',
  ] : [
    'GPS位置情報を含む写真を共有すると撮影場所が分かる場合があるため、共有前に位置情報の有無を確認してください。',
    'DPI・PPIは実際のピクセル数とは別の情報で、推定印刷サイズは選択したPPIを基準にした参考値です。',
    'ファイル形式や構造によっては削除後も個人情報ではないメタデータが残る場合があるため、再確認結果を確認してください。',
    'SoftwareタグやEXIFの有無だけでAI生成、真偽、加工の有無を判断することはできません。',
  ];

  const notes = locale === 'ko' ? [
    ['DPI·PPI','파일에 저장된 해상도 메타데이터가 없으면 72·96·300 같은 값을 실제 값처럼 만들지 않습니다. 인쇄 크기 계산용 PPI는 별도로 선택합니다.'],
    ['촬영일','EXIF 촬영일과 파일 수정 시간은 구분해 표시합니다. 파일 수정 시간을 촬영일로 바꾸어 보여주지 않습니다.'],
    ['GPS','위도·경도는 원본 정보를 확인하기 위한 값입니다. 주소나 촬영 장소 이름을 외부 API 없이 추정하지 않습니다.'],
    ['메타데이터 제거','원본 파일은 수정하지 않고 새 파일을 만들며, 결과 파일을 다시 분석해 제거 상태를 확인합니다.'],
    ['색상 프로파일','ICC 프로파일은 개인정보와 성격이 달라 기본 제거 대상에서 제외해 불필요한 색 변화 가능성을 줄입니다.'],
    ['진위 판정','Software나 EXIF 유무만으로 AI 이미지, 조작 사진, 진짜 사진 여부를 판정하지 않습니다.'],
  ] : locale === 'en' ? [
    ['DPI / PPI','If no resolution metadata exists, the tool does not invent 72, 96, or 300 as a stored value. Print-size PPI is selected separately.'],
    ['Date taken','EXIF capture time and file-modified time are shown separately. File modified time is not presented as the capture date.'],
    ['GPS','Latitude and longitude are shown as stored information. The tool does not guess an address or place name without an external service.'],
    ['Metadata removal','The original stays untouched. A new result is created and analyzed again to verify removal.'],
    ['Color profile','ICC profiles are not treated like privacy metadata by default, reducing unnecessary color changes.'],
    ['Authenticity','Software tags or missing EXIF do not prove whether an image is AI-generated, manipulated, or authentic.'],
  ] : [
    ['DPI・PPI','解像度情報がない場合、72・96・300などを保存値として作りません。印刷サイズ計算用PPIは別に選択します。'],
    ['撮影日時','EXIFの撮影日時とファイル更新日時は分けて表示し、更新日時を撮影日時として扱いません。'],
    ['GPS','緯度・経度は保存された情報として表示します。外部サービスなしで住所や撮影場所名を推測しません。'],
    ['メタデータ削除','元ファイルは変更せず新しい結果を作成し、結果を再解析して削除状態を確認します。'],
    ['カラープロファイル','ICCプロファイルは個人情報と区別し、不要な色変化を避けるため基本削除対象から外します。'],
    ['真偽判定','SoftwareタグやEXIFの有無だけでAI画像、加工画像、真偽を判定しません。'],
  ];

  return <ToolboxSubpageShell locale={locale} appName={t.title}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>
    <section className="toolbox-tool-detail-hero tool018-detail-hero">
      <Link className="toolbox-subpage-back" href={`/${locale}/category/image-edit`}>← {t.back}</Link>
      <p className="toolbox-subpage-eyebrow">018 · IMAGE EDIT</p>
      <div className="toolbox-tool-detail-heading"><h1>{t.title}</h1><p>{t.desc}</p></div>
      <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
    </section>

    <section className="toolbox-tool-detail-body"><div><ImageMetadataCheckerTool locale={locale}/>
      <section className="toolbox-next-work"><div><p>NEXT WORK</p><h2>{t.next}</h2></div><div className="toolbox-next-work-grid"><div className="toolbox-next-work-card is-disabled"><span>019</span><h3>{locale === 'ko' ? '유튜브 썸네일 제작기' : locale === 'en' ? 'YouTube Thumbnail Maker' : 'YouTubeサムネイル作成'}</h3><div className="toolbox-next-work-card-foot"><span>{t.coming}</span><strong>·</strong></div></div></div></section>
      <section className="toolbox-next-work toolbox-related-tools"><div><p>RELATED TOOLS</p><h2>{t.related}</h2></div><div className="toolbox-next-work-grid">{related.map((item) => <Link key={item.n} href={item.href} className="toolbox-next-work-card"><span>{item.n}</span><h3>{item.name}</h3><div className="toolbox-next-work-card-foot"><span>{t.available}</span><strong>↗</strong></div></Link>)}</div></section>
    </div></section>

    <section className={`toolbox-tool-guide tool018-how-to ${styles.howTo}`}><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((step,index) => <li key={step}><span>{String(index+1).padStart(2,'0')}</span><p>{step}</p></li>)}</ol></section>

    <section className={`toolbox-tool-format-guide toolbox-tool-expert-post tool018-format-guide ${styles.metadataGuide}`}>
      <div className="toolbox-tool-format-guide-head"><p>METADATA GUIDE</p><h2 className={styles.keepWords}>{t.guideTitle}</h2><span>{t.guideDesc}</span></div>
      <div className="toolbox-tool-result-grid">{notes.map(([title,description],index) => <article key={title}><span>{String(index+1).padStart(2,'0')}</span><div><h4>{title}</h4><p>{description}</p></div></article>)}</div>
      <section className="toolbox-tool-format-notes-section" aria-label="Additional guide notes"><div className="toolbox-tool-format-notes">
        <article><h3>{locale === 'ko' ? '주의사항' : locale === 'en' ? 'Important notes' : '注意事項'}</h3><ul>{cautions.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h3>{locale === 'ko' ? '개인정보 확인 기준' : locale === 'en' ? 'Privacy check guide' : 'プライバシー確認の基準'}</h3><ul>{(locale === 'ko' ? ['GPS·촬영일·카메라·작성자 정보는 실제 태그가 있을 때만 표시합니다.','파일 수정 시간은 촬영일로 바꾸어 표시하지 않습니다.','원본 파일은 수정하지 않고 정리된 새 파일을 생성합니다.'] : locale === 'en' ? ['GPS, capture date, camera, and author information are shown only when matching tags exist.','File modified time is not presented as the date taken.','The source file is not modified; cleaning creates a new file.'] : ['GPS・撮影日時・カメラ・作成者情報は実際のタグがある場合のみ表示します。','ファイル更新日時を撮影日時として表示しません。','元ファイルは変更せず、削除後の新しいファイルを作成します。']).map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div></section>
    </section>

    <section className={`toolbox-tool-format-guide toolbox-tool-expert-post tool018-use-cases ${styles.useCases}`}>
      <div className="toolbox-tool-format-guide-head"><p>USE CASES</p><h2 className={styles.keepWords}>{t.examplesTitle}</h2></div>
      <div className="toolbox-tool-result-grid">{t.examples.map(([title,description],index) => <article key={title}><span>{String(index+1).padStart(2,'0')}</span><div><h4>{title}</h4><p>{description}</p></div></article>)}</div>
    </section>

    <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{t.faqTitle}</h2></div><ToolboxFaqList items={t.faqs} initialCount={5} moreLabel={t.more} collapseLabel={t.collapse} className="toolbox-tool-faq-list"/></section>
    <section className="toolbox-tool-processing-note"><p>{t.local}</p></section>
  </ToolboxSubpageShell>;
}
