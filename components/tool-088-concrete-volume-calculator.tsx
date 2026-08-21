'use client';
import {useMemo,useState} from 'react';
import type {Locale} from '@/lib/site';
import {TOOL088_LIMITS,calculateTool088ConcreteVolume,formatTool088,parseTool088Number,type Tool088LengthUnit} from '@/lib/tool-088-concrete-volume';
import styles from './tool-088-concrete-volume-calculator.module.css';

const copy={
 ko:{local:'입력한 치수와 기준량은 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.',dimensions:'치수 입력',length:'길이',width:'폭',thickness:'두께',unit:'단위',extra:'여유분',delivery:'레미콘 1회 기준량',deliveryOptional:'선택 입력',base:'기본 부피',adjusted:'여유 포함 부피',reference:'레미콘 참고 횟수',times:'회',formula:'계산식',reset:'초기화',copy:'결과 복사',copied:'복사됨',precision:'표시 소수점',invalid:'올바른 숫자를 입력하세요.',dimensionZero:'길이·폭·두께는 0보다 커야 합니다.',extraRange:'여유분은 0~100% 사이여야 합니다.',deliveryZero:'1회 기준량은 0보다 커야 합니다.',limit:'입력값이 서비스 유효상한을 초과했습니다.',empty:'길이·폭·두께를 입력하면 결과가 표시됩니다.'},
 en:{local:'Dimensions and reference quantities are calculated only in this browser and are not sent to or stored on a server.',dimensions:'Dimensions',length:'Length',width:'Width',thickness:'Thickness',unit:'Unit',extra:'Extra Allowance',delivery:'Ready-Mix Volume per Delivery',deliveryOptional:'Optional',base:'Base Volume',adjusted:'Adjusted Volume',reference:'Reference Deliveries',times:'deliveries',formula:'Formula',reset:'Reset',copy:'Copy result',copied:'Copied',precision:'Display decimals',invalid:'Enter valid numbers.',dimensionZero:'Length, width, and thickness must be greater than zero.',extraRange:'Extra allowance must be between 0% and 100%.',deliveryZero:'Volume per delivery must be greater than zero.',limit:'An input exceeds the service limit.',empty:'Enter length, width, and thickness to see results.'},
 ja:{local:'入力した寸法と基準量はサーバーへ送信・保存せず、このブラウザ内だけで計算します。',dimensions:'寸法入力',length:'長さ',width:'幅',thickness:'厚さ',unit:'単位',extra:'余裕率',delivery:'生コン1回基準量',deliveryOptional:'任意',base:'基本体積',adjusted:'余裕込み体積',reference:'生コン参考回数',times:'回',formula:'計算式',reset:'リセット',copy:'結果をコピー',copied:'コピー済み',precision:'表示小数点',invalid:'有効な数値を入力してください。',dimensionZero:'長さ・幅・厚さは0より大きくしてください。',extraRange:'余裕率は0〜100%の範囲で入力してください。',deliveryZero:'1回基準量は0より大きくしてください。',limit:'入力値がサービス上限を超えています。',empty:'長さ・幅・厚さを入力すると結果が表示されます。'}
} as const;
function localeCode(locale:Locale){return locale==='ko'?'ko-KR':locale==='ja'?'ja-JP':'en-US'}
type DimensionState={value:string;unit:Tool088LengthUnit};

export function Tool088ConcreteVolumeCalculator({locale}:{locale:Locale}){
 const t=copy[locale];
 const [length,setLength]=useState<DimensionState>({value:'5',unit:'m'});
 const [width,setWidth]=useState<DimensionState>({value:'4',unit:'m'});
 const [thickness,setThickness]=useState<DimensionState>({value:'15',unit:'cm'});
 const [extraRate,setExtraRate]=useState('5');
 const [delivery,setDelivery]=useState('6');
 const [precision,setPrecision]=useState(2);
 const [status,setStatus]=useState('');
 const calculation=useMemo(()=>{
  const lv=parseTool088Number(length.value),wv=parseTool088Number(width.value),tv=parseTool088Number(thickness.value),ev=parseTool088Number(extraRate),dv=parseTool088Number(delivery);
  if(lv===null||wv===null||tv===null||ev===null||(delivery.trim()&&dv===null))return {value:null,error:(length.value||width.value||thickness.value||extraRate||delivery)?t.invalid:''};
  try{return {value:calculateTool088ConcreteVolume({length:lv,lengthUnit:length.unit,width:wv,widthUnit:width.unit,thickness:tv,thicknessUnit:thickness.unit,extraRate:ev,deliveryVolume:delivery.trim()?dv:null}),error:''}}
  catch(e){const c=e instanceof Error?e.message:'';return {value:null,error:c==='DIMENSION_ZERO'?t.dimensionZero:c==='EXTRA_RANGE'?t.extraRange:c==='DELIVERY_ZERO'?t.deliveryZero:c.includes('LIMIT')?t.limit:t.invalid}}
 },[length,width,thickness,extraRate,delivery,t]);
 const f=(v:number)=>formatTool088(v,precision,localeCode(locale));
 const result=calculation.value;
 function reset(){setLength({value:'5',unit:'m'});setWidth({value:'4',unit:'m'});setThickness({value:'15',unit:'cm'});setExtraRate('5');setDelivery('6');setPrecision(2);setStatus('')}
 async function copyResult(){if(!result)return;const parts=[`${t.base}: ${f(result.baseVolumeM3)} m³`,`${t.extra}: ${f(result.extraRate)}%`,`${t.adjusted}: ${f(result.adjustedVolumeM3)} m³`];if(result.referenceDeliveries!=null)parts.push(`${t.reference}: ${result.referenceDeliveries} ${t.times}`);try{await navigator.clipboard.writeText(parts.join('\n'));setStatus(t.copied)}catch{setStatus('')}}
 const dimensionField=(label:string,state:DimensionState,setState:(v:DimensionState)=>void,id:string)=><label className={styles.field}>{label}<span className={styles.withUnit}><input inputMode="decimal" maxLength={TOOL088_LIMITS.maxInputChars} value={state.value} onChange={e=>setState({...state,value:e.target.value})} data-testid={`tool088-${id}`}/><select value={state.unit} onChange={e=>setState({...state,unit:e.target.value as Tool088LengthUnit})} aria-label={`${label} ${t.unit}`} data-testid={`tool088-${id}-unit`}><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option></select></span></label>;
 return <div className={styles.root} data-testid="tool088-root">
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <section className={styles.workspace} data-testid="tool088-workspace">
   <div className={styles.cardHead}><strong>CONCRETE VOLUME</strong><span>{t.dimensions}</span></div>
   <div className={styles.dimensionGrid}>{dimensionField(t.length,length,setLength,'length')}{dimensionField(t.width,width,setWidth,'width')}{dimensionField(t.thickness,thickness,setThickness,'thickness')}</div>
   <div className={styles.optionGrid}><label className={styles.field}>{t.extra}<span className={styles.suffixInput}><input inputMode="decimal" maxLength={TOOL088_LIMITS.maxInputChars} value={extraRate} onChange={e=>setExtraRate(e.target.value)} data-testid="tool088-extra"/><b>%</b></span></label><label className={styles.field}>{t.delivery}<span className={styles.suffixInput}><input inputMode="decimal" maxLength={TOOL088_LIMITS.maxInputChars} value={delivery} onChange={e=>setDelivery(e.target.value)} placeholder={t.deliveryOptional} data-testid="tool088-delivery"/><b>m³</b></span></label></div>
   <div className={styles.actionRow}><button type="button" className={styles.button} onClick={reset} data-testid="tool088-reset">{t.reset}</button><button type="button" className={styles.primaryButton} disabled={!result} onClick={copyResult} data-testid="tool088-copy">{t.copy}</button></div>
   {calculation.error&&<p className={styles.error} role="alert" data-testid="tool088-error">{calculation.error}</p>}
  </section>
  <details className={styles.advanced}><summary>{t.precision}</summary><div className={styles.precisionRow}><input type="range" min="0" max={TOOL088_LIMITS.maxDisplayPrecision} value={precision} onChange={e=>setPrecision(Number(e.target.value))} data-testid="tool088-precision"/><span className={styles.precisionValue}>{precision}</span></div></details>
  <section className={styles.resultCard} aria-live="polite" data-testid="tool088-result"><div className={styles.resultHead}><p className={styles.resultLabel}>RESULT · m³</p></div>{!result?<p className={styles.hint}>{calculation.error||t.empty}</p>:<><div className={styles.resultGrid}><div className={styles.resultItem}><span>{t.base}</span><strong data-testid="tool088-base-volume">{f(result.baseVolumeM3)}</strong><em>m³</em></div><div className={styles.resultItem}><span>{t.adjusted}</span><strong data-testid="tool088-adjusted-volume">{f(result.adjustedVolumeM3)}</strong><em>m³ · +{f(result.extraRate)}%</em></div>{result.referenceDeliveries!=null&&<div className={styles.resultItem}><span>{t.reference}</span><strong data-testid="tool088-reference-deliveries">{result.referenceDeliveries}</strong><em>{t.times} · {f(result.deliveryVolumeM3!)} m³ / {t.times}</em></div>}</div><div className={styles.formulaBox}><strong>{t.formula}</strong><code data-testid="tool088-formula">{t.base} = {t.length} × {t.width} × {t.thickness} · {t.adjusted} = {t.base} × (1 + {t.extra}/100){result.deliveryVolumeM3!=null?` · ${t.reference} = ceil(${t.adjusted} ÷ ${t.delivery})`:''}</code></div></>}{status&&<p className={styles.status} aria-live="polite">{status}</p>}</section>
 </div>
}
