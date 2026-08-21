'use client';
import {useMemo,useState} from 'react';
import type {Locale} from '@/lib/site';
import {TOOL074_LIMITS,calculateTool074,formatTool074,parseTool074Number,type CompoundingFrequency,type ContributionTiming,type TermUnit} from '@/lib/tool-074-compound-growth';
import styles from './tool-074-compound-growth-calculator.module.css';

const copy={
ko:{local:'입력한 원금·납입액·이율·목표금액은 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.',principal:'원금',contribution:'추가 납입',rate:'연이율',term:'기간',termUnit:'기간 단위',years:'년',months:'개월',frequency:'복리 주기',monthly:'월 복리',annual:'연 복리',timing:'납입 시점',end:'기말 납입',beginning:'기초 납입',goal:'목표금액',reset:'초기화',copy:'결과 복사',copied:'복사됨',future:'미래자산',totalInvested:'총 투입 원금',totalContribution:'총 추가 납입 원금',growth:'복리 성장액',gap:'목표 부족액',surplus:'목표 초과액',reached:'목표 달성/초과',short:'목표 미달',requiredContribution:'목표에 필요한 정기 납입액',requiredPrincipal:'목표에 필요한 초기 원금',formula:'계산식',assumptions:'가정 및 역산',periods:'총 복리 기간',periodicRate:'기간 이율',mode:'고정 이율 시뮬레이션',invalid:'올바른 숫자를 입력하세요.',negative:'금액과 이율은 0 이상이어야 합니다.',rateLimit:'연이율은 0~100% 범위에서 입력하세요.',termLimit:'기간은 최대 100년 또는 1200개월입니다.',mismatch:'연 복리에서 개월 단위 기간은 12의 배수로 입력하세요.',overflow:'입력값이 너무 커 계산할 수 없습니다.',legal:'이 결과는 입력한 고정 연이율이 기간 내 유지된다는 가정의 미래가치 시뮬레이션이며 실제 투자수익을 예측하거나 보장하지 않습니다.'},
en:{local:'Principal, contribution, rate, and target values are calculated only in this browser and are not sent to or stored on a server.',principal:'Initial Principal',contribution:'Additional Contribution',rate:'Annual Rate',term:'Term',termUnit:'Term unit',years:'Years',months:'Months',frequency:'Compounding',monthly:'Monthly Compounding',annual:'Annual Compounding',timing:'Contribution Timing',end:'End of period',beginning:'Beginning of period',goal:'Target Amount',reset:'Reset',copy:'Copy result',copied:'Copied',future:'Future Value',totalInvested:'Total Invested',totalContribution:'Total Contributions',growth:'Compound Growth',gap:'Goal Gap',surplus:'Goal Surplus',reached:'Goal reached/exceeded',short:'Below goal',requiredContribution:'Required Recurring Contribution',requiredPrincipal:'Required Initial Principal',formula:'Formula',assumptions:'Assumptions & reverse calculations',periods:'Compounding periods',periodicRate:'Periodic rate',mode:'Fixed-rate simulation',invalid:'Enter a valid number.',negative:'Amounts and rate must be zero or greater.',rateLimit:'Use an annual rate from 0% to 100%.',termLimit:'Term is limited to 100 years or 1,200 months.',mismatch:'With annual compounding, a month-based term must be a multiple of 12.',overflow:'The values are too large to calculate safely.',legal:'This is a future-value simulation assuming the entered fixed annual rate remains constant. It does not predict or guarantee actual investment returns.'},
ja:{local:'入力した元金・積立額・金利・目標金額はサーバーへ送信・保存せず、このブラウザ内だけで計算します。',principal:'元金',contribution:'追加積立',rate:'年利',term:'期間',termUnit:'期間単位',years:'年',months:'か月',frequency:'複利周期',monthly:'月複利',annual:'年複利',timing:'積立タイミング',end:'期末積立',beginning:'期首積立',goal:'目標金額',reset:'リセット',copy:'結果をコピー',copied:'コピー済み',future:'将来資産',totalInvested:'投入元本合計',totalContribution:'追加積立元本合計',growth:'複利成長額',gap:'目標不足額',surplus:'目標超過額',reached:'目標達成・超過',short:'目標未達',requiredContribution:'目標に必要な定期積立額',requiredPrincipal:'目標に必要な初期元金',formula:'計算式',assumptions:'前提・逆算',periods:'複利期間数',periodicRate:'期間利率',mode:'固定金利シミュレーション',invalid:'有効な数値を入力してください。',negative:'金額と金利は0以上にしてください。',rateLimit:'年利は0〜100%で入力してください。',termLimit:'期間は最大100年または1200か月です。',mismatch:'年複利で月単位を使う場合、期間は12の倍数にしてください。',overflow:'入力値が大きすぎて安全に計算できません。',legal:'この結果は入力した固定年利が期間中一定であると仮定した将来価値シミュレーションで、実際の投資収益を予測・保証するものではありません。'}
} as const;

function localeCode(locale:Locale){return locale==='ko'?'ko-KR':locale==='ja'?'ja-JP':'en-US'}

export function Tool074CompoundGrowthCalculator({locale}:{locale:Locale}){
 const t=copy[locale];
 const [principal,setPrincipal]=useState('10000000');
 const [contribution,setContribution]=useState('300000');
 const [rate,setRate]=useState('4');
 const [term,setTerm]=useState('10');
 const [termUnit,setTermUnit]=useState<TermUnit>('years');
 const [frequency,setFrequency]=useState<CompoundingFrequency>('monthly');
 const [timing,setTiming]=useState<ContributionTiming>('end');
 const [goal,setGoal]=useState('100000000');
 const [precision,setPrecision]=useState(0);
 const [status,setStatus]=useState('');
 const calculation=useMemo(()=>{
  const p=parseTool074Number(principal),c=parseTool074Number(contribution),r=parseTool074Number(rate),n=parseTool074Number(term),g=parseTool074Number(goal);
  if([p,c,r,n].some(v=>v===null)) return {error:t.invalid,result:null};
  if(goal.trim()!==''&&g===null) return {error:t.invalid,result:null};
  try{return {error:'',result:calculateTool074({principal:p!,contribution:c!,annualRate:r!,term:n!,termUnit,frequency,timing,goal:goal.trim()===''?undefined:g!})};}
  catch(e){const code=e instanceof Error?e.message:'';const error=code.includes('NEGATIVE')?t.negative:code==='RATE_LIMIT'?t.rateLimit:code==='TERM_LIMIT'||code==='TERM_INVALID'?t.termLimit:code==='TERM_FREQUENCY_MISMATCH'?t.mismatch:code==='OVERFLOW'?t.overflow:t.invalid;return {error,result:null};}
 },[principal,contribution,rate,term,termUnit,frequency,timing,goal,t]);
 const result=calculation.result;
 const f=(v:number)=>formatTool074(v,precision,localeCode(locale));
 function reset(){setPrincipal('10000000');setContribution('300000');setRate('4');setTerm('10');setTermUnit('years');setFrequency('monthly');setTiming('end');setGoal('100000000');setPrecision(0);setStatus('')}
 async function copyResult(){if(!result)return;const parts=[`${t.future}: ${f(result.futureValue)}`,`${t.totalInvested}: ${f(result.totalInvested)}`,`${t.growth}: ${f(result.growth)}`];if(result.goalGap!==null)parts.push(`${t.gap}: ${f(Math.abs(result.goalGap))}`);try{await navigator.clipboard.writeText(parts.join(' | '));setStatus(t.copied)}catch{setStatus('')}}
 const goalLabel=result?.goalGap==null?'':result.goalGap<=0?t.reached:t.short;
 return <div className={styles.root} data-testid="tool074-root">
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <section className={styles.workspace} data-testid="tool074-workspace">
   <div className={styles.card}>
    <div className={styles.inputGrid}>
     <label className={styles.field}>{t.principal}<input inputMode="decimal" maxLength={TOOL074_LIMITS.maxInputChars} value={principal} onChange={e=>{setPrincipal(e.target.value);setStatus('')}} data-testid="tool074-principal"/></label>
     <label className={styles.field}>{t.contribution}<input inputMode="decimal" maxLength={TOOL074_LIMITS.maxInputChars} value={contribution} onChange={e=>{setContribution(e.target.value);setStatus('')}} data-testid="tool074-contribution"/></label>
     <label className={styles.field}>{t.rate} (%)<input inputMode="decimal" maxLength={TOOL074_LIMITS.maxInputChars} value={rate} onChange={e=>{setRate(e.target.value);setStatus('')}} data-testid="tool074-rate"/></label>
     <label className={styles.field}>{t.term}<input inputMode="decimal" maxLength={TOOL074_LIMITS.maxInputChars} value={term} onChange={e=>{setTerm(e.target.value);setStatus('')}} data-testid="tool074-term"/></label>
     <label className={styles.field}>{t.termUnit}<select value={termUnit} onChange={e=>setTermUnit(e.target.value as TermUnit)} data-testid="tool074-term-unit"><option value="years">{t.years}</option><option value="months">{t.months}</option></select></label>
     <label className={styles.field}>{t.goal}<input inputMode="decimal" maxLength={TOOL074_LIMITS.maxInputChars} value={goal} onChange={e=>{setGoal(e.target.value);setStatus('')}} data-testid="tool074-goal"/></label>
    </div>
    <p className={styles.sectionLabel}>{t.frequency}</p><div className={styles.segmented}><button type="button" className={`${styles.segment} ${frequency==='monthly'?styles.segmentActive:''}`} onClick={()=>setFrequency('monthly')} data-testid="tool074-frequency-monthly">{t.monthly}</button><button type="button" className={`${styles.segment} ${frequency==='annual'?styles.segmentActive:''}`} onClick={()=>setFrequency('annual')} data-testid="tool074-frequency-annual">{t.annual}</button></div>
    <p className={styles.sectionLabel}>{t.timing}</p><div className={styles.segmented}><button type="button" className={`${styles.segment} ${timing==='end'?styles.segmentActive:''}`} onClick={()=>setTiming('end')} data-testid="tool074-timing-end">{t.end}</button><button type="button" className={`${styles.segment} ${timing==='beginning'?styles.segmentActive:''}`} onClick={()=>setTiming('beginning')} data-testid="tool074-timing-beginning">{t.beginning}</button></div>
    <div className={styles.actionRow}><button type="button" className={styles.button} onClick={reset} data-testid="tool074-reset">{t.reset}</button><button type="button" className={styles.primaryButton} onClick={copyResult} disabled={!result} data-testid="tool074-copy">{t.copy}</button></div>
    {calculation.error&&<p className={styles.error} role="alert" data-testid="tool074-error">{calculation.error}</p>}
   </div>
   <details className={styles.advanced}><summary>{t.assumptions}</summary><div className={styles.advancedGrid}><label className={styles.field}>{locale==='ko'?'표시 소수점':locale==='ja'?'表示小数点':'Display decimals'}<input type="number" min="0" max={TOOL074_LIMITS.maxPrecision} value={precision} onChange={e=>setPrecision(Math.max(0,Math.min(TOOL074_LIMITS.maxPrecision,Number(e.target.value)||0)))} data-testid="tool074-precision"/></label><div className={styles.formulaBox}><strong>{t.formula}</strong><code data-testid="tool074-formula">FV = P×(1+r/m)^N + C×[((1+r/m)^N−1)/(r/m)]{timing==='beginning'?'×(1+r/m)':''}</code></div></div></details>
   <section className={styles.resultCard} aria-live="polite" data-testid="tool074-result"><div className={styles.resultHead}><p className={styles.resultLabel}>RESULT · {t.future}</p><span className={styles.statusTag}>{t.mode}</span></div>{!result?<p className={styles.hint}>{calculation.error||t.invalid}</p>:<><div className={styles.heroValue}><span>{t.future}</span><strong data-testid="tool074-future-value">{f(result.futureValue)}</strong><em>KRW</em></div><div className={styles.resultGrid}><div className={styles.resultItem}><span>{t.totalInvested}</span><strong data-testid="tool074-total-invested">{f(result.totalInvested)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.totalContribution}</span><strong data-testid="tool074-total-contributions">{f(result.totalContributions)}</strong><em>KRW</em></div><div className={styles.resultItem}><span>{t.growth}</span><strong data-testid="tool074-growth">{f(result.growth)}</strong><em>KRW</em></div></div>{result.goalGap!==null&&<div className={styles.goalBox} data-testid="tool074-goal-status"><strong>{goalLabel} · {result.goalGap<=0?t.surplus:t.gap}: <span data-testid="tool074-goal-gap">{f(Math.abs(result.goalGap))}</span> KRW</strong><p>{t.requiredContribution}: <b data-testid="tool074-required-contribution">{f(result.requiredContribution??0)}</b> KRW / {t.requiredPrincipal}: <b data-testid="tool074-required-principal">{f(result.requiredPrincipal??0)}</b> KRW</p></div>}<div className={styles.assumption}><div><span>{t.periods}</span><strong>{result.periods}</strong></div><div><span>{t.periodicRate}</span><strong>{formatTool074(result.periodicRate*100,TOOL074_LIMITS.maxPrecision,localeCode(locale))}%</strong></div><div><span>{t.frequency} / {t.timing}</span><strong>{frequency==='monthly'?t.monthly:t.annual} · {timing==='end'?t.end:t.beginning}</strong></div></div></>}{status&&<p className={styles.status} role="status">{status}</p>}<p className={styles.legalNotice} data-testid="tool074-assumption-warning"><strong>SIMULATION</strong> · {t.legal}</p></section>
  </section>
 </div>
}
