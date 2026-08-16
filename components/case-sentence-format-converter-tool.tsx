"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import { countChangedCodePoints038, transformTool038, type Tool038Mode } from "@/lib/tool-038-case";
import styles from "./case-sentence-format-converter-tool.module.css";

const ACCEPTED_EXTENSIONS = ["txt", "md", "csv"] as const;
const modes: Tool038Mode[] = ["upper", "lower", "title", "sentence", "first"];
type LoadedFile = Readonly<{ name: string; size: number }>;

const copy = {
  ko: {
    local: "입력하거나 불러온 원문과 변환 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 처리합니다.",
    inputTitle: "텍스트를 입력·붙여넣거나 파일을 넣으세요",
    placeholder: "변환할 텍스트를 직접 입력하거나 붙여넣으세요…",
    inputMeta: "변환 형식을 선택한 뒤 결과를 만들 수 있습니다.",
    privacy: "로컬 처리 · 서버 업로드 없음",
    dropHint: "TXT · MD · CSV 파일을 이 영역에 끌어다 놓아도 됩니다.",
    chooseFile: "텍스트 파일 선택", replaceFile: "새 파일 불러오기", loadedFile: "불러온 파일", supported: ".txt · .md · .csv",
    sample: "예시 넣기", clear: "전체 지우기", input: "원문", result: "변환 결과", resultPlaceholder: "변환하기를 누르면 결과가 여기에 표시됩니다.",
    options: "변환 형식", optionsHelp: "대문자 · 소문자 · 제목형 · 문장형 · 첫 글자 대문자", modeTitle: "변환 규칙 선택",
    upper: "대문자", upperSub: "영문 등 대소문자가 있는 문자를 대문자로 변환합니다.",
    lower: "소문자", lowerSub: "영문 등 대소문자가 있는 문자를 소문자로 변환합니다.",
    title: "제목형", titleSub: "각 단어와 하이픈·apostrophe 뒤 첫 cased 문자를 대문자로 만듭니다.",
    sentence: "문장형", sentenceSub: "전체를 소문자화한 뒤 문장 시작의 첫 cased 문자를 대문자로 만듭니다.",
    first: "첫 글자 대문자", firstSub: "원문에서 처음 만나는 cased 문자 하나만 대문자로 바꿉니다.",
    convert: "변환하기", copy: "결과 복사", save: "TXT 다운로드", chars: "자", changed: "변경 문자", modeUsed: "적용 형식",
    copied: "변환 결과를 복사했습니다.", copyFail: "변환 결과를 복사하지 못했습니다.", saved: "TXT 파일을 저장했습니다.",
    invalidFile: "TXT, MD, CSV 텍스트 파일만 사용할 수 있습니다.", readFailed: "파일 내용을 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.",
    replaceWarning: "새 파일을 불러오면 현재 원문, 결과와 변환 형식이 초기화됩니다. 계속하시겠습니까?", cancelReplace: "취소", confirmReplace: "확인",
    sampleText: "fixlgs TOOLBOX\nhello WORLD! this is a CASE converter.\nNASA and iPhone stay predictable by the selected rule.",
  },
  en: {
    local: "Text you type or load and the converted result stay in this browser and are not sent to or stored on a server.",
    inputTitle: "Type, paste, or drop a text file", placeholder: "Type or paste the text you want to convert…", inputMeta: "Choose a conversion format, then generate the result.",
    privacy: "Local processing · No server upload", dropHint: "You can also drop a TXT, MD, or CSV file anywhere in this workspace.",
    chooseFile: "Choose text file", replaceFile: "Load another file", loadedFile: "Loaded file", supported: ".txt · .md · .csv",
    sample: "Insert sample", clear: "Clear all", input: "Original text", result: "Converted result", resultPlaceholder: "Run the converter to see the result here.",
    options: "Conversion format", optionsHelp: "Uppercase · Lowercase · Title Case · Sentence case · First letter", modeTitle: "Choose conversion rule",
    upper: "UPPERCASE", upperSub: "Convert cased letters to uppercase using default Unicode case mapping.",
    lower: "lowercase", lowerSub: "Convert cased letters to lowercase using default Unicode case mapping.",
    title: "Title Case", titleSub: "Uppercase the first cased character of each word and after hyphens or apostrophes.",
    sentence: "Sentence case", sentenceSub: "Lowercase first, then uppercase the first cased character at sentence starts.",
    first: "First letter uppercase", firstSub: "Uppercase only the first cased character in the original text.",
    convert: "Convert text", copy: "Copy result", save: "Download TXT", chars: "characters", changed: "Changed characters", modeUsed: "Applied format",
    copied: "Converted result copied.", copyFail: "Could not copy the converted result.", saved: "TXT file saved.",
    invalidFile: "Only TXT, MD, and CSV text files are supported.", readFailed: "Could not read this file. Please try another file.",
    replaceWarning: "Loading a new file will reset the current original text, result, and conversion format. Continue?", cancelReplace: "Cancel", confirmReplace: "Continue",
    sampleText: "fixlgs TOOLBOX\nhello WORLD! this is a CASE converter.\nNASA and iPhone stay predictable by the selected rule.",
  },
  ja: {
    local: "入力・読込した原文と変換結果はサーバーへ送信・保存せず、このブラウザ内だけで処理します。",
    inputTitle: "入力・貼り付け・ファイル読込", placeholder: "変換するテキストを直接入力または貼り付けてください…", inputMeta: "変換形式を選んでから結果を作成できます。",
    privacy: "ローカル処理 · サーバー送信なし", dropHint: "TXT・MD・CSVファイルをこの作業エリアへドラッグ＆ドロップできます。",
    chooseFile: "テキストファイルを選択", replaceFile: "別のファイルを読み込む", loadedFile: "読み込んだファイル", supported: ".txt · .md · .csv",
    sample: "サンプルを入力", clear: "すべてクリア", input: "元のテキスト", result: "変換結果", resultPlaceholder: "変換を実行すると結果がここに表示されます。",
    options: "変換形式", optionsHelp: "大文字 · 小文字 · 単語先頭 · 文頭 · 最初の文字", modeTitle: "変換ルールを選択",
    upper: "大文字", upperSub: "caseを持つ文字をUnicode標準の大文字へ変換します。",
    lower: "小文字", lowerSub: "caseを持つ文字をUnicode標準の小文字へ変換します。",
    title: "単語先頭を大文字", titleSub: "各単語とハイフン・apostrophe後の最初のcased文字を大文字にします。",
    sentence: "文頭を大文字", sentenceSub: "全体を小文字化し、文頭の最初のcased文字を大文字にします。",
    first: "最初の文字を大文字", firstSub: "元の文字列で最初のcased文字だけを大文字にします。",
    convert: "変換する", copy: "結果をコピー", save: "TXTダウンロード", chars: "文字", changed: "変更文字", modeUsed: "適用形式",
    copied: "変換結果をコピーしました。", copyFail: "変換結果をコピーできませんでした。", saved: "TXTファイルを保存しました。",
    invalidFile: "TXT・MD・CSVのテキストファイルのみ使用できます。", readFailed: "ファイルを読み込めませんでした。別のファイルで再試行してください。",
    replaceWarning: "新しいファイルを読み込むと、現在の原文・結果・変換形式が初期化されます。続けますか？", cancelReplace: "キャンセル", confirmReplace: "確認",
    sampleText: "fixlgs TOOLBOX\nhello WORLD! this is a CASE converter.\nNASA and iPhone stay predictable by the selected rule.",
  },
} as const;

function isSupportedTextFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number]);
}
function formatBytes(size: number, locale: Locale): string {
  if (size < 1024) return `${size.toLocaleString()} B`;
  return `${(size / 1024).toLocaleString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US", { maximumFractionDigits: 1 })} KB`;
}

export function CaseSentenceFormatConverterTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Tool038Mode>("upper");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const localeId = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
  const count = useMemo(() => Array.from(input).length.toLocaleString(localeId), [input, localeId]);
  const resultCount = useMemo(() => Array.from(result).length.toLocaleString(localeId), [result, localeId]);
  const changed = useMemo(() => countChangedCodePoints038(input, result), [input, result]);
  const hasCurrentWork = Boolean(hasStarted || input || loadedFile || hasProcessed || mode !== "upper");
  const modeLabel = (value: Tool038Mode) => value === "upper" ? t.upper : value === "lower" ? t.lower : value === "title" ? t.title : value === "sentence" ? t.sentence : t.first;

  const invalidateResult = () => { setResult(""); setHasProcessed(false); setStatus(""); };
  const updateInput = (value: string) => { setHasStarted(true); setInput(value); invalidateResult(); setError(""); };
  const chooseMode = (value: Tool038Mode) => { setMode(value); invalidateResult(); };
  const convert = () => { setResult(transformTool038(input, mode)); setHasProcessed(true); setStatus(""); setError(""); };

  const copyResult = async () => {
    if (!hasProcessed) return;
    try { await navigator.clipboard.writeText(result); setStatus(t.copied); setError(""); }
    catch { setStatus(""); setError(t.copyFail); }
  };
  const downloadResult = () => {
    if (!hasProcessed) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "converted-text.txt"; document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0); setStatus(t.saved);
  };
  const clearAll = () => {
    setInput(""); setMode("upper"); setResult(""); setStatus(""); setError(""); setLoadedFile(null); setHasStarted(false); setHasProcessed(false); setDragActive(false); setPendingFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };
  const loadFile = async (file: File) => {
    setDragActive(false); setStatus("");
    try { const content = await file.text(); setInput(content); setLoadedFile({ name: file.name, size: file.size }); setHasStarted(true); setResult(""); setHasProcessed(false); setMode("upper"); setError(""); }
    catch { setError(t.readFailed); }
    finally { if (fileInput.current) fileInput.current.value = ""; }
  };
  const requestFileLoad = (file: File) => {
    setDragActive(false); setStatus("");
    if (!isSupportedTextFile(file)) { setError(t.invalidFile); if (fileInput.current) fileInput.current.value = ""; return; }
    if (hasCurrentWork) { setPendingFile(file); return; }
    void loadFile(file);
  };
  const cancelFileReplace = () => { setPendingFile(null); if (fileInput.current) fileInput.current.value = ""; };
  const confirmFileReplace = () => { const file = pendingFile; setPendingFile(null); if (file) void loadFile(file); };
  const onDragEnter = (event: DragEvent<HTMLElement>) => { if (!Array.from(event.dataTransfer.types).includes("Files")) return; event.preventDefault(); setDragActive(true); };
  const onDragOver = (event: DragEvent<HTMLElement>) => { if (!Array.from(event.dataTransfer.types).includes("Files")) return; event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDragActive(true); };
  const onDragLeave = (event: DragEvent<HTMLElement>) => { const next = event.relatedTarget as Node | null; if (!next || !event.currentTarget.contains(next)) setDragActive(false); };
  const onDrop = (event: DragEvent<HTMLElement>) => { if (!Array.from(event.dataTransfer.types).includes("Files")) return; event.preventDefault(); setDragActive(false); const file = event.dataTransfer.files?.[0]; if (file) requestFileLoad(file); };

  const optionData: Array<readonly [Tool038Mode, string, string]> = [
    ["upper", t.upper, t.upperSub], ["lower", t.lower, t.lowerSub], ["title", t.title, t.titleSub], ["sentence", t.sentence, t.sentenceSub], ["first", t.first, t.firstSub],
  ];

  return <div className={styles.root} data-testid="tool038-root">
    <div className={styles.localNotice} data-testid="tool038-local-notice"><strong>LOCAL</strong><span>{t.local}</span></div>
    <input ref={fileInput} className={styles.hiddenInput} type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" data-testid="tool038-file-input" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) requestFileLoad(file); }}/>

    <section className={`${styles.activeWorkspace} ${dragActive ? styles.workspaceDragging : ""}`} data-testid="tool038-workspace" data-drag-active={dragActive ? "true" : "false"} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={styles.editorCard} data-testid="tool038-input-zone">
        {loadedFile && <div className={styles.fileBar} data-testid="tool038-file-info"><div><span>{t.loadedFile}</span><strong>{loadedFile.name}</strong><small>{formatBytes(loadedFile.size, locale)} · {t.supported}</small></div><button type="button" className={styles.button} onClick={() => fileInput.current?.click()}>{t.replaceFile}</button></div>}
        <div className={styles.textareaShell}>
          {!hasStarted && !loadedFile && <div className={styles.startDropzone} data-testid="tool038-start-dropzone"><span className={styles.plusIcon} aria-hidden="true">+</span><h2>{t.inputTitle}</h2><p>{t.dropHint}</p><button type="button" className={styles.fileButton} onClick={() => fileInput.current?.click()} data-testid="tool038-file-button">{t.chooseFile}</button></div>}
          <label className={styles.visibleLabel} htmlFor="tool038-input">{t.input}</label>
          <textarea id="tool038-input" aria-label={t.input} className={`${styles.textarea} ${hasStarted || loadedFile ? styles.textareaLoaded : styles.textareaInitial}`} value={input} onChange={(event) => updateInput(event.currentTarget.value)} placeholder={t.placeholder} data-testid="tool038-input"/>
          <div className={styles.editorHead}><span>{t.inputMeta}</span><em>{count} {t.chars} · {t.supported}</em></div>
        </div>
        <div className={styles.editorFoot}><p className={styles.privacy}>{t.privacy}</p><div className={styles.textActions}><button type="button" className={styles.button} onClick={() => { setLoadedFile(null); updateInput(t.sampleText); }} data-testid="tool038-sample">{t.sample}</button><button type="button" className={styles.button} onClick={clearAll} disabled={!hasCurrentWork} data-testid="tool038-reset">{t.clear}</button></div></div>
      </div>

      <details className={styles.optionsCard} data-testid="tool038-options">
        <summary className={styles.optionsSummary}><span>{t.options}</span><em>{t.optionsHelp}</em></summary>
        <div className={styles.optionsBody}><div className={styles.optionSection}><div className={styles.optionTitle}><strong>{t.modeTitle}</strong></div><div className={styles.optionGrid} role="radiogroup" aria-label={t.options}>
          {optionData.map(([value, label, sub]) => <label className={styles.option} key={value}><input type="radio" name="tool038-mode" value={value} checked={mode === value} onChange={() => chooseMode(value)} data-testid={`tool038-mode-${value}`}/><span><strong>{label}</strong><small>{sub}</small></span></label>)}
        </div></div></div>
      </details>

      <div className={styles.actionRow}><button type="button" className={styles.primaryButton} onClick={convert} data-testid="tool038-convert">{t.convert}</button></div>

      {hasProcessed && <>
        <div className={styles.editorCard} data-testid="tool038-result-card"><div className={styles.resultHead}><label className={styles.visibleLabel} htmlFor="tool038-result">{t.result}</label><span>{resultCount} {t.chars}</span></div><textarea id="tool038-result" aria-label={t.result} className={`${styles.textarea} ${styles.resultTextarea}`} value={result} onChange={(event) => { setResult(event.currentTarget.value); setStatus(""); }} placeholder={t.resultPlaceholder} data-testid="tool038-result"/></div>
        <section className={styles.stats} aria-label={t.result}><div className={styles.secondaryGrid} data-testid="tool038-summary"><article className={styles.secondaryCard}><span>{t.changed}</span><strong data-testid="tool038-changed">{changed.toLocaleString(localeId)}</strong></article><article className={styles.secondaryCard}><span>{t.modeUsed}</span><strong data-testid="tool038-mode-used">{modeLabel(mode)}</strong></article><article className={styles.secondaryCard}><span>{t.chars}</span><strong data-testid="tool038-result-count">{resultCount}</strong></article></div></section>
        <div className={styles.actionRow}><button type="button" className={styles.button} onClick={() => void copyResult()} data-testid="tool038-copy">{t.copy}</button><button type="button" className={styles.primaryButton} onClick={downloadResult} data-testid="tool038-download">{t.save}</button></div>
      </>}
    </section>

    {pendingFile && <div className={styles.dialogBackdrop} data-testid="tool038-replace-dialog-backdrop"><section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="tool038-replace-title" data-testid="tool038-replace-dialog"><h2 id="tool038-replace-title">{t.replaceFile}</h2><p>{t.replaceWarning}</p><div className={styles.dialogActions}><button type="button" className={styles.button} onClick={cancelFileReplace} data-testid="tool038-replace-cancel">{t.cancelReplace}</button><button type="button" className={styles.primaryButton} onClick={confirmFileReplace} data-testid="tool038-replace-confirm">{t.confirmReplace}</button></div></section></div>}
    {status && <p className={styles.copyStatus} role="status" aria-live="polite">{status}</p>}
    {error && <p className={styles.error} role="alert" data-testid="tool038-error">{error}</p>}
  </div>;
}
