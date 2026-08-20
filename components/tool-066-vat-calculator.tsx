'use client';
import {useMemo,useState} from 'react';
import type {Locale} from '@/lib/site';
import {TOOL066_LIMITS,calculateEffectiveRate,calculateExclusive,calculateInclusive,formatTool066,parseTool066Number,type Tool066Breakdown,type Tool066Mode} from '@/lib/tool-066-vat';
import styles from './tool-066-vat-calculator.module.css';

const copy={
 ko:{exclusive:'공급가액 기준',inclusive:'합계금액 기준',reverse:'세율 확인',local:'입력한 금액과 계산 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.',amount:'금액',supply:'공급가액',vat:'부가세액',total:'합계금액',rate:'세율',applied:'적용 세율',separate:'부가세 별도',included:'부가세 포함',reset:'초기화',copy:'결과 복사',copied:'복사됨',formula:'계산식',display:'표시 설정',precision:'소수점',reference:'참고 계산',defaultRate:'기본 10%',modeA:'공급가액에서 부가세와 합계금액을 계산합니다.',modeB:'부가세가 포함된 합계금액에서 공급가액과 부가세를 역산합니다.',modeC:'공급가액과 부가세액으로 실제 적용된 세율을 확인합니다.',empty:'계산할 금액을 입력하세요.',invalid:'올바른 숫자를 입력하세요.',negative:'금액과 세율은 0 이상이어야 합니다.',limit:'금액은 1e15 이하로 입력하세요.',rateLimit:'세율은 0~100% 범위에서 입력하세요.',zeroSupply:'공급가액이 0원일 때 부가세가 0원보다 크면 세율을 계산할 수 없습니다.',custom:'기본 10%가 아닌 세율은 참고 계산입니다.',legal:'이 결과는 거래금액의 VAT 구성요소 계산이며 최종 납부세액 신고 계산이 아닙니다.',result:'계산 결과'},
 en:{exclusive:'Net amount',inclusive:'VAT-inclusive total',reverse:'Reverse tax rate',local:'Amounts and results are calculated only in this browser and are not sent to or stored on a server.',amount:'Amount',supply:'Net Amount',vat:'VAT',total:'Total Amount',rate:'Tax Rate',applied:'Applied Rate',separate:'VAT Excluded',included:'VAT Included',reset:'Reset',copy:'Copy result',copied:'Copied',formula:'Formula',display:'Display settings',precision:'Decimals',reference:'Reference Calculation',defaultRate:'Default 10%',modeA:'Calculate VAT and total from a net amount.',modeB:'Reverse a VAT-inclusive total into net amount and VAT.',modeC:'Calculate the effective rate from net amount and VAT.',empty:'Enter an amount to calculate.',invalid:'Enter a valid number.',negative:'Amounts and tax rates must be zero or greater.',limit:'Enter an amount no greater than 1e15.',rateLimit:'Use a tax rate from 0% to 100%.',zeroSupply:'A rate cannot be calculated when net amount is zero and VAT is greater than zero.',custom:'Rates other than the default 10% are reference calculations.',legal:'This result calculates the VAT component of a transaction. It is not a final VAT filing or tax-payable calculation.',result:'Calculation result'},
 ja:{exclusive:'税抜価格基準',inclusive:'税込価格基準',reverse:'税率を逆算',local:'入力金額と計算結果はサーバーへ送信・保存せず、このブラウザ内だけで計算します。',amount:'金額',supply:'税抜価格',vat:'消費税',total:'税込価格',rate:'税率',applied:'適用税率',separate:'税抜',included:'税込',reset:'リセット',copy:'結果をコピー',copied:'コピー済み',formula:'計算式',display:'表示設定',precision:'小数点',reference:'参考計算',defaultRate:'基本10%',modeA:'税抜価格から消費税と税込価格を計算します。',modeB:'税込価格から税抜価格と消費税を逆算します。',modeC:'税抜価格と消費税から実際の税率を逆算します。',empty:'計算する金額を入力してください。',invalid:'有効な数値を入力してください。',negative:'金額と税率は0以上にしてください。',limit:'金額は1e15以下で入力してください。',rateLimit:'税率は0〜100%で入力してください。',zeroSupply:'税抜価格が0で消費税が0より大きい場合、税率を計算できません。',custom:'基本10%以外の税率は参考計算です。',legal:'この結果は取引金額に含まれる消費税部分の参考計算で、最終的な申告・納付税額の計算ではありません。',result:'計算結果'}
} as const;

function localeCode(locale:Locale){return locale==='ko'?'ko-KR':locale==='ja'?'ja-JP':'en-US'}

export function Tool066VatCalculator({locale}:{locale:Locale}){
 const t=copy[locale];
 const [mode,setMode]=useState<Tool066Mode>('exclusive');
 const [amount,setAmount]=useState('100000');
 const [vatInput,setVatInput]=useState('10000');
 const [rateRaw,setRateRaw]=useState('10');
 const [precision,setPrecision]=useState(0);
 const [includedState,setIncludedState]=useState<'excluded'|'included'>('excluded');
 const [status,setStatus]=useState('');
 const calculation=useMemo(()=>{
   const parsed=parseTool066Number(amount);
   const rate=parseTool066Number(rateRaw);
   const vatParsed=parseTool066Number(vatInput);
   if(parsed===null) return {error:amount.trim()===''?t.empty:t.invalid,result:null as Tool066Breakdown|null};
   try{
    if(mode==='reverse-rate'){
      if(vatParsed===null) return {error:vatInput.trim()===''?t.empty:t.invalid,result:null};
      return {error:'',result:calculateEffectiveRate(parsed,vatParsed)};
    }
    if(rate===null) return {error:rateRaw.trim()===''?t.empty:t.invalid,result:null};
    return {error:'',result:mode==='exclusive'?calculateExclusive(parsed,rate):calculateInclusive(parsed,rate)};
   }catch(e){const code=e instanceof Error?e.message:'';const error=code.includes('NEGATIVE')?t.negative:code.includes('AMOUNT_LIMIT')?t.limit:code==='RATE_LIMIT'?t.rateLimit:code==='ZERO_SUPPLY_RATE'?t.zeroSupply:t.invalid;return {error,result:null};}
 },[amount,vatInput,rateRaw,mode,t]);
 const result=calculation.result;
 const customRate=mode!=='reverse-rate'&&result!==null&&Math.abs(result.rate-10)>1e-12;
 function switchMode(next:Tool066Mode){setMode(next);setIncludedState(next==='inclusive'?'included':'excluded');setStatus('');if(next==='exclusive')setAmount('100000');if(next==='inclusive')setAmount('110000');if(next==='reverse-rate'){setAmount('500000');setVatInput('50000')}}
 function reset(){setMode('exclusive');setAmount('100000');setVatInput('10000');setRateRaw('10');setPrecision(0);setIncludedState('excluded');setStatus('')}
 async function copyResult(){if(!result)return;const f=(v:number)=>formatTool066(v,precision,localeCode(locale));const text=`${t.supply}: ${f(result.supply)} | ${t.vat}: ${f(result.vat)} | ${t.total}: ${f(result.total)} | ${t.applied}: ${formatTool066(result.rate,2,localeCode(locale))}%`;try{await navigator.clipboard.writeText(text);setStatus(t.copied)}catch{setStatus('')}}
 const f=(v:number)=>formatTool066(v,precision,localeCode(locale));
 return <div className={styles.root} data-testid="tool066-root" data-mode={mode}>
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <div className={styles.tabs} role="tablist" aria-label={locale==='ko'?'계산 모드':locale==='ja'?'計算モード':'Calculation mode'}>{([['exclusive',t.exclusive],['inclusive',t.inclusive],['reverse-rate',t.reverse]] as const).map(([id,label])=><button key={id} type="button" role="tab" aria-selected={mode===id} className={`${styles.tab} ${mode===id?styles.tabActive:''}`} onClick={()=>switchMode(id)} data-testid={`tool066-mode-${id}`}>{label}</button>)}</div>
  <section className={styles.workspace} data-testid="tool066-workspace">
   <div className={styles.card}>
    <p className={styles.modeHint}>{mode==='exclusive'?t.modeA:mode==='inclusive'?t.modeB:t.modeC}</p>
    <div className={`${styles.inputGrid} ${mode==='reverse-rate'?styles.inputGridReverse:''}`}>
     <label className={styles.field}>{mode==='inclusive'?t.total:t.supply}<input inputMode="decimal" maxLength={TOOL066_LIMITS.maxInputChars} value={amount} onChange={e=>{setAmount(e.target.value);setStatus('')}} aria-invalid={Boolean(calculation.error)} data-testid="tool066-amount"/></label>
     {mode==='reverse-rate'?<label className={styles.field}>{t.vat}<input inputMode="decimal" maxLength={TOOL066_LIMITS.maxInputChars} value={vatInput} onChange={e=>{setVatInput(e.target.value);setStatus('')}} data-testid="tool066-vat-input"/></label>:<div className={styles.rateWrap}><div className={styles.rateHead}><label className={styles.field}>{t.rate}<input inputMode="decimal" value={rateRaw} onChange={e=>{setRateRaw(e.target.value);setStatus('')}} data-testid="tool066-rate"/></label><span className={`${styles.rateBadge} ${customRate?styles.referenceBadge:''}`}>{customRate?t.reference:t.defaultRate}</span></div><div className={styles.rateQuick}><button type="button" className={`${styles.preset} ${rateRaw==='10'?styles.presetActive:''}`} onClick={()=>setRateRaw('10')} data-testid="tool066-rate-10">10%</button><button type="button" className={styles.preset} onClick={()=>setRateRaw('0')} data-testid="tool066-rate-0">0%</button></div></div>}
    </div>
    <div className={styles.toggleRow} aria-label={locale==='ko'?'부가세 포함 여부':locale==='ja'?'税込・税抜':'VAT state'}><button type="button" className={`${styles.toggleButton} ${includedState==='excluded'?styles.toggleActive:''}`} onClick={()=>{setIncludedState('excluded');if(mode==='inclusive')switchMode('exclusive')}} data-testid="tool066-toggle-excluded">{t.separate}</button><button type="button" className={`${styles.toggleButton} ${includedState==='included'?styles.toggleActive:''}`} onClick={()=>{setIncludedState('included');if(mode==='exclusive')switchMode('inclusive')}} data-testid="tool066-toggle-included">{t.included}</button></div>
    <div className={styles.actionRow}><button type="button" className={styles.button} onClick={reset} data-testid="tool066-reset">{t.reset}</button><button type="button" className={styles.primaryButton} onClick={copyResult} disabled={!result} data-testid="tool066-copy">{t.copy}</button></div>
    {calculation.error&&<p className={styles.error} role="alert" data-testid="tool066-error">{calculation.error}</p>}
    {customRate&&<p className={styles.warning} data-testid="tool066-custom-warning">{t.custom}</p>}
   </div>
   <details className={styles.advanced}><summary>{t.display} · {t.precision}</summary><div className={styles.precisionRow}><input aria-label={t.precision} type="range" min="0" max={TOOL066_LIMITS.maxDisplayPrecision} value={precision} onChange={e=>setPrecision(Number(e.target.value))} data-testid="tool066-precision"/><span className={styles.precisionValue}>{precision}</span></div></details>
   <section className={styles.resultCard} aria-live="polite" data-testid="tool066-result"><div className={styles.resultHead}><p className={styles.resultLabel}>RESULT · {t.result}</p><span className={styles.statusTag}>{mode==='inclusive'?t.included:t.separate}</span></div>{!result?<p className={styles.hint}>{calculation.error||t.empty}</p>:<><div className={styles.resultGrid}><div className={styles.resultItem}><span>{t.supply}</span><strong data-testid="tool066-result-supply">{f(result.supply)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.vat}</span><strong data-testid="tool066-result-vat">{f(result.vat)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.total}</span><strong data-testid="tool066-result-total">{f(result.total)}</strong><em>KRW</em></div></div><div className={styles.formulaBox}><strong>{t.applied}: <span data-testid="tool066-result-rate">{formatTool066(result.rate,2,localeCode(locale))}%</span></strong><code data-testid="tool066-formula">{result.formula}</code></div></>}{status&&<p className={styles.status} role="status">{status}</p>}<p className={styles.legalNotice} data-testid="tool066-legal-warning"><strong>VAT</strong> · {t.legal}</p></section>
  </section>
 </div>
}
