"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import {
  TOOL036_DEFAULT_WPM,
  TOOL036_MAX_GRAPHEMES,
  TOOL036_WPM_PRESETS,
  calculateTool036Statistics,
  limitTool036Text,
  type Tool036Statistics,
} from "@/lib/tool-036-text-statistics";
import styles from "./character-document-counter-tool.module.css";

const zero: Tool036Statistics = { charactersWithSpaces: 0, charactersWithoutSpaces: 0, words: 0, sentences: 0, paragraphs: 0, lines: 0, utf8Bytes: 0, readingSeconds: 0 };
const ACCEPTED_EXTENSIONS = ["txt", "md", "csv"] as const;

type LoadedFile = Readonly<{ name: string; size: number }>;

const copy = {
  ko: {
    local: "입력하거나 불러온 원문은 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 처리합니다.",
    eyebrow: "TEXT WORKSPACE", inputTitle: "텍스트를 입력·붙여넣거나 파일을 넣으세요", placeholder: "여기에 텍스트를 직접 입력하거나 붙여넣으세요…", inputMeta: "입력과 동시에 글자 수가 갱신됩니다.", privacy: "로컬 처리 · 서버 업로드 없음",
    dropHint: "TXT · MD · CSV 파일을 이 영역에 끌어다 놓아도 됩니다.", chooseFile: "텍스트 파일 선택", replaceFile: "새 파일 불러오기", loadedFile: "불러온 파일", supported: ".txt · .md · .csv",
    sample: "예시 넣기", clear: "전체 지우기", copyStats: "통계 복사", downloadText: "TXT 다운로드", copied: "통계를 복사했습니다.", copyFailed: "통계를 복사하지 못했습니다.",
    invalidFile: "TXT, MD, CSV 텍스트 파일만 사용할 수 있습니다.", readFailed: "파일 내용을 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.",
    replaceWarning: "새 파일을 불러오면 현재 작업 내용과 설정이 초기화됩니다. 계속하시겠습니까?", cancelReplace: "취소", confirmReplace: "확인",
    withSpaces: "글자 수 (공백 포함)", withoutSpaces: "글자 수 (공백 제외)", words: "단어 수", sentences: "문장 수", paragraphs: "문단 수", lines: "줄 수", bytes: "UTF-8 바이트", reading: "예상 읽기시간",
    options: "고급 옵션", optionsHelp: "목표 글자·단어 수 · 읽기 속도 · 계산 기준", goalMode: "목표 제한 사용", charGoal: "목표 글자 수", wordGoal: "목표 단어 수", readingSpeed: "읽기 속도", wpm: "단어/분",
    standardsTitle: "계산 기준", standards: ["글자 수는 사용자 인식 문자에 가까운 Unicode grapheme cluster 기준입니다.","공백 제외는 space·tab·줄바꿈 등 Unicode White_Space를 제거한 뒤 계산합니다.","단어·문장은 지원 브라우저에서 Intl.Segmenter의 언어별 경계를 사용합니다.","바이트 수는 UTF-8 기준이며 읽기시간은 선택한 WPM 기준의 예상치입니다."],
    remaining: (n:number)=>`${n.toLocaleString("ko-KR")}자 남음`, over: (n:number)=>`${n.toLocaleString("ko-KR")}자 초과`, wordRemaining:(n:number)=>`${n.toLocaleString("ko-KR")}단어 남음`, wordOver:(n:number)=>`${n.toLocaleString("ko-KR")}단어 초과`,
    sampleText: "FIXLGS TOOLBOX는 브라우저에서 빠르게 사용할 수 있는 도구 모음입니다.\n\n글자 수와 단어 수를 확인하고, 문서의 구조도 함께 살펴보세요.",
    live: "문서 통계가 갱신되었습니다.", limit: `최대 ${TOOL036_MAX_GRAPHEMES.toLocaleString("ko-KR")}자까지 입력할 수 있습니다. 초과분은 입력되지 않았습니다.`, limitMeta: `최대 ${TOOL036_MAX_GRAPHEMES.toLocaleString("ko-KR")}자`,
  },
  en: {
    local: "Text you type or load stays in this browser and is not sent to or stored on a server.",
    eyebrow: "TEXT WORKSPACE", inputTitle: "Type, paste, or drop a text file", placeholder: "Type or paste your text here…", inputMeta: "Character counts update as you type.", privacy: "Local processing · No server upload",
    dropHint: "You can also drop a TXT, MD, or CSV file anywhere in this workspace.", chooseFile: "Choose text file", replaceFile: "Load another file", loadedFile: "Loaded file", supported: ".txt · .md · .csv",
    sample: "Insert sample", clear: "Clear all", copyStats: "Copy statistics", downloadText: "Download TXT", copied: "Statistics copied.", copyFailed: "Could not copy statistics.",
    invalidFile: "Only TXT, MD, and CSV text files are supported.", readFailed: "Could not read this file. Please try another file.",
    replaceWarning: "Loading a new file will reset the current text and settings. Continue?", cancelReplace: "Cancel", confirmReplace: "Continue",
    withSpaces: "Characters (with spaces)", withoutSpaces: "Characters (without spaces)", words: "Words", sentences: "Sentences", paragraphs: "Paragraphs", lines: "Lines", bytes: "UTF-8 bytes", reading: "Estimated reading time",
    options: "Advanced options", optionsHelp: "Character / word goals · Reading speed · Counting rules", goalMode: "Use goals", charGoal: "Character goal", wordGoal: "Word goal", readingSpeed: "Reading speed", wpm: "words/min",
    standardsTitle: "Counting rules", standards: ["Characters use Unicode grapheme clusters, which are close to user-perceived characters.","Without-spaces removes Unicode White_Space such as spaces, tabs, and line breaks before counting.","Words and sentences use locale-aware Intl.Segmenter boundaries when the browser supports them.","Bytes are UTF-8 bytes, and reading time is an estimate based on the selected WPM."],
    remaining: (n:number)=>`${n.toLocaleString("en-US")} characters remaining`, over: (n:number)=>`${n.toLocaleString("en-US")} characters over`, wordRemaining:(n:number)=>`${n.toLocaleString("en-US")} words remaining`, wordOver:(n:number)=>`${n.toLocaleString("en-US")} words over`,
    sampleText: "FIXLGS TOOLBOX is a collection of fast browser-based utilities.\n\nCheck character and word counts, then review the structure of your document at a glance.",
    live: "Document statistics updated.", limit: `You can enter up to ${TOOL036_MAX_GRAPHEMES.toLocaleString("en-US")} characters. Extra characters were not entered.`, limitMeta: `Maximum ${TOOL036_MAX_GRAPHEMES.toLocaleString("en-US")} characters`,
  },
  ja: {
    local: "入力または読み込んだ原文はサーバーへ送信・保存せず、このブラウザ内だけで処理します。",
    eyebrow: "TEXT WORKSPACE", inputTitle: "入力・貼り付け・ファイル読込", placeholder: "ここにテキストを直接入力または貼り付けてください…", inputMeta: "入力と同時に文字数が更新されます。", privacy: "ローカル処理 · サーバー送信なし",
    dropHint: "TXT・MD・CSVファイルをこの作業エリアへドラッグ＆ドロップできます。", chooseFile: "テキストファイルを選択", replaceFile: "別のファイルを読み込む", loadedFile: "読み込んだファイル", supported: ".txt · .md · .csv",
    sample: "サンプルを入力", clear: "すべてクリア", copyStats: "統計をコピー", downloadText: "TXTダウンロード", copied: "統計をコピーしました。", copyFailed: "統計をコピーできませんでした。",
    invalidFile: "TXT・MD・CSVのテキストファイルのみ使用できます。", readFailed: "ファイルを読み込めませんでした。別のファイルで再試行してください。",
    replaceWarning: "新しいファイルを読み込むと、現在の入力内容と設定が初期化されます。続けますか？", cancelReplace: "キャンセル", confirmReplace: "確認",
    withSpaces: "文字数（空白を含む）", withoutSpaces: "文字数（空白を除く）", words: "単語数", sentences: "文数", paragraphs: "段落数", lines: "行数", bytes: "UTF-8バイト", reading: "推定読了時間",
    options: "詳細オプション", optionsHelp: "目標文字数・目標単語数 · 読む速度 · 計算基準", goalMode: "目標設定を使う", charGoal: "目標文字数", wordGoal: "目標単語数", readingSpeed: "読む速度", wpm: "語/分",
    standardsTitle: "計算基準", standards: ["文字数はユーザーが認識する文字に近いUnicode grapheme cluster基準です。","空白を除く文字数はspace・tab・改行などUnicode White_Spaceを除いて計算します。","単語・文は対応ブラウザでIntl.Segmenterによる言語別の境界を使用します。","バイト数はUTF-8基準、読了時間は選択したWPMによる推定値です。"],
    remaining: (n:number)=>`残り${n.toLocaleString("ja-JP")}文字`, over: (n:number)=>`${n.toLocaleString("ja-JP")}文字超過`, wordRemaining:(n:number)=>`残り${n.toLocaleString("ja-JP")}語`, wordOver:(n:number)=>`${n.toLocaleString("ja-JP")}語超過`,
    sampleText: "FIXLGS TOOLBOXはブラウザですぐ使える便利なツール集です。空白の少ない日本語でも単語や文の区切りを確認できます。\n\n文章の長さと構造を一度に確認してみましょう。",
    live: "文書統計を更新しました。", limit: `最大${TOOL036_MAX_GRAPHEMES.toLocaleString("ja-JP")}文字まで入力できます。超過分は入力されませんでした。`, limitMeta: `最大${TOOL036_MAX_GRAPHEMES.toLocaleString("ja-JP")}文字`,
  },
} as const;

function formatReadingTime(seconds: number, locale: Locale): string {
  if (seconds <= 0) return locale === "ja" ? "約0秒" : locale === "ko" ? "약 0초" : "About 0 sec";
  const minutes = Math.floor(seconds / 60); const rest = seconds % 60;
  if (locale === "ko") return minutes > 0 ? `약 ${minutes}분${rest ? ` ${rest}초` : ""}` : `약 ${rest}초`;
  if (locale === "ja") return minutes > 0 ? `約${minutes}分${rest ? `${rest}秒` : ""}` : `約${rest}秒`;
  return minutes > 0 ? `About ${minutes} min${rest ? ` ${rest} sec` : ""}` : `About ${rest} sec`;
}

function formatBytes(size: number, locale: Locale): string {
  if (size < 1024) return `${size.toLocaleString()} B`;
  const kb = size / 1024;
  return `${kb.toLocaleString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US", { maximumFractionDigits: 1 })} KB`;
}

function isSupportedTextFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number]);
}

function downloadName(file: LoadedFile | null): string {
  if (!file) return "text-statistics.txt";
  const base = file.name.replace(/\.[^.]+$/, "").trim() || "text";
  return `${base}-edited.txt`;
}

export function CharacterDocumentCounterTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [text, setText] = useState("");
  const [stats, setStats] = useState<Tool036Statistics>(zero);
  const [wpm, setWpm] = useState<number>(TOOL036_DEFAULT_WPM);
  const [goalMode, setGoalMode] = useState(false);
  const [characterGoal, setCharacterGoal] = useState<number | "">("");
  const [wordGoal, setWordGoal] = useState<number | "">("");
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [error, setError] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const composing = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const delay = window.setTimeout(() => setStats(calculateTool036Statistics(text, locale, wpm)), composing.current ? 180 : 120);
    return () => window.clearTimeout(delay);
  }, [text, locale, wpm]);

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => setCopyStatus(""), 1800);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const characterGoalState = useMemo(() => {
    if (!goalMode || characterGoal === "" || characterGoal <= 0) return null;
    const diff = characterGoal - stats.charactersWithSpaces;
    return { over: diff < 0, text: diff < 0 ? t.over(Math.abs(diff)) : t.remaining(diff) };
  }, [goalMode, characterGoal, stats.charactersWithSpaces, t]);

  const wordGoalState = useMemo(() => {
    if (!goalMode || wordGoal === "" || wordGoal <= 0) return null;
    const diff = wordGoal - stats.words;
    return { over: diff < 0, text: diff < 0 ? t.wordOver(Math.abs(diff)) : t.wordRemaining(diff) };
  }, [goalMode, wordGoal, stats.words, t]);

  const applyText = (value: string) => {
    const limited = limitTool036Text(value, locale);
    setText(limited.text);
    if (limited.truncated) { setError(t.limit); setCopyStatus(""); }
    else if (error === t.limit) setError("");
  };

  const hasCurrentWork = Boolean(text || loadedFile || goalMode || characterGoal !== "" || wordGoal !== "" || wpm !== TOOL036_DEFAULT_WPM);

  const loadFile = async (file: File) => {
    setDragActive(false);
    setCopyStatus("");
    try {
      const content = await file.text();
      const limited = limitTool036Text(content, locale);
      setText(limited.text);
      setLoadedFile({ name: file.name, size: file.size });
      setHasStarted(true);
      setWpm(TOOL036_DEFAULT_WPM);
      setGoalMode(false);
      setCharacterGoal("");
      setWordGoal("");
      setError(limited.truncated ? t.limit : "");
    } catch {
      setError(t.readFailed);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const requestFileLoad = (file: File) => {
    setDragActive(false);
    setCopyStatus("");
    if (!isSupportedTextFile(file)) {
      setError(t.invalidFile);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (hasCurrentWork) {
      setPendingFile(file);
      return;
    }
    void loadFile(file);
  };

  const cancelFileReplace = () => {
    setPendingFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const confirmFileReplace = () => {
    const file = pendingFile;
    setPendingFile(null);
    if (file) void loadFile(file);
  };

  const onDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault(); setDragActive(true);
  };
  const onDragOver = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDragActive(true);
  };
  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) setDragActive(false);
  };
  const onDrop = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault(); setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) requestFileLoad(file);
  };

  const copyStatistics = async () => {
    const lines = [
      `${t.withSpaces}: ${stats.charactersWithSpaces.toLocaleString()}`, `${t.withoutSpaces}: ${stats.charactersWithoutSpaces.toLocaleString()}`,
      `${t.words}: ${stats.words.toLocaleString()}`, `${t.sentences}: ${stats.sentences.toLocaleString()}`, `${t.paragraphs}: ${stats.paragraphs.toLocaleString()}`,
      `${t.lines}: ${stats.lines.toLocaleString()}`, `${t.bytes}: ${stats.utf8Bytes.toLocaleString()}`, `${t.reading}: ${formatReadingTime(stats.readingSeconds, locale)}`,
    ].join("\n");
    try { await navigator.clipboard.writeText(lines); setError(""); setCopyStatus(t.copied); }
    catch { setCopyStatus(""); setError(t.copyFailed); }
  };

  const downloadText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = downloadName(loadedFile); document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const clearAll = () => {
    setText(""); setStats(zero); setWpm(TOOL036_DEFAULT_WPM); setGoalMode(false); setCharacterGoal(""); setWordGoal(""); setLoadedFile(null); setHasStarted(false); setDragActive(false); setCopyStatus(""); setError(""); setPendingFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  return <div className={styles.root} data-testid="tool036-root">
    <div className={styles.localNotice} data-testid="tool036-local-notice"><strong>LOCAL</strong><span>{t.local}</span></div>
    <input ref={fileInput} className={styles.hiddenInput} type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" data-testid="tool036-file-input" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) requestFileLoad(file); }}/>

    <section className={`${styles.activeWorkspace} ${dragActive ? styles.workspaceDragging : ""}`} data-testid="tool036-workspace" data-drag-active={dragActive ? "true" : "false"} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={styles.editorCard} data-testid="tool036-input-zone">
        {loadedFile && <div className={styles.fileBar} data-testid="tool036-file-info"><div><span>{t.loadedFile}</span><strong>{loadedFile.name}</strong><small>{formatBytes(loadedFile.size, locale)} · {t.supported}</small></div><button type="button" className={styles.button} onClick={() => fileInput.current?.click()}>{t.replaceFile}</button></div>}

        <div className={styles.textareaShell} data-testid="tool036-textarea-shell">
          {!hasStarted && !loadedFile && <div className={styles.startDropzone} data-testid="tool036-start-dropzone">
            <span className={styles.plusIcon} aria-hidden="true">+</span>
            <h2 id="tool036-input-title">{t.inputTitle}</h2>
            <p>{t.dropHint}</p>
            <button type="button" className={styles.fileButton} onClick={() => fileInput.current?.click()} data-testid="tool036-file-button">{t.chooseFile}</button>
          </div>}
          <textarea className={`${styles.textarea} ${hasStarted || loadedFile ? styles.textareaLoaded : styles.textareaInitial}`} data-testid="tool036-textarea" value={text} placeholder={t.placeholder} aria-describedby="tool036-local-desc tool036-counting-desc"
            onCompositionStart={(event) => { composing.current = true; setHasStarted(true); setText(event.currentTarget.value); }}
            onCompositionEnd={(event) => { composing.current = false; setHasStarted(true); applyText(event.currentTarget.value); }}
            onChange={(event) => { setHasStarted(true); if (composing.current) setText(event.currentTarget.value); else applyText(event.currentTarget.value); }}/>
          <div className={styles.editorHead}><span>{t.inputMeta}</span><em>{t.supported}</em></div>
        </div>
        <span id="tool036-local-desc" className={styles.live}>{t.local}</span>
        <div className={styles.editorFoot}><p className={styles.privacy}>{t.privacy} · {t.limitMeta}</p><div className={styles.textActions}><button type="button" className={styles.button} onClick={() => { setLoadedFile(null); setHasStarted(true); applyText(t.sampleText); }} data-testid="tool036-sample">{t.sample}</button><button type="button" className={styles.button} onClick={clearAll} disabled={!text && !loadedFile && !goalMode && wpm === TOOL036_DEFAULT_WPM} data-testid="tool036-clear">{t.clear}</button></div></div>
      </div>

      <section className={styles.stats} aria-label={locale === "ko" ? "문서 통계" : locale === "ja" ? "文書統計" : "Document statistics"}>
        <div className={styles.coreGrid} data-testid="tool036-core-stats">
          <article className={styles.coreCard}><span>{t.withSpaces}</span><strong data-testid="tool036-chars-with">{stats.charactersWithSpaces.toLocaleString()}</strong>{characterGoalState && <p className={`${styles.goalState} ${characterGoalState.over ? styles.goalStateOver : styles.goalStateRemain}`}>{characterGoalState.text}</p>}</article>
          <article className={styles.coreCard}><span>{t.withoutSpaces}</span><strong data-testid="tool036-chars-without">{stats.charactersWithoutSpaces.toLocaleString()}</strong></article>
        </div>
        <div className={styles.secondaryGrid} data-testid="tool036-secondary-stats">
          <article className={styles.secondaryCard}><span>{t.words}</span><strong data-testid="tool036-words">{stats.words.toLocaleString()}</strong>{wordGoalState && <p className={`${styles.goalState} ${wordGoalState.over ? styles.goalStateOver : styles.goalStateRemain}`}>{wordGoalState.text}</p>}</article>
          <article className={styles.secondaryCard}><span>{t.sentences}</span><strong data-testid="tool036-sentences">{stats.sentences.toLocaleString()}</strong></article>
          <article className={styles.secondaryCard}><span>{t.paragraphs}</span><strong data-testid="tool036-paragraphs">{stats.paragraphs.toLocaleString()}</strong></article>
          <article className={styles.secondaryCard}><span>{t.lines}</span><strong data-testid="tool036-lines">{stats.lines.toLocaleString()}</strong></article>
          <article className={styles.secondaryCard}><span>{t.bytes}</span><strong data-testid="tool036-bytes">{stats.utf8Bytes.toLocaleString()}</strong></article>
          <article className={styles.secondaryCard}><span>{t.reading}</span><strong data-testid="tool036-reading-time">{formatReadingTime(stats.readingSeconds, locale)}</strong></article>
        </div>
      </section>

      <details className={styles.optionsCard} data-testid="tool036-options">
        <summary className={styles.optionsSummary}><span>{t.options}</span><em>{t.optionsHelp}</em></summary>
        <div className={styles.optionsBody}>
          <div className={styles.optionSection}><div className={styles.optionTitle}><strong>{locale === "ko" ? "목표 설정" : locale === "ja" ? "目標設定" : "Goals"}</strong><label className={styles.toggle}><input type="checkbox" checked={goalMode} onChange={(event) => setGoalMode(event.target.checked)} data-testid="tool036-goal-toggle"/>{t.goalMode}</label></div>{goalMode && <div className={styles.goalGrid} data-testid="tool036-goal-fields"><label className={styles.field}>{t.charGoal}<input type="number" min="1" step="1" inputMode="numeric" value={characterGoal} onChange={(event) => setCharacterGoal(event.target.value === "" ? "" : Math.max(1, Math.floor(Number(event.target.value))))} data-testid="tool036-character-goal"/></label><label className={styles.field}>{t.wordGoal}<input type="number" min="1" step="1" inputMode="numeric" value={wordGoal} onChange={(event) => setWordGoal(event.target.value === "" ? "" : Math.max(1, Math.floor(Number(event.target.value))))} data-testid="tool036-word-goal"/></label></div>}</div>
          <div className={styles.optionSection}><label className={styles.field}>{t.readingSpeed}<select value={wpm} onChange={(event) => setWpm(Number(event.target.value))} data-testid="tool036-wpm">{TOOL036_WPM_PRESETS.map((value) => <option value={value} key={value}>{value} {t.wpm}</option>)}</select></label></div>
          <div className={styles.optionSection} id="tool036-counting-desc"><strong>{t.standardsTitle}</strong><ul className={styles.standards}>{t.standards.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
      </details>

      <div className={styles.actionRow}><button type="button" className={styles.button} onClick={() => void copyStatistics()} disabled={!text} data-testid="tool036-copy-stats">{t.copyStats}</button><button type="button" className={styles.primaryButton} onClick={downloadText} disabled={!text} data-testid="tool036-download-text">{t.downloadText}</button></div>
    </section>

    {pendingFile && <div className={styles.dialogBackdrop} data-testid="tool036-replace-dialog-backdrop">
      <section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="tool036-replace-title" data-testid="tool036-replace-dialog">
        <h2 id="tool036-replace-title">{t.replaceFile}</h2>
        <p>{t.replaceWarning}</p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.button} onClick={cancelFileReplace} data-testid="tool036-replace-cancel">{t.cancelReplace}</button>
          <button type="button" className={styles.primaryButton} onClick={confirmFileReplace} data-testid="tool036-replace-confirm">{t.confirmReplace}</button>
        </div>
      </section>
    </div>}

    {copyStatus && <p className={styles.copyStatus} role="status">{copyStatus}</p>}
    {error && <p className={styles.error} role="alert" data-testid="tool036-error">{error}</p>}
    <span className={styles.live} aria-live="polite">{text ? `${t.live} ${stats.charactersWithSpaces}` : ""}</span>
  </div>;
}
