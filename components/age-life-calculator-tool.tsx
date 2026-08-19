"use client";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/site";
import { calculateTool048, formatTool048Date, TOOL048_SERVICE_DATE_RANGE } from "@/lib/tool-048-age-life";
import styles from "./age-life-calculator-tool.module.css";

const copy={
 ko:{local:"입력한 생년월일과 기준일은 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.",eyebrow:"AGE WORKSPACE",heading:"생년월일을 선택하세요",dob:"생년월일",asOf:"기준일",today:"기본값은 오늘이며 필요할 때 변경할 수 있습니다.",range:"지원 범위: 1900-01-01 ~ 2100-12-31",empty:"생년월일을 선택하면 만나이와 생후기간 결과가 바로 표시됩니다.",future:"생년월일은 기준일보다 늦을 수 없습니다.",invalid:"올바른 날짜를 선택해 주세요.",rangeError:"지원 범위 안의 날짜를 선택해 주세요.",reset:"초기화",age:"만나이",yearAge:"연나이",elapsed:"생후 일수",next:"다음 생일까지",days:"일",years:"년",months:"개월",birthday:"다음 생일",dday:"D-Day",copy:"복사",copied:"복사 완료",copyFail:"자동 복사에 실패했습니다. 아래 요약을 직접 선택해 복사하세요.",rule:"만나이는 완료된 달력 연·월·일 순서로 계산하며, 연나이는 기준연도-출생연도 값으로 별도 표시합니다.",leap:"2월 29일 출생자는 비윤년의 생일을 2월 28일로 계산합니다.",weekdays:["일","월","화","수","목","금","토"]},
 en:{local:"Your date of birth and as-of date are calculated only in this browser and are not sent to or stored on a server.",eyebrow:"AGE WORKSPACE",heading:"Choose a date of birth",dob:"Date of birth",asOf:"As of date",today:"Defaults to today and can be changed when needed.",range:"Supported range: 1900-01-01 to 2100-12-31",empty:"Choose a date of birth to see age and elapsed-life results instantly.",future:"Date of birth cannot be later than the as-of date.",invalid:"Choose valid dates.",rangeError:"Choose dates within the supported range.",reset:"Reset",age:"Age",yearAge:"Year age",elapsed:"Days since birth",next:"Next birthday",days:"days",years:"yr",months:"mo",birthday:"Birthday",dday:"D-Day",copy:"Copy",copied:"Copied",copyFail:"Automatic copy failed. Select and copy the summary below.",rule:"Calendar age is calculated as complete calendar years, months, then days. Year age is shown separately as as-of year minus birth year.",leap:"For a February 29 birth date, the birthday is treated as February 28 in non-leap years.",weekdays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},
 ja:{local:"入力した生年月日と基準日はサーバーへ送信・保存せず、このブラウザ内だけで計算します。",eyebrow:"AGE WORKSPACE",heading:"生年月日を選択してください",dob:"生年月日",asOf:"基準日",today:"初期値は今日で、必要に応じて変更できます。",range:"対応範囲: 1900-01-01～2100-12-31",empty:"生年月日を選択すると、満年齢と生後期間の結果がすぐ表示されます。",future:"生年月日は基準日より後にできません。",invalid:"正しい日付を選択してください。",rangeError:"対応範囲内の日付を選択してください。",reset:"リセット",age:"満年齢",yearAge:"年齢（年基準）",elapsed:"生後日数",next:"次の誕生日まで",days:"日",years:"年",months:"か月",birthday:"次の誕生日",dday:"D-Day",copy:"コピー",copied:"コピー完了",copyFail:"自動コピーに失敗しました。下の要約を選択してコピーしてください。",rule:"満年齢は経過した暦年・月・日の順に計算し、年基準の年齢は基準年－出生年として別表示します。",leap:"2月29日生まれは、うるう年でない年の誕生日を2月28日として計算します。",weekdays:["日","月","火","水","木","金","土"]}
} as const;

function localToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}

export function AgeLifeCalculatorTool({locale}:{locale:Locale}){
 const t=copy[locale]; const [dob,setDob]=useState(""); const [asOf,setAsOf]=useState(""); const [copyState,setCopyState]=useState<"idle"|"ok"|"fail">("idle");
 useEffect(()=>{setAsOf(v=>v||localToday())},[]);
 const state=useMemo(()=>{if(!dob||!asOf)return{result:null,error:""};try{return{result:calculateTool048(dob,asOf),error:""}}catch(e){const m=e instanceof RangeError?e.message:"";return{result:null,error:m==="DOB_AFTER_AS_OF"?t.future:m==="OUT_OF_RANGE"?t.rangeError:t.invalid}}},[dob,asOf,t.future,t.invalid,t.rangeError]);
 const reset=()=>{setDob("");setAsOf(localToday());setCopyState("idle")};
 const summary=state.result?`${t.age}: ${state.result.age.years} ${t.years} ${state.result.age.months} ${t.months} ${state.result.age.days} ${t.days} · ${t.yearAge}: ${state.result.yearAge} · ${t.elapsed}: ${state.result.elapsedDays} ${t.days} · ${t.next}: ${state.result.birthdayToday?t.dday:`${state.result.nextBirthdayDays} ${t.days}`} (${formatTool048Date(state.result.nextBirthday)})`:"";
 const copyResult=async()=>{if(!summary)return;try{await navigator.clipboard.writeText(summary);setCopyState("ok")}catch{setCopyState("fail")}};
 return <div className={styles.root} data-testid="tool048-root">
  <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
  <section className={styles.workspace} data-testid="tool048-workspace"><div className={styles.workspaceHead}><div><span>{t.eyebrow}</span><h2>{t.heading}</h2></div><button type="button" className={styles.button} onClick={reset} disabled={!dob&&asOf===localToday()} data-testid="tool048-reset">{t.reset}</button></div>
   <div className={styles.dateGrid}><label className={styles.field}><span>{t.dob}</span><input type="date" min={TOOL048_SERVICE_DATE_RANGE.min} max={TOOL048_SERVICE_DATE_RANGE.max} value={dob} onChange={e=>{setDob(e.target.value);setCopyState("idle")}} aria-label={t.dob} data-testid="tool048-dob"/><small>{t.range}</small></label><label className={styles.field}><span>{t.asOf}</span><input type="date" min={TOOL048_SERVICE_DATE_RANGE.min} max={TOOL048_SERVICE_DATE_RANGE.max} value={asOf} onChange={e=>{setAsOf(e.target.value);setCopyState("idle")}} aria-label={t.asOf} data-testid="tool048-as-of"/><small>{t.today}</small></label></div>
   {state.error&&<p className={styles.error} role="alert" aria-live="polite" data-testid="tool048-error">{state.error}</p>}
  </section>
  {!state.result?<div className={styles.emptyResult} data-testid="tool048-empty-result"><span>RESULT</span><p>{t.empty}</p></div>:<section className={styles.results} aria-live="polite" data-testid="tool048-result">
   <div className={styles.primaryCard}><span>{t.age}</span><strong data-testid="tool048-age">{state.result.age.years} {t.years} · {state.result.age.months} {t.months} · {state.result.age.days} {t.days}</strong></div>
   <div className={styles.resultGrid}><article><span>{t.yearAge}</span><strong data-testid="tool048-year-age">{state.result.yearAge}</strong></article><article><span>{t.elapsed}</span><strong data-testid="tool048-elapsed-days">{state.result.elapsedDays.toLocaleString()} {t.days}</strong></article><article><span>{t.next}</span><strong data-testid="tool048-next-days">{state.result.birthdayToday?t.dday:`${state.result.nextBirthdayDays.toLocaleString()} ${t.days}`}</strong><small data-testid="tool048-next-date">{t.birthday} · {formatTool048Date(state.result.nextBirthday)} · {t.weekdays[state.result.nextBirthdayWeekday]}</small></article></div>
   {state.result.leapBirthdayPolicyApplied&&<p className={styles.policy} data-testid="tool048-leap-policy">{t.leap}</p>}
   <p className={styles.rule}>{t.rule}</p><div className={styles.actions}><button type="button" className={styles.copyButton} onClick={copyResult} data-testid="tool048-copy">{copyState==="ok"?t.copied:t.copy}</button></div>
   {copyState==="fail"&&<><p className={styles.error} role="alert">{t.copyFail}</p><p className={styles.fallback} data-testid="tool048-copy-fallback">{summary}</p></>}
   <span className={styles.srOnly}>{summary}</span>
  </section>}
 </div>
}
