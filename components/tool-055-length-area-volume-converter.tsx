'use client';
import {useMemo,useState} from 'react';
import type {Locale} from '@/lib/site';
import {TOOL055_DEFAULT_PRECISION,TOOL055_DEFAULTS,TOOL055_LIMITS,TOOL055_UNITS,convertTool055,formatTool055,getTool055Unit,parseTool055Number,summarizeTool055,type Tool055Dimension} from '@/lib/tool-055-units';
import styles from './tool-055-length-area-volume-converter.module.css';
const copy={
 ko:{length:'길이',area:'면적',volume:'부피',local:'입력값과 변환 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.',value:'입력값',from:'변환 전',to:'변환 후',swap:'단위 교환',reset:'초기화',copy:'결과 복사',copied:'복사됨',common:'자주 쓰는 단위',precision:'정밀도',advanced:'표시 설정',empty:'변환할 숫자를 입력하세요.',invalid:'올바른 숫자를 입력하세요.',negative:'일반 측정값은 0 이상으로 입력하세요.',limit:`입력값은 ${TOOL055_LIMITS.maxAbsInput.toExponential(0)} 이하로 입력하세요.`,pyeong:'면적에서는 평과 ㎡를 빠르게 비교할 수 있습니다.',result:'변환 결과',quick:'빠른 단위'},
 en:{length:'Length',area:'Area',volume:'Volume',local:'Values and conversion results are calculated only in this browser and are not sent to or stored on a server.',value:'Value',from:'From',to:'To',swap:'Swap units',reset:'Reset',copy:'Copy result',copied:'Copied',common:'Common Units',precision:'Precision',advanced:'Display settings',empty:'Enter a number to convert.',invalid:'Enter a valid number.',negative:'Use a value of zero or greater for general measurements.',limit:`Enter a value no greater than ${TOOL055_LIMITS.maxAbsInput.toExponential(0)}.`,pyeong:'Area mode keeps Pyeong and square meters easy to compare.',result:'Conversion result',quick:'Quick units'},
 ja:{length:'長さ',area:'面積',volume:'体積',local:'入力値と変換結果はサーバーに送信・保存せず、このブラウザ内だけで計算します。',value:'値',from:'変換前',to:'変換後',swap:'単位を入れ替え',reset:'リセット',copy:'結果をコピー',copied:'コピー済み',common:'よく使う単位',precision:'精度',advanced:'表示設定',empty:'変換する数値を入力してください。',invalid:'有効な数値を入力してください。',negative:'一般的な測定値は0以上で入力してください。',limit:`入力値は${TOOL055_LIMITS.maxAbsInput.toExponential(0)}以下にしてください。`,pyeong:'面積では坪と平方メートルをすぐ比較できます。',result:'変換結果',quick:'クイック単位'}
} as const;
function errorMessage(code:string,t:(typeof copy)[Locale]){return code==='NEGATIVE_VALUE'?t.negative:code==='VALUE_LIMIT'?t.limit:t.invalid}
export function Tool055LengthAreaVolumeConverter({locale}:{locale:Locale}){
 const t=copy[locale];const [dimension,setDimension]=useState<Tool055Dimension>('length');const [raw,setRaw]=useState('1');const [from,setFrom]=useState(TOOL055_DEFAULTS.length.from);const [to,setTo]=useState(TOOL055_DEFAULTS.length.to);const [precision,setPrecision]=useState(TOOL055_DEFAULT_PRECISION);const [status,setStatus]=useState('');
 const parsed=parseTool055Number(raw);let error='';let result:number|null=null;if(raw.trim()==='')error=t.empty;else if(parsed===null)error=t.invalid;else{try{result=convertTool055(parsed,dimension,from,to)}catch(e){error=errorMessage(e instanceof Error?e.message:'',t)}}
 const summary=useMemo(()=>{if(parsed===null||parsed<0||Math.abs(parsed)>TOOL055_LIMITS.maxAbsInput)return[];try{return summarizeTool055(parsed,dimension,from)}catch{return[]}},[parsed,dimension,from]);
 function switchDimension(next:Tool055Dimension){setDimension(next);setFrom(TOOL055_DEFAULTS[next].from);setTo(TOOL055_DEFAULTS[next].to);setStatus('')}
 function swap(){setFrom(to);setTo(from);setStatus('')}
 function reset(){setDimension('length');setRaw('1');setFrom(TOOL055_DEFAULTS.length.from);setTo(TOOL055_DEFAULTS.length.to);setPrecision(TOOL055_DEFAULT_PRECISION);setStatus('')}
 async function copyResult(){if(result===null)return;const fromUnit=getTool055Unit(dimension,from),toUnit=getTool055Unit(dimension,to);const text=`${raw} ${fromUnit.symbol} = ${formatTool055(result,precision)} ${toUnit.symbol}`;try{await navigator.clipboard.writeText(text);setStatus(t.copied)}catch{setStatus('')}}
 const units=TOOL055_UNITS[dimension],toUnit=getTool055Unit(dimension,to),fromUnit=getTool055Unit(dimension,from);
 return <div className={styles.root} data-testid="tool055-root" data-dimension={dimension}>
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <div className={styles.tabs} role="tablist" aria-label="dimension">{(['length','area','volume'] as Tool055Dimension[]).map(d=><button key={d} type="button" role="tab" aria-selected={dimension===d} className={`${styles.tab} ${dimension===d?styles.tabActive:''}`} onClick={()=>switchDimension(d)} data-testid={`tool055-tab-${d}`}>{t[d]}</button>)}</div>
  <section className={styles.workspace} data-testid="tool055-workspace">
   <div className={styles.card}>
    <div className={styles.inputGrid}>
     <label className={`${styles.field} ${styles.valueField}`}>{t.value}<input inputMode="decimal" value={raw} onChange={e=>{setRaw(e.target.value);setStatus('')}} aria-invalid={Boolean(error)} data-testid="tool055-value"/></label>
     <label className={styles.field}>{t.from}<select value={from} onChange={e=>{setFrom(e.target.value);setStatus('')}} data-testid="tool055-from">{units.map(u=><option key={u.id} value={u.id}>{u.names[locale]} ({u.symbol})</option>)}</select></label>
     <button type="button" className={styles.swap} onClick={swap} aria-label={t.swap} title={t.swap} data-testid="tool055-swap">⇄</button>
     <label className={styles.field}>{t.to}<select value={to} onChange={e=>{setTo(e.target.value);setStatus('')}} data-testid="tool055-to">{units.map(u=><option key={u.id} value={u.id}>{u.names[locale]} ({u.symbol})</option>)}</select></label>
    </div>
    <div><p className={styles.summaryTitle}>{t.quick}</p><div className={styles.quickRow}>{TOOL055_DEFAULTS[dimension].summary.slice(0,6).map(id=>{const u=getTool055Unit(dimension,id);return <button type="button" key={id} className={`${styles.preset} ${to===id?styles.presetActive:''}`} onClick={()=>setTo(id)}>{u.symbol}</button>})}</div></div>
    {dimension==='area'&&<p className={styles.pyeongHint}>{t.pyeong}</p>}
    <div className={styles.actionRow}><button type="button" className={styles.button} onClick={reset} data-testid="tool055-reset">{t.reset}</button><button type="button" className={styles.primaryButton} onClick={copyResult} disabled={result===null} data-testid="tool055-copy">{t.copy}</button></div>
    {error&&<p className={styles.error} role="alert" data-testid="tool055-error">{error}</p>}
   </div>
   <details className={styles.advanced}><summary>{t.advanced} · {t.precision}</summary><div className={styles.precisionRow}><input aria-label={t.precision} type="range" min="0" max={TOOL055_LIMITS.maxPrecision} value={precision} onChange={e=>setPrecision(Number(e.target.value))} data-testid="tool055-precision"/><span className={styles.precisionValue}>{precision}</span></div></details>
   <section className={styles.resultCard} aria-live="polite" data-testid="tool055-result"><div className={styles.resultHead}><p className={styles.resultLabel}>RESULT · {t.result}</p></div>{result===null?<p className={styles.hint}>{error||t.empty}</p>:<><p className={styles.resultValue} data-testid="tool055-main-result">{formatTool055(result,precision)}<span>{toUnit.symbol}</span></p><p className={styles.equation}>{formatTool055(parsed!,precision)} {fromUnit.symbol} → {toUnit.symbol}</p><p className={styles.summaryTitle}>{t.common}</p><div className={styles.summaryGrid} data-testid="tool055-summary">{summary.map(({unit,value})=><div className={styles.summaryItem} key={unit.id} data-unit={unit.id}><strong>{formatTool055(value,precision)}</strong><span>{unit.names[locale]} · {unit.symbol}</span></div>)}</div></>}{status&&<p className={styles.status} role="status">{status}</p>}</section>
  </section>
 </div>
}
