'use client';
import {useMemo,useState} from 'react';
import type {Locale} from '@/lib/site';
import {TOOL075_LIMITS,calculateTool075,compareTool075,formatTool075Money,normalizeTool075Term,parseTool075Number,type Tool075Method,type Tool075TermUnit} from '@/lib/tool-075-loan';
import styles from './tool-075-loan-calculator.module.css';

const copy={
 ko:{local:'입력값은 서버로 전송하지 않고 브라우저에서 계산합니다.',methods:{'equal-payment':'원리금 균등','equal-principal':'원금 균등','bullet':'만기일시'},principal:'대출원금',rate:'연이율',term:'대출기간',months:'개월',years:'년',monthly:'월 납부액',totalInterest:'총이자',totalRepayment:'총상환액',first:'첫 회차 납부액',last:'마지막 회차 납부액',copy:'결과 복사',reset:'초기화',compare:'3가지 상환방식 비교',schedule:'월별 상환표',period:'회차',payment:'납부금액',principalPart:'원금',interest:'이자',balance:'상환 후 잔액',total:'합계',formula:'계산식',empty:'원금·금리·기간을 입력하면 결과가 표시됩니다.',error:'입력값을 확인해주세요.',copied:'결과를 복사했습니다.',assumption:'고정 연이율을 12로 나눈 월이율, 월말 납부 기준입니다.',notice:'실제 금융기관의 수수료·보증료·보험료·중도상환수수료·우대금리는 자동 반영하지 않습니다.',regular:'기준 월 납부액',showAll:'전체 상환표 보기',collapse:'상환표 접기'},
 en:{local:'Your loan values stay in this browser and are not sent to a server.',methods:{'equal-payment':'Equal Payment','equal-principal':'Equal Principal','bullet':'Bullet Payment'},principal:'Loan Principal',rate:'Annual Rate',term:'Term',months:'Months',years:'Years',monthly:'Monthly Payment',totalInterest:'Total Interest',totalRepayment:'Total Repayment',first:'First Payment',last:'Last Payment',copy:'Copy Summary',reset:'Reset',compare:'Compare 3 repayment methods',schedule:'Amortization Schedule',period:'Period',payment:'Payment',principalPart:'Principal',interest:'Interest',balance:'Balance',total:'Total',formula:'Formula',empty:'Enter principal, rate, and term to see the result.',error:'Check the input values.',copied:'Summary copied.',assumption:'Uses a fixed annual rate divided by 12 with month-end payments.',notice:'Bank fees, guarantee/insurance fees, prepayment charges, and preferential rates are not added automatically.',regular:'Reference Monthly Payment',showAll:'Show full schedule',collapse:'Collapse schedule'},
 ja:{local:'入力した借入額・金利・期間はサーバーへ送信せず、ブラウザ内で計算します。',methods:{'equal-payment':'元利均等返済','equal-principal':'元金均等返済','bullet':'元金一括返済'},principal:'借入額',rate:'年利',term:'期間',months:'か月',years:'年',monthly:'月の返済額',totalInterest:'総利息',totalRepayment:'総返済額',first:'初回返済額',last:'最終回返済額',copy:'結果をコピー',reset:'リセット',compare:'3つの返済方式を比較',schedule:'月別返済表',period:'回',payment:'返済額',principalPart:'元金',interest:'利息',balance:'返済後残高',total:'合計',formula:'計算式',empty:'借入額・金利・期間を入力すると結果が表示されます。',error:'入力値を確認してください。',copied:'結果をコピーしました。',assumption:'固定年利を12で割った月利、月末返済を基準にします。',notice:'金融機関の手数料・保証料・保険料・繰上返済手数料・優遇金利は自動反映しません。',regular:'基準月返済額',showAll:'返済表をすべて表示',collapse:'返済表を閉じる'}
} as const;

function localeCode(locale:Locale){return locale==='ko'?'ko-KR':locale==='ja'?'ja-JP':'en-US'}
export function Tool075LoanCalculator({locale}:{locale:Locale}){
 const t=copy[locale];
 const [method,setMethod]=useState<Tool075Method>('equal-payment');
 const [principalRaw,setPrincipalRaw]=useState('100000000');
 const [rateRaw,setRateRaw]=useState('5');
 const [termRaw,setTermRaw]=useState('20');
 const [termUnit,setTermUnit]=useState<Tool075TermUnit>('years');
 const [status,setStatus]=useState('');
 const [scheduleExpanded,setScheduleExpanded]=useState(false);
 const calculation=useMemo(()=>{
  try{
   const principal=parseTool075Number(principalRaw); const rate=parseTool075Number(rateRaw); const term=parseTool075Number(termRaw);
   if(principal===null||rate===null||term===null) return {result:null,compare:null,error:''};
   const months=normalizeTool075Term(term,termUnit);
   const result=calculateTool075(principal,rate,months,method);
   const compare=compareTool075(principal,rate,months);
   return {result,compare,error:''};
  }catch{return {result:null,compare:null,error:t.error};}
 },[principalRaw,rateRaw,termRaw,termUnit,method,t.error]);
 const f=(value:number)=>formatTool075Money(value,localeCode(locale),'KRW');
 const result=calculation.result;
 const reset=()=>{setMethod('equal-payment');setPrincipalRaw('100000000');setRateRaw('5');setTermRaw('20');setTermUnit('years');setStatus('');setScheduleExpanded(false);};
 const copySummary=async()=>{if(!result)return; const text=`${t.methods[result.method]} | ${t.principal}: ${f(result.principal)} | ${t.rate}: ${result.annualRate}% | ${t.term}: ${result.months} ${t.months} | ${t.first}: ${f(result.firstPayment)} | ${t.last}: ${f(result.lastPayment)} | ${t.totalInterest}: ${f(result.totalInterest)} | ${t.totalRepayment}: ${f(result.totalRepayment)}`; try{await navigator.clipboard.writeText(text);setStatus(t.copied);}catch{setStatus(text)}};
 return <div className={styles.root} data-testid="tool075-root">
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <div className={styles.tabs} role="tablist" aria-label={t.schedule}>{(['equal-payment','equal-principal','bullet'] as const).map(m=><button key={m} type="button" role="tab" aria-selected={method===m} className={`${styles.tab} ${method===m?styles.tabActive:''}`} onClick={()=>setMethod(m)} data-testid={`tool075-method-${m}`}>{t.methods[m]}</button>)}</div>
  <section className={styles.workspace}>
   <div className={styles.card}>
    <div className={styles.inputGrid}>
     <label className={styles.field}>{t.principal}<input data-testid="tool075-principal" inputMode="decimal" value={principalRaw} maxLength={TOOL075_LIMITS.maxInputChars} onChange={e=>setPrincipalRaw(e.target.value)}/></label>
     <label className={styles.field}>{t.rate} (%)<input data-testid="tool075-rate" inputMode="decimal" value={rateRaw} maxLength={TOOL075_LIMITS.maxInputChars} onChange={e=>setRateRaw(e.target.value)}/></label>
     <label className={styles.field}>{t.term}<span className={styles.termWrap}><input data-testid="tool075-term" inputMode="decimal" value={termRaw} maxLength={TOOL075_LIMITS.maxInputChars} onChange={e=>setTermRaw(e.target.value)}/><select aria-label={t.term} data-testid="tool075-term-unit" value={termUnit} onChange={e=>setTermUnit(e.target.value as Tool075TermUnit)}><option value="months">{t.months}</option><option value="years">{t.years}</option></select></span></label>
    </div>
    <div className={styles.quickTerms}>{[10,20,30].map(y=><button className={styles.preset} key={y} type="button" onClick={()=>{setTermRaw(String(y));setTermUnit('years')}}>{y} {t.years}</button>)}</div>
    <div className={styles.actionRow}><button className={styles.button} type="button" onClick={reset} data-testid="tool075-reset">{t.reset}</button><button className={styles.primaryButton} type="button" disabled={!result} onClick={copySummary} data-testid="tool075-copy">{t.copy}</button></div>
    {calculation.error&&<p className={styles.error} role="alert" data-testid="tool075-error">{calculation.error}</p>}
   </div>
   <section className={styles.resultCard} aria-live="polite" data-testid="tool075-result">
    <div className={styles.resultHead}><p className={styles.resultLabel}>RESULT</p><span className={styles.statusTag}>{result?t.methods[result.method]:'—'}</span></div>
    {!result?<p className={styles.hint}>{t.empty}</p>:<><div className={styles.resultGrid}><div className={styles.resultItem}><span>{method==='equal-principal'?t.first:method==='bullet'?t.monthly:t.monthly}</span><strong data-testid="tool075-result-monthly">{f(result.regularPayment)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.totalInterest}</span><strong data-testid="tool075-result-interest">{f(result.totalInterest)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.totalRepayment}</span><strong data-testid="tool075-result-total">{f(result.totalRepayment)}</strong><em>KRW</em></div></div><div className={styles.secondaryGrid}><div className={styles.secondaryItem}><span>{t.first}</span><strong data-testid="tool075-first-payment">{f(result.firstPayment)}</strong></div><div className={styles.secondaryItem}><span>{t.last}</span><strong data-testid="tool075-last-payment">{f(result.lastPayment)}</strong></div></div><div className={styles.formulaBox}><strong>{t.formula}</strong><code data-testid="tool075-formula">{result.formula}</code><span className={styles.hint}>{t.assumption}</span></div></>}
    {status&&<p className={styles.status} role="status">{status}</p>}<p className={styles.legalNotice}><strong>075</strong> · {t.notice}</p>
   </section>
   {calculation.compare&&<section className={styles.compareCard} data-testid="tool075-compare"><div className={styles.resultHead}><p className={styles.resultLabel}>COMPARE</p><span className={styles.statusTag}>{t.compare}</span></div><div className={styles.compareGrid}>{calculation.compare.map(item=><div className={styles.compareItem} key={item.method}><b>{t.methods[item.method]}</b><span>{t.first}</span><strong>{f(item.firstPayment)}</strong><span>{t.totalInterest}</span><strong>{f(item.totalInterest)}</strong></div>)}</div></section>}
   {result&&<section className={styles.scheduleCard} data-testid="tool075-schedule"><div className={styles.scheduleHead}><div><p className={styles.resultLabel}>SCHEDULE</p><strong>{t.schedule}</strong></div><span className={styles.statusTag}>{result.months} {t.months}</span></div><div className={styles.tableWrap}><table className={styles.scheduleTable}><thead><tr><th scope="col">{t.period}</th><th scope="col">{t.payment}</th><th scope="col">{t.principalPart}</th><th scope="col">{t.interest}</th><th scope="col">{t.balance}</th></tr></thead><tbody>{result.schedule.slice(0,scheduleExpanded?result.schedule.length:12).map(row=><tr key={row.period} data-testid={row.period===1?'tool075-row-first':row.period===result.months?'tool075-row-last':undefined}><td>{row.period}</td><td>{f(row.payment)}</td><td>{f(row.principal)}</td><td>{f(row.interest)}</td><td>{f(row.balance)}</td></tr>)}</tbody><tfoot><tr><td>{t.total}</td><td>{f(result.totalRepayment)}</td><td>{f(result.totalPrincipal)}</td><td>{f(result.totalInterest)}</td><td>{f(0)}</td></tr></tfoot></table></div>{result.schedule.length>12&&<div className={styles.actionRow}><button className={styles.button} type="button" onClick={()=>setScheduleExpanded(v=>!v)} aria-expanded={scheduleExpanded} data-testid="tool075-schedule-toggle">{scheduleExpanded?t.collapse:t.showAll}</button></div>}</section>}
  </section>
 </div>
}
