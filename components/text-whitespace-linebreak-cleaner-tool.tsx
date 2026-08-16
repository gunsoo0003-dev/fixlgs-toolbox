"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import {
  TOOL037_DEFAULT_OPTIONS,
  TOOL037_SERVICE_LIMITS,
  normalizeText,
  type Tool037Options,
  type Tool037Summary,
} from "@/lib/tool-037-text-cleaner";
import styles from "./text-whitespace-linebreak-cleaner-tool.module.css";

const ACCEPTED_EXTENSIONS = ["txt", "md", "csv"] as const;
const zeroSummary: Tool037Summary = {
  spacesCollapsed: 0,
  edgeWhitespaceRemoved: 0,
  tabsRemoved: 0,
  blankLinesRemoved: 0,
  eolNormalized: false,
};

type LoadedFile = Readonly<{ name: string; size: number }>;

const copy = {
  ko: {
    local: "입력하거나 불러온 원문과 정리 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 처리합니다.",
    inputTitle: "텍스트를 입력·붙여넣거나 파일을 넣으세요",
    placeholder: "정리할 텍스트를 직접 입력하거나 붙여넣으세요…",
    inputMeta: "정리 옵션을 선택한 뒤 결과를 만들 수 있습니다.",
    privacy: "로컬 처리 · 서버 업로드 없음",
    dropHint: "TXT · MD · CSV 파일을 이 영역에 끌어다 놓아도 됩니다.",
    chooseFile: "텍스트 파일 선택",
    replaceFile: "새 파일 불러오기",
    loadedFile: "불러온 파일",
    supported: ".txt · .md · .csv",
    sample: "예시 넣기",
    clear: "전체 지우기",
    input: "원문",
    result: "정리 결과",
    resultPlaceholder: "정리하기를 누르면 결과가 여기에 표시됩니다.",
    options: "정리 옵션",
    optionsHelp: "연속 공백 · 앞뒤 공백 · 탭 · 빈 줄 · LF/CRLF",
    quick: "빠른 정리",
    collapse: "연속 공백 제거",
    collapseSub: "일반 공백(U+0020)이 2개 이상 이어지면 1개로 줄입니다.",
    trim: "각 줄 앞뒤 공백 제거",
    trimSub: "각 줄의 선두·후미 horizontal whitespace를 제거합니다.",
    tabs: "탭 제거",
    tabsSub: "TAB(U+0009)을 실제로 삭제합니다.",
    blank: "빈 줄 제거",
    blankSub: "공백 정리 후 내용이 없는 줄을 삭제합니다.",
    eol: "줄바꿈 통일",
    eolSub: "혼합 CRLF·CR·LF를 내부 LF로 정규화한 뒤 선택 형식으로 출력합니다.",
    clean: "정리하기",
    copy: "결과 복사",
    save: "TXT 다운로드",
    summary: "변경 요약",
    spaceCount: "줄인 공백",
    edgeCount: "앞뒤 공백",
    tabCount: "삭제 탭",
    blankCount: "삭제 빈 줄",
    eolState: "출력 줄바꿈",
    copied: "정리 결과를 복사했습니다.",
    copyFail: "정리 결과를 복사하지 못했습니다.",
    saved: "TXT 파일을 저장했습니다.",
    invalidFile: "TXT, MD, CSV 텍스트 파일만 사용할 수 있습니다.",
    readFailed: "파일 내용을 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.",
    replaceWarning: "새 파일을 불러오면 현재 원문, 결과와 정리 설정이 초기화됩니다. 계속하시겠습니까?",
    cancelReplace: "취소",
    confirmReplace: "확인",
    chars: "자",
    limit: `최대 ${TOOL037_SERVICE_LIMITS.maxCharacters.toLocaleString("ko-KR")}자까지 처리할 수 있습니다. 입력을 줄여 주세요.`,
    limitMeta: `최대 ${TOOL037_SERVICE_LIMITS.maxCharacters.toLocaleString("ko-KR")}자`,
    sampleText: "   FIXLGS    TOOLBOX   \n\ttext   cleaner\n\n   공백과 줄바꿈을 정리합니다.   ",
  },
  en: {
    local: "Text you type or load and the cleaned result stay in this browser and are not sent to or stored on a server.",
    inputTitle: "Type, paste, or drop a text file",
    placeholder: "Type or paste the text you want to clean…",
    inputMeta: "Choose cleanup options, then generate the cleaned result.",
    privacy: "Local processing · No server upload",
    dropHint: "You can also drop a TXT, MD, or CSV file anywhere in this workspace.",
    chooseFile: "Choose text file",
    replaceFile: "Load another file",
    loadedFile: "Loaded file",
    supported: ".txt · .md · .csv",
    sample: "Insert sample",
    clear: "Clear all",
    input: "Original text",
    result: "Cleaned result",
    resultPlaceholder: "Run the cleaner to see the result here.",
    options: "Cleanup options",
    optionsHelp: "Repeated spaces · Line edges · Tabs · Blank lines · LF/CRLF",
    quick: "Quick cleanup",
    collapse: "Collapse repeated spaces",
    collapseSub: "Reduce runs of two or more regular U+0020 spaces to one.",
    trim: "Trim each line",
    trimSub: "Remove leading and trailing horizontal whitespace on every line.",
    tabs: "Remove tabs",
    tabsSub: "Delete TAB (U+0009) characters.",
    blank: "Remove blank lines",
    blankSub: "Delete lines that are empty after whitespace cleanup.",
    eol: "Normalize line endings",
    eolSub: "Normalize mixed CRLF, CR, and LF internally, then emit the selected format.",
    clean: "Clean text",
    copy: "Copy result",
    save: "Download TXT",
    summary: "Change summary",
    spaceCount: "Spaces collapsed",
    edgeCount: "Edge whitespace",
    tabCount: "Tabs removed",
    blankCount: "Blank lines removed",
    eolState: "Output line ending",
    copied: "Cleaned result copied.",
    copyFail: "Could not copy the cleaned result.",
    saved: "TXT file saved.",
    invalidFile: "Only TXT, MD, and CSV text files are supported.",
    readFailed: "Could not read this file. Please try another file.",
    replaceWarning: "Loading a new file will reset the current original text, result, and cleanup settings. Continue?",
    cancelReplace: "Cancel",
    confirmReplace: "Continue",
    chars: "characters",
    limit: `Up to ${TOOL037_SERVICE_LIMITS.maxCharacters.toLocaleString("en-US")} characters can be processed. Reduce the input and try again.`,
    limitMeta: `Maximum ${TOOL037_SERVICE_LIMITS.maxCharacters.toLocaleString("en-US")} characters`,
    sampleText: "   FIXLGS    TOOLBOX   \n\ttext   cleaner\n\n   Clean spaces and line breaks.   ",
  },
  ja: {
    local: "入力・読込した原文と整理結果はサーバーへ送信・保存せず、このブラウザ内だけで処理します。",
    inputTitle: "入力・貼り付け・ファイル読込",
    placeholder: "整理するテキストを直接入力または貼り付けてください…",
    inputMeta: "整理オプションを選んでから結果を作成できます。",
    privacy: "ローカル処理 · サーバー送信なし",
    dropHint: "TXT・MD・CSVファイルをこの作業エリアへドラッグ＆ドロップできます。",
    chooseFile: "テキストファイルを選択",
    replaceFile: "別のファイルを読み込む",
    loadedFile: "読み込んだファイル",
    supported: ".txt · .md · .csv",
    sample: "サンプルを入力",
    clear: "すべてクリア",
    input: "元のテキスト",
    result: "整理結果",
    resultPlaceholder: "整理を実行すると結果がここに表示されます。",
    options: "整理オプション",
    optionsHelp: "連続スペース · 行の前後 · タブ · 空行 · LF/CRLF",
    quick: "クイック整理",
    collapse: "連続スペースを1つに整理",
    collapseSub: "通常スペース(U+0020)が2個以上続く部分を1個にします。",
    trim: "各行の前後空白を削除",
    trimSub: "各行の先頭・末尾のhorizontal whitespaceを削除します。",
    tabs: "タブを削除",
    tabsSub: "TAB(U+0009)を実際に削除します。",
    blank: "空行を削除",
    blankSub: "空白整理後に内容がない行を削除します。",
    eol: "改行コードを統一",
    eolSub: "混在するCRLF・CR・LFを内部LFへ統一し、選択形式で出力します。",
    clean: "整理する",
    copy: "結果をコピー",
    save: "TXTダウンロード",
    summary: "変更内容",
    spaceCount: "縮小した空白",
    edgeCount: "前後空白",
    tabCount: "削除タブ",
    blankCount: "削除空行",
    eolState: "出力改行",
    copied: "整理結果をコピーしました。",
    copyFail: "整理結果をコピーできませんでした。",
    saved: "TXTファイルを保存しました。",
    invalidFile: "TXT・MD・CSVのテキストファイルのみ使用できます。",
    readFailed: "ファイルを読み込めませんでした。別のファイルで再試行してください。",
    replaceWarning: "新しいファイルを読み込むと、現在の原文・結果・整理設定が初期化されます。続けますか？",
    cancelReplace: "キャンセル",
    confirmReplace: "確認",
    chars: "文字",
    limit: `最大${TOOL037_SERVICE_LIMITS.maxCharacters.toLocaleString("ja-JP")}文字まで処理できます。入力を減らしてください。`,
    limitMeta: `最大${TOOL037_SERVICE_LIMITS.maxCharacters.toLocaleString("ja-JP")}文字`,
    sampleText: "   FIXLGS    TOOLBOX   \n\ttext   cleaner\n\n   空白と改行を整理します。   ",
  },
} as const;

function isSupportedTextFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number]);
}

function formatBytes(size: number, locale: Locale): string {
  if (size < 1024) return `${size.toLocaleString()} B`;
  const kb = size / 1024;
  return `${kb.toLocaleString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US", { maximumFractionDigits: 1 })} KB`;
}

function materializeResult(value: string, eol: Tool037Options["eol"]): string {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return eol === "crlf" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

export function TextWhitespaceLinebreakCleanerTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<Tool037Options>(TOOL037_DEFAULT_OPTIONS);
  const [result, setResult] = useState("");
  const [summary, setSummary] = useState<Tool037Summary>(zeroSummary);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const overLimit = input.length > TOOL037_SERVICE_LIMITS.maxCharacters;
  const count = useMemo(() => input.length.toLocaleString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US"), [input.length, locale]);
  const resultCount = useMemo(() => result.length.toLocaleString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US"), [result.length, locale]);
  const hasCurrentWork = Boolean(hasStarted || input || loadedFile || hasProcessed || JSON.stringify(options) !== JSON.stringify(TOOL037_DEFAULT_OPTIONS));

  const invalidateResult = () => {
    setResult("");
    setSummary(zeroSummary);
    setHasProcessed(false);
    setStatus("");
  };

  const updateInput = (value: string) => {
    setHasStarted(true);
    setInput(value);
    invalidateResult();
    setError(value.length > TOOL037_SERVICE_LIMITS.maxCharacters ? t.limit : "");
  };

  const setOption = <K extends keyof Tool037Options>(key: K, value: Tool037Options[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
    invalidateResult();
  };

  const toggle = (key: keyof Pick<Tool037Options, "collapseSpaces" | "trimEachLine" | "removeTabs" | "removeBlankLines">) => {
    setOption(key, !options[key]);
  };

  const clean = () => {
    setStatus("");
    if (overLimit) { setError(t.limit); return; }
    try {
      const next = normalizeText(input, options);
      setResult(next.output);
      setSummary(next.summary);
      setHasProcessed(true);
      setError("");
    } catch {
      setError(t.limit);
    }
  };

  const copyResult = async () => {
    if (!hasProcessed) return;
    try {
      await navigator.clipboard.writeText(materializeResult(result, options.eol));
      setStatus(t.copied);
      setError("");
    } catch {
      setStatus("");
      setError(t.copyFail);
    }
  };

  const downloadResult = () => {
    if (!hasProcessed) return;
    const output = materializeResult(result, options.eol);
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cleaned-text.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus(t.saved);
  };

  const clearAll = () => {
    setInput("");
    setResult("");
    setSummary(zeroSummary);
    setOptions(TOOL037_DEFAULT_OPTIONS);
    setStatus("");
    setError("");
    setLoadedFile(null);
    setHasStarted(false);
    setHasProcessed(false);
    setDragActive(false);
    setPendingFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const loadFile = async (file: File) => {
    setDragActive(false);
    setStatus("");
    try {
      const content = await file.text();
      setInput(content);
      setLoadedFile({ name: file.name, size: file.size });
      setHasStarted(true);
      setResult("");
      setSummary(zeroSummary);
      setHasProcessed(false);
      setOptions(TOOL037_DEFAULT_OPTIONS);
      setError(content.length > TOOL037_SERVICE_LIMITS.maxCharacters ? t.limit : "");
    } catch {
      setError(t.readFailed);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const requestFileLoad = (file: File) => {
    setDragActive(false);
    setStatus("");
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
    event.preventDefault();
    setDragActive(true);
  };

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragActive(true);
  };

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) setDragActive(false);
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) requestFileLoad(file);
  };

  return <div className={styles.root} data-testid="tool037-root">
    <div className={styles.localNotice} data-testid="tool037-local-notice"><strong>LOCAL</strong><span>{t.local}</span></div>
    <input ref={fileInput} className={styles.hiddenInput} type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" data-testid="tool037-file-input" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) requestFileLoad(file); }}/>

    <section className={`${styles.activeWorkspace} ${dragActive ? styles.workspaceDragging : ""}`} data-testid="tool037-workspace" data-drag-active={dragActive ? "true" : "false"} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={styles.editorCard} data-testid="tool037-input-zone">
        {loadedFile && <div className={styles.fileBar} data-testid="tool037-file-info"><div><span>{t.loadedFile}</span><strong>{loadedFile.name}</strong><small>{formatBytes(loadedFile.size, locale)} · {t.supported}</small></div><button type="button" className={styles.button} onClick={() => fileInput.current?.click()}>{t.replaceFile}</button></div>}
        <div className={styles.textareaShell}>
          {!hasStarted && !loadedFile && <div className={styles.startDropzone} data-testid="tool037-start-dropzone">
            <span className={styles.plusIcon} aria-hidden="true">+</span>
            <h2>{t.inputTitle}</h2>
            <p>{t.dropHint}</p>
            <button type="button" className={styles.fileButton} onClick={() => fileInput.current?.click()} data-testid="tool037-file-button">{t.chooseFile}</button>
          </div>}
          <label className={styles.visibleLabel} htmlFor="tool037-input">{t.input}</label>
          <textarea id="tool037-input" aria-label={t.input} className={`${styles.textarea} ${hasStarted || loadedFile ? styles.textareaLoaded : styles.textareaInitial}`} value={input} onChange={(event) => updateInput(event.currentTarget.value)} placeholder={t.placeholder} data-testid="tool037-input"/>
          <div className={styles.editorHead}><span>{t.inputMeta}</span><em>{count} {t.chars} · {t.supported}</em></div>
        </div>
        <div className={styles.editorFoot}><p className={styles.privacy}>{t.privacy} · {t.limitMeta}</p><div className={styles.textActions}><button type="button" className={styles.button} onClick={() => { setLoadedFile(null); updateInput(t.sampleText); }} data-testid="tool037-sample">{t.sample}</button><button type="button" className={styles.button} onClick={clearAll} disabled={!hasCurrentWork} data-testid="tool037-reset">{t.clear}</button></div></div>
      </div>

      <details className={styles.optionsCard} data-testid="tool037-options">
        <summary className={styles.optionsSummary}><span>{t.options}</span><em>{t.optionsHelp}</em></summary>
        <div className={styles.optionsBody}>
          <div className={styles.optionSection}>
            <div className={styles.optionTitle}><strong>{t.quick}</strong></div>
            <div className={styles.optionGrid}>
              <label className={styles.option}><input type="checkbox" checked={options.collapseSpaces} onChange={() => toggle("collapseSpaces")} data-testid="tool037-collapse-spaces"/><span><strong>{t.collapse}</strong><small>{t.collapseSub}</small></span></label>
              <label className={styles.option}><input type="checkbox" checked={options.trimEachLine} onChange={() => toggle("trimEachLine")} data-testid="tool037-trim-lines"/><span><strong>{t.trim}</strong><small>{t.trimSub}</small></span></label>
              <label className={styles.option}><input type="checkbox" checked={options.removeTabs} onChange={() => toggle("removeTabs")} data-testid="tool037-remove-tabs"/><span><strong>{t.tabs}</strong><small>{t.tabsSub}</small></span></label>
              <label className={styles.option}><input type="checkbox" checked={options.removeBlankLines} onChange={() => toggle("removeBlankLines")} data-testid="tool037-remove-blank-lines"/><span><strong>{t.blank}</strong><small>{t.blankSub}</small></span></label>
            </div>
          </div>
          <div className={styles.optionSection}>
            <div className={styles.optionTitle}><strong>{t.eol}</strong><span>{t.eolSub}</span></div>
            <div className={styles.eolGroup}>
              <button type="button" className={styles.eolButton} aria-pressed={options.eol === "lf"} onClick={() => setOption("eol", "lf")} data-testid="tool037-eol-lf">LF</button>
              <button type="button" className={styles.eolButton} aria-pressed={options.eol === "crlf"} onClick={() => setOption("eol", "crlf")} data-testid="tool037-eol-crlf">CRLF</button>
            </div>
          </div>
        </div>
      </details>

      {overLimit && <p className={styles.error} role="alert" data-testid="tool037-error">{t.limit}</p>}
      <div className={styles.actionRow}><button type="button" className={styles.primaryButton} disabled={overLimit} onClick={clean} data-testid="tool037-clean">{t.clean}</button></div>

      {hasProcessed && <>
        <div className={styles.editorCard} data-testid="tool037-result-card">
          <div className={styles.resultHead}><label className={styles.visibleLabel} htmlFor="tool037-result">{t.result}</label><span>{resultCount} {t.chars}</span></div>
          <textarea id="tool037-result" aria-label={t.result} className={`${styles.textarea} ${styles.resultTextarea}`} value={result} onChange={(event) => { setResult(event.currentTarget.value); setStatus(""); }} placeholder={t.resultPlaceholder} data-testid="tool037-result"/>
        </div>
        <section className={styles.stats} aria-label={t.summary}>
          <div className={styles.secondaryGrid} data-testid="tool037-summary">
            <article className={styles.secondaryCard}><span>{t.spaceCount}</span><strong data-testid="tool037-summary-spaces">{summary.spacesCollapsed.toLocaleString()}</strong></article>
            <article className={styles.secondaryCard}><span>{t.edgeCount}</span><strong data-testid="tool037-summary-edges">{summary.edgeWhitespaceRemoved.toLocaleString()}</strong></article>
            <article className={styles.secondaryCard}><span>{t.tabCount}</span><strong data-testid="tool037-summary-tabs">{summary.tabsRemoved.toLocaleString()}</strong></article>
            <article className={styles.secondaryCard}><span>{t.blankCount}</span><strong data-testid="tool037-summary-blank">{summary.blankLinesRemoved.toLocaleString()}</strong></article>
            <article className={styles.secondaryCard}><span>{t.eolState}</span><strong data-testid="tool037-summary-eol">{options.eol.toUpperCase()}</strong></article>
          </div>
        </section>
        <div className={styles.actionRow}><button type="button" className={styles.button} onClick={() => void copyResult()} data-testid="tool037-copy">{t.copy}</button><button type="button" className={styles.primaryButton} onClick={downloadResult} data-testid="tool037-download">{t.save}</button></div>
      </>}
    </section>

    {pendingFile && <div className={styles.dialogBackdrop} data-testid="tool037-replace-dialog-backdrop">
      <section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="tool037-replace-title" data-testid="tool037-replace-dialog">
        <h2 id="tool037-replace-title">{t.replaceFile}</h2>
        <p>{t.replaceWarning}</p>
        <div className={styles.dialogActions}><button type="button" className={styles.button} onClick={cancelFileReplace} data-testid="tool037-replace-cancel">{t.cancelReplace}</button><button type="button" className={styles.primaryButton} onClick={confirmFileReplace} data-testid="tool037-replace-confirm">{t.confirmReplace}</button></div>
      </section>
    </div>}

    {status && <p className={styles.copyStatus} role="status" aria-live="polite">{status}</p>}
    {!overLimit && error && <p className={styles.error} role="alert" data-testid="tool037-error">{error}</p>}
  </div>;
}
