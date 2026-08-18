"use client";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/site";
import { calculateDate, TOOL046_LIMITS, weekdayIndex, type DateDirection, type DateUnit } from "@/lib/tool-046-date-arithmetic";
import styles from "./date-add-subtract-calculator-tool.module.css";

const copy = {
  ko:{local:"날짜와 계산 결과는 브라우저 안에서만 처리되며 서버로 전송하거나 저장하지 않습니다.",start:"시작일",direction:"방향",add:"더하기",subtract:"빼기",unit:"단위",day:"일",week:"주",month:"개월",year:"년",quantity:"수량",calculate:"계산",reset:"초기화",quick:"빠른 계산",quickHint:"자주 쓰는 날짜 이동",result:"결과 날짜",copy:"결과 복사",copied:"결과를 복사했습니다.",empty:"시작일과 수량을 입력하세요.",invalid:"유효한 날짜와 0 이상의 정수 수량을 입력하세요.",range:`수량은 ${TOOL046_LIMITS.maxQuantity.toLocaleString()} 이하의 정수만 사용할 수 있습니다.`,dateRange:"계산 결과가 지원 날짜 범위를 벗어났습니다.",weekdays:["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],summary:(d:string,u:string,q:number)=>`${d} ${q}${u}`,presets:[["+7일","day",7],["+30일","day",30],["+90일","day",90],["+6개월","month",6],["+1년","year",1]] as const},
  en:{local:"Dates and results are processed only in your browser and are not sent to or stored on a server.",start:"Start Date",direction:"Direction",add:"Add",subtract:"Subtract",unit:"Unit",day:"Days",week:"Weeks",month:"Months",year:"Years",quantity:"Quantity",calculate:"Calculate",reset:"Reset",quick:"Quick calculations",quickHint:"Common date shifts",result:"Result Date",copy:"Copy result",copied:"Result copied.",empty:"Enter a start date and quantity.",invalid:"Enter a valid date and a non-negative whole number.",range:`Quantity must be an integer up to ${TOOL046_LIMITS.maxQuantity.toLocaleString()}.`,dateRange:"The result is outside the supported date range.",weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],summary:(d:string,u:string,q:number)=>`${d} ${q} ${u}`,presets:[["+7 days","day",7],["+30 days","day",30],["+90 days","day",90],["+6 months","month",6],["+1 year","year",1]] as const},
  ja:{local:"日付と計算結果はブラウザ内だけで処理され、サーバーへ送信・保存されません。",start:"開始日",direction:"方向",add:"加算",subtract:"減算",unit:"単位",day:"日",week:"週",month:"か月",year:"年",quantity:"数量",calculate:"計算",reset:"リセット",quick:"クイック計算",quickHint:"よく使う日付移動",result:"計算結果",copy:"結果をコピー",copied:"結果をコピーしました。",empty:"開始日と数量を入力してください。",invalid:"有効な日付と0以上の整数を入力してください。",range:`数量は${TOOL046_LIMITS.maxQuantity.toLocaleString()}以下の整数にしてください。`,dateRange:"計算結果が対応日付範囲を超えています。",weekdays:["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],summary:(d:string,u:string,q:number)=>`${d} ${q}${u}`,presets:[["+7日","day",7],["+30日","day",30],["+90日","day",90],["+6か月","month",6],["+1年","year",1]] as const}
} satisfies Record<Locale, any>;

export function DateAddSubtractCalculatorTool({locale}:{locale:Locale}){
  const t=copy[locale]; const [startDate,setStartDate]=useState(""); const [direction,setDirection]=useState<DateDirection>("add"); const [unit,setUnit]=useState<DateUnit>("day"); const [quantity,setQuantity]=useState("7"); const [result,setResult]=useState(""); const [error,setError]=useState(""); const [status,setStatus]=useState("");
  const weekday=useMemo(()=>result?t.weekdays[weekdayIndex(result)]:"",[result,t.weekdays]);
  const unitLabel=unit==="day"?t.day:unit==="week"?t.week:unit==="month"?t.month:t.year;
  function run(nextDirection=direction,nextUnit=unit,nextQuantity=quantity){setStatus("");setError("");if(!startDate||nextQuantity===""){setResult("");setError(t.empty);return;}const n=Number(nextQuantity);if(!Number.isInteger(n)||n<0){setResult("");setError(t.invalid);return;}if(n>TOOL046_LIMITS.maxQuantity){setResult("");setError(t.range);return;}try{setResult(calculateDate(startDate,nextDirection,nextUnit,n));}catch(e){setResult("");setError(e instanceof RangeError?t.dateRange:t.invalid);}}
  function reset(){setStartDate("");setDirection("add");setUnit("day");setQuantity("7");setResult("");setError("");setStatus("");}
  async function copyResult(){if(!result)return;await navigator.clipboard.writeText(`${result} ${weekday}`);setStatus(t.copied);}
  return <div className={styles.root} data-testid="tool046-root">
    <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
    <section className={styles.workspace} aria-label={t.calculate} data-testid="tool046-workspace">
      <div className={styles.inputCard}>
        <div className={styles.inputGrid}>
          <label className={styles.field}>{t.start}<input type="date" value={startDate} min="0001-01-01" max="9999-12-31" onChange={e=>setStartDate(e.target.value)} data-testid="tool046-start-date"/></label>
          <label className={styles.field}>{t.direction}<select value={direction} onChange={e=>setDirection(e.target.value as DateDirection)} data-testid="tool046-direction"><option value="add">{t.add}</option><option value="subtract">{t.subtract}</option></select></label>
          <label className={styles.field}>{t.unit}<select value={unit} onChange={e=>setUnit(e.target.value as DateUnit)} data-testid="tool046-unit"><option value="day">{t.day}</option><option value="week">{t.week}</option><option value="month">{t.month}</option><option value="year">{t.year}</option></select></label>
          <label className={styles.field}>{t.quantity}<input inputMode="numeric" type="number" min="0" max={TOOL046_LIMITS.maxQuantity} step="1" value={quantity} onChange={e=>setQuantity(e.target.value)} data-testid="tool046-quantity"/></label>
        </div>
        <div className={styles.actionRow}><button type="button" className={styles.button} onClick={reset} data-testid="tool046-reset">{t.reset}</button><button type="button" className={styles.primaryButton} onClick={()=>run()} data-testid="tool046-calculate">{t.calculate}</button></div>
        {error&&<p className={styles.error} role="alert" data-testid="tool046-error">{error}</p>}
      </div>
      <div className={styles.presetCard}><div className={styles.presetHead}><strong>{t.quick}</strong><span>{t.quickHint}</span></div><div className={styles.presetGrid}>{t.presets.map(([label,u,q])=><button type="button" className={styles.presetButton} key={label} onClick={()=>{setDirection("add");setUnit(u as DateUnit);setQuantity(String(q));run("add",u as DateUnit,String(q));}}>{label}</button>)}</div></div>
      <section className={styles.resultCard} aria-live="polite" data-testid="tool046-result"><p className={styles.resultLabel}>{t.result}</p>{result?<><p className={styles.resultDate} data-testid="tool046-result-date">{result}</p><p className={styles.weekday} data-testid="tool046-weekday">{weekday}</p><p className={styles.summary}>{t.summary(direction==="add"?t.add:t.subtract,unitLabel,Number(quantity))}</p><div className={styles.actionRow}><button type="button" className={styles.button} onClick={copyResult} data-testid="tool046-copy">{t.copy}</button></div>{status&&<p className={styles.status} role="status">{status}</p>}</>:<p className={styles.hint}>{t.empty}</p>}</section>
    </section>
  </div>;
}
