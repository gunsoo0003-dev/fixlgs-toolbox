"use client";

import { useMemo, useState } from "react";
import {
  TOOL051_LIMITS,
  addOrSubtractTime,
  format12,
  format24,
  timeDifference,
  twelveToTwentyFour,
  twentyFourToTwelve,
  type ClockTime,
  type DurationParts,
} from "@/lib/tool-051-time-calculator";
import styles from "./tool-051-time-calculator.module.css";

type Locale = "ko" | "en" | "ja";
type Mode = "arithmetic" | "difference" | "convert";
type DisplayFormat = "24" | "12";

const text = {
  ko: {
    modes: ["시간 더하기·빼기", "두 시각 차이", "12·24시간 변환"],
    local: "입력한 시각과 계산값은 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.",
    workspace: "TIME WORKSPACE", choose: "계산할 시간과 방식을 입력하세요", reset: "초기화", result: "RESULT",
    base: "기준 시각", operation: "연산", add: "더하기 (+)", subtract: "빼기 (−)", duration: "시간량",
    hours: "시간", minutes: "분", seconds: "초", start: "시작 시각", end: "종료 시각", cross: "자정 넘김",
    crossHelp: "종료 시각이 더 이르면 다음 날 종료로 계산합니다.", now: "현재 시각", display: "결과 형식",
    convertInput: "입력 형식", timeValue: "시간값", am: "AM", pm: "PM", copy: "결과 복사", copied: "복사됨",
    copyFail: "복사에 실패했습니다. 결과를 직접 선택해 복사하세요.", invalid: "시간 입력 범위를 확인하세요.",
    crossRequired: "종료 시각이 시작 시각보다 이릅니다. 자정 넘김을 켜거나 종료 시각을 확인하세요.",
    nextDay: "다음 날", previousDay: "이전 날", daysLater: "일 후", daysEarlier: "일 전", totalMinutes: "총 분",
    midnightHint: "다음 날로 계산하려면 자정 넘김을 켜세요.", twelveHelp: "12 AM은 자정(00:00), 12 PM은 정오(12:00)입니다.",
  },
  en: {
    modes: ["Add/Subtract Time", "Time Difference", "12/24-hour Conversion"],
    local: "Times and calculation values stay in this browser and are not sent to or stored on a server.",
    workspace: "TIME WORKSPACE", choose: "Enter a time and calculation method", reset: "Reset", result: "RESULT",
    base: "Base time", operation: "Operation", add: "Add (+)", subtract: "Subtract (−)", duration: "Duration",
    hours: "Hours", minutes: "Minutes", seconds: "Seconds", start: "Start time", end: "End time", cross: "Cross midnight",
    crossHelp: "When the end time is earlier, treat it as the next day.", now: "Now", display: "Result format",
    convertInput: "Input format", timeValue: "Time", am: "AM", pm: "PM", copy: "Copy result", copied: "Copied",
    copyFail: "Copy failed. Select the result and copy it manually.", invalid: "Check the supported time range.",
    crossRequired: "The end time is earlier than the start. Enable Cross midnight or check the end time.",
    nextDay: "next day", previousDay: "previous day", daysLater: "days later", daysEarlier: "days earlier", totalMinutes: "Total minutes",
    midnightHint: "Enable Cross midnight to calculate into the next day.", twelveHelp: "12 AM is midnight (00:00); 12 PM is noon (12:00).",
  },
  ja: {
    modes: ["時間の加算・減算", "時刻の差", "12・24時間制変換"],
    local: "入力した時刻と計算値はサーバーへ送信・保存せず、このブラウザ内だけで計算します。",
    workspace: "TIME WORKSPACE", choose: "時刻と計算方法を入力してください", reset: "リセット", result: "RESULT",
    base: "基準時刻", operation: "演算", add: "加算 (+)", subtract: "減算 (−)", duration: "時間量",
    hours: "時間", minutes: "分", seconds: "秒", start: "開始時刻", end: "終了時刻", cross: "日付をまたぐ",
    crossHelp: "終了時刻が早い場合は翌日の終了として計算します。", now: "現在時刻", display: "結果形式",
    convertInput: "入力形式", timeValue: "時刻", am: "AM", pm: "PM", copy: "結果をコピー", copied: "コピー済み",
    copyFail: "コピーに失敗しました。結果を選択してコピーしてください。", invalid: "時刻の入力範囲を確認してください。",
    crossRequired: "終了時刻が開始時刻より早いです。「日付をまたぐ」を有効にするか終了時刻を確認してください。",
    nextDay: "翌日", previousDay: "前日", daysLater: "日後", daysEarlier: "日前", totalMinutes: "合計分",
    midnightHint: "翌日として計算するには「日付をまたぐ」を有効にしてください。", twelveHelp: "12 AMは深夜0時(00:00)、12 PMは正午(12:00)です。",
  },
} as const;

function timeNow(): ClockTime {
  const d = new Date();
  return { hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds() };
}
function clockFromString(value: string, second = 0): ClockTime | null {
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const v = { hour: Number(m[1]), minute: Number(m[2]), second };
  return v.hour <= 23 && v.minute <= 59 && second <= 59 ? v : null;
}
function durationFromStrings(hours: string, minutes: string, seconds: string): DurationParts | null {
  const v = { hours: Number(hours), minutes: Number(minutes), seconds: Number(seconds) };
  if (![hours, minutes, seconds].every(x => /^\d+$/.test(x))) return null;
  if (!Number.isInteger(v.hours) || v.hours < 0 || v.hours > TOOL051_LIMITS.maxDurationHours || v.minutes < 0 || v.minutes > 59 || v.seconds < 0 || v.seconds > 59) return null;
  return v;
}
function durationLabel(locale: Locale, d: DurationParts, includeSeconds: boolean) {
  if (locale === "ko") return `${d.hours}시간 ${d.minutes}분${includeSeconds ? ` ${d.seconds}초` : ""}`;
  if (locale === "ja") return `${d.hours}時間 ${d.minutes}分${includeSeconds ? ` ${d.seconds}秒` : ""}`;
  return `${d.hours} hr ${d.minutes} min${includeSeconds ? ` ${d.seconds} sec` : ""}`;
}

export function Tool051TimeCalculator({ locale }: { locale: Locale }) {
  const t = text[locale];
  const [mode, setMode] = useState<Mode>("arithmetic");
  const [base, setBase] = useState("09:25");
  const [baseSecond, setBaseSecond] = useState("0");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [durationHours, setDurationHours] = useState("2");
  const [durationMinutes, setDurationMinutes] = useState("40");
  const [durationSeconds, setDurationSeconds] = useState("0");
  const [start, setStart] = useState("09:20");
  const [startSecond, setStartSecond] = useState("0");
  const [end, setEnd] = useState("17:55");
  const [endSecond, setEndSecond] = useState("0");
  const [crossMidnight, setCrossMidnight] = useState(false);
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("24");
  const [convertFormat, setConvertFormat] = useState<DisplayFormat>("12");
  const [convert24, setConvert24] = useState("19:30");
  const [convertSecond, setConvertSecond] = useState("0");
  const [convertHour12, setConvertHour12] = useState("7");
  const [convertMinute12, setConvertMinute12] = useState("30");
  const [convertSecond12, setConvertSecond12] = useState("0");
  const [period, setPeriod] = useState<"AM" | "PM">("PM");
  const [copyState, setCopyState] = useState("");
  const [copyFallback, setCopyFallback] = useState("");

  const arithmetic = useMemo(() => {
    try {
      const b = clockFromString(base, Number(baseSecond));
      const d = durationFromStrings(durationHours, durationMinutes, durationSeconds);
      if (!b || !d) return { error: t.invalid } as const;
      return { value: addOrSubtractTime(b, d, operation), includeSeconds: b.second !== 0 || d.seconds !== 0 } as const;
    } catch { return { error: t.invalid } as const; }
  }, [base, baseSecond, durationHours, durationMinutes, durationSeconds, operation, t.invalid]);

  const difference = useMemo(() => {
    try {
      const s = clockFromString(start, Number(startSecond));
      const e = clockFromString(end, Number(endSecond));
      if (!s || !e) return { error: t.invalid } as const;
      const value = timeDifference(s, e, crossMidnight);
      return { value, includeSeconds: s.second !== 0 || e.second !== 0 } as const;
    } catch (error) {
      return { error: error instanceof RangeError && error.message === "CROSS_MIDNIGHT_REQUIRED" ? t.crossRequired : t.invalid } as const;
    }
  }, [start, startSecond, end, endSecond, crossMidnight, t.crossRequired, t.invalid]);

  const conversion = useMemo(() => {
    try {
      if (convertFormat === "12") {
        const c = twelveToTwentyFour(Number(convertHour12), Number(convertMinute12), Number(convertSecond12), period);
        return { primary: format24(c, Number(convertSecond12) !== 0), secondary: `${convertHour12}:${String(Number(convertMinute12)).padStart(2,"0")}${Number(convertSecond12)!==0?`:${String(Number(convertSecond12)).padStart(2,"0")}`:""} ${period}` } as const;
      }
      const c = clockFromString(convert24, Number(convertSecond));
      if (!c) return { error: t.invalid } as const;
      const twelve = twentyFourToTwelve(c);
      return { primary: format12(c, Number(convertSecond) !== 0), secondary: format24(c, Number(convertSecond) !== 0), twelve } as const;
    } catch { return { error: t.invalid } as const; }
  }, [convertFormat, convertHour12, convertMinute12, convertSecond12, convert24, convertSecond, period, t.invalid]);

  const setNow = (target: "base" | "start" | "end") => {
    const n = timeNow(); const value = `${String(n.hour).padStart(2,"0")}:${String(n.minute).padStart(2,"0")}`;
    if (target === "base") { setBase(value); setBaseSecond(String(n.second)); }
    if (target === "start") { setStart(value); setStartSecond(String(n.second)); }
    if (target === "end") { setEnd(value); setEndSecond(String(n.second)); }
  };

  const resultSummary = () => {
    if (mode === "arithmetic" && arithmetic.value !== undefined) {
      const formatted = displayFormat === "24" ? format24(arithmetic.value, arithmetic.includeSeconds) : format12(arithmetic.value, arithmetic.includeSeconds);
      const offset = arithmetic.value.dayOffset;
      const suffix = offset === 0 ? "" : locale === "ko" ? ` · ${Math.abs(offset) === 1 ? (offset > 0 ? t.nextDay : t.previousDay) : `${Math.abs(offset)}${offset > 0 ? t.daysLater : t.daysEarlier}`}` : locale === "ja" ? ` · ${Math.abs(offset) === 1 ? (offset > 0 ? t.nextDay : t.previousDay) : `${Math.abs(offset)}${offset > 0 ? t.daysLater : t.daysEarlier}`}` : ` · ${Math.abs(offset) === 1 ? (offset > 0 ? t.nextDay : t.previousDay) : `${Math.abs(offset)} ${offset > 0 ? t.daysLater : t.daysEarlier}`}`;
      return `${formatted}${suffix}`;
    }
    if (mode === "difference" && difference.value !== undefined) return durationLabel(locale, difference.value, difference.includeSeconds);
    if (mode === "convert" && "primary" in conversion) return `${conversion.secondary} → ${conversion.primary}`;
    return "";
  };

  const copy = async () => {
    const line = resultSummary(); if (!line) return;
    try { await navigator.clipboard.writeText(line); setCopyFallback(""); setCopyState(t.copied); window.setTimeout(() => setCopyState(""), 1400); }
    catch { setCopyState(t.copyFail); setCopyFallback(line); }
  };

  const reset = () => {
    setMode("arithmetic"); setBase("09:25"); setBaseSecond("0"); setOperation("add"); setDurationHours("2"); setDurationMinutes("40"); setDurationSeconds("0");
    setStart("09:20"); setStartSecond("0"); setEnd("17:55"); setEndSecond("0"); setCrossMidnight(false); setDisplayFormat("24");
    setConvertFormat("12"); setConvert24("19:30"); setConvertSecond("0"); setConvertHour12("7"); setConvertMinute12("30"); setConvertSecond12("0"); setPeriod("PM"); setCopyState(""); setCopyFallback("");
  };

  const error = mode === "arithmetic" ? ("error" in arithmetic ? arithmetic.error : "") : mode === "difference" ? ("error" in difference ? difference.error : "") : ("error" in conversion ? conversion.error : "");

  return <div className={styles.root} data-testid="tool051-root">
    <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>
    <div className={styles.modeRow} role="tablist" aria-label="Mode">
      {(["arithmetic","difference","convert"] as Mode[]).map((m,i)=><button type="button" key={m} role="tab" aria-selected={mode===m} data-testid={`tool051-mode-${m}`} className={`${styles.modeButton} ${mode===m?styles.modeButtonActive:""}`} onClick={()=>{setMode(m);setCopyState("");setCopyFallback("");}}>{t.modes[i]}</button>)}
    </div>
    <section className={styles.workspace} data-testid="tool051-workspace">
      <div className={styles.card}>
        {mode === "arithmetic" && <div className={styles.inputGrid}>
          <label className={styles.field}><span>{t.base}</span><div className={styles.inline}><input data-testid="tool051-base" type="time" value={base} onChange={e=>setBase(e.target.value)}/><button type="button" className={styles.button} onClick={()=>setNow("base")}>{t.now}</button></div></label>
          <label className={styles.field}><span>{t.operation}</span><select data-testid="tool051-operation" value={operation} onChange={e=>setOperation(e.target.value as "add"|"subtract")}><option value="add">{t.add}</option><option value="subtract">{t.subtract}</option></select></label>
          <div className={`${styles.field} ${styles.durationField}`}><span>{t.duration}</span><div className={styles.durationGrid}><label><span>{t.hours}</span><input data-testid="tool051-duration-hours" type="number" min="0" max={TOOL051_LIMITS.maxDurationHours} value={durationHours} onChange={e=>setDurationHours(e.target.value)}/></label><label><span>{t.minutes}</span><input data-testid="tool051-duration-minutes" type="number" min="0" max="59" value={durationMinutes} onChange={e=>setDurationMinutes(e.target.value)}/></label><label><span>{t.seconds}</span><input data-testid="tool051-duration-seconds" type="number" min="0" max="59" value={durationSeconds} onChange={e=>setDurationSeconds(e.target.value)}/></label></div></div>
          <label className={styles.field}><span>{t.display}</span><select data-testid="tool051-display-format" value={displayFormat} onChange={e=>setDisplayFormat(e.target.value as DisplayFormat)}><option value="24">24-hour</option><option value="12">12-hour</option></select></label>
        </div>}

        {mode === "difference" && <div className={styles.inputGrid}>
          <label className={styles.field}><span>{t.start}</span><div className={styles.inline}><input data-testid="tool051-start" type="time" value={start} onChange={e=>setStart(e.target.value)}/><button type="button" className={styles.button} onClick={()=>setNow("start")}>{t.now}</button></div></label>
          <label className={styles.field}><span>{t.end}</span><div className={styles.inline}><input data-testid="tool051-end" type="time" value={end} onChange={e=>setEnd(e.target.value)}/><button type="button" className={styles.button} onClick={()=>setNow("end")}>{t.now}</button></div></label>
          <label className={`${styles.toggleField} ${crossMidnight?styles.toggleFieldActive:""}`}><input data-testid="tool051-cross-midnight" type="checkbox" role="switch" aria-checked={crossMidnight} checked={crossMidnight} onChange={e=>setCrossMidnight(e.target.checked)}/><span><strong>{t.cross}</strong><small>{t.crossHelp}</small></span></label>
        </div>}

        {mode === "convert" && <div className={styles.inputGrid}>
          <label className={styles.field}><span>{t.convertInput}</span><select data-testid="tool051-convert-format" value={convertFormat} onChange={e=>setConvertFormat(e.target.value as DisplayFormat)}><option value="12">12-hour</option><option value="24">24-hour</option></select></label>
          {convertFormat === "24" ? <label className={styles.field}><span>{t.timeValue}</span><input data-testid="tool051-convert-24" type="time" value={convert24} onChange={e=>setConvert24(e.target.value)}/></label> : <div className={`${styles.field} ${styles.durationField}`}><span>{t.timeValue}</span><div className={styles.convertGrid}><label><span>{t.hours}</span><input data-testid="tool051-convert-hour12" type="number" min="1" max="12" value={convertHour12} onChange={e=>setConvertHour12(e.target.value)}/></label><label><span>{t.minutes}</span><input data-testid="tool051-convert-minute12" type="number" min="0" max="59" value={convertMinute12} onChange={e=>setConvertMinute12(e.target.value)}/></label><label><span>AM/PM</span><select data-testid="tool051-period" value={period} onChange={e=>setPeriod(e.target.value as "AM"|"PM")}><option>AM</option><option>PM</option></select></label></div></div>}
          <div className={styles.help}>{t.twelveHelp}</div>
        </div>}
        {error && <div className={styles.error} role="alert" data-testid="tool051-error">{error}</div>}
        <div className={styles.actionRow}><button type="button" className={styles.button} data-testid="tool051-reset" onClick={reset}>{t.reset}</button></div>
      </div>

      <section className={styles.resultCard} data-testid="tool051-result" aria-live="polite">
        <div className={styles.resultHead}><p className={styles.resultLabel}>{t.result}</p><button type="button" className={styles.button} data-testid="tool051-copy" onClick={copy} disabled={Boolean(error)}>{t.copy}</button></div>
        {!error && <>
          <p className={styles.resultValue} data-testid="tool051-result-value">{resultSummary()}</p>
          {mode === "difference" && difference.value !== undefined && <p className={styles.resultSub}>{t.totalMinutes}: {difference.value.hours*60+difference.value.minutes}{difference.includeSeconds?` · ${difference.value.seconds}s`:""}</p>}
        </>}
        {mode === "difference" && error === t.crossRequired && <p className={styles.hint}>{t.midnightHint}</p>}
        {copyState && <p className={styles.copyState}>{copyState}</p>}
        {copyFallback && <output className={styles.copyFallback}>{copyFallback}</output>}
      </section>
    </section>
  </div>;
}
