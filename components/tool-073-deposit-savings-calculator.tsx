'use client';
import {useMemo,useState} from 'react';
import type {Locale} from '@/lib/site';
import {TOOL073_LIMITS,calculateTool073Deposit,calculateTool073Savings,formatTool073,parseTool073Number,type Tool073Mode,type Tool073TermUnit} from '@/lib/tool-073-deposit-savings';
import styles from './tool-073-deposit-savings-calculator.module.css';

const copy={
 ko:{deposit:'예금',savings:'적금',local:'입력한 금액과 계산 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.',depositAmount:'예치금',monthly:'월 납입액',rate:'연이율',term:'기간',months:'개월',years:'년',tax:'참고 세율',taxHelp:'세후 참고값에만 적용합니다. 실제 상품 과세를 확정하지 않습니다.',reset:'초기화',copy:'결과 복사',copied:'복사됨',display:'표시 설정',precision:'소수점',modeDeposit:'예치금 전체가 선택한 기간 동안 예치된 것으로 단순이자 참고 계산합니다.',modeSavings:'매월 납입금의 남은 예치기간 차이를 반영해 참고 이자를 계산합니다.',result:'계산 결과',principal:'총 원금',grossInterest:'세전 이자',grossMaturity:'세전 만기금액',afterTaxInterest:'세후 참고 이자',afterTaxMaturity:'세후 참고 만기금액',formula:'계산식',applied:'적용 가정',empty:'계산할 금액을 입력하세요.',invalid:'올바른 숫자를 입력하세요.',negative:'금액·금리·참고 세율은 0 이상이어야 합니다.',amountLimit:'금액은 1e15 이하로 입력하세요.',rateLimit:'금리와 참고 세율은 0~100% 범위에서 입력하세요.',termError:'기간은 0보다 큰 정수 개월로 입력하세요.',termLimit:'기간은 최대 1200개월입니다.',totalLimit:'총 납입 원금은 1e15 이하이어야 합니다.',legal:'세후 값은 사용자가 입력한 참고 세율을 이자에만 적용한 참고값입니다. 실제 금융상품의 우대금리·복리·중도해지·과세 조건은 자동 확정하지 않습니다.'},
 en:{deposit:'Deposit',savings:'Installment Savings',local:'Amounts and results are calculated only in this browser and are not sent to or stored on a server.',depositAmount:'Principal',monthly:'Monthly Deposit',rate:'Annual Interest Rate',term:'Term',months:'Months',years:'Years',tax:'Reference Tax Rate',taxHelp:'Applied only to the after-tax reference values. It does not determine actual product taxation.',reset:'Reset',copy:'Copy result',copied:'Copied',display:'Display settings',precision:'Decimals',modeDeposit:'Uses a simple-interest reference where the full principal is deposited for the selected term.',modeSavings:'Uses a monthly-deposit reference that reflects the different remaining interest periods of each payment.',result:'Calculation result',principal:'Total Principal',grossInterest:'Pre-tax Interest',grossMaturity:'Pre-tax Maturity',afterTaxInterest:'Reference After-tax Interest',afterTaxMaturity:'Reference After-tax Maturity',formula:'Formula',applied:'Assumptions',empty:'Enter an amount to calculate.',invalid:'Enter a valid number.',negative:'Amounts, rates, and the reference tax rate must be zero or greater.',amountLimit:'Enter an amount no greater than 1e15.',rateLimit:'Use rates from 0% to 100%.',termError:'Enter a term greater than zero in whole months.',termLimit:'The maximum term is 1200 months.',totalLimit:'Total principal must not exceed 1e15.',legal:'After-tax values apply only the reference tax rate you enter to the interest. Product-specific preferential rates, compounding, early-withdrawal rules, and actual taxation are not determined.'},
 ja:{deposit:'預金',savings:'積立',local:'入力した金額と計算結果はサーバーへ送信・保存せず、このブラウザ内だけで計算します。',depositAmount:'元金',monthly:'月額積立',rate:'年利',term:'期間',months:'か月',years:'年',tax:'参考税率',taxHelp:'税引後の参考値だけに適用します。実際の商品課税を確定するものではありません。',reset:'リセット',copy:'結果をコピー',copied:'コピー済み',display:'表示設定',precision:'小数点',modeDeposit:'元金全体が選択期間中ずっと預けられる単利の参考計算です。',modeSavings:'毎月の積立金ごとに残りの預入期間が異なる点を反映した参考計算です。',result:'計算結果',principal:'元本合計',grossInterest:'税引前利息',grossMaturity:'税引前満期額',afterTaxInterest:'税引後参考利息',afterTaxMaturity:'税引後参考満期額',formula:'計算式',applied:'適用条件',empty:'計算する金額を入力してください。',invalid:'有効な数値を入力してください。',negative:'金額・金利・参考税率は0以上にしてください。',amountLimit:'金額は1e15以下で入力してください。',rateLimit:'金利と参考税率は0〜100%で入力してください。',termError:'期間は0より大きい整数月で入力してください。',termLimit:'期間は最大1200か月です。',totalLimit:'元本合計は1e15以下にしてください。',legal:'税引後の値は入力した参考税率を利息だけに適用した参考値です。商品別の優遇金利・複利・中途解約・実際の課税条件は自動判定しません。'}
} as const;

function localeCode(locale:Locale){return locale==='ko'?'ko-KR':locale==='ja'?'ja-JP':'en-US'}

export function Tool073DepositSavingsCalculator({locale}:{locale:Locale}){
 const t=copy[locale];
 const [mode,setMode]=useState<Tool073Mode>('deposit');
 const [amount,setAmount]=useState('10000000');
 const [rateRaw,setRateRaw]=useState('3');
 const [termRaw,setTermRaw]=useState('12');
 const [termUnit,setTermUnit]=useState<Tool073TermUnit>('months');
 const [taxRaw,setTaxRaw]=useState('0');
 const [precision,setPrecision]=useState(0);
 const [status,setStatus]=useState('');
 const calculation=useMemo(()=>{
   const amountValue=parseTool073Number(amount),rate=parseTool073Number(rateRaw),term=parseTool073Number(termRaw),tax=parseTool073Number(taxRaw);
   if(amountValue===null) return {error:amount.trim()===''?t.empty:t.invalid,result:null};
   if(rate===null||term===null||tax===null) return {error:t.invalid,result:null};
   try{return {error:'',result:mode==='deposit'?calculateTool073Deposit(amountValue,rate,term,termUnit,tax):calculateTool073Savings(amountValue,rate,term,termUnit,tax)}}catch(e){
     const code=e instanceof Error?e.message:'';
     const error=code.includes('NEGATIVE')?t.negative:code.includes('AMOUNT_LIMIT')?t.amountLimit:code==='TOTAL_PRINCIPAL_LIMIT'?t.totalLimit:code.includes('RATE_LIMIT')||code.includes('TAX_LIMIT')?t.rateLimit:code==='TERM_LIMIT'?t.termLimit:code.startsWith('TERM_')?t.termError:t.invalid;
     return {error,result:null};
   }
 },[amount,rateRaw,termRaw,termUnit,taxRaw,mode,t]);
 const result=calculation.result;
 function switchMode(next:Tool073Mode){setMode(next);setAmount(next==='deposit'?'10000000':'500000');setRateRaw('3');setTermRaw('12');setTermUnit('months');setTaxRaw('0');setStatus('')}
 function reset(){switchMode('deposit');setPrecision(0)}
 const f=(v:number)=>formatTool073(v,precision,localeCode(locale));
 async function copyResult(){if(!result)return;const text=`${t.principal}: ${f(result.principal)} | ${t.grossInterest}: ${f(result.grossInterest)} | ${t.grossMaturity}: ${f(result.grossMaturity)} | ${t.afterTaxInterest}: ${f(result.afterTaxInterest)} | ${t.afterTaxMaturity}: ${f(result.afterTaxMaturity)} | ${t.rate}: ${formatTool073(result.annualRate,2,localeCode(locale))}% | ${t.term}: ${result.months} ${t.months} | ${t.tax}: ${formatTool073(result.referenceTaxRate,2,localeCode(locale))}%`;try{await navigator.clipboard.writeText(text);setStatus(t.copied)}catch{setStatus('')}}
 return <div className={styles.root} data-testid="tool073-root" data-mode={mode}>
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <div className={styles.tabs} role="tablist" aria-label={locale==='ko'?'예금·적금 모드':locale==='ja'?'預金・積立モード':'Deposit or savings mode'}>{([['deposit',t.deposit],['savings',t.savings]] as const).map(([id,label])=><button key={id} type="button" role="tab" aria-selected={mode===id} className={`${styles.tab} ${mode===id?styles.tabActive:''}`} onClick={()=>switchMode(id)} data-testid={`tool073-mode-${id}`}>{label}</button>)}</div>
  <section className={styles.workspace} data-testid="tool073-workspace">
   <div className={styles.card}>
    <p className={styles.modeHint}>{mode==='deposit'?t.modeDeposit:t.modeSavings}</p>
    <div className={styles.inputGrid}>
     <label className={styles.field}>{mode==='deposit'?t.depositAmount:t.monthly}<input inputMode="decimal" maxLength={TOOL073_LIMITS.maxInputChars} value={amount} onChange={e=>{setAmount(e.target.value);setStatus('')}} aria-invalid={Boolean(calculation.error)} data-testid="tool073-amount"/></label>
     <label className={styles.field}>{t.rate}<input inputMode="decimal" maxLength={TOOL073_LIMITS.maxInputChars} value={rateRaw} onChange={e=>{setRateRaw(e.target.value);setStatus('')}} data-testid="tool073-rate"/></label>
     <label className={styles.field}>{t.term}<span className={styles.termWrap}><input inputMode="decimal" maxLength={TOOL073_LIMITS.maxInputChars} value={termRaw} onChange={e=>{setTermRaw(e.target.value);setStatus('')}} data-testid="tool073-term"/><select value={termUnit} onChange={e=>{setTermUnit(e.target.value as Tool073TermUnit);setStatus('')}} data-testid="tool073-term-unit"><option value="months">{t.months}</option><option value="years">{t.years}</option></select></span></label>
    </div>
    <div className={styles.assumptionRow} aria-label={t.applied}><div className={styles.assumption}><span>{t.rate}</span><strong data-testid="tool073-assumption-rate">{rateRaw||'—'}%</strong></div><div className={styles.assumption}><span>{t.term}</span><strong data-testid="tool073-assumption-term">{result?`${result.months} ${t.months}`:'—'}</strong></div><div className={styles.assumption}><span>{t.tax}</span><strong data-testid="tool073-assumption-tax">{taxRaw||'—'}%</strong></div></div>
    <div className={styles.actionRow}><button type="button" className={styles.button} onClick={reset} data-testid="tool073-reset">{t.reset}</button><button type="button" className={styles.primaryButton} onClick={copyResult} disabled={!result} data-testid="tool073-copy">{t.copy}</button></div>
    {calculation.error&&<p className={styles.error} role="alert" data-testid="tool073-error">{calculation.error}</p>}
   </div>
   <details className={styles.advanced}><summary>{t.display}</summary><div className={styles.advancedGrid}><label className={styles.field}>{t.tax}<input inputMode="decimal" maxLength={TOOL073_LIMITS.maxInputChars} value={taxRaw} onChange={e=>{setTaxRaw(e.target.value);setStatus('')}} data-testid="tool073-tax-rate"/><span>{t.taxHelp}</span></label><label className={styles.field}>{t.precision}<input type="number" min="0" max={TOOL073_LIMITS.maxDisplayPrecision} value={precision} onChange={e=>setPrecision(Math.max(0,Math.min(TOOL073_LIMITS.maxDisplayPrecision,Number(e.target.value)||0)))} data-testid="tool073-precision"/></label></div></details>
   <section className={styles.resultCard} aria-live="polite" data-testid="tool073-result"><div className={styles.resultHead}><p className={styles.resultLabel}>RESULT · {t.result}</p><span className={styles.statusTag}>{mode==='deposit'?t.deposit:t.savings}</span></div>{!result?<p className={styles.hint}>{calculation.error||t.empty}</p>:<><div className={styles.resultGrid}><div className={`${styles.resultItem} ${styles.resultItemPrimary}`}><span>{t.principal}</span><strong data-testid="tool073-result-principal">{f(result.principal)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.grossInterest}</span><strong data-testid="tool073-result-gross-interest">{f(result.grossInterest)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.grossMaturity}</span><strong data-testid="tool073-result-gross-maturity">{f(result.grossMaturity)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.afterTaxInterest}</span><strong data-testid="tool073-result-aftertax-interest">{f(result.afterTaxInterest)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.afterTaxMaturity}</span><strong data-testid="tool073-result-aftertax-maturity">{f(result.afterTaxMaturity)}</strong><em>KRW</em></div></div><div className={styles.formulaBox}><strong>{t.formula}</strong><code data-testid="tool073-formula">{result.formula}</code></div></>}{status&&<p className={styles.status} role="status">{status}</p>}<p className={styles.legalNotice} data-testid="tool073-reference-warning"><strong>REFERENCE</strong> · {t.legal}</p></section>
  </section>
 </div>
}
