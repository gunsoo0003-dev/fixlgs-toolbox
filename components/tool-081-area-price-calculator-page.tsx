import Link from 'next/link';
import type {Locale} from '@/lib/site';
import {Tool081AreaPriceCalculator} from '@/components/tool-081-area-price-calculator';
import {ToolboxFaqList} from '@/components/toolbox-faq-list';
import {ToolboxSubpageShell} from '@/components/toolbox-subpage-shell';

const copy={
 ko:{
  title:'평수·평당가격 계산기',
  desc:'㎡와 평을 서로 변환하고 공급면적·전용면적을 같은 기준으로 맞춰 평당 가격과 ㎡당 가격을 계산합니다. 아파트·토지·상가 등 부동산의 면적과 단가를 비교할 때 사용할 수 있습니다.',
  back:'부동산·건축 계산기',local:'브라우저에서 바로 계산',how:'사용 방법',
  steps:[
   '단순 면적 변환만 필요하면 ㎡ 또는 평 중 하나만 입력합니다. 1평=3.305785㎡ 기준으로 반대 단위가 즉시 계산됩니다.',
   '평당 가격이나 ㎡당 가격까지 확인하려면 매매가·분양가 등 비교하려는 총가격을 입력합니다.',
   '계약서나 매물 정보에서 확인한 공급면적과 전용면적을 각각 입력하고 각 입력값의 단위를 ㎡ 또는 평으로 선택합니다.',
   '공급면적 기준과 전용면적 기준의 평당 가격·㎡당 가격을 함께 확인합니다. 서로 다른 매물은 반드시 같은 면적 기준끼리 비교하세요.',
   '예를 들어 84㎡는 약 25.41평이고, 5억원을 25평으로 나누면 평당 약 2,000만원입니다.',
   '결과 아래 계산식을 확인해 어떤 면적이 분모로 사용됐는지 확인하고 실제 계약 전에는 등기·건축물대장·분양계약서의 공식 면적을 다시 확인합니다.'
  ],
  notes:[
   '공급면적과 전용면적은 같은 값이 아닙니다. 평당 가격을 비교할 때 공급면적끼리 또는 전용면적끼리 같은 기준을 사용하세요.',
   '이 도구는 사용자가 입력한 면적을 계산 기준으로 사용하며 공급면적·전용면적·계약면적의 법적 정의나 적정성을 판정하지 않습니다.',
   '평과 ㎡는 같은 면적을 다른 단위로 표현한 값이므로 단위를 변환해도 총가격 자체는 변하지 않습니다.',
   '같은 5억원이라도 25평 기준이면 평당 2,000만원이고, 84㎡ 기준이면 ㎡당 약 595만원처럼 분모에 따라 단가 표현이 달라집니다.',
   '분양면적·계약면적·공용면적 등 다른 면적 명칭이 사용될 수 있으므로 실제 매물 비교에서는 원문에 표시된 면적 종류를 먼저 확인하세요.',
   '계산은 중간 반올림 없이 내부값으로 처리하고 화면 표시 단계에서만 반올림합니다. 표시값은 비교용 참고값으로 사용하세요.'
  ],
  faqs:[
   ['1평은 정확히 몇 ㎡인가요?','이 계산기는 1평=3.305785㎡를 기준으로 사용합니다. 따라서 ㎡를 평으로 바꿀 때는 3.305785로 나누고, 평을 ㎡로 바꿀 때는 3.305785를 곱합니다.'],
   ['84㎡는 몇 평인가요?','84÷3.305785로 계산하면 약 25.41평입니다. 화면 표시값은 반올림되므로 소수점 자릿수에 따라 마지막 숫자가 달라질 수 있습니다.'],
   ['59㎡는 몇 평인가요?','59÷3.305785로 계산하면 약 17.85평입니다. 다만 부동산에서 말하는 평형은 공급면적을 가리키는 경우도 있으므로 59㎡ 전용면적을 곧바로 특정 평형과 동일하게 보면 안 됩니다.'],
   ['공급면적과 전용면적은 어떻게 다른가요?','전용면적은 세대가 독립적으로 사용하는 내부 면적을 중심으로 보고, 공급면적은 전용면적에 주거공용면적 등이 더해진 값으로 사용됩니다. 실제 문서의 면적 명칭을 확인한 뒤 같은 기준으로 비교하세요.'],
   ['평당 가격은 공급면적으로 계산해야 하나요?','하나의 절대 기준으로 고정하기보다 비교 대상과 목적에 맞춰 같은 면적 기준을 쓰는 것이 중요합니다. 공급면적 기준 가격과 전용면적 기준 가격을 섞으면 비교가 왜곡될 수 있습니다.'],
   ['평당 가격은 어떻게 계산하나요?','총가격을 해당 면적의 평수로 나눕니다. 예를 들어 총가격 5억원, 기준 면적 25평이면 5억원÷25=평당 2,000만원입니다.'],
   ['㎡당 가격은 어떻게 계산하나요?','총가격을 해당 면적의 ㎡ 값으로 나눕니다. 예를 들어 5억원을 84㎡로 나누면 ㎡당 약 595만원입니다.'],
   ['계산 결과가 부동산 광고의 평형이나 단가와 다른 이유는 무엇인가요?','광고가 공급면적·전용면적·계약면적 중 다른 기준을 사용했거나 표시 단계에서 반올림했을 수 있습니다. 비교 전에 어떤 면적을 기준으로 했는지 먼저 확인하세요.']
  ]
 },
 en:{
  title:'Area & Price per Unit Calculator',
  desc:'Convert square meters and pyeong, then compare price per pyeong and price per square meter on the same gross- or exclusive-area basis. Use it to compare area and unit price for apartments, land, shops, and other property listings.',
  back:'Real Estate & Build',local:'CALCULATE IN YOUR BROWSER',how:'How to use',
  steps:[
   'For a simple area conversion, enter only m² or pyeong. The opposite unit is calculated using 1 pyeong = 3.305785 m².',
   'To calculate unit price, enter the total sale, asking, or reference price you want to compare.',
   'Enter the gross area and exclusive area shown in the contract or listing, and choose m² or pyeong for each input.',
   'Compare price per pyeong and price per m² on the gross-area and exclusive-area bases. Compare different properties only on the same area basis.',
   'As a quick example, 84 m² is about 25.41 pyeong, while KRW 500 million divided by 25 pyeong is about KRW 20 million per pyeong.',
   'Check the formula shown below the result to confirm the denominator, and verify the official area in the original property documents before a transaction.'
  ],
  notes:[
   'Gross area and exclusive area are not the same value. Compare gross with gross or exclusive with exclusive when evaluating unit prices.',
   'This tool uses the area values you enter and does not determine the legal definition or correctness of gross, exclusive, or contractual area.',
   'Pyeong and m² express the same physical area in different units, so converting units does not change the total property price.',
   'With the same KRW 500 million total price, dividing by 25 pyeong gives KRW 20 million per pyeong, while dividing by 84 m² gives about KRW 5.95 million per m².',
   'Listings may also use contractual, common, or other area labels. Confirm the exact area type shown in the original source before comparing properties.',
   'Calculations keep unrounded internal values and round only for display. Treat displayed unit prices as comparison references.'
  ],
  faqs:[
   ['How many square meters are in one pyeong?','This calculator uses 1 pyeong = 3.305785 m². Divide m² by 3.305785 to get pyeong, or multiply pyeong by 3.305785 to get m².'],
   ['How many pyeong is 84 m²?','84 ÷ 3.305785 is about 25.41 pyeong. The final displayed digit can vary with the selected display precision.'],
   ['How many pyeong is 59 m²?','59 ÷ 3.305785 is about 17.85 pyeong. A marketed apartment “pyeong type” may use a different area basis, so exclusive area should not automatically be treated as the advertised type.'],
   ['What is the difference between gross and exclusive area?','Exclusive area generally refers to the space used independently by the unit, while gross area adds shared residential area according to the applicable listing or document convention. Check the original area label before comparing.'],
   ['Should price per pyeong use gross area or exclusive area?','There is no single comparison basis that fits every purpose. The important rule is consistency: compare gross with gross or exclusive with exclusive rather than mixing the two.'],
   ['How is price per pyeong calculated?','Divide total price by the area in pyeong. For example, KRW 500 million ÷ 25 pyeong = KRW 20 million per pyeong.'],
   ['How is price per m² calculated?','Divide total price by the area in square meters. For example, KRW 500 million ÷ 84 m² is about KRW 5.95 million per m².'],
   ['Why can this result differ from a property listing?','The listing may use gross, exclusive, contractual, or another area basis, and it may round displayed values. Confirm the area basis before comparing unit prices.']
  ]
 },
 ja:{
  title:'面積・坪単価計算ツール',
  desc:'㎡と坪を相互換算し、供給面積・専有面積の基準をそろえて坪単価と㎡単価を計算します。マンション・土地・店舗など不動産の面積と単価を比較するときに利用できます。',
  back:'不動産・建築',local:'ブラウザ内で計算',how:'使い方',
  steps:[
   '面積換算だけなら㎡または坪のどちらか一方を入力します。1坪=3.305785㎡を基準に反対の単位を計算します。',
   '坪単価・㎡単価まで確認する場合は、比較したい売買価格や表示価格などの総価格を入力します。',
   '契約書や物件情報に記載された供給面積と専有面積をそれぞれ入力し、㎡または坪の入力単位を選択します。',
   '供給面積基準と専有面積基準の坪単価・㎡単価を確認します。別の物件を比べるときは同じ面積基準同士で比較してください。',
   '例として84㎡は約25.41坪で、5億ウォンを25坪で割ると坪当たり約2,000万ウォンです。',
   '結果下の計算式で分母に使われた面積を確認し、実際の契約前には登記・建築物台帳・分譲契約書などの公式面積を再確認します。'
  ],
  notes:[
   '供給面積と専有面積は同じ値ではありません。単価比較では供給面積同士、または専有面積同士で基準をそろえてください。',
   'このツールは入力された面積を計算基準として使用し、供給面積・専有面積・契約面積の法的定義や妥当性は判定しません。',
   '坪と㎡は同じ物理的な面積を別の単位で表したものなので、単位を換算しても総価格そのものは変わりません。',
   '同じ5億ウォンでも25坪で割れば坪当たり2,000万ウォン、84㎡で割れば㎡当たり約595万ウォンとなり、分母によって単価表現が変わります。',
   '物件情報では契約面積・共用面積など別の名称が使われることがあります。比較前に原文の面積種類を確認してください。',
   '計算は途中で丸めず内部値を保持し、画面表示時のみ丸めます。表示単価は比較用の参考値として利用してください。'
  ],
  faqs:[
   ['1坪は何㎡ですか？','この計算機では1坪=3.305785㎡を基準にします。㎡から坪へは3.305785で割り、坪から㎡へは3.305785を掛けます。'],
   ['84㎡は何坪ですか？','84÷3.305785で約25.41坪です。表示する小数桁によって最後の数字が異なる場合があります。'],
   ['59㎡は何坪ですか？','59÷3.305785で約17.85坪です。ただし物件広告の「坪型」が別の面積基準を使う場合があるため、専有面積だけで広告上の坪型を断定しないでください。'],
   ['供給面積と専有面積はどう違いますか？','専有面積は住戸が独立して使用する部分を中心とした面積で、供給面積は専有面積に住居共用部分などを加えた基準として使われます。実際の書類に記載された名称を確認してください。'],
   ['坪単価は供給面積で計算するべきですか？','用途にかかわらず一つの絶対基準があるというより、比較する面積基準をそろえることが重要です。供給面積基準と専有面積基準を混在させないでください。'],
   ['坪単価はどう計算しますか？','総価格を坪数で割ります。例えば5億ウォン÷25坪=坪当たり2,000万ウォンです。'],
   ['㎡単価はどう計算しますか？','総価格を㎡面積で割ります。例えば5億ウォン÷84㎡で、㎡当たり約595万ウォンです。'],
   ['物件広告の坪型や単価と結果が違うのはなぜですか？','広告が供給面積・専有面積・契約面積など別の基準を使っているか、表示時に丸めている可能性があります。比較前に面積基準を確認してください。']
  ]
 }
} as const;

const expert={
 ko:[
  ['CONVERT','㎡와 평을 같은 면적으로 보기','1평은 3.305785㎡입니다. 예를 들어 84㎡는 약 25.41평이고 25평은 약 82.64㎡입니다. 단위를 바꾸는 것일 뿐 실제 면적이나 총가격이 달라지는 것은 아닙니다.'],
  ['EXAMPLE 01','84㎡ 아파트 면적 확인','84㎡를 평으로 환산하면 약 25.41평입니다. 다만 매물에서 말하는 평형이 공급면적 기준이라면 84㎡ 전용면적의 환산값과 광고 평형은 서로 다를 수 있습니다.'],
  ['EXAMPLE 02','5억원·25평의 평당 가격','총가격 5억원을 25평으로 나누면 평당 2,000만원입니다. 같은 매물을 다른 매물과 비교하려면 두 매물 모두 공급면적 또는 전용면적 중 같은 기준을 사용해야 합니다.'],
  ['SUPPLY / EXCLUSIVE','공급면적과 전용면적 구분','공급면적과 전용면적은 분모가 다르므로 같은 총가격이라도 계산되는 단가가 다릅니다. 어느 값이 더 맞다고 단정하기보다 비교 목적에 맞는 동일 기준을 유지하는 것이 중요합니다.'],
  ['PER UNIT','평당 가격과 ㎡당 가격 함께 보기','평당 가격은 총가격÷평수, ㎡당 가격은 총가격÷㎡입니다. 5억원을 84㎡로 나누면 ㎡당 약 595만원으로, 같은 가격을 서로 다른 단위로 비교할 수 있습니다.'],
  ['ROUNDING','계산값과 표시값 구분','계산 과정에서는 변환된 면적을 중간에 반올림하지 않고 내부값을 유지합니다. 최종 화면에서만 읽기 쉽게 반올림하므로 계약서·감정평가 등 정밀한 판단에는 공식 원문 수치를 우선하세요.']
 ],
 en:[
  ['CONVERT','Read m² and pyeong as the same area','One pyeong equals 3.305785 m². For example, 84 m² is about 25.41 pyeong and 25 pyeong is about 82.64 m². Converting the unit does not change the physical area or total price.'],
  ['EXAMPLE 01','Check an 84 m² apartment','Converting 84 m² gives about 25.41 pyeong. If a listing markets an apartment type using gross area, however, that marketed pyeong figure can differ from a conversion of the 84 m² exclusive area.'],
  ['EXAMPLE 02','KRW 500M and 25 pyeong','KRW 500 million divided by 25 pyeong equals KRW 20 million per pyeong. For a fair comparison, calculate every property using the same gross- or exclusive-area basis.'],
  ['GROSS / EXCLUSIVE','Keep the area basis consistent','Gross and exclusive areas use different denominators, so the same total price produces different unit prices. The useful comparison is not which denominator is universally “correct,” but whether the basis is consistent.'],
  ['PER UNIT','View per-pyeong and per-m² prices together','Price per pyeong is total price ÷ pyeong, while price per m² is total price ÷ m². KRW 500 million divided by 84 m² is about KRW 5.95 million per m².'],
  ['ROUNDING','Separate calculation from display rounding','The calculator keeps converted area values unrounded during calculation and rounds only the displayed result. For contracts, valuation, or legal review, prioritize the exact figures in the official source document.']
 ],
 ja:[
  ['CONVERT','㎡と坪を同じ面積として見る','1坪は3.305785㎡です。例えば84㎡は約25.41坪、25坪は約82.64㎡です。単位を換算しても実際の面積や総価格が変わるわけではありません。'],
  ['EXAMPLE 01','84㎡のマンションを確認','84㎡を坪に換算すると約25.41坪です。ただし広告の坪型が供給面積基準なら、84㎡の専有面積を換算した値と広告上の坪型は異なる場合があります。'],
  ['EXAMPLE 02','5億ウォン・25坪の坪単価','総価格5億ウォンを25坪で割ると坪当たり2,000万ウォンです。物件同士を比較するときは、供給面積または専有面積の同じ基準でそろえて計算します。'],
  ['SUPPLY / EXCLUSIVE','供給面積と専有面積を区別','供給面積と専有面積では分母が異なるため、同じ総価格でも単価が変わります。どちらが常に正しいかではなく、比較目的に合わせて同じ基準を保つことが重要です。'],
  ['PER UNIT','坪単価と㎡単価を一緒に確認','坪単価は総価格÷坪数、㎡単価は総価格÷㎡です。5億ウォンを84㎡で割ると㎡当たり約595万ウォンとなり、同じ価格を別の単位でも比較できます。'],
  ['ROUNDING','計算値と表示上の丸めを区別','計算途中では換算面積を丸めず内部値を保持し、最終表示時のみ読みやすく丸めます。契約・鑑定などでは公式書類の正確な数値を優先してください。']
 ]
} as const;

export function Tool081AreaPriceCalculatorPage({locale}:{locale:Locale}){
 const t=copy[locale];
 const url=`https://toolbox.fixlgs.com/${locale}/area-price-per-unit-calculator`;
 const jsonLd={"@context":"https://schema.org","@graph":[{"@type":"WebApplication",name:t.title,applicationCategory:'UtilitiesApplication',operatingSystem:'Any',url,description:t.desc,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:'TOOLBOX',item:`https://toolbox.fixlgs.com/${locale}`},{"@type":"ListItem",position:2,name:t.back,item:`https://toolbox.fixlgs.com/${locale}/category/real-estate-build`},{"@type":"ListItem",position:3,name:t.title,item:url}]},{"@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]};
 return <ToolboxSubpageShell locale={locale} appName={t.title}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
  <section className="toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description">
   <Link className="toolbox-subpage-back" href={`/${locale}/category/real-estate-build`}>← {t.back}</Link>
   <p className="toolbox-subpage-eyebrow">081 · REAL ESTATE & BUILD</p>
   <div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div>
   <div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div>
  </section>
  <section className="toolbox-tool-detail-body"><div><Tool081AreaPriceCalculator locale={locale}/></div></section>
  <section className="toolbox-tool-guide toolbox-tool-guide--five">
   <div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div>
   <ol>{t.steps.map((s,i)=><li key={s}><span>{String(i+1).padStart(2,'0')}</span><p>{s}</p></li>)}</ol>
  </section>
  <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head">
   <div className="toolbox-tool-format-guide-head"><p>AREA & UNIT PRICE</p><h2>{locale==='ko'?'면적 기준을 맞추면 가격 비교가 명확해집니다':locale==='ja'?'面積の基準を合わせると価格比較が明確になります':'Match the area basis before comparing prices'}</h2></div>
   <div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{expert[locale].map(([tag,title,desc])=><article key={tag}><strong>{tag}</strong><h3>{title}</h3><p>{desc}</p></article>)}</div></div>
  </section>
  <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head">
   <div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{locale==='ko'?'주의사항':locale==='ja'?'注意事項':'Important notes'}</h2></div>
   <ul className="toolbox-tool-info-band-list">{t.notes.map(n=><li key={n}>{n}</li>)}</ul>
  </section>
  <section className="toolbox-tool-faq">
   <div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{locale==='ko'?'자주 묻는 질문':locale==='ja'?'よくある質問':'Frequently asked questions'}</h2></div>
   <ToolboxFaqList items={[...t.faqs]} initialCount={4} moreLabel={locale==='ko'?'FAQ 더보기':locale==='ja'?'FAQをもっと見る':'Show more FAQs'} collapseLabel={locale==='ko'?'FAQ 접기':locale==='ja'?'FAQを閉じる':'Collapse FAQs'} className="toolbox-tool-faq-list"/>
  </section>
 </ToolboxSubpageShell>
}
