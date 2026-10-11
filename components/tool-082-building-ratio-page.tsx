import Link from 'next/link';
import type {Locale} from '@/lib/site';
import {Tool082BuildingRatio} from '@/components/tool-082-building-ratio';
import {ToolboxFaqList} from '@/components/toolbox-faq-list';
import {ToolboxSubpageShell} from '@/components/toolbox-subpage-shell';
import {ToolNavigation} from '@/components/tool-navigation';

const copy={
 ko:{title:'건폐율·용적률 계산기',desc:'대지면적·건축면적·연면적으로 현재 건폐율과 용적률을 계산하고, 목표 비율을 적용했을 때의 가능 건축면적과 가능 연면적을 역산합니다.',back:'부동산·건축 계산기',local:'브라우저에서 바로 계산',how:'사용 방법',steps:[
  '대지면적을 ㎡ 단위로 입력합니다. 현재 비율 계산과 목표 비율 역산에서 같은 대지면적이 공통 분모로 사용됩니다.',
  '건축면적과 연면적을 입력하면 건폐율=건축면적÷대지면적×100, 용적률=연면적÷대지면적×100으로 현재 비율을 확인할 수 있습니다.',
  '목표 건폐율 또는 목표 용적률을 입력하면 같은 대지면적에 목표 비율을 적용한 가능 건축면적·가능 연면적을 역산합니다.',
  '예를 들어 대지 200㎡, 건축면적 120㎡라면 건폐율은 60%이고, 연면적 400㎡라면 용적률은 200%입니다.',
  '목표 건폐율 50%를 대지 300㎡에 적용하면 가능 건축면적은 150㎡, 목표 용적률 180%라면 가능 연면적은 540㎡입니다.',
  '결과는 산술 계산값입니다. 실제 건축 가능 여부를 판단할 때는 용도지역·지구단위계획·높이·주차·일조 등 관련 규정을 별도로 확인합니다.'
 ],notes:[
  '건폐율과 용적률은 모두 대지면적을 분모로 사용하지만 건폐율은 건축면적, 용적률은 연면적을 분자로 사용합니다.',
  '건축면적과 연면적은 서로 다른 개념입니다. 한 값을 다른 값 대신 입력하면 계산 결과의 의미가 달라집니다.',
  '목표 비율 역산은 사용자가 입력한 목표 비율을 단순 적용한 값이며 법정 상한이나 허용치를 자동 조회하지 않습니다.',
  '대지 200㎡에서 목표 건폐율 60%면 120㎡, 목표 용적률 200%면 400㎡처럼 같은 대지라도 서로 다른 면적 결과가 나옵니다.',
  '실제 허용 건폐율·용적률은 용도지역, 지구, 건축물 용도, 지자체 조례와 각종 완화·가산 조건에 따라 달라질 수 있습니다.',
  '계산값은 비교와 사전 검토용 참고값으로 사용하고, 설계·허가·매입 판단 전에는 토지이용계획과 담당 행정기관 또는 전문가 자료를 확인하세요.'
 ],faqs:[
  ['건폐율은 어떻게 계산하나요?','건축면적을 대지면적으로 나눈 뒤 100을 곱합니다. 예를 들어 대지 200㎡에 건축면적 120㎡이면 건폐율은 60%입니다.'],
  ['용적률은 어떻게 계산하나요?','연면적을 대지면적으로 나눈 뒤 100을 곱합니다. 대지 200㎡에 연면적 400㎡이면 용적률은 200%입니다.'],
  ['건축면적과 연면적은 같은 값인가요?','아닙니다. 건축면적은 건축물이 대지에 차지하는 수평 투영 면적을 중심으로 보고, 연면적은 여러 층의 바닥면적을 합산한 값으로 사용됩니다. 실제 법정 산정 범위는 관련 기준을 확인하세요.'],
  ['대지 300㎡에 건폐율 50%면 건축면적은 얼마인가요?','300×50÷100으로 계산해 150㎡입니다. 이는 입력한 목표 비율을 단순 적용한 산술값입니다.'],
  ['대지 300㎡에 용적률 180%면 연면적은 얼마인가요?','300×180÷100으로 계산해 540㎡입니다. 실제 허용 연면적과 동일하다고 단정할 수는 없습니다.'],
  ['법적으로 건축 가능한지 자동 판정하나요?','아닙니다. 이 도구는 입력값의 산술 계산과 역산만 수행하며 용도지역, 높이, 주차, 일조, 허가 여부 등을 자동 판정하지 않습니다.'],
  ['평 단위로 직접 입력할 수 있나요?','TOOL082는 ㎡를 기준으로 계산합니다. 평과 ㎡ 변환은 TOOL081 평수·평당가격 계산기에서 먼저 처리할 수 있습니다.'],
  ['건폐율·용적률 결과가 공공자료와 다른 이유는 무엇인가요?','공공자료나 허가 기준에는 산정 제외 면적, 완화·가산, 용도지역·지구 조건 등 추가 규칙이 반영될 수 있습니다. 이 계산기는 입력한 면적과 비율만 사용합니다.']
 ]},
 en:{title:'Building Coverage & Floor Area Ratio Calculator',desc:'Calculate current building coverage and floor area ratio from site, building and gross floor area, then reverse-calculate possible areas from target ratios.',back:'Real Estate & Build',local:'CALCULATE IN YOUR BROWSER',how:'How to use',steps:[
  'Enter the site area in m². The same site area is used as the denominator for both current-ratio calculations and target reverse calculations.',
  'Enter building area and gross floor area to calculate coverage = building area ÷ site area × 100 and FAR = gross floor area ÷ site area × 100.',
  'Enter a target coverage ratio or target FAR to reverse-calculate possible building area or possible gross floor area on the same site.',
  'For example, a 200 m² site with 120 m² building area gives 60% coverage, while 400 m² gross floor area gives 200% FAR.',
  'On a 300 m² site, target coverage of 50% gives 150 m² possible building area, while target FAR of 180% gives 540 m² possible gross floor area.',
  'Treat the result as arithmetic reference data. Check zoning, district plans, height, parking, sunlight and other rules separately before making a legal or design decision.'
 ],notes:[
  'Coverage and FAR both use site area as the denominator, but coverage uses building area while FAR uses gross floor area as the numerator.',
  'Building area and gross floor area are different concepts. Substituting one for the other changes the meaning of the result.',
  'Target reverse calculations simply apply the ratio you enter and do not look up statutory limits or legal allowances.',
  'On the same 200 m² site, 60% target coverage gives 120 m² while 200% target FAR gives 400 m², because the two ratios refer to different areas.',
  'Actual permitted ratios may vary by zoning, district, building use, local ordinances, bonuses, exemptions and other planning rules.',
  'Use these results for comparison and preliminary review. Before design, permitting, or purchase decisions, verify official land-use information and applicable authority or professional guidance.'
 ],faqs:[
  ['How is building coverage calculated?','Divide building area by site area and multiply by 100. A 200 m² site with 120 m² building area gives 60% coverage.'],
  ['How is FAR calculated?','Divide gross floor area by site area and multiply by 100. A 200 m² site with 400 m² gross floor area gives 200% FAR.'],
  ['Are building area and gross floor area the same?','No. Building area generally concerns the footprint on the site, while gross floor area combines floor areas across levels. Legal calculation rules can include additional details.'],
  ['What does 50% coverage mean on a 300 m² site?','300 × 50 ÷ 100 gives 150 m² as the arithmetic possible building area.'],
  ['What does 180% FAR mean on a 300 m² site?','300 × 180 ÷ 100 gives 540 m² as the arithmetic possible gross floor area.'],
  ['Does this determine whether construction is legally permitted?','No. It performs arithmetic calculations only and does not automatically judge zoning, height, parking, sunlight, or permit eligibility.'],
  ['Can I enter pyeong directly?','TOOL082 uses square metres as its canonical unit. You can convert pyeong and m² first with TOOL081.'],
  ['Why can the result differ from an official planning figure?','Official calculations may include exclusions, bonuses, zoning rules, district plans, or other legal conditions. This calculator only uses the values you enter.']
 ]},
 ja:{title:'建蔽率・容積率計算ツール',desc:'敷地面積・建築面積・延べ床面積から現在の建蔽率と容積率を計算し、目標比率から可能面積を逆算します。',back:'不動産・建築',local:'ブラウザ内で計算',how:'使い方',steps:[
  '敷地面積を㎡で入力します。現在比率の計算と目標比率の逆算で同じ敷地面積を分母として使います。',
  '建築面積と延べ床面積を入力すると、建蔽率=建築面積÷敷地面積×100、容積率=延べ床面積÷敷地面積×100で確認できます。',
  '目標建蔽率または目標容積率を入力すると、同じ敷地面積に目標比率を適用した建築可能面積・建築可能延べ床面積を逆算します。',
  '例として敷地200㎡、建築面積120㎡なら建蔽率60%、延べ床面積400㎡なら容積率200%です。',
  '敷地300㎡に目標建蔽率50%を適用すると150㎡、目標容積率180%なら540㎡が算術上の可能面積です。',
  '結果は算術上の参考値です。実際の建築可否は用途地域、地区計画、高さ、駐車、日照などの規定を別途確認してください。'
 ],notes:[
  '建蔽率と容積率はどちらも敷地面積を分母にしますが、建蔽率は建築面積、容積率は延べ床面積を分子にします。',
  '建築面積と延べ床面積は異なる概念です。一方を他方の代わりに入力すると結果の意味が変わります。',
  '目標比率の逆算は入力した比率を単純適用するだけで、法定上限や許容値を自動取得しません。',
  '同じ200㎡の敷地でも目標建蔽率60%なら120㎡、目標容積率200%なら400㎡となり、対象面積が異なります。',
  '実際の許容比率は用途地域、地区、建物用途、自治体条例、緩和・加算条件などで変わる場合があります。',
  '比較や事前検討の参考として使い、設計・許可・購入判断の前には公式な土地利用情報や行政機関・専門家の資料を確認してください。'
 ],faqs:[
  ['建蔽率はどう計算しますか？','建築面積を敷地面積で割って100を掛けます。敷地200㎡、建築面積120㎡なら60%です。'],
  ['容積率はどう計算しますか？','延べ床面積を敷地面積で割って100を掛けます。敷地200㎡、延べ床面積400㎡なら200%です。'],
  ['建築面積と延べ床面積は同じですか？','いいえ。建築面積は敷地上の建物の水平投影面積を中心に扱い、延べ床面積は各階の床面積を合計した値として使われます。法的な算定範囲は関連基準を確認してください。'],
  ['敷地300㎡・建蔽率50%なら建築面積はいくらですか？','300×50÷100で150㎡です。入力比率を単純適用した算術値です。'],
  ['敷地300㎡・容積率180%なら延べ床面積はいくらですか？','300×180÷100で540㎡です。実際の許容延べ床面積と同一とは限りません。'],
  ['法的に建築可能か自動判定しますか？','いいえ。入力値の算術計算のみを行い、用途地域、高さ、駐車、日照、許可可否などは自動判定しません。'],
  ['坪を直接入力できますか？','TOOL082は㎡を基準に計算します。坪と㎡の換算はTOOL081で先に行えます。'],
  ['公的な計画資料と結果が違うのはなぜですか？','公的な算定には除外面積、緩和・加算、用途地域や地区計画など追加条件が反映される場合があります。このツールは入力値だけで計算します。']
 ]}
} as const;

const expert={
 ko:[
  ['COVERAGE','건폐율은 대지 위의 점유 비율','대지 200㎡에 건축면적 120㎡라면 120÷200×100=60%입니다. 건폐율은 건물이 대지에 얼마나 넓게 자리하는지를 보는 비율로 이해하면 쉽습니다.'],
  ['FAR','용적률은 연면적의 누적 비율','대지 200㎡에 연면적 400㎡라면 400÷200×100=200%입니다. 여러 층의 바닥면적이 합산되므로 건폐율과 같은 숫자가 나올 필요는 없습니다.'],
  ['EXAMPLE 01','300㎡ 대지에서 목표 건폐율 50%','300×0.5=150㎡입니다. 이는 목표 비율을 단순 적용한 최대 추정 면적이 아니라 산술 역산값이며 실제 허용면적은 별도 확인이 필요합니다.'],
  ['EXAMPLE 02','300㎡ 대지에서 목표 용적률 180%','300×1.8=540㎡입니다. 층수나 층별 배치까지 자동 결정하는 값은 아니므로 설계안과 직접 동일시하지 않습니다.'],
  ['COMPARE','현재 비율과 목표 비율을 분리해서 보기','현재 값은 실제 입력 면적에서 계산하고 목표 값은 원하는 비율에서 역산합니다. 두 결과를 나란히 보면 현재 상태와 가정 시나리오를 혼동하지 않고 비교할 수 있습니다.'],
  ['LEGAL','법정 허용치와 계산값은 별개','법정 건폐율·용적률에는 용도지역과 각종 예외·완화 조건이 적용될 수 있습니다. 이 도구는 규정 데이터베이스가 아니라 계산기이므로 최종 판단은 공식 자료를 우선합니다.']
 ],
 en:[
  ['COVERAGE','Coverage describes site footprint ratio','A 200 m² site with 120 m² building area gives 120 ÷ 200 × 100 = 60%. It is useful for understanding how much of the site is occupied by the building footprint.'],
  ['FAR','FAR describes accumulated floor-area ratio','A 200 m² site with 400 m² gross floor area gives 400 ÷ 200 × 100 = 200%. Because floor areas across levels are accumulated, FAR does not need to match coverage.'],
  ['EXAMPLE 01','Target coverage on a 300 m² site','300 × 0.5 = 150 m². This is an arithmetic reverse calculation from the target ratio, not a statutory maximum or guaranteed buildable area.'],
  ['EXAMPLE 02','Target FAR on a 300 m² site','300 × 1.8 = 540 m². The value does not choose the number of floors or a floor-by-floor layout, so it should not be treated as a finished design.'],
  ['COMPARE','Separate current and target ratios','Current values come from entered areas, while target values are reverse-calculated from hypothetical ratios. Reading them side by side helps keep actual inputs separate from scenarios.'],
  ['LEGAL','Legal allowances are separate from arithmetic','Statutory coverage and FAR can depend on zoning and exceptions, bonuses, or local rules. This tool is a calculator, not a regulatory database, so official sources remain the priority.']
 ],
 ja:[
  ['COVERAGE','建蔽率は敷地上の占有割合','敷地200㎡に建築面積120㎡なら120÷200×100=60%です。建物が敷地をどの程度占有するかを見る比率として理解できます。'],
  ['FAR','容積率は延べ床面積の累積割合','敷地200㎡に延べ床面積400㎡なら400÷200×100=200%です。複数階の床面積を合計するため、建蔽率と同じ数値になる必要はありません。'],
  ['EXAMPLE 01','300㎡の敷地で目標建蔽率50%','300×0.5=150㎡です。目標比率からの算術的な逆算値であり、法定上限や保証された建築可能面積ではありません。'],
  ['EXAMPLE 02','300㎡の敷地で目標容積率180%','300×1.8=540㎡です。階数や各階の配置を自動決定する値ではないため、完成した設計案とは区別して扱います。'],
  ['COMPARE','現在値と目標値を分けて確認','現在値は入力した実面積から計算し、目標値は仮定した比率から逆算します。並べて見ると実値とシナリオを混同せず比較できます。'],
  ['LEGAL','法的許容値と算術結果は別','法定の建蔽率・容積率には用途地域や例外、緩和、自治体ルールが関係します。このツールは規制データベースではないため、最終判断では公式資料を優先してください。']
 ]
} as const;

export function Tool082BuildingRatioPage({locale}:{locale:Locale}){
 const t=copy[locale];
 const url=`https://toolbox.fixlgs.com/${locale}/building-coverage-floor-area-ratio-calculator`;
 const jsonLd={"@context":"https://schema.org","@graph":[{"@type":"WebApplication",name:t.title,applicationCategory:'UtilitiesApplication',operatingSystem:'Any',url,description:t.desc,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:'TOOLBOX',item:`https://toolbox.fixlgs.com/${locale}`},{"@type":"ListItem",position:2,name:t.back,item:`https://toolbox.fixlgs.com/${locale}/category/real-estate-build`},{"@type":"ListItem",position:3,name:t.title,item:url}]},{"@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]};
 return <ToolboxSubpageShell locale={locale} appName={t.title}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
  <section className={`toolbox-tool-detail-hero${locale==='en'?'':' toolbox-tool-detail-hero--single-line-description'}`}><Link className="toolbox-subpage-back" href={`/${locale}/category/real-estate-build`}>← {t.back}</Link><p className="toolbox-subpage-eyebrow">082 · REAL ESTATE & CONSTRUCTION</p><div className="toolbox-tool-detail-heading"><h1><span className="toolbox-tool-title-line">{t.title}</span></h1><p>{t.desc}</p></div><div className="toolbox-tool-detail-badge"><strong>LOCAL</strong><span>{t.local}</span></div></section>
  <section className="toolbox-tool-detail-body"><div><Tool082BuildingRatio locale={locale}/><ToolNavigation locale={locale} currentTool={82}/></div></section>
  <section className="toolbox-tool-guide toolbox-tool-guide--five"><div className="toolbox-tool-guide-head"><p>HOW TO USE</p><h2>{t.how}</h2></div><ol>{t.steps.map((s,i)=><li key={s}><span>{String(i+1).padStart(2,'0')}</span><p>{s}</p></li>)}</ol></section>
  <section className="toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head"><div className="toolbox-tool-format-guide-head"><p>BUILDING RATIO GUIDE</p><h2>{locale==='ko'?'건폐율·용적률 계산값을 읽는 법':locale==='ja'?'建蔽率・容積率の計算結果の見方':'How to read coverage and FAR results'}</h2><span>{locale==='ko'?'현재 비율 계산과 목표 비율 역산을 분리해 보면 실제 입력값과 가정 시나리오를 명확히 구분할 수 있습니다.':locale==='ja'?'現在比率と目標比率の逆算を分けると、実際の入力値と仮定シナリオを明確に区別できます。':'Separating current calculations from target reverse calculations keeps actual inputs distinct from hypothetical scenarios.'}</span></div><div className="toolbox-tool-format-body"><div className="toolbox-tool-format-grid">{expert[locale].map(([tag,title,desc])=><article key={tag}><strong>{tag}</strong><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
  <section className="toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head"><div className="toolbox-tool-info-band-head"><p>IMPORTANT NOTES</p><h2>{locale==='ko'?'주의사항':locale==='ja'?'注意事項':'Important notes'}</h2></div><ul className="toolbox-tool-info-band-list">{t.notes.map(n=><li key={n}>{n}</li>)}</ul></section>
  <section className="toolbox-tool-faq"><div className="toolbox-tool-guide-head"><p>FAQ</p><h2>{locale==='ko'?'자주 묻는 질문':locale==='ja'?'よくある質問':'Frequently asked questions'}</h2></div><ToolboxFaqList items={[...t.faqs]} initialCount={4} moreLabel={locale==='ko'?'FAQ 더보기':locale==='ja'?'FAQをもっと見る':'Show more FAQs'} collapseLabel={locale==='ko'?'FAQ 접기':locale==='ja'?'FAQを閉じる':'Collapse FAQs'} className="toolbox-tool-faq-list"/></section>
 </ToolboxSubpageShell>;
}
