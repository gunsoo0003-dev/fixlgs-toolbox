'use client';

import {useMemo, useState} from 'react';
import {
  TOOL062_CURRENCIES, TOOL062_LIMITS, calculateTool062Discount,
  findTool062DiscountRate, formatTool062Money, formatTool062Number,
  parseTool062Number, reverseTool062Original, type Tool062Currency, type Tool062Mode,
} from '@/lib/tool-062-discount';
import styles from './tool-062-discount-price-calculator.module.css';

type Locale='ko'|'en'|'ja';
const text={
 ko:{modes:['기본 할인','원래가격 역산','할인율 확인'],workspace:'DISCOUNT WORKSPACE',choose:'가격과 할인 조건을 입력하세요',local:'입력한 가격과 할인율은 서버로 전송하거나 저장하지 않습니다.',original:'정가',rate:'할인율',finalInput:'할인가',currency:'통화 표시',additional:'추가 할인',second:'2차 할인',third:'3차 할인',addThird:'3차 할인 추가',removeThird:'3차 할인 제거',discountAmount:'할인금액',final:'최종가격',savings:'전체 절약액',effective:'실질 할인율',breakdown:'순차 할인 내역',formula:'계산식',before:'적용 전',after:'적용 후',copy:'결과 복사',copied:'복사됨',reset:'초기화',findOriginal:'역산 원래가격',findRate:'계산된 할인율',error:'입력값을 확인하세요.',rateRange:'할인율은 0~100% 범위여야 합니다.',reverse100:'100% 할인은 원래가격을 역산할 수 없습니다.',zeroOriginal:'정가가 0이면 할인율을 계산할 수 없습니다.',finalOver:'할인가는 정가보다 클 수 없습니다.',stackHint:'추가 할인은 직전 할인 후 가격에 순차 적용됩니다.',displayOnly:'통화는 표시용이며 환율 변환은 하지 않습니다.'},
 en:{modes:['Discount','Find Original Price','Find Discount %'],workspace:'DISCOUNT WORKSPACE',choose:'Enter a price and discount conditions',local:'Prices and discount rates stay in this browser and are not sent to or stored on a server.',original:'Original Price',rate:'Discount %',finalInput:'Sale Price',currency:'Currency display',additional:'Additional Discount',second:'2nd discount',third:'3rd discount',addThird:'Add 3rd discount',removeThird:'Remove 3rd discount',discountAmount:'Discount Amount',final:'Final Price',savings:'Total Savings',effective:'Effective Discount',breakdown:'Sequential Breakdown',formula:'Formula',before:'Before',after:'After',copy:'Copy result',copied:'Copied',reset:'Reset',findOriginal:'Original Price',findRate:'Discount Rate',error:'Check the input values.',rateRange:'Discount must be between 0% and 100%.',reverse100:'An original price cannot be recovered from a 100% discount.',zeroOriginal:'Discount rate is undefined when the original price is zero.',finalOver:'Sale price cannot be greater than the original price.',stackHint:'Additional discounts are applied sequentially to the already discounted price.',displayOnly:'Currency is for display only; no exchange-rate conversion is performed.'},
 ja:{modes:['基本割引','元の価格を逆算','割引率を計算'],workspace:'DISCOUNT WORKSPACE',choose:'価格と割引条件を入力してください',local:'入力した価格と割引率はサーバーへ送信・保存せず、このブラウザ内だけで計算します。',original:'元の価格',rate:'割引率',finalInput:'割引後価格',currency:'通貨表示',additional:'追加割引',second:'2回目の割引',third:'3回目の割引',addThird:'3回目の割引を追加',removeThird:'3回目の割引を削除',discountAmount:'割引額',final:'最終価格',savings:'合計節約額',effective:'実質割引率',breakdown:'順次割引の内訳',formula:'計算式',before:'適用前',after:'適用後',copy:'結果をコピー',copied:'コピー済み',reset:'リセット',findOriginal:'逆算した元の価格',findRate:'計算した割引率',error:'入力値を確認してください。',rateRange:'割引率は0〜100%の範囲で入力してください。',reverse100:'100%割引から元の価格を逆算することはできません。',zeroOriginal:'元の価格が0の場合、割引率は計算できません。',finalOver:'割引後価格は元の価格を超えることができません。',stackHint:'追加割引は直前の割引後価格に順番に適用されます。',displayOnly:'通貨は表示用で、為替換算は行いません。'}
} as const;

function errorMessage(locale:Locale, code:string){const t=text[locale];if(code==='RATE_RANGE'||code==='RATE_PRECISION')return t.rateRange;if(code==='REVERSE_100')return t.reverse100;if(code==='ZERO_ORIGINAL')return t.zeroOriginal;if(code==='FINAL_OVER_ORIGINAL')return t.finalOver;return t.error;}
function parseRequired(raw:string){const v=parseTool062Number(raw);if(v===null)throw new RangeError('EMPTY');return v;}

export function Tool062DiscountPriceCalculator({locale}:{locale:Locale}){
 const t=text[locale];
 const [mode,setMode]=useState<Tool062Mode>('discount');
 const [currency,setCurrency]=useState<Tool062Currency>('KRW');
 const [original,setOriginal]=useState('100000');
 const [rate,setRate]=useState('20');
 const [finalInput,setFinalInput]=useState('70000');
 const [additional,setAdditional]=useState(false);
 const [second,setSecond]=useState('10');
 const [thirdEnabled,setThirdEnabled]=useState(false);
 const [third,setThird]=useState('5');
 const [copyState,setCopyState]=useState('');

 const result=useMemo(()=>{try{
   if(mode==='discount'){
     const rates=[parseRequired(rate)];if(additional)rates.push(parseRequired(second));if(additional&&thirdEnabled)rates.push(parseRequired(third));
     return {kind:'discount' as const,value:calculateTool062Discount(parseRequired(original),rates)};
   }
   if(mode==='reverse') return {kind:'reverse' as const,value:reverseTool062Original(parseRequired(finalInput),parseRequired(rate))};
   return {kind:'rate' as const,value:findTool062DiscountRate(parseRequired(original),parseRequired(finalInput))};
 }catch(e){return {kind:'error' as const,error:errorMessage(locale,e instanceof Error?e.message:'')};}},[mode,original,rate,finalInput,additional,second,thirdEnabled,third,locale]);

 const reset=()=>{setCurrency('KRW');setOriginal('100000');setRate('20');setFinalInput('70000');setAdditional(false);setSecond('10');setThirdEnabled(false);setThird('5');setCopyState('');};
 const summary=()=>{if(result.kind==='discount'){const r=result.value;return `${t.original}: ${formatTool062Money(r.original,currency,locale)}\n${t.savings}: ${formatTool062Money(r.savings,currency,locale)}\n${t.final}: ${formatTool062Money(r.final,currency,locale)}\n${t.effective}: ${formatTool062Number(r.effectiveRate,4)}%`;}
 if(result.kind==='reverse')return `${t.findOriginal}: ${formatTool062Money(result.value,currency,locale)}\n${t.finalInput}: ${formatTool062Money(Number(finalInput),currency,locale)}\n${t.rate}: ${rate}%`;
 if(result.kind==='rate')return `${t.original}: ${formatTool062Money(Number(original),currency,locale)}\n${t.finalInput}: ${formatTool062Money(Number(finalInput),currency,locale)}\n${t.findRate}: ${formatTool062Number(result.value,4)}%`;return '';};
 const copy=async()=>{try{await navigator.clipboard.writeText(summary());setCopyState(t.copied);setTimeout(()=>setCopyState(''),1200);}catch{setCopyState(t.error);}};
 const modeItems:Tool062Mode[]=['discount','reverse','rate'];
 return <div className={styles.root} data-testid="tool-062-root">
  <div className={styles.tabs} role="tablist" aria-label={t.workspace}>{modeItems.map((m,i)=><button key={m} type="button" role="tab" aria-selected={mode===m} className={`${styles.tab} ${mode===m?styles.tabActive:''}`} onClick={()=>{setMode(m);setCopyState('')}} data-testid={`tool-062-mode-${m}`}>{t.modes[i]}</button>)}</div>
  <section className={styles.workspace} aria-label={t.workspace}>
   <div className={styles.workspaceHead}><div><p>{t.workspace}</p><h2>{t.choose}</h2></div><button type="button" className={styles.reset} onClick={reset}>{t.reset}</button></div>
   <p className={styles.localNote}>{t.local}</p>
   <div className={styles.layout}>
    <section className={styles.inputCard} aria-label={t.choose}>
      <div className={styles.fieldGrid}>
       {(mode==='discount'||mode==='rate')&&<label className={styles.field}>{t.original}<input inputMode="decimal" value={original} maxLength={TOOL062_LIMITS.maxInputLength} onChange={e=>setOriginal(e.target.value)} data-testid="tool-062-original"/></label>}
       {(mode==='discount'||mode==='reverse')&&<label className={styles.field}>{t.rate}<div className={styles.suffixInput}><input inputMode="decimal" value={rate} maxLength={TOOL062_LIMITS.maxInputLength} onChange={e=>setRate(e.target.value)} data-testid="tool-062-rate"/><span>%</span></div></label>}
       {(mode==='reverse'||mode==='rate')&&<label className={styles.field}>{t.finalInput}<input inputMode="decimal" value={finalInput} maxLength={TOOL062_LIMITS.maxInputLength} onChange={e=>setFinalInput(e.target.value)} data-testid="tool-062-final-input"/></label>}
       <label className={styles.field}>{t.currency}<select value={currency} onChange={e=>setCurrency(e.target.value as Tool062Currency)} data-testid="tool-062-currency">{TOOL062_CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></label>
      </div>
      {mode==='discount'&&<div className={styles.additionalBox}>
       <label className={styles.toggleRow}><span><strong>{t.additional}</strong><small>{t.stackHint}</small></span><input type="checkbox" checked={additional} onChange={e=>{setAdditional(e.target.checked);if(!e.target.checked)setThirdEnabled(false);}} data-testid="tool-062-additional-toggle"/></label>
       {additional&&<div className={styles.stackFields}>
        <label className={styles.field}>{t.second}<div className={styles.suffixInput}><input inputMode="decimal" value={second} onChange={e=>setSecond(e.target.value)} data-testid="tool-062-second-rate"/><span>%</span></div></label>
        {thirdEnabled&&<label className={styles.field}>{t.third}<div className={styles.suffixInput}><input inputMode="decimal" value={third} onChange={e=>setThird(e.target.value)} data-testid="tool-062-third-rate"/><span>%</span></div></label>}
        <button type="button" className={styles.smallButton} onClick={()=>setThirdEnabled(v=>!v)}>{thirdEnabled?t.removeThird:t.addThird}</button>
       </div>}
      </div>}
      <p className={styles.displayOnly}>{t.displayOnly}</p>
    </section>
    <section className={styles.resultCard} aria-live="polite" data-testid="tool-062-result">
     {result.kind==='error'?<p className={styles.error} role="alert">{result.error}</p>:result.kind==='discount'?<>
       <div className={styles.finalBlock}><p>{t.final}</p><strong data-testid="tool-062-final">{formatTool062Money(result.value.final,currency,locale)}</strong></div>
       <div className={styles.metricGrid}><div><span>{t.discountAmount}</span><strong>{formatTool062Money(result.value.steps[0].discountAmount,currency,locale)}</strong></div><div><span>{t.savings}</span><strong data-testid="tool-062-savings">{formatTool062Money(result.value.savings,currency,locale)}</strong></div><div><span>{t.effective}</span><strong data-testid="tool-062-effective">{formatTool062Number(result.value.effectiveRate,4)}%</strong></div></div>
       <div className={styles.breakdown}><h3>{t.breakdown}</h3>{result.value.steps.map(step=><div className={styles.step} key={step.index} data-testid={`tool-062-step-${step.index}`}><span>{String(step.index).padStart(2,'0')}</span><div><strong>{formatTool062Number(step.rate,8)}%</strong><p>{t.before} {formatTool062Money(step.before,currency,locale)} → {t.after} {formatTool062Money(step.after,currency,locale)}</p></div><b>−{formatTool062Money(step.discountAmount,currency,locale)}</b></div>)}</div>
       <div className={styles.formula}><span>{t.formula}</span><code>{result.value.steps.map(s=>`× (1 − ${formatTool062Number(s.rate,8)}/100)`).join(' ')}</code></div>
     </>:result.kind==='reverse'?<><div className={styles.finalBlock}><p>{t.findOriginal}</p><strong data-testid="tool-062-reverse-result">{formatTool062Money(result.value,currency,locale)}</strong></div><div className={styles.formula}><span>{t.formula}</span><code>final ÷ (1 − discount/100)</code></div></>:<><div className={styles.finalBlock}><p>{t.findRate}</p><strong data-testid="tool-062-rate-result">{formatTool062Number(result.value,4)}%</strong></div><div className={styles.formula}><span>{t.formula}</span><code>(original − final) ÷ original × 100</code></div></>}
     {result.kind!=='error'&&<div className={styles.actions}><button type="button" className={styles.primaryButton} onClick={copy}>{t.copy}</button>{copyState&&<span className={styles.copyState}>{copyState}</span>}</div>}
    </section>
   </div>
  </section>
 </div>;
}
