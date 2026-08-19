"use client";

import { useMemo, useState } from "react";
import {
  TOOL047_SERVICE_LIMITS,
  addDays,
  anniversaryMilestones,
  anniversaryYears,
  birthdayResult,
  ddayStatus,
  isSupportedDate,
} from "@/lib/tool-047-dday";
import styles from "./tool-047-dday-anniversary-tool.module.css";

const text = {
  ko: {
    dday: "D-day", birthday: "생일까지", anniversary: "기념일", ref: "기준일", target: "목표일", start: "시작일",
    event: "이벤트명", birthdayInput: "생일 (MM-DD)", today: "오늘", tomorrow: "내일", d7: "7일 후", d30: "30일 후",
    d100: "100일 후", copy: "결과 복사", reset: "초기화", next: "다음 생일까지", milestone: "기념일 날짜", year: "주년",
    invalid: "날짜와 입력 범위를 확인하세요.", customInvalid: "사용자 milestone은 1~10,000 사이의 정수만 입력하세요.",
    copyDone: "복사됨", copyFail: "복사에 실패했습니다. 아래 결과를 직접 선택해 복사하세요.", weeks: "주", days: "일",
    remaining: "남음", elapsed: "지남", outside: "서비스 범위 밖", nextLeap: "다음 윤년",
    local: "선택한 날짜와 이벤트명은 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 계산합니다.", workspace: "DATE WORKSPACE", choose: "날짜와 기념일 조건을 선택하세요", result: "RESULT",
  },
  en: {
    dday: "D-Day", birthday: "Birthday", anniversary: "Anniversary", ref: "Reference date", target: "Target date", start: "Start date",
    event: "Event name", birthdayInput: "Birthday (MM-DD)", today: "Today", tomorrow: "Tomorrow", d7: "7 days", d30: "30 days",
    d100: "100 days", copy: "Copy result", reset: "Reset", next: "Next birthday", milestone: "Milestones", year: " anniversary",
    invalid: "Check the date and supported input range.", customInvalid: "Custom milestone must be a whole number from 1 to 10,000.",
    copyDone: "Copied", copyFail: "Copy failed. Select the result below and copy it manually.", weeks: "wk", days: "day",
    remaining: "remaining", elapsed: "past", outside: "Outside service range", nextLeap: "Next leap year",
    local: "Selected dates and event names are calculated only in this browser and are not sent to or stored on a server.", workspace: "DATE WORKSPACE", choose: "Choose dates and anniversary options", result: "RESULT",
  },
  ja: {
    dday: "Dデイ", birthday: "誕生日まで", anniversary: "記念日", ref: "基準日", target: "目標日", start: "開始日",
    event: "イベント名", birthdayInput: "誕生日 (MM-DD)", today: "今日", tomorrow: "明日", d7: "7日後", d30: "30日後",
    d100: "100日後", copy: "結果をコピー", reset: "リセット", next: "次の誕生日まで", milestone: "記念日の日付", year: "周年",
    invalid: "日付と対応範囲を確認してください。", customInvalid: "マイルストーンは1〜10,000の整数で入力してください。",
    copyDone: "コピー済み", copyFail: "コピーに失敗しました。下の結果を選択してコピーしてください。", weeks: "週", days: "日",
    remaining: "後", elapsed: "経過", outside: "対応範囲外", nextLeap: "次のうるう年",
    local: "選択した日付とイベント名はサーバーへ送信・保存せず、このブラウザ内だけで計算します。", workspace: "DATE WORKSPACE", choose: "日付と記念日の条件を選択してください", result: "RESULT",
  },
} as const;

type Locale = keyof typeof text;
type Mode = "dday" | "birthday" | "anniversary";

function localDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateLabel(locale: Locale, value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric", month: "long", day: "numeric", weekday: "short", timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function dayBreakdown(locale: Locale, days: number) {
  const t = text[locale];
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  if (locale === "ko") return `${weeks}${t.weeks} ${rest}${t.days}`;
  if (locale === "ja") return `${weeks}${t.weeks}${rest}${t.days}`;
  return `${weeks} ${t.weeks} ${rest} ${t.days}${rest === 1 ? "" : "s"}`;
}

export function Tool047DdayAnniversaryTool({ locale }: { locale: Locale }) {
  const t = text[locale];
  const today = useMemo(localDateString, []);
  const [mode, setMode] = useState<Mode>("dday");
  const [reference, setReference] = useState(today);
  const [target, setTarget] = useState(today);
  const [start, setStart] = useState(today);
  const [birthday, setBirthday] = useState("05-21");
  const [eventName, setEventName] = useState("");
  const [customMilestone, setCustomMilestone] = useState("");
  const [copyState, setCopyState] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [actionError, setActionError] = useState("");

  const dday = useMemo(() => {
    if (mode !== "dday" || !isSupportedDate(reference) || !isSupportedDate(target)) return null;
    try { return ddayStatus(reference, target); } catch { return null; }
  }, [mode, reference, target]);

  const birthdayData = useMemo(() => {
    if (mode !== "birthday" || !isSupportedDate(reference)) return null;
    try { return birthdayResult(reference, birthday); } catch { return null; }
  }, [mode, reference, birthday]);

  const customValue = customMilestone === "" ? null : Number(customMilestone);
  const customValid = customValue === null || (Number.isInteger(customValue) && customValue >= TOOL047_SERVICE_LIMITS.minMilestone && customValue <= TOOL047_SERVICE_LIMITS.maxMilestone);

  const milestones = useMemo(() => {
    if (mode !== "anniversary" || !isSupportedDate(start) || !customValid) return [];
    const extra = customValue === null ? [] : [customValue];
    return anniversaryMilestones(start, [100, 200, 300, 365, 500, 1000, ...extra]);
  }, [mode, start, customValid, customValue]);

  const years = useMemo(() => {
    if (mode !== "anniversary" || !isSupportedDate(start)) return [];
    try { return anniversaryYears(start, 5); } catch { return []; }
  }, [mode, start]);

  const computedError = mode === "dday"
    ? (!isSupportedDate(reference) || !isSupportedDate(target) ? t.invalid : "")
    : mode === "birthday"
      ? (!isSupportedDate(reference) || birthdayData === null ? t.invalid : "")
      : (!isSupportedDate(start) ? t.invalid : !customValid ? t.customInvalid : "");
  const error = actionError || computedError;

  const quick = (days: number) => {
    try {
      setTarget(addDays(reference, days));
      setMode("dday");
      setActionError("");
      setCopyState("");
      setCopyFallback("");
    } catch {
      setActionError(t.invalid);
    }
  };

  const summaryLine = () => {
    const name = eventName.trim();
    const prefix = name ? `${name} - ` : "";
    if (mode === "dday" && dday) return `${prefix}${dday.label} (${dateLabel(locale, target)})`;
    if (mode === "birthday" && birthdayData) return `${prefix}${birthdayData.status.label} (${dateLabel(locale, birthdayData.date)})`;
    if (mode === "anniversary" && isSupportedDate(start) && customValid) return `${prefix}${t.milestone} (${dateLabel(locale, start)})`;
    return "";
  };

  const copy = async () => {
    const line = summaryLine();
    if (!line) { setActionError(computedError || t.invalid); return; }
    setActionError("");
    try {
      await navigator.clipboard.writeText(line);
      setCopyFallback("");
      setCopyState(t.copyDone);
      window.setTimeout(() => setCopyState(""), 1400);
    } catch {
      setCopyState(t.copyFail);
      setCopyFallback(line);
    }
  };

  const reset = () => {
    setMode("dday");
    setReference(today);
    setTarget(today);
    setStart(today);
    setBirthday("05-21");
    setEventName("");
    setCustomMilestone("");
    setActionError("");
    setCopyState("");
    setCopyFallback("");
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setActionError("");
    setCopyState("");
    setCopyFallback("");
  };

  return (
    <div className={styles.tool} data-testid="tool047-root">
      <div className={styles.localNotice}><strong>LOCAL</strong><span>{t.local}</span></div>

      <div className={styles.modeRow} role="tablist" aria-label="Mode">
        <button type="button" role="tab" data-testid="tool047-mode-dday" className={`${styles.modeButton} ${mode === "dday" ? styles.modeButtonActive : ""}`} aria-selected={mode === "dday"} onClick={() => switchMode("dday")}>{t.dday}</button>
        <button type="button" role="tab" data-testid="tool047-mode-birthday" className={`${styles.modeButton} ${mode === "birthday" ? styles.modeButtonActive : ""}`} aria-selected={mode === "birthday"} onClick={() => switchMode("birthday")}>{t.birthday}</button>
        <button type="button" role="tab" data-testid="tool047-mode-anniversary" className={`${styles.modeButton} ${mode === "anniversary" ? styles.modeButtonActive : ""}`} aria-selected={mode === "anniversary"} onClick={() => switchMode("anniversary")}>{t.anniversary}</button>
      </div>

      <section className={styles.workspace} data-testid="tool047-workspace">
        <div className={styles.workspaceHead}>
          <div><span>{t.workspace}</span><h2>{t.choose}</h2></div>
          <button type="button" data-testid="tool047-reset" className={styles.resetButton} onClick={reset}>{t.reset}</button>
        </div>

        <div className={styles.fields}>
          {mode !== "anniversary" && <label className={styles.field} htmlFor="tool047-reference"><span>{t.ref}</span><input id="tool047-reference" data-testid="tool047-reference" type="date" min={TOOL047_SERVICE_LIMITS.minDate} max={TOOL047_SERVICE_LIMITS.maxDate} value={reference} onChange={(e) => { setReference(e.target.value); setActionError(""); }} /></label>}
          {mode === "dday" && <label className={styles.field} htmlFor="tool047-target"><span>{t.target}</span><input id="tool047-target" data-testid="tool047-target" type="date" min={TOOL047_SERVICE_LIMITS.minDate} max={TOOL047_SERVICE_LIMITS.maxDate} value={target} onChange={(e) => { setTarget(e.target.value); setActionError(""); }} /></label>}
          {mode === "birthday" && <label className={styles.field} htmlFor="tool047-birthday"><span>{t.birthdayInput}</span><input id="tool047-birthday" data-testid="tool047-birthday" type="text" inputMode="numeric" pattern="\d{2}-\d{2}" placeholder="05-21" value={birthday} onChange={(e) => { setBirthday(e.target.value); setActionError(""); }} /></label>}
          {mode === "anniversary" && <label className={styles.field} htmlFor="tool047-start"><span>{t.start}</span><input id="tool047-start" data-testid="tool047-start" type="date" min={TOOL047_SERVICE_LIMITS.minDate} max={TOOL047_SERVICE_LIMITS.maxDate} value={start} onChange={(e) => { setStart(e.target.value); setActionError(""); }} /></label>}
          <label className={styles.field} htmlFor="tool047-event"><span>{t.event}</span><input id="tool047-event" data-testid="tool047-event" type="text" maxLength={80} value={eventName} onChange={(e) => setEventName(e.target.value)} /></label>
          {mode === "anniversary" && <label className={styles.field} htmlFor="tool047-custom-milestone"><span>{locale === "ko" ? "사용자 milestone (1~10,000일)" : locale === "ja" ? "ユーザー指定マイルストーン (1〜10,000日)" : "Custom milestone (1-10,000 days)"}</span><input id="tool047-custom-milestone" data-testid="tool047-custom-milestone" type="number" min={TOOL047_SERVICE_LIMITS.minMilestone} max={TOOL047_SERVICE_LIMITS.maxMilestone} step={1} value={customMilestone} onChange={(e) => { setCustomMilestone(e.target.value); setActionError(""); }} /></label>}
        </div>

        {mode === "dday" && <div className={styles.presets}><button className={styles.preset} type="button" onClick={() => { setTarget(reference); setActionError(""); }}>{t.today}</button><button className={styles.preset} type="button" onClick={() => quick(1)}>{t.tomorrow}</button><button className={styles.preset} type="button" onClick={() => quick(7)}>{t.d7}</button><button className={styles.preset} type="button" onClick={() => quick(30)}>{t.d30}</button><button className={styles.preset} type="button" onClick={() => quick(100)}>{t.d100}</button></div>}

        {error && <div className={styles.error} role="alert" data-testid="tool047-error">{error}</div>}
      </section>

      <section className={styles.result} data-testid="tool047-result" aria-live="polite">
        <div className={styles.resultHead}><span>{t.result}</span><button type="button" data-testid="tool047-copy" className={styles.copyButton} onClick={copy}>{t.copy}</button></div>
        {mode === "dday" && <>
          <div className={styles.resultHero}><div><div className={styles.resultLabel}>D-DAY</div><div className={styles.resultValue}>{dday?.label ?? "—"}</div></div><div className={styles.resultDate}>{isSupportedDate(target) ? dateLabel(locale, target) : "—"}</div></div>
          {dday && <div className={styles.resultSub}>{dday.days === 0 ? (locale === "ko" ? "오늘입니다." : locale === "ja" ? "今日はDデイです。" : "Today is the target date.") : locale === "ko" ? `${dday.days}일 ${dday.sign === "D-" ? "남았습니다" : "지났습니다"} · ${dayBreakdown(locale, dday.days)}` : locale === "ja" ? `${dday.days}日${dday.sign === "D-" ? "後" : "経過"} · ${dayBreakdown(locale, dday.days)}` : `${dday.days} day${dday.days === 1 ? "" : "s"} ${dday.sign === "D-" ? t.remaining : t.elapsed} · ${dayBreakdown(locale, dday.days)}`}</div>}
        </>}

        {mode === "birthday" && <>
          <div className={styles.resultHero}><div><div className={styles.resultLabel}>{t.next}</div><div className={styles.resultValue}>{birthdayData?.status.label ?? "—"}</div></div><div className={styles.resultDate}>{birthdayData ? dateLabel(locale, birthdayData.date) : "—"}</div></div>
          {birthdayData && <div className={styles.resultSub}>{dayBreakdown(locale, birthdayData.status.days)}</div>}
        </>}

        {mode === "anniversary" && <>
          <div className={styles.resultHero}><div><div className={styles.resultLabel}>{t.milestone}</div><div className={styles.anniversaryStart}>{isSupportedDate(start) ? dateLabel(locale, start) : "—"}</div></div></div>
          <div className={styles.milestones}>
            {milestones.map((m) => <div className={styles.milestone} key={m.days}><strong>{m.days}</strong><span>{m.date ? dateLabel(locale, m.date) : t.outside}</span></div>)}
            {years.map((y) => <div className={styles.milestone} key={`y-${y.years}`}><strong>{y.years}{t.year}</strong><span>{y.date ? dateLabel(locale, y.date) : t.nextLeap}</span></div>)}
          </div>
        </>}

        {copyState && <div className={styles.copyState} data-testid="tool047-copy-status">{copyState}</div>}
        {copyFallback && <output className={styles.copyFallback} data-testid="tool047-copy-fallback">{copyFallback}</output>}
      </section>
    </div>
  );
}
