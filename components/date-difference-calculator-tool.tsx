"use client";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/site";
import { calculateTool045 } from "@/lib/tool-045-date-difference";
import styles from "./date-difference-calculator-tool.module.css";

const copy={
 ko:{local:"선택한 날짜는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.",eyebrow:"DATE WORKSPACE",start:"시작일",end:"종료일",include:"시작일 포함",includeHelp:"켜면 시작일을 1일째로 함께 셉니다.",empty:"시작일과 종료일을 선택하면 결과가 바로 표시됩니다.",order:"시작일은 종료일보다 늦을 수 없습니다. 날짜 순서를 수정해 주세요.",invalid:"올바른 날짜를 선택해 주세요.",reset:"초기화",total:"총 일수",weeks:"주 / 나머지 일",calendar:"달력 기간",weekdays:"평일",weekends:"주말",days:"일",week:"주",year:"년",month:"개월",rule:"총 일수는 두 날짜의 실제 달력 일수 차이입니다. 달력 기간은 완전히 지난 연·월·일 단위로 별도 표시합니다.",live:"날짜 차이 계산 결과가 갱신되었습니다."},
 en:{local:"Selected dates are calculated only in this browser and are not sent to or stored on a server.",eyebrow:"DATE WORKSPACE",start:"Start date",end:"End date",include:"Include start date",includeHelp:"When enabled, the start date is counted as day 1.",empty:"Choose a start and end date to see the result instantly.",order:"The start date cannot be later than the end date. Please correct the order.",invalid:"Choose valid dates.",reset:"Reset",total:"Total days",weeks:"Weeks / remainder",calendar:"Calendar period",weekdays:"Weekdays",weekends:"Weekends",days:"days",week:"wk",year:"yr",month:"mo",rule:"Total days is the actual Gregorian day difference. Calendar period is shown separately as complete years, months, and days.",live:"Date difference result updated."},
 ja:{local:"選択した日付はサーバーへ送信・保存せず、このブラウザ内だけで計算します。",eyebrow:"DATE WORKSPACE",start:"開始日",end:"終了日",include:"開始日を含める",includeHelp:"オンにすると開始日を1日目として数えます。",empty:"開始日と終了日を選択すると結果がすぐ表示されます。",order:"開始日は終了日より後にできません。日付の順序を修正してください。",invalid:"正しい日付を選択してください。",reset:"リセット",total:"合計日数",weeks:"週 / 残り日数",calendar:"カレンダー期間",weekdays:"平日",weekends:"週末",days:"日",week:"週",year:"年",month:"か月",rule:"合計日数は実際のグレゴリオ暦の日付差です。カレンダー期間は完全に経過した年・月・日を別表示します。",live:"日付差の計算結果を更新しました。"}
} as const;

export function DateDifferenceCalculatorTool({locale}:{locale:Locale}){
 const t=copy[locale]; const [start,setStart]=useState(""); const [end,setEnd]=useState(""); const [includeStart,setIncludeStart]=useState(false);
 const state=useMemo(()=>{if(!start||!end)return{result:null,error:""};try{return{result:calculateTool045(start,end,includeStart),error:""}}catch(e){return{result:null,error:e instanceof RangeError&&e.message==="START_AFTER_END"?t.order:t.invalid}}},[start,end,includeStart,t.order,t.invalid]);
 const reset=()=>{setStart("");setEnd("");setIncludeStart(false)};
 return <div className={styles.root} data-testid="tool045-root">
   <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
   <section className={styles.workspace} data-testid="tool045-workspace">
    <div className={styles.workspaceHead}><div><span>{t.eyebrow}</span><h2>{locale==="ko"?"두 날짜를 선택하세요":locale==="ja"?"2つの日付を選択してください":"Choose two dates"}</h2></div><button type="button" className={styles.button} onClick={reset} disabled={!start&&!end&&!includeStart} data-testid="tool045-reset">{t.reset}</button></div>
    <div className={styles.dateGrid}>
      <label className={styles.field}><span>{t.start}</span><input type="date" value={start} onChange={e=>setStart(e.target.value)} aria-label={t.start} data-testid="tool045-start" /></label>
      <label className={styles.field}><span>{t.end}</span><input type="date" value={end} onChange={e=>setEnd(e.target.value)} aria-label={t.end} data-testid="tool045-end" /></label>
    </div>
    <label className={styles.toggleCard}><input type="checkbox" checked={includeStart} onChange={e=>setIncludeStart(e.target.checked)} data-testid="tool045-include-start"/><span><strong>{t.include}</strong><small>{t.includeHelp}</small></span></label>
    {state.error&&<p className={styles.error} role="alert" aria-live="polite" data-testid="tool045-error">{state.error}</p>}
   </section>
   {!state.result ? <div className={styles.emptyResult} data-testid="tool045-empty-result"><span>RESULT</span><p>{t.empty}</p></div> : <section className={styles.results} aria-live="polite" data-testid="tool045-result">
      <div className={styles.primaryCard}><span>{t.total}</span><strong data-testid="tool045-total-days">{state.result.appliedDays.toLocaleString()}</strong><em>{t.days}</em></div>
      <div className={styles.resultGrid}>
       <article><span>{t.weeks}</span><strong data-testid="tool045-weeks">{state.result.weeks} {t.week} · {state.result.remainderDays} {t.days}</strong></article>
       <article><span>{t.calendar}</span><strong data-testid="tool045-calendar">{state.result.calendar.years} {t.year} · {state.result.calendar.months} {t.month} · {state.result.calendar.days} {t.days}</strong></article>
       <article><span>{t.weekdays}</span><strong data-testid="tool045-weekdays">{state.result.weekdays.toLocaleString()} {t.days}</strong></article>
       <article><span>{t.weekends}</span><strong data-testid="tool045-weekends">{state.result.weekends.toLocaleString()} {t.days}</strong></article>
      </div><p className={styles.rule}>{t.rule}</p><span className={styles.srOnly}>{t.live}</span>
   </section>}
 </div>
}
