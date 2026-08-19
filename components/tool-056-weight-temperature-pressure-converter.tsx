'use client';
import {useMemo,useState} from 'react';
import type {Locale} from '@/lib/site';
import {TOOL056_DEFAULT_PRECISION,TOOL056_DEFAULTS,TOOL056_LIMITS,convertTool056,formatTool056,getTool056Unit,getTool056Units,parseTool056Number,summarizeTool056,type Tool056Category} from '@/lib/tool-056-units';
import styles from './tool-056-weight-temperature-pressure-converter.module.css';
const copy={
 ko:{mass:'무게',temperature:'온도',pressure:'압력',local:'입력값과 변환 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.',value:'입력값',from:'변환 전',to:'변환 후',swap:'단위 교환',reset:'초기화',copy:'결과 복사',copied:'복사됨',common:'대표 단위',precision:'소수점',advanced:'표시 설정',empty:'변환할 숫자를 입력하세요.',invalid:'올바른 숫자를 입력하세요.',negative:'무게와 압력은 0 이상으로 입력하세요.',absolute:'절대영도(0 K)보다 낮은 온도는 입력할 수 없습니다.',limit:`입력값의 절대값은 ${TOOL056_LIMITS.maxAbsInput.toExponential(0)} 이하로 입력하세요.`,temperatureHint:'온도는 단순 배율이 아니라 °C·°F·K 사이의 offset 공식을 사용합니다.',result:'변환 결과',quick:'빠른 단위',source:'NIST 기준 계수·공식 · 반올림은 표시 단계에만 적용'},
 en:{mass:'Mass',temperature:'Temperature',pressure:'Pressure',local:'Values and conversion results are calculated only in this browser and are not sent to or stored on a server.',value:'Value',from:'From',to:'To',swap:'Swap units',reset:'Reset',copy:'Copy result',copied:'Copied',common:'Common units',precision:'Decimal places',advanced:'Display settings',empty:'Enter a number to convert.',invalid:'Enter a valid number.',negative:'Mass and pressure must be zero or greater.',absolute:'Temperature cannot be below absolute zero (0 K).',limit:`Use an absolute input value no greater than ${TOOL056_LIMITS.maxAbsInput.toExponential(0)}.`,temperatureHint:'Temperature uses offset formulas between °C, °F, and K instead of a simple factor.',result:'Conversion result',quick:'Quick units',source:'NIST conversion references · rounding is display-only'},
 ja:{mass:'重量',temperature:'温度',pressure:'圧力',local:'入力値と変換結果はサーバーに送信・保存せず、このブラウザ内だけで計算します。',value:'値',from:'変換前',to:'変換後',swap:'単位を入れ替え',reset:'リセット',copy:'結果をコピー',copied:'コピー済み',common:'代表単位',precision:'小数点',advanced:'表示設定',empty:'変換する数値を入力してください。',invalid:'有効な数値を入力してください。',negative:'重量と圧力は0以上で入力してください。',absolute:'絶対零度（0 K）未満の温度は入力できません。',limit:`入力値の絶対値は${TOOL056_LIMITS.maxAbsInput.toExponential(0)}以下にしてください。`,temperatureHint:'温度は単純な倍率ではなく、°C・°F・K間のオフセット式で換算します。',result:'変換結果',quick:'クイック単位',source:'NIST換算基準 · 丸めは表示時のみ'}
} as const;
function errorMessage(code:string,t:(typeof copy)[Locale]){return code==='NEGATIVE_VALUE'?t.negative:code==='BELOW_ABSOLUTE_ZERO'?t.absolute:code==='VALUE_LIMIT'?t.limit:t.invalid}
export function Tool056WeightTemperaturePressureConverter({locale}:{locale:Locale}){
 const t=copy[locale];const [category,setCategory]=useState<Tool056Category>('mass');const [raw,setRaw]=useState('1');const [from,setFrom]=useState(TOOL056_DEFAULTS.mass.from);const [to,setTo]=useState(TOOL056_DEFAULTS.mass.to);const [precision,setPrecision]=useState(TOOL056_DEFAULT_PRECISION);const [status,setStatus]=useState('');
 const parsed=parseTool056Number(raw);let error='';let result:number|null=null;if(raw.trim()==='')error=t.empty;else if(parsed===null)error=t.invalid;else{try{result=convertTool056(parsed,category,from,to)}catch(e){error=errorMessage(e instanceof Error?e.message:'',t)}}
 const summary=useMemo(()=>{if(parsed===null||Math.abs(parsed)>TOOL056_LIMITS.maxAbsInput)return[];try{return summarizeTool056(parsed,category,from)}catch{return[]}},[parsed,category,from]);
 function switchCategory(next:Tool056Category){setCategory(next);setFrom(TOOL056_DEFAULTS[next].from);setTo(TOOL056_DEFAULTS[next].to);setStatus('')}
 function swap(){setFrom(to);setTo(from);setStatus('')}
 function reset(){setCategory('mass');setRaw('1');setFrom(TOOL056_DEFAULTS.mass.from);setTo(TOOL056_DEFAULTS.mass.to);setPrecision(TOOL056_DEFAULT_PRECISION);setStatus('')}
 async function copyResult(){if(result===null)return;const fromUnit=getTool056Unit(category,from),toUnit=getTool056Unit(category,to);const text=`${raw} ${fromUnit.symbol} = ${formatTool056(result,precision)} ${toUnit.symbol}`;try{await navigator.clipboard.writeText(text);setStatus(t.copied)}catch{setStatus('')}}
 const units=getTool056Units(category),toUnit=getTool056Unit(category,to),fromUnit=getTool056Unit(category,from);
 return <div className={styles.root} data-testid="tool056-root" data-category={category}>
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <div className={styles.tabs} role="tablist" aria-label="category">{(['mass','temperature','pressure'] as Tool056Category[]).map(c=><button key={c} type="button" role="tab" aria-selected={category===c} className={`${styles.tab} ${category===c?styles.tabActive:''}`} onClick={()=>switchCategory(c)} data-testid={`tool056-tab-${c}`}>{t[c]}</button>)}</div>
  <section className={styles.workspace} data-testid="tool056-workspace">
   <div className={styles.card}>
    <div className={styles.inputGrid}>
     <label className={`${styles.field} ${styles.valueField}`}>{t.value}<input inputMode="decimal" value={raw} onChange={e=>{setRaw(e.target.value);setStatus('')}} aria-invalid={Boolean(error)} data-testid="tool056-value"/></label>
     <label className={styles.field}>{t.from}<select value={from} onChange={e=>{setFrom(e.target.value);setStatus('')}} data-testid="tool056-from">{units.map(u=><option key={u.id} value={u.id}>{u.names[locale]} ({u.symbol})</option>)}</select></label>
     <button type="button" className={styles.swap} onClick={swap} aria-label={t.swap} title={t.swap} data-testid="tool056-swap">⇄</button>
     <label className={styles.field}>{t.to}<select value={to} onChange={e=>{setTo(e.target.value);setStatus('')}} data-testid="tool056-to">{units.map(u=><option key={u.id} value={u.id}>{u.names[locale]} ({u.symbol})</option>)}</select></label>
    </div>
    <div><p className={styles.summaryTitle}>{t.quick}</p><div className={styles.quickRow}>{TOOL056_DEFAULTS[category].summary.map(id=>{const u=getTool056Unit(category,id);return <button type="button" key={id} className={`${styles.preset} ${to===id?styles.presetActive:''}`} onClick={()=>setTo(id)} data-testid={`tool056-preset-${id}`}>{u.symbol}</button>})}</div></div>
    {category==='temperature'&&<p className={styles.temperatureHint}>{t.temperatureHint}</p>}
    <div className={styles.actionRow}><button type="button" className={styles.button} onClick={reset} data-testid="tool056-reset">{t.reset}</button><button type="button" className={styles.primaryButton} onClick={copyResult} disabled={result===null} data-testid="tool056-copy">{t.copy}</button></div>
    {error&&<p className={styles.error} role="alert" data-testid="tool056-error">{error}</p>}
   </div>
   <details className={styles.advanced}><summary>{t.advanced} · {t.precision}</summary><div className={styles.precisionRow}><input aria-label={t.precision} type="range" min="0" max={TOOL056_LIMITS.maxPrecision} value={precision} onChange={e=>setPrecision(Number(e.target.value))} data-testid="tool056-precision"/><span className={styles.precisionValue} data-testid="tool056-precision-value">{precision}</span></div></details>
   <section className={styles.resultCard} aria-live="polite" data-testid="tool056-result"><div className={styles.resultHead}><p className={styles.resultLabel}>RESULT · {t.result}</p></div>{result===null?<p className={styles.hint}>{error||t.empty}</p>:<><p className={styles.resultValue} data-testid="tool056-main-result">{formatTool056(result,precision)}<span>{toUnit.symbol}</span></p><p className={styles.equation}>{formatTool056(parsed!,precision)} {fromUnit.symbol} → {toUnit.symbol}</p><p className={styles.summaryTitle}>{t.common}</p><div className={styles.summaryGrid} data-testid="tool056-summary">{summary.map(({unit,value})=><div className={styles.summaryItem} key={unit.id} data-unit={unit.id}><strong>{formatTool056(value,precision)}</strong><span>{unit.names[locale]} · {unit.symbol}</span></div>)}</div><p className={styles.source}>{t.source}</p></>}{status&&<p className={styles.status} role="status">{status}</p>}</section>
  </section>
 </div>
}
