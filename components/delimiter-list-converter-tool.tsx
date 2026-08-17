"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import {
  TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE,
  TOOL040_INPUT_LIMIT_CANDIDATE,
  TOOL040_ITEM_LIMIT_CANDIDATE,
  convertTool040,
  parseTool040Items,
  type Tool040DelimiterKind,
  type Tool040ListMode,
  type Tool040QuoteMode,
} from "@/lib/tool-040-delimiter-list";
import styles from "./delimiter-list-converter-tool.module.css";

const ACCEPTED_EXTENSIONS = ["txt", "md", "csv"] as const;
type LoadedFile = Readonly<{ name: string; size: number }>;

const copy = {
  ko: {
    local: "입력하거나 불러온 원문과 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 처리합니다.",
    inputTitle: "목록을 입력·붙여넣거나 파일을 넣으세요", dropHint: "TXT · MD · CSV 파일을 이 작업영역에 끌어다 놓아도 됩니다.", chooseFile: "텍스트 파일 선택", replaceFile: "새 파일 불러오기", loadedFile: "불러온 파일", supported: ".txt · .md · .csv",
    input: "입력 목록", inputHelp: "텍스트를 붙여넣고 변환 규칙을 선택하세요.", output: "변환 결과", outputHelp: "선택한 구분자와 목록 형식으로 만든 결과입니다.", placeholder: "예) apple\nbanana\ncherry", resultPlaceholder: "변환 결과가 여기에 표시됩니다.", privacy: "로컬 처리 · 서버 업로드 없음",
    quick: "빠른 변환", nlComma: "줄바꿈 → 쉼표", commaNl: "쉼표 → 줄바꿈", tabPipe: "탭 → 파이프", sql: "따옴표 목록",
    options: "변환 설정", optionsHelp: "입력·출력 구분자 · 따옴표 · 번호·글머리표", source: "입력 구분자", target: "출력 구분자", newline: "줄바꿈", comma: "쉼표", tab: "탭", semicolon: "세미콜론", pipe: "파이프", space: "공백", custom: "사용자 구분자", customSource: "입력 사용자 구분자", customTarget: "출력 사용자 구분자",
    trim: "항목 앞뒤 공백 제거", empty: "빈 항목 제거", quote: "따옴표", none: "없음", single: "작은따옴표", double: "큰따옴표", list: "목록 표기", number: "번호", bullet: "글머리표", hyphen: "하이픈",
    convert: "변환", copy: "결과 복사", save: "TXT 다운로드", reset: "전체 지우기", sample: "예시 넣기", copied: "결과를 복사했습니다.", saved: "TXT 파일을 저장했습니다.", copyFailed: "복사하지 못했습니다. 결과를 직접 선택해 복사해 주세요.",
    emptyInput: "변환할 텍스트를 입력해 주세요.", customEmpty: "사용자 구분자를 입력해 주세요.", sourceMissing: "입력에서 선택한 구분자를 찾지 못했습니다.", inputTooLong: "입력이 현재 서비스 상한 후보를 초과했습니다.", delimiterTooLong: "사용자 구분자가 현재 서비스 상한 후보를 초과했습니다.", itemTooMany: "항목 수가 현재 서비스 상한 후보를 초과했습니다.", invalidFile: "TXT, MD, CSV 텍스트 파일만 사용할 수 있습니다.", readFailed: "파일 내용을 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.", replaceWarning: "새 파일을 불러오면 현재 원문, 결과와 변환 설정이 초기화됩니다. 계속하시겠습니까?", cancelReplace: "취소", confirmReplace: "확인",
    items: "항목", from: "입력", to: "출력", limit: `서비스 상한 후보: ${TOOL040_INPUT_LIMIT_CANDIDATE.toLocaleString("ko-KR")}자 · ${TOOL040_ITEM_LIMIT_CANDIDATE.toLocaleString("ko-KR")}항목 · 사용자 구분자 ${TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE}자`, sampleText: "apple\nbanana\ncherry",
  },
  en: {
    local: "Text you type or load and the result stay in this browser and are not sent to or stored on a server.",
    inputTitle: "Type, paste, or drop a list file", dropHint: "You can also drop a TXT, MD, or CSV file anywhere in this workspace.", chooseFile: "Choose text file", replaceFile: "Load another file", loadedFile: "Loaded file", supported: ".txt · .md · .csv",
    input: "Input list", inputHelp: "Paste text and choose conversion rules.", output: "Converted result", outputHelp: "Result created with the selected delimiter and list format.", placeholder: "Example: apple\nbanana\ncherry", resultPlaceholder: "The converted result appears here.", privacy: "Local processing · No server upload",
    quick: "Quick conversions", nlComma: "New line → Comma", commaNl: "Comma → New line", tabPipe: "Tab → Pipe", sql: "Quoted list",
    options: "Conversion settings", optionsHelp: "Source/target delimiter · quotes · numbering/bullets", source: "Source delimiter", target: "Target delimiter", newline: "New line", comma: "Comma", tab: "Tab", semicolon: "Semicolon", pipe: "Pipe", space: "Space", custom: "Custom delimiter", customSource: "Custom source delimiter", customTarget: "Custom target delimiter",
    trim: "Trim item edges", empty: "Remove empty items", quote: "Quotes", none: "None", single: "Single quote", double: "Double quote", list: "List prefix", number: "Numbers", bullet: "Bullets", hyphen: "Hyphens",
    convert: "Convert", copy: "Copy result", save: "Download TXT", reset: "Clear all", sample: "Insert sample", copied: "Result copied.", saved: "TXT file saved.", copyFailed: "Could not write to the clipboard. Select and copy the result manually.",
    emptyInput: "Enter text to convert.", customEmpty: "Enter the custom delimiter.", sourceMissing: "The selected source delimiter was not found in the input.", inputTooLong: "The input exceeds the current service-limit candidate.", delimiterTooLong: "The custom delimiter exceeds the current service-limit candidate.", itemTooMany: "The item count exceeds the current service-limit candidate.", invalidFile: "Only TXT, MD, and CSV text files are supported.", readFailed: "Could not read this file. Please try another file.", replaceWarning: "Loading a new file will reset the current source, result, and conversion settings. Continue?", cancelReplace: "Cancel", confirmReplace: "Continue",
    items: "Items", from: "Source", to: "Target", limit: `Service-limit candidate: ${TOOL040_INPUT_LIMIT_CANDIDATE.toLocaleString("en-US")} characters · ${TOOL040_ITEM_LIMIT_CANDIDATE.toLocaleString("en-US")} items · custom delimiter ${TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE} chars`, sampleText: "apple\nbanana\ncherry",
  },
  ja: {
    local: "入力・読込した原文と結果はサーバーへ送信・保存せず、このブラウザ内だけで処理します。",
    inputTitle: "一覧を入力・貼り付け・ファイル読込", dropHint: "TXT・MD・CSVファイルをこの作業エリアへドラッグ＆ドロップできます。", chooseFile: "テキストファイルを選択", replaceFile: "別のファイルを読み込む", loadedFile: "読み込んだファイル", supported: ".txt · .md · .csv",
    input: "入力リスト", inputHelp: "テキストを貼り付けて変換ルールを選択します。", output: "変換結果", outputHelp: "選択した区切り文字とリスト形式で作成した結果です。", placeholder: "例: apple\nbanana\ncherry", resultPlaceholder: "変換結果がここに表示されます。", privacy: "ローカル処理 · サーバー送信なし",
    quick: "クイック変換", nlComma: "改行 → カンマ", commaNl: "カンマ → 改行", tabPipe: "タブ → パイプ", sql: "引用符付きリスト",
    options: "変換設定", optionsHelp: "入力・出力区切り文字 · 引用符 · 番号・箇条書き", source: "入力区切り文字", target: "出力区切り文字", newline: "改行", comma: "カンマ", tab: "タブ", semicolon: "セミコロン", pipe: "パイプ", space: "スペース", custom: "カスタム区切り文字", customSource: "入力カスタム区切り文字", customTarget: "出力カスタム区切り文字",
    trim: "項目の前後空白を削除", empty: "空項目を削除", quote: "引用符", none: "なし", single: "シングルクォート", double: "ダブルクォート", list: "リスト表記", number: "番号", bullet: "箇条書き", hyphen: "ハイフン",
    convert: "変換", copy: "結果をコピー", save: "TXTをダウンロード", reset: "すべてクリア", sample: "サンプルを入力", copied: "結果をコピーしました。", saved: "TXTファイルを保存しました。", copyFailed: "クリップボードへコピーできませんでした。結果を選択して手動でコピーしてください。",
    emptyInput: "変換するテキストを入力してください。", customEmpty: "カスタム区切り文字を入力してください。", sourceMissing: "選択した入力区切り文字が見つかりません。", inputTooLong: "入力が現在のサービス上限候補を超えています。", delimiterTooLong: "カスタム区切り文字が現在のサービス上限候補を超えています。", itemTooMany: "項目数が現在のサービス上限候補を超えています。", invalidFile: "TXT・MD・CSVのテキストファイルのみ使用できます。", readFailed: "ファイルを読み込めませんでした。別のファイルで再試行してください。", replaceWarning: "新しいファイルを読み込むと、現在の原文・結果・変換設定が初期化されます。続けますか？", cancelReplace: "キャンセル", confirmReplace: "確認",
    items: "項目", from: "入力", to: "出力", limit: `サービス上限候補: ${TOOL040_INPUT_LIMIT_CANDIDATE.toLocaleString("ja-JP")}文字 · ${TOOL040_ITEM_LIMIT_CANDIDATE.toLocaleString("ja-JP")}項目 · カスタム区切り文字${TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE}文字`, sampleText: "apple\nbanana\ncherry",
  },
} as const;

const delimiterOptions: Tool040DelimiterKind[] = ["newline", "comma", "tab", "semicolon", "pipe", "space", "custom"];

function isSupportedTextFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number]);
}
function formatBytes(size: number, locale: Locale): string {
  if (size < 1024) return `${size.toLocaleString()} B`;
  const localeId = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
  return `${(size / 1024).toLocaleString(localeId, { maximumFractionDigits: 1 })} KB`;
}

export function DelimiterListConverterTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const localeId = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
  const [sourceText, setSourceText] = useState("");
  const [result, setResult] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [sourceKind, setSourceKind] = useState<Tool040DelimiterKind>("newline");
  const [targetKind, setTargetKind] = useState<Tool040DelimiterKind>("comma");
  const [sourceCustom, setSourceCustom] = useState("");
  const [targetCustom, setTargetCustom] = useState("");
  const [trimItems, setTrimItems] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [quoteMode, setQuoteMode] = useState<Tool040QuoteMode>("none");
  const [listMode, setListMode] = useState<Tool040ListMode>("none");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const delimiterLabel = (kind: Tool040DelimiterKind) => ({ newline: t.newline, comma: t.comma, tab: t.tab, semicolon: t.semicolon, pipe: t.pipe, space: t.space, custom: t.custom }[kind]);
  const selectedSummary = useMemo(() => `${delimiterLabel(sourceKind)} → ${delimiterLabel(targetKind)}`, [sourceKind, targetKind, locale]);
  const hasCurrentWork = Boolean(hasStarted || sourceText || loadedFile || result || sourceKind !== "newline" || targetKind !== "comma" || sourceCustom || targetCustom || !trimItems || !removeEmpty || quoteMode !== "none" || listMode !== "none");

  const invalidateResult = () => { setResult(""); setItemCount(0); setStatus(""); setError(""); };
  const updateSource = (value: string) => { setHasStarted(true); setSourceText(value); invalidateResult(); };
  const resetOptions = () => { setSourceKind("newline"); setTargetKind("comma"); setSourceCustom(""); setTargetCustom(""); setTrimItems(true); setRemoveEmpty(true); setQuoteMode("none"); setListMode("none"); };

  const validate = () => {
    if (!sourceText) { setError(t.emptyInput); return false; }
    if (sourceText.length > TOOL040_INPUT_LIMIT_CANDIDATE) { setError(t.inputTooLong); setResult(""); setItemCount(0); return false; }
    if (sourceKind === "custom" && !sourceCustom) { setError(t.customEmpty); return false; }
    if (targetKind === "custom" && !targetCustom) { setError(t.customEmpty); return false; }
    if (sourceCustom.length > TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE || targetCustom.length > TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE) { setError(t.delimiterTooLong); return false; }
    const count = parseTool040Items(sourceText, sourceKind, sourceCustom).length;
    if (count > TOOL040_ITEM_LIMIT_CANDIDATE) { setError(t.itemTooMany); setResult(""); setItemCount(0); return false; }
    return true;
  };

  const runConvert = () => {
    setStatus("");
    if (!validate()) return;
    try {
      const converted = convertTool040(sourceText, { sourceKind, targetKind, sourceCustom, targetCustom, trimItems, removeEmpty, quoteMode, listMode });
      if (converted.itemCount === 1 && sourceKind !== targetKind && sourceText !== "") setError(t.sourceMissing); else setError("");
      setResult(converted.output); setItemCount(converted.itemCount);
    } catch { setResult(""); setItemCount(0); setError(t.customEmpty); }
  };

  const preset = (id: "nl-comma" | "comma-nl" | "tab-pipe" | "quoted") => {
    invalidateResult(); setListMode("none");
    if (id === "nl-comma") { setSourceKind("newline"); setTargetKind("comma"); setQuoteMode("none"); }
    if (id === "comma-nl") { setSourceKind("comma"); setTargetKind("newline"); setQuoteMode("none"); }
    if (id === "tab-pipe") { setSourceKind("tab"); setTargetKind("pipe"); setQuoteMode("none"); }
    if (id === "quoted") { setSourceKind("newline"); setTargetKind("comma"); setQuoteMode("single"); }
  };

  const reset = () => { setSourceText(""); setResult(""); setItemCount(0); resetOptions(); setError(""); setStatus(""); setLoadedFile(null); setHasStarted(false); setDragActive(false); setPendingFile(null); if (fileInput.current) fileInput.current.value = ""; };
  const copyResult = async () => { if (!result) return; try { await navigator.clipboard.writeText(result); setStatus(t.copied); setError(""); } catch { setStatus(""); setError(t.copyFailed); } };
  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "converted-list.txt"; document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0); setStatus(t.saved); setError("");
  };

  const loadFile = async (file: File) => {
    setDragActive(false); setStatus("");
    try { const content = await file.text(); setSourceText(content); setLoadedFile({ name: file.name, size: file.size }); setHasStarted(true); resetOptions(); setResult(""); setItemCount(0); setError(""); }
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

  return <div className={styles.root} data-testid="tool040-root">
    <div className={styles.localNotice} data-testid="tool040-local-notice"><strong>LOCAL</strong><span>{t.local}</span></div>
    <input ref={fileInput} className={styles.hiddenInput} type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" data-testid="tool040-file-input" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) requestFileLoad(file); }} />

    <section className={`${styles.activeWorkspace} ${dragActive ? styles.workspaceDragging : ""}`} data-testid="tool040-workspace" data-drag-active={dragActive ? "true" : "false"} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={styles.editorCard} data-testid="tool040-input-zone">
        {loadedFile && <div className={styles.fileBar} data-testid="tool040-file-info"><div><span>{t.loadedFile}</span><strong>{loadedFile.name}</strong><small>{formatBytes(loadedFile.size, locale)} · {t.supported}</small></div><button type="button" className={styles.button} onClick={() => fileInput.current?.click()}>{t.replaceFile}</button></div>}
        <div className={styles.textareaShell}>
          {!hasStarted && !loadedFile && <div className={styles.startDropzone} data-testid="tool040-start-dropzone"><span className={styles.plusIcon} aria-hidden="true">+</span><h2>{t.inputTitle}</h2><p>{t.dropHint}</p><button type="button" className={styles.fileButton} onClick={() => fileInput.current?.click()} data-testid="tool040-file-button">{t.chooseFile}</button></div>}
          <label className={styles.visibleLabel} htmlFor="tool040-source">{t.input}</label>
          <textarea id="tool040-source" aria-label={t.input} className={`${styles.textarea} ${hasStarted || loadedFile ? styles.textareaLoaded : styles.textareaInitial}`} value={sourceText} maxLength={TOOL040_INPUT_LIMIT_CANDIDATE + 1} placeholder={t.placeholder} onChange={(event) => updateSource(event.currentTarget.value)} data-testid="tool040-source" />
          <div className={styles.editorHead}><span>{t.inputHelp}</span><em>{sourceText.length.toLocaleString(localeId)} / {TOOL040_INPUT_LIMIT_CANDIDATE.toLocaleString(localeId)}</em></div>
        </div>
        <div className={styles.editorFoot}><p className={styles.privacy}>{t.privacy} · {t.limit}</p><div className={styles.textActions}><button type="button" className={styles.button} onClick={() => { setLoadedFile(null); updateSource(t.sampleText); }} data-testid="tool040-sample">{t.sample}</button><button type="button" className={styles.button} onClick={reset} disabled={!hasCurrentWork} data-testid="tool040-reset">{t.reset}</button></div></div>
      </div>

      <div className={styles.presetRow} aria-label={t.quick} data-testid="tool040-presets">
        <button type="button" className={styles.presetButton} onClick={() => preset("nl-comma")}>{t.nlComma}</button><button type="button" className={styles.presetButton} onClick={() => preset("comma-nl")}>{t.commaNl}</button><button type="button" className={styles.presetButton} onClick={() => preset("tab-pipe")}>{t.tabPipe}</button><button type="button" className={styles.presetButton} onClick={() => preset("quoted")}>{t.sql}</button>
      </div>

      <details className={styles.optionsCard} data-testid="tool040-options">
        <summary className={styles.optionsSummary}><span>{t.options}</span><em>{selectedSummary} · {t.optionsHelp}</em></summary>
        <div className={styles.optionsBody}>
          <div className={styles.delimiterGrid}>
            <label className={styles.field}>{t.source}<select value={sourceKind} onChange={(e) => { setSourceKind(e.target.value as Tool040DelimiterKind); invalidateResult(); }} data-testid="tool040-source-kind">{delimiterOptions.map((kind) => <option value={kind} key={kind}>{delimiterLabel(kind)}</option>)}</select>{sourceKind === "custom" && <input className={styles.customInput} aria-label={t.customSource} value={sourceCustom} maxLength={TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE + 1} onChange={(e) => { setSourceCustom(e.target.value); invalidateResult(); }} placeholder="::" data-testid="tool040-source-custom" />}</label>
            <label className={styles.field}>{t.target}<select value={targetKind} onChange={(e) => { setTargetKind(e.target.value as Tool040DelimiterKind); invalidateResult(); }} data-testid="tool040-target-kind">{delimiterOptions.map((kind) => <option value={kind} key={kind}>{delimiterLabel(kind)}</option>)}</select>{targetKind === "custom" && <input className={styles.customInput} aria-label={t.customTarget} value={targetCustom} maxLength={TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE + 1} onChange={(e) => { setTargetCustom(e.target.value); invalidateResult(); }} placeholder=" | " data-testid="tool040-target-custom" />}</label>
          </div>
          <div className={styles.optionGrid}>
            <label className={styles.toggleCard}><input type="checkbox" checked={trimItems} onChange={(e) => { setTrimItems(e.target.checked); invalidateResult(); }} data-testid="tool040-trim" />{t.trim}</label>
            <label className={styles.toggleCard}><input type="checkbox" checked={removeEmpty} onChange={(e) => { setRemoveEmpty(e.target.checked); invalidateResult(); }} data-testid="tool040-empty" />{t.empty}</label>
            <label className={styles.selectCompact}>{t.quote}<select value={quoteMode} onChange={(e) => { setQuoteMode(e.target.value as Tool040QuoteMode); invalidateResult(); }} data-testid="tool040-quote"><option value="none">{t.none}</option><option value="single">{t.single}</option><option value="double">{t.double}</option></select></label>
            <label className={styles.selectCompact}>{t.list}<select value={listMode} onChange={(e) => { setListMode(e.target.value as Tool040ListMode); invalidateResult(); }} data-testid="tool040-list"><option value="none">{t.none}</option><option value="number">{t.number}</option><option value="bullet">{t.bullet}</option><option value="hyphen">{t.hyphen}</option></select></label>
          </div>
        </div>
      </details>

      <div className={styles.actionRow}><button type="button" className={styles.primaryButton} onClick={runConvert} disabled={!sourceText} data-testid="tool040-convert">{t.convert}</button></div>

      <div className={styles.editorCard} data-testid="tool040-result-card"><div className={styles.resultHead}><label className={styles.visibleLabel} htmlFor="tool040-result">{t.output}</label><span>{itemCount.toLocaleString(localeId)} {t.items}</span></div><textarea id="tool040-result" aria-label={t.output} className={`${styles.textarea} ${styles.resultTextarea}`} value={result} readOnly placeholder={t.resultPlaceholder} data-testid="tool040-result" /><p className={styles.notice}>{t.outputHelp}</p></div>
      <section className={styles.stats} aria-label={t.output} data-testid="tool040-summary"><div className={styles.secondaryGrid}><article className={styles.secondaryCard}><span>{t.items}</span><strong data-testid="tool040-item-count">{itemCount.toLocaleString(localeId)}</strong></article><article className={styles.secondaryCard}><span>{t.from}</span><strong>{delimiterLabel(sourceKind)}</strong></article><article className={styles.secondaryCard}><span>{t.to}</span><strong>{delimiterLabel(targetKind)}</strong></article></div></section>
      <div className={styles.actionRow}><button type="button" className={styles.button} onClick={() => void copyResult()} disabled={!result} data-testid="tool040-copy">{t.copy}</button><button type="button" className={styles.primaryButton} onClick={downloadResult} disabled={!result} data-testid="tool040-download">{t.save}</button></div>
      {status && <p className={styles.copyStatus} role="status" aria-live="polite" data-testid="tool040-status">{status}</p>}
      {error && <p className={styles.error} role="alert" data-testid="tool040-error">{error}</p>}
    </section>

    {pendingFile && <div className={styles.dialogBackdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) cancelFileReplace(); }}><section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="tool040-replace-title" data-testid="tool040-replace-dialog"><h2 id="tool040-replace-title">{t.replaceFile}</h2><p>{t.replaceWarning}</p><div className={styles.dialogActions}><button type="button" className={styles.button} onClick={cancelFileReplace} data-testid="tool040-replace-cancel">{t.cancelReplace}</button><button type="button" className={styles.primaryButton} onClick={confirmFileReplace} data-testid="tool040-replace-confirm">{t.confirmReplace}</button></div></section></div>}
  </div>;
}
