'use client';
import {useMemo,useState} from 'react';
import type {Locale} from '@/lib/site';
import {TOOL071_METRICS,calculateTool071,formatTool071,parseTool071Number,type Tool071MetricId} from '@/lib/tool-071-ad-sales-performance';
import styles from './tool-071-ad-sales-performance-calculator.module.css';

const copy={
 ko:{local:'입력한 광고·매출 데이터는 브라우저 안에서만 계산됩니다.',select:'계산할 KPI 선택',names:{ctr:'클릭률',cpc:'클릭당 비용',cpm:'1,000회 노출당 비용',cvr:'전환율',cac:'고객획득비용',roas:'광고비 대비 매출',roi:'투자수익률',aov:'객단가'},labels:{clicks:'클릭수',impressions:'노출수',spend:'광고비',conversions:'전환수',acquisitionSpend:'고객획득비용',newCustomers:'신규 고객수',attributedRevenue:'귀속매출',adSpend:'광고비',return:'수익',cost:'비용',revenue:'매출',orders:'주문수'},denom:'분모',calculate:'계산',reset:'초기화',copy:'결과 복사',result:'계산 결과',formula:'공식',actualDenom:'실제 분모',empty:'값을 입력하면 결과가 표시됩니다.',zero:'분모는 0보다 커야 합니다.',invalid:'0 이상의 유효한 숫자를 입력하세요.',limit:'입력값이 서비스 상한을 초과했습니다.',roasNote:'ROAS는 광고비 대비 귀속매출이며 ROI와 다른 지표입니다.',cacNote:'CAC는 신규 고객 수를 기준으로 계산합니다.',aovNote:'AOV는 기본적으로 주문 수를 기준으로 계산합니다.',compare:'A/B KPI 비교',compareDesc:'같은 KPI를 두 세트의 입력값으로 비교합니다.',setA:'A 세트',setB:'B 세트',precision:'표시 소수점 최대 자리',copied:'결과를 복사했습니다.'},
 en:{local:'Your ad and sales inputs are calculated only in your browser.',select:'Choose a KPI',names:{ctr:'Click-through rate',cpc:'Cost per click',cpm:'Cost per 1,000 impressions',cvr:'Conversion rate',cac:'Customer acquisition cost',roas:'Return on ad spend',roi:'Return on investment',aov:'Average order value'},labels:{clicks:'Clicks',impressions:'Impressions',spend:'Ad spend',conversions:'Conversions',acquisitionSpend:'Acquisition spend',newCustomers:'New customers',attributedRevenue:'Attributed revenue',adSpend:'Ad spend',return:'Return',cost:'Cost',revenue:'Revenue',orders:'Orders'},denom:'DENOMINATOR',calculate:'Calculate',reset:'Reset',copy:'Copy result',result:'Result',formula:'Formula',actualDenom:'Actual denominator',empty:'Enter values to see the result.',zero:'The denominator must be greater than zero.',invalid:'Enter valid non-negative numbers.',limit:'An input exceeds the service limit.',roasNote:'ROAS uses attributed revenue over ad spend and is not ROI.',cacNote:'CAC is calculated using new customers.',aovNote:'AOV uses order count by default.',compare:'A/B KPI comparison',compareDesc:'Compare two input sets using the same KPI.',setA:'Set A',setB:'Set B',precision:'Maximum display decimals',copied:'Result copied.'},
 ja:{local:'入力した広告・売上データはブラウザ内だけで計算されます。',select:'計算するKPIを選択',names:{ctr:'クリック率',cpc:'クリック単価',cpm:'1,000表示あたり費用',cvr:'コンバージョン率',cac:'顧客獲得単価',roas:'広告費用対効果',roi:'投資収益率',aov:'客単価'},labels:{clicks:'クリック数',impressions:'インプレッション',spend:'広告費',conversions:'コンバージョン数',acquisitionSpend:'顧客獲得費用',newCustomers:'新規顧客数',attributedRevenue:'帰属売上',adSpend:'広告費',return:'収益',cost:'費用',revenue:'売上',orders:'注文数'},denom:'分母',calculate:'計算',reset:'リセット',copy:'結果をコピー',result:'計算結果',formula:'計算式',actualDenom:'実際の分母',empty:'値を入力すると結果が表示されます。',zero:'分母は0より大きい必要があります。',invalid:'0以上の有効な数値を入力してください。',limit:'入力値がサービス上限を超えています。',roasNote:'ROASは広告費に対する帰属売上で、ROIとは別の指標です。',cacNote:'CACは新規顧客数を基準に計算します。',aovNote:'AOVは基本的に注文数を基準に計算します。',compare:'A/B KPI比較',compareDesc:'同じKPIで2セットの入力値を比較します。',setA:'Aセット',setB:'Bセット',precision:'表示小数点の最大桁数',copied:'結果をコピーしました。'}
} as const;

const order:Tool071MetricId[]=['ctr','cpc','cpm','cvr','cac','roas','roi','aov'];
const lc=(l:Locale)=>l==='ko'?'ko-KR':l==='ja'?'ja-JP':'en-US';

export function Tool071AdSalesPerformanceCalculator({locale}:{locale:Locale}){
 const t=copy[locale];const [metric,setMetric]=useState<Tool071MetricId>('ctr');const [a,setA]=useState('');const [b,setB]=useState('');const [precision,setPrecision]=useState(2);const [status,setStatus]=useState('');
 const schema=TOOL071_METRICS[metric];
 const calc=useMemo(()=>{const av=parseTool071Number(a),bv=parseTool071Number(b);if(av===null||bv===null)return {result:null,error:''};try{return {result:calculateTool071(metric,av,bv),error:''}}catch(e){const m=e instanceof Error?e.message:'';return {result:null,error:m==='ZERO_DENOMINATOR'?t.zero:m.includes('LIMIT')?t.limit:t.invalid}}},[a,b,metric,t.zero,t.limit,t.invalid]);
 const display=calc.result?schema.output==='roas'?`${formatTool071(calc.result.ratioValue??calc.result.value,precision,lc(locale))}x · ${formatTool071(calc.result.percentValue??0,precision,lc(locale))}%`:schema.output==='percent'?`${formatTool071(calc.result.value,precision,lc(locale))}%`:`${formatTool071(calc.result.value,precision,lc(locale))} ${locale==='ko'?'원':locale==='ja'?'通貨単位':'currency units'}`:'';
 const reset=()=>{setA('');setB('');setStatus('')};
 const copyResult=async()=>{if(!calc.result)return;const text=`${schema.short}: ${display}\n${t.formula}: ${schema.formula}\n${t.actualDenom}: ${t.labels[schema.denominatorKey as keyof typeof t.labels]} = ${formatTool071(calc.result.denominatorValue,precision,lc(locale))}`;try{await navigator.clipboard.writeText(text);setStatus(t.copied)}catch{setStatus(text)}};
 const switchMetric=(id:Tool071MetricId)=>{setMetric(id);setA('');setB('');setStatus('')};
 return <div className={styles.root} data-testid="tool071-root">
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <section aria-label={t.select}><div className={styles.metricGrid}>{order.map(id=><button key={id} type="button" data-testid={`tool071-metric-${id}`} className={`${styles.metricButton} ${metric===id?styles.metricActive:''}`} aria-pressed={metric===id} onClick={()=>switchMetric(id)}><strong>{TOOL071_METRICS[id].short}</strong><span>{t.names[id]}</span></button>)}</div></section>
  <section className={styles.workspace}>
   <div className={styles.card}>
    <div className={styles.metricTitle}><h3>{schema.short} · {t.names[metric]}</h3><span>{schema.formula}</span></div>
    <div className={styles.inputGrid}>
     <label className={styles.field}><span>{t.labels[schema.inputA.labelKey as keyof typeof t.labels]}</span><input data-testid="tool071-input-a" inputMode="decimal" maxLength={30} value={a} onChange={e=>setA(e.target.value)} placeholder="0"/></label>
     <label className={styles.field}><span>{t.labels[schema.inputB.labelKey as keyof typeof t.labels]}</span><small className={styles.denominator}>{t.denom}</small><input data-testid="tool071-input-b" inputMode="decimal" maxLength={30} value={b} onChange={e=>setB(e.target.value)} placeholder="0"/></label>
    </div>
    <p className={styles.formulaPreview} data-testid="tool071-formula-preview">{schema.short} = {schema.formula}</p>
    {metric==='roas'&&<p className={styles.hint}>{t.roasNote}</p>}{metric==='cac'&&<p className={styles.hint}>{t.cacNote}</p>}{metric==='aov'&&<p className={styles.hint}>{t.aovNote}</p>}
    {calc.error&&<p className={styles.error} role="alert" data-testid="tool071-error">{calc.error}</p>}
    <div className={styles.actionRow}><button className={styles.button} type="button" onClick={reset}>{t.reset}</button><button className={styles.primaryButton} type="button" onClick={copyResult} disabled={!calc.result}>{t.copy}</button></div>
   </div>
   <div className={styles.resultCard} aria-live="polite">
    <div className={styles.resultHead}><p className={styles.resultLabel}>RESULT · {schema.short}</p><span>{t.names[metric]}</span></div>
    {!calc.result?<p className={styles.hint}>{calc.error||t.empty}</p>:<><div className={styles.resultValue}><strong data-testid="tool071-result">{display}</strong><span>{t.result}</span></div><div className={styles.resultMeta}><div><b>{t.formula}</b><code data-testid="tool071-formula">{schema.formula}</code></div><div><b>{t.actualDenom}</b><span data-testid="tool071-denominator">{t.labels[schema.denominatorKey as keyof typeof t.labels]} = {formatTool071(calc.result.denominatorValue,precision,lc(locale))}</span></div></div></>}
    {status&&<p className={styles.status} role="status">{status}</p>}
   </div>
  </section>
  <details className={styles.advanced}><summary>{t.compare}</summary><p className={styles.hint}>{t.compareDesc}</p><Compare locale={locale} metric={metric} titleA={t.setA} titleB={t.setB} labels={t.labels} precision={precision}/><label className={styles.precisionRow}><span>{t.precision}</span><input data-testid="tool071-precision" type="range" min="0" max="8" value={precision} onChange={e=>setPrecision(Number(e.target.value))}/><strong className={styles.precisionValue}>{precision}</strong></label></details>
 </div>
}

function Compare({locale,metric,titleA,titleB,labels,precision}:{locale:Locale;metric:Tool071MetricId;titleA:string;titleB:string;labels:Record<string,string>;precision:number}){
 const schema=TOOL071_METRICS[metric];const [values,setValues]=useState({aa:'',ab:'',ba:'',bb:''});
 const one=(x:string,y:string)=>{const a=parseTool071Number(x),b=parseTool071Number(y);if(a===null||b===null)return '';try{const r=calculateTool071(metric,a,b);return schema.output==='roas'?`${formatTool071(r.ratioValue??0,precision,lc(locale))}x / ${formatTool071(r.percentValue??0,precision,lc(locale))}%`:schema.output==='percent'?`${formatTool071(r.value,precision,lc(locale))}%`:formatTool071(r.value,precision,lc(locale))}catch{return '—'}};
 const box=(prefix:'a'|'b',title:string)=>{const k1=`${prefix}a` as keyof typeof values,k2=`${prefix}b` as keyof typeof values;return <div className={styles.compareBox}><strong>{title}</strong><label className={styles.field}><span>{labels[schema.inputA.labelKey]}</span><input data-testid={`tool071-compare-${prefix}-a`} value={values[k1]} onChange={e=>setValues(v=>({...v,[k1]:e.target.value}))}/></label><label className={styles.field}><span>{labels[schema.inputB.labelKey]}</span><input data-testid={`tool071-compare-${prefix}-b`} value={values[k2]} onChange={e=>setValues(v=>({...v,[k2]:e.target.value}))}/></label><span className={styles.compareResult} data-testid={`tool071-compare-${prefix}-result`}>{one(values[k1],values[k2])||'—'}</span></div>};
 return <div className={styles.compareGrid}>{box('a',titleA)}{box('b',titleB)}</div>
}
