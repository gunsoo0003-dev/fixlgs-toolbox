"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import {
  TOOL041_MAX_CHARS,
  TOOL041_MAX_MATCHES_PER_TYPE,
  TOOL041_MAX_TOTAL_RESULTS,
  allTool041Matches,
  countTool041Results,
  extractTool041,
  type Tool041Results,
  type Tool041Type,
} from "@/lib/tool-041-text-extractor";
import styles from "./text-extractor-tool.module.css";

const ACCEPTED_EXTENSIONS = ["txt", "md", "csv"] as const;
const TYPES: Tool041Type[] = ["numbers", "korean", "english", "emails", "urls", "phones", "hashtags"];
type LoadedFile = Readonly<{ name: string; size: number }>;
const emptyResults = (): Tool041Results => ({ numbers: [], korean: [], english: [], emails: [], urls: [], phones: [], hashtags: [] });

const copy = {
  ko: {
    local: "입력하거나 불러온 원문과 추출 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 처리합니다.",
    inputTitle: "텍스트를 입력·붙여넣거나 파일을 넣으세요", dropHint: "TXT · MD · CSV 파일을 이 작업영역에 끌어다 놓아도 됩니다.", chooseFile: "텍스트 파일 선택", replaceFile: "새 파일 불러오기", loadedFile: "불러온 파일", supported: ".txt · .md · .csv",
    input: "원문 텍스트", inputHelp: "추출할 텍스트를 붙여넣고 필요한 유형을 선택하세요.", placeholder: "예) 문의: hello@example.com / https://fixlgs.com / 010-1234-5678 / #FIXLGS", privacy: "로컬 처리 · 서버 업로드 없음",
    options: "추출 유형", optionsHelp: "숫자 · 한글 · 영어 · 이메일 · URL · 전화번호 · 해시태그", numbers: "숫자", korean: "한글", english: "영어", emails: "이메일", urls: "URL", phones: "전화번호", hashtags: "해시태그", selectAll: "전체 선택", clearAll: "전체 해제",
    extract: "추출", reset: "전체 지우기", sample: "예시 넣기", result: "추출 결과", resultHelp: "선택한 유형별 결과입니다. 각 유형 안에서는 원문 등장 순서를 유지합니다.", noMatch: "추출된 결과가 없습니다.", position: "위치", matches: "건", total: "전체 결과", selectedTypes: "선택 유형", chars: "입력 글자",
    copy: "결과 복사", save: "TXT 다운로드", copied: "결과를 복사했습니다.", saved: "TXT 파일을 저장했습니다.", copyFailed: "복사하지 못했습니다. 결과를 직접 선택해 복사해 주세요.",
    emptyInput: "추출할 텍스트를 입력해 주세요.", noType: "추출 유형을 하나 이상 선택해 주세요.", inputTooLong: "입력이 서비스 상한을 초과했습니다.", perTypeTooMany: "한 유형의 결과가 서비스 상한을 초과했습니다.", totalTooMany: "전체 추출 결과가 서비스 상한을 초과했습니다.", invalidFile: "TXT, MD, CSV 텍스트 파일만 사용할 수 있습니다.", readFailed: "파일 내용을 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.", replaceWarning: "새 파일을 불러오면 현재 원문, 결과와 추출 유형이 초기화됩니다. 계속하시겠습니까?", cancelReplace: "취소", confirmReplace: "확인",
    limit: `서비스 상한: ${TOOL041_MAX_CHARS.toLocaleString("ko-KR")}자 · 유형당 ${TOOL041_MAX_MATCHES_PER_TYPE.toLocaleString("ko-KR")}건 · 전체 ${TOOL041_MAX_TOTAL_RESULTS.toLocaleString("ko-KR")}건`,
    sampleText: "FIXLGS 문의 hello@example.com\n웹 https://toolbox.fixlgs.com\n전화 010-1234-5678\n가격 12,500원 #웹도구 #FIXLGS",
  },
  en: {
    local: "Text you type or load and extracted results stay in this browser and are not sent to or stored on a server.",
    inputTitle: "Type, paste, or drop a text file", dropHint: "You can also drop a TXT, MD, or CSV file anywhere in this workspace.", chooseFile: "Choose text file", replaceFile: "Load another file", loadedFile: "Loaded file", supported: ".txt · .md · .csv",
    input: "Source text", inputHelp: "Paste source text and select the types you want to extract.", placeholder: "Example: hello@example.com / https://fixlgs.com / +82 10-1234-5678 / #FIXLGS", privacy: "Local processing · No server upload",
    options: "Extraction types", optionsHelp: "Numbers · Korean · English · emails · URLs · phone numbers · hashtags", numbers: "Numbers", korean: "Korean", english: "English", emails: "Emails", urls: "URLs", phones: "Phone numbers", hashtags: "Hashtags", selectAll: "Select all", clearAll: "Clear all",
    extract: "Extract", reset: "Clear all", sample: "Insert sample", result: "Extracted results", resultHelp: "Results are grouped by selected type and keep source order within each type.", noMatch: "No matches found.", position: "Position", matches: "matches", total: "Total results", selectedTypes: "Selected types", chars: "Input chars",
    copy: "Copy results", save: "Download TXT", copied: "Results copied.", saved: "TXT file saved.", copyFailed: "Could not write to the clipboard. Select and copy the results manually.",
    emptyInput: "Enter text to extract.", noType: "Select at least one extraction type.", inputTooLong: "The input exceeds the service limit.", perTypeTooMany: "A result type exceeds the service limit.", totalTooMany: "The total extracted result count exceeds the service limit.", invalidFile: "Only TXT, MD, and CSV text files are supported.", readFailed: "Could not read this file. Please try another file.", replaceWarning: "Loading a new file will reset the current source, results, and extraction types. Continue?", cancelReplace: "Cancel", confirmReplace: "Continue",
    limit: `Service limit: ${TOOL041_MAX_CHARS.toLocaleString("en-US")} characters · ${TOOL041_MAX_MATCHES_PER_TYPE.toLocaleString("en-US")} per type · ${TOOL041_MAX_TOTAL_RESULTS.toLocaleString("en-US")} total`,
    sampleText: "Contact FIXLGS at hello@example.com\nWeb https://toolbox.fixlgs.com\nPhone +82 10-1234-5678\nPrice 12,500 #webtools #FIXLGS",
  },
  ja: {
    local: "入力・読込した原文と抽出結果はサーバーへ送信・保存せず、このブラウザ内だけで処理します。",
    inputTitle: "テキストを入力・貼り付け・ファイル読込", dropHint: "TXT・MD・CSVファイルをこの作業エリアへドラッグ＆ドロップできます。", chooseFile: "テキストファイルを選択", replaceFile: "別のファイルを読み込む", loadedFile: "読み込んだファイル", supported: ".txt · .md · .csv",
    input: "原文テキスト", inputHelp: "抽出するテキストを貼り付け、必要な種類を選択します。", placeholder: "例: hello@example.com / https://fixlgs.com / 010-1234-5678 / #FIXLGS", privacy: "ローカル処理 · サーバー送信なし",
    options: "抽出タイプ", optionsHelp: "数字 · 韓国語 · 英語 · メール · URL · 電話番号 · ハッシュタグ", numbers: "数字", korean: "韓国語", english: "英語", emails: "メール", urls: "URL", phones: "電話番号", hashtags: "ハッシュタグ", selectAll: "すべて選択", clearAll: "すべて解除",
    extract: "抽出", reset: "すべてクリア", sample: "サンプルを入力", result: "抽出結果", resultHelp: "選択した種類ごとの結果です。各種類の中では原文の出現順を維持します。", noMatch: "一致する結果がありません。", position: "位置", matches: "件", total: "全体結果", selectedTypes: "選択タイプ", chars: "入力文字",
    copy: "結果をコピー", save: "TXTをダウンロード", copied: "結果をコピーしました。", saved: "TXTファイルを保存しました。", copyFailed: "クリップボードへコピーできませんでした。結果を選択して手動でコピーしてください。",
    emptyInput: "抽出するテキストを入力してください。", noType: "抽出タイプを1つ以上選択してください。", inputTooLong: "入力がサービス上限を超えています。", perTypeTooMany: "1種類の結果がサービス上限を超えています。", totalTooMany: "抽出結果の合計がサービス上限を超えています。", invalidFile: "TXT・MD・CSVのテキストファイルのみ使用できます。", readFailed: "ファイルを読み込めませんでした。別のファイルで再試行してください。", replaceWarning: "新しいファイルを読み込むと、現在の原文・結果・抽出タイプが初期化されます。続けますか？", cancelReplace: "キャンセル", confirmReplace: "確認",
    limit: `サービス上限: ${TOOL041_MAX_CHARS.toLocaleString("ja-JP")}文字 · 種類ごと${TOOL041_MAX_MATCHES_PER_TYPE.toLocaleString("ja-JP")}件 · 全体${TOOL041_MAX_TOTAL_RESULTS.toLocaleString("ja-JP")}件`,
    sampleText: "FIXLGS hello@example.com\nWeb https://toolbox.fixlgs.com\n電話 010-1234-5678\n価格 12,500 #ウェブツール #FIXLGS",
  },
} as const;

function isSupportedTextFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number]);
}
function formatBytes(size: number, locale: Locale): string {
  if (size < 1024) return `${size.toLocaleString()} B`;
  const localeId = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
  return `${(size / 1024).toLocaleString(localeId, { maximumFractionDigits: 1 })} KB`;
}

export function TextExtractorTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const localeId = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
  const [sourceText, setSourceText] = useState("");
  const [selected, setSelected] = useState<Tool041Type[]>(TYPES);
  const [results, setResults] = useState<Tool041Results>(emptyResults);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const total = countTool041Results(results);
  const flat = useMemo(() => allTool041Matches(results), [results]);
  const hasCurrentWork = Boolean(hasStarted || sourceText || loadedFile || total || selected.length !== TYPES.length);
  const invalidateResult = () => { setResults(emptyResults()); setStatus(""); setError(""); };
  const updateSource = (value: string) => { setHasStarted(true); setSourceText(value); invalidateResult(); };
  const toggle = (type: Tool041Type) => { setSelected((cur) => cur.includes(type) ? cur.filter((x) => x !== type) : [...cur, type]); invalidateResult(); };

  const runExtract = () => {
    setStatus(""); setError("");
    if (!sourceText) { setError(t.emptyInput); setResults(emptyResults()); return; }
    if (!selected.length) { setError(t.noType); setResults(emptyResults()); return; }
    if (sourceText.length > TOOL041_MAX_CHARS) { setError(t.inputTooLong); setResults(emptyResults()); return; }
    const next = extractTool041(sourceText, selected);
    if (Object.values(next).some((list) => list.length > TOOL041_MAX_MATCHES_PER_TYPE)) { setError(t.perTypeTooMany); setResults(emptyResults()); return; }
    if (countTool041Results(next) > TOOL041_MAX_TOTAL_RESULTS) { setError(t.totalTooMany); setResults(emptyResults()); return; }
    setResults(next);
  };

  const serialize = () => TYPES.filter((type) => selected.includes(type)).flatMap((type) => results[type].map((item) => item.value)).join("\n");
  const reset = () => { setSourceText(""); setSelected(TYPES); setResults(emptyResults()); setError(""); setStatus(""); setLoadedFile(null); setHasStarted(false); setDragActive(false); setPendingFile(null); if (fileInput.current) fileInput.current.value = ""; };
  const copyResult = async () => { const value = serialize(); if (!value) return; try { await navigator.clipboard.writeText(value); setStatus(t.copied); setError(""); } catch { setStatus(""); setError(t.copyFailed); } };
  const downloadResult = () => { const value = serialize(); if (!value) return; const blob = new Blob([value], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "extracted-text.txt"; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0); setStatus(t.saved); setError(""); };

  const loadFile = async (file: File) => {
    setDragActive(false); setStatus("");
    try { const content = await file.text(); setSourceText(content); setLoadedFile({ name: file.name, size: file.size }); setHasStarted(true); setSelected(TYPES); setResults(emptyResults()); setError(""); }
    catch { setError(t.readFailed); }
    finally { if (fileInput.current) fileInput.current.value = ""; }
  };
  const requestFileLoad = (file: File) => { setDragActive(false); setStatus(""); if (!isSupportedTextFile(file)) { setError(t.invalidFile); if (fileInput.current) fileInput.current.value = ""; return; } if (hasCurrentWork) { setPendingFile(file); return; } void loadFile(file); };
  const cancelFileReplace = () => { setPendingFile(null); if (fileInput.current) fileInput.current.value = ""; };
  const confirmFileReplace = () => { const file = pendingFile; setPendingFile(null); if (file) void loadFile(file); };
  const onDragEnter = (event: DragEvent<HTMLElement>) => { if (!Array.from(event.dataTransfer.types).includes("Files")) return; event.preventDefault(); setDragActive(true); };
  const onDragOver = (event: DragEvent<HTMLElement>) => { if (!Array.from(event.dataTransfer.types).includes("Files")) return; event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDragActive(true); };
  const onDragLeave = (event: DragEvent<HTMLElement>) => { const next = event.relatedTarget as Node | null; if (!next || !event.currentTarget.contains(next)) setDragActive(false); };
  const onDrop = (event: DragEvent<HTMLElement>) => { if (!Array.from(event.dataTransfer.types).includes("Files")) return; event.preventDefault(); setDragActive(false); const file = event.dataTransfer.files?.[0]; if (file) requestFileLoad(file); };

  return <div className={styles.root} data-testid="tool041-root">
    <div className={styles.localNotice} data-testid="tool041-local-notice"><strong>LOCAL</strong><span>{t.local}</span></div>
    <input ref={fileInput} className={styles.hiddenInput} type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" data-testid="tool041-file-input" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) requestFileLoad(file); }} />

    <section className={`${styles.activeWorkspace} ${dragActive ? styles.workspaceDragging : ""}`} data-testid="tool041-workspace" data-drag-active={dragActive ? "true" : "false"} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={styles.editorCard} data-testid="tool041-input-zone">
        {loadedFile && <div className={styles.fileBar} data-testid="tool041-file-info"><div><span>{t.loadedFile}</span><strong>{loadedFile.name}</strong><small>{formatBytes(loadedFile.size, locale)} · {t.supported}</small></div><button type="button" className={styles.button} onClick={() => fileInput.current?.click()}>{t.replaceFile}</button></div>}
        <div className={styles.textareaShell}>
          {!hasStarted && !loadedFile && <div className={styles.startDropzone} data-testid="tool041-start-dropzone"><span className={styles.plusIcon} aria-hidden="true">+</span><h2>{t.inputTitle}</h2><p>{t.dropHint}</p><button type="button" className={styles.fileButton} onClick={() => fileInput.current?.click()} data-testid="tool041-file-button">{t.chooseFile}</button></div>}
          <label className={styles.visibleLabel} htmlFor="tool041-source">{t.input}</label>
          <textarea id="tool041-source" aria-label={t.input} className={`${styles.textarea} ${hasStarted || loadedFile ? styles.textareaLoaded : styles.textareaInitial}`} value={sourceText} maxLength={TOOL041_MAX_CHARS + 1} placeholder={t.placeholder} onChange={(event) => updateSource(event.currentTarget.value)} data-testid="tool041-source" />
          <div className={styles.editorHead}><span>{t.inputHelp}</span><em>{sourceText.length.toLocaleString(localeId)} / {TOOL041_MAX_CHARS.toLocaleString(localeId)}</em></div>
        </div>
        <div className={styles.editorFoot}><p className={styles.privacy}>{t.privacy} · {t.limit}</p><div className={styles.textActions}><button type="button" className={styles.button} onClick={() => { setLoadedFile(null); updateSource(t.sampleText); }} data-testid="tool041-sample">{t.sample}</button><button type="button" className={styles.button} onClick={reset} disabled={!hasCurrentWork} data-testid="tool041-reset">{t.reset}</button></div></div>
      </div>

      <details className={styles.optionsCard} open data-testid="tool041-options">
        <summary className={styles.optionsSummary}><span>{t.options}</span><em>{selected.length.toLocaleString(localeId)} / {TYPES.length.toLocaleString(localeId)} · {t.optionsHelp}</em></summary>
        <div className={styles.optionsBody}>
          <div className={styles.optionGrid} data-testid="tool041-types">{TYPES.map((type) => <label className={styles.toggleCard} key={type}><input type="checkbox" checked={selected.includes(type)} onChange={() => toggle(type)} data-testid={`tool041-type-${type}`} />{t[type]}</label>)}</div>
          <div className={styles.smallActions}><button type="button" className={styles.button} onClick={() => { setSelected(TYPES); invalidateResult(); }} data-testid="tool041-select-all">{t.selectAll}</button><button type="button" className={styles.button} onClick={() => { setSelected([]); invalidateResult(); }} data-testid="tool041-clear-all">{t.clearAll}</button></div>
        </div>
      </details>

      <div className={styles.actionRow}><button type="button" className={styles.primaryButton} onClick={runExtract} disabled={!sourceText || !selected.length} data-testid="tool041-extract">{t.extract}</button></div>

      <div className={styles.editorCard} data-testid="tool041-result-card"><div className={styles.resultHead}><span className={styles.visibleLabel}>{t.result}</span><span data-testid="tool041-total-count">{total.toLocaleString(localeId)} {t.matches}</span></div><div className={styles.resultsGrid} data-testid="tool041-results-grid">{TYPES.filter((type) => selected.includes(type)).map((type) => <article className={styles.resultCard} key={type} data-testid={`tool041-result-${type}`}><div className={styles.resultHead}><strong>{t[type]}</strong><span>{results[type].length.toLocaleString(localeId)} {t.matches}</span></div><div className={styles.resultList}>{results[type].length === 0 ? <p className={styles.empty}>{t.noMatch}</p> : results[type].map((item, index) => <div className={styles.resultItem} key={`${item.startIndex}-${item.endIndex}-${index}`}><span className={styles.index}>{t.position} {item.startIndex.toLocaleString(localeId)}</span><span className={styles.value}>{item.value}</span></div>)}</div></article>)}</div><p className={styles.notice}>{t.resultHelp}</p></div>
      <section className={styles.stats} aria-label={t.result} data-testid="tool041-summary"><div className={styles.secondaryGrid}><article className={styles.secondaryCard}><span>{t.total}</span><strong>{total.toLocaleString(localeId)}</strong></article><article className={styles.secondaryCard}><span>{t.selectedTypes}</span><strong>{selected.length.toLocaleString(localeId)}</strong></article><article className={styles.secondaryCard}><span>{t.chars}</span><strong>{sourceText.length.toLocaleString(localeId)}</strong></article></div></section>
      <div className={styles.actionRow}><button type="button" className={styles.button} onClick={() => void copyResult()} disabled={!flat.length} data-testid="tool041-copy">{t.copy}</button><button type="button" className={styles.primaryButton} onClick={downloadResult} disabled={!flat.length} data-testid="tool041-download">{t.save}</button></div>
      {status && <p className={styles.copyStatus} role="status" aria-live="polite" data-testid="tool041-status">{status}</p>}
      {error && <p className={styles.error} role="alert" data-testid="tool041-error">{error}</p>}
    </section>

    {pendingFile && <div className={styles.dialogBackdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) cancelFileReplace(); }}><section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="tool041-replace-title" data-testid="tool041-replace-dialog"><h2 id="tool041-replace-title">{t.replaceFile}</h2><p>{t.replaceWarning}</p><div className={styles.dialogActions}><button type="button" className={styles.button} onClick={cancelFileReplace} data-testid="tool041-replace-cancel">{t.cancelReplace}</button><button type="button" className={styles.primaryButton} onClick={confirmFileReplace} data-testid="tool041-replace-confirm">{t.confirmReplace}</button></div></section></div>}
  </div>;
}
