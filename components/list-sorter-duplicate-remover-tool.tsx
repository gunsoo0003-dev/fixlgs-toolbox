"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import { transformTool039, type Tool039Mode, TOOL039_LIMIT_CANDIDATES } from "@/lib/tool-039-list-operations";
import styles from "./list-sorter-duplicate-remover-tool.module.css";

const ACCEPTED_EXTENSIONS = ["txt", "md", "csv"] as const;
type LoadedFile = Readonly<{ name: string; size: number }>;
const modes: Tool039Mode[] = ["dedupe", "text", "numeric", "reverse", "shuffle"];

const copy = {
  ko: {
    local: "입력하거나 불러온 원문과 결과는 서버로 전송하거나 저장하지 않고 현재 브라우저에서만 처리합니다.",
    inputTitle: "목록을 입력·붙여넣거나 파일을 넣으세요",
    placeholder: "한 줄에 하나씩 목록을 입력하거나 붙여넣으세요…",
    inputMeta: "한 줄 = 목록 항목 1개 · 중복 제거와 정렬 기준을 선택할 수 있습니다.",
    privacy: "로컬 처리 · 서버 업로드 없음",
    dropHint: "TXT · MD · CSV 파일을 이 작업영역에 끌어다 놓아도 됩니다.",
    chooseFile: "텍스트 파일 선택", replaceFile: "새 파일 불러오기", loadedFile: "불러온 파일", supported: ".txt · .md · .csv",
    sample: "예시 넣기", clear: "전체 지우기", input: "원본 목록", result: "정리 결과", resultPlaceholder: "정리 방식을 선택하면 결과가 여기에 표시됩니다.",
    options: "정리 방식", optionsHelp: "중복 제거 · 가나다/알파벳 · 숫자순 · 역순 · 무작위 섞기", modeTitle: "정리 규칙 선택",
    dedupe: "중복 줄 제거", dedupeSub: "완전히 같은 줄의 첫 출현 유지", text: "가나다·알파벳순", textSub: "현재 한국어 페이지 기준 locale 정렬", numeric: "숫자순", numericSub: "유한 숫자값을 실제 숫자로 비교", reverse: "역순", reverseSub: "원문 줄 순서만 반전", shuffle: "무작위 섞기", shuffleSub: "Fisher-Yates 방식으로 순서만 변경",
    inputLines: "입력 줄", outputLines: "결과 줄", changed: "변경 상태", removed: (n: number) => `중복 ${n.toLocaleString("ko-KR")}개 제거`, nonNumeric: (n: number) => `비숫자 ${n.toLocaleString("ko-KR")}개`, unchanged: "변경 없음",
    copy: "결과 복사", save: "TXT 다운로드", copied: "결과를 복사했습니다.", saved: "TXT 파일을 저장했습니다.", copyFailed: "복사하지 못했습니다. 결과를 직접 선택해 복사해 주세요.", reset: "전체 지우기", reshuffle: "다시 섞기", empty: "목록을 입력하면 결과가 표시됩니다.",
    invalidFile: "TXT, MD, CSV 텍스트 파일만 사용할 수 있습니다.", readFailed: "파일 내용을 읽지 못했습니다. 다른 파일로 다시 시도해 주세요.", replaceWarning: "새 파일을 불러오면 현재 원문, 결과와 정리 방식이 초기화됩니다. 계속하시겠습니까?", cancelReplace: "취소", confirmReplace: "확인",
    sampleText: "김민수\n이서연\n김민수\n10\n2\n서울\n부산",
    limit: `서비스 상한 후보: ${TOOL039_LIMIT_CANDIDATES.maxCharacters.toLocaleString("ko-KR")}자 · ${TOOL039_LIMIT_CANDIDATES.maxLines.toLocaleString("ko-KR")}줄 (사용자 승인 전 후보값)`,
  },
  en: {
    local: "Text you type or load and the result stay in this browser and are not sent to or stored on a server.",
    inputTitle: "Type, paste, or drop a list file", placeholder: "Enter or paste one list item per line…", inputMeta: "1 line = 1 list item · Choose the operation you want to apply.", privacy: "Local processing · No server upload", dropHint: "You can also drop a TXT, MD, or CSV file anywhere in this workspace.",
    chooseFile: "Choose text file", replaceFile: "Load another file", loadedFile: "Loaded file", supported: ".txt · .md · .csv", sample: "Insert sample", clear: "Clear all", input: "Source list", result: "Processed result", resultPlaceholder: "Choose an operation to see the result here.",
    options: "List operation", optionsHelp: "Deduplicate · alphabetic · numeric · reverse · shuffle", modeTitle: "Choose operation",
    dedupe: "Remove duplicates", dedupeSub: "Keep the first exact line", text: "Alphabetical sort", textSub: "Sort with the current page locale", numeric: "Numeric sort", numericSub: "Compare finite numeric values", reverse: "Reverse order", reverseSub: "Reverse source order only", shuffle: "Shuffle", shuffleSub: "Change order with Fisher-Yates",
    inputLines: "Input lines", outputLines: "Result lines", changed: "Change summary", removed: (n: number) => `Removed ${n.toLocaleString("en-US")} duplicates`, nonNumeric: (n: number) => `${n.toLocaleString("en-US")} non-numeric lines`, unchanged: "No change",
    copy: "Copy result", save: "Download TXT", copied: "Result copied.", saved: "TXT file saved.", copyFailed: "Could not write to the clipboard. Select and copy the result manually.", reset: "Clear all", reshuffle: "Shuffle again", empty: "Enter a list to see the result.",
    invalidFile: "Only TXT, MD, and CSV text files are supported.", readFailed: "Could not read this file. Please try another file.", replaceWarning: "Loading a new file will reset the current source, result, and list operation. Continue?", cancelReplace: "Cancel", confirmReplace: "Continue",
    sampleText: "Apple\nOrange\nApple\n10\n2\nSeoul\nBusan",
    limit: `Service-limit candidate: ${TOOL039_LIMIT_CANDIDATES.maxCharacters.toLocaleString("en-US")} characters · ${TOOL039_LIMIT_CANDIDATES.maxLines.toLocaleString("en-US")} lines (candidate until user approval)`,
  },
  ja: {
    local: "入力・読込した原文と結果はサーバーへ送信・保存せず、このブラウザ内だけで処理します。",
    inputTitle: "一覧を入力・貼り付け・ファイル読込", placeholder: "1行に1項目ずつ一覧を入力または貼り付けてください…", inputMeta: "1行 = 1項目 · 処理方法を選択して結果を作成できます。", privacy: "ローカル処理 · サーバー送信なし", dropHint: "TXT・MD・CSVファイルをこの作業エリアへドラッグ＆ドロップできます。",
    chooseFile: "テキストファイルを選択", replaceFile: "別のファイルを読み込む", loadedFile: "読み込んだファイル", supported: ".txt · .md · .csv", sample: "サンプルを入力", clear: "すべてクリア", input: "元の一覧", result: "処理結果", resultPlaceholder: "処理方法を選ぶと結果がここに表示されます。",
    options: "処理方法", optionsHelp: "重複削除 · 五十音/アルファベット · 数値 · 逆順 · シャッフル", modeTitle: "処理ルールを選択",
    dedupe: "重複行を削除", dedupeSub: "完全一致する最初の行を残す", text: "五十音・アルファベット順", textSub: "現在のページ言語で照合", numeric: "数値順", numericSub: "有限の数値を実数として比較", reverse: "逆順", reverseSub: "元の行順だけを反転", shuffle: "シャッフル", shuffleSub: "Fisher-Yatesで順序だけ変更",
    inputLines: "入力行", outputLines: "結果行", changed: "変更内容", removed: (n: number) => `重複${n.toLocaleString("ja-JP")}件を削除`, nonNumeric: (n: number) => `非数値${n.toLocaleString("ja-JP")}行`, unchanged: "変更なし",
    copy: "結果をコピー", save: "TXTをダウンロード", copied: "結果をコピーしました。", saved: "TXTファイルを保存しました。", copyFailed: "クリップボードへコピーできませんでした。結果を選択して手動でコピーしてください。", reset: "すべてクリア", reshuffle: "もう一度シャッフル", empty: "一覧を入力すると結果が表示されます。",
    invalidFile: "TXT・MD・CSVのテキストファイルのみ使用できます。", readFailed: "ファイルを読み込めませんでした。別のファイルで再試行してください。", replaceWarning: "新しいファイルを読み込むと、現在の原文・結果・処理方法が初期化されます。続けますか？", cancelReplace: "キャンセル", confirmReplace: "確認",
    sampleText: "りんご\nみかん\nりんご\n10\n2\nソウル\n釜山",
    limit: `サービス上限候補: ${TOOL039_LIMIT_CANDIDATES.maxCharacters.toLocaleString("ja-JP")}文字 · ${TOOL039_LIMIT_CANDIDATES.maxLines.toLocaleString("ja-JP")}行（ユーザー承認前は候補値）`,
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

export function ListSorterDuplicateRemoverTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<Tool039Mode>("dedupe");
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const localeId = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
  const result = useMemo(() => { void shuffleNonce; return transformTool039(mode, source, locale); }, [mode, source, locale, shuffleNonce]);
  const changeSummary = mode === "dedupe" ? t.removed(result.removedDuplicates) : mode === "numeric" ? t.nonNumeric(result.nonNumericLines) : t.unchanged;
  const hasCurrentWork = Boolean(hasStarted || source || loadedFile || mode !== "dedupe");

  const updateSource = (value: string) => { setHasStarted(true); setSource(value); setStatus(""); setError(""); };
  const chooseMode = (next: Tool039Mode) => { setMode(next); setStatus(""); setError(""); if (next === "shuffle") setShuffleNonce((value) => value + 1); };
  const copyResult = async () => {
    if (!source) return;
    try { await navigator.clipboard.writeText(result.output); setStatus(t.copied); setError(""); } catch { setStatus(""); setError(t.copyFailed); }
  };
  const downloadResult = () => {
    if (!source) return;
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "processed-list.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus(t.saved);
    setError("");
  };
  const clearAll = () => { setSource(""); setMode("dedupe"); setShuffleNonce(0); setStatus(""); setError(""); setLoadedFile(null); setHasStarted(false); setDragActive(false); setPendingFile(null); if (fileInput.current) fileInput.current.value = ""; };

  const loadFile = async (file: File) => {
    setDragActive(false); setStatus("");
    try {
      const content = await file.text();
      setSource(content); setLoadedFile({ name: file.name, size: file.size }); setHasStarted(true); setMode("dedupe"); setShuffleNonce(0); setError("");
    } catch { setError(t.readFailed); }
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
  const labelFor = (item: Tool039Mode) => item === "dedupe" ? t.dedupe : item === "text" ? t.text : item === "numeric" ? t.numeric : item === "reverse" ? t.reverse : t.shuffle;

  return <div className={styles.root} data-testid="tool039-root">
    <div className={styles.localNotice} data-testid="tool039-local-notice"><strong>LOCAL</strong><span>{t.local}</span></div>
    <input ref={fileInput} className={styles.hiddenInput} type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" data-testid="tool039-file-input" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) requestFileLoad(file); }}/>

    <section className={`${styles.activeWorkspace} ${dragActive ? styles.workspaceDragging : ""}`} data-testid="tool039-workspace" data-drag-active={dragActive ? "true" : "false"} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={styles.editorCard} data-testid="tool039-input-zone">
        {loadedFile && <div className={styles.fileBar} data-testid="tool039-file-info"><div><span>{t.loadedFile}</span><strong>{loadedFile.name}</strong><small>{formatBytes(loadedFile.size, locale)} · {t.supported}</small></div><button type="button" className={styles.button} onClick={() => fileInput.current?.click()}>{t.replaceFile}</button></div>}
        <div className={styles.textareaShell}>
          {!hasStarted && !loadedFile && <div className={styles.startDropzone} data-testid="tool039-start-dropzone"><span className={styles.plusIcon} aria-hidden="true">+</span><h2>{t.inputTitle}</h2><p>{t.dropHint}</p><button type="button" className={styles.fileButton} onClick={() => fileInput.current?.click()} data-testid="tool039-file-button">{t.chooseFile}</button></div>}
          <label className={styles.visibleLabel} htmlFor="tool039-source">{t.input}</label>
          <textarea id="tool039-source" aria-label={t.input} className={`${styles.textarea} ${hasStarted || loadedFile ? styles.textareaLoaded : styles.textareaInitial}`} value={source} onChange={(event) => updateSource(event.currentTarget.value)} placeholder={t.placeholder} data-testid="tool039-source" />
          <div className={styles.editorHead}><span>{t.inputMeta}</span><em>{result.inputLines.toLocaleString(localeId)} {t.inputLines}</em></div>
        </div>
        <div className={styles.editorFoot}><p className={styles.privacy}>{t.privacy} · {t.limit}</p><div className={styles.textActions}><button type="button" className={styles.button} onClick={() => { setLoadedFile(null); updateSource(t.sampleText); }} data-testid="tool039-sample">{t.sample}</button><button type="button" className={styles.button} onClick={clearAll} disabled={!hasCurrentWork} data-testid="tool039-reset">{t.clear}</button></div></div>
      </div>

      <details className={styles.optionsCard} data-testid="tool039-options">
        <summary className={styles.optionsSummary}><span>{t.options}</span><em>{t.optionsHelp}</em></summary>
        <div className={styles.optionsBody}><div className={styles.optionSection}><div className={styles.optionTitle}><strong>{t.modeTitle}</strong></div><div className={styles.optionGrid} role="radiogroup" aria-label={t.options}>
          {modes.map((item) => <label className={styles.option} key={item}><input type="radio" name="tool039-mode" value={item} checked={mode === item} onChange={() => chooseMode(item)} data-testid={`tool039-mode-${item}`} /><span><strong>{labelFor(item)}</strong><small>{item === "dedupe" ? t.dedupeSub : item === "text" ? t.textSub : item === "numeric" ? t.numericSub : item === "reverse" ? t.reverseSub : t.shuffleSub}</small></span></label>)}
        </div></div></div>
      </details>

      <div className={styles.actionRow}>
        <button type="button" className={styles.primaryButton} onClick={() => setShuffleNonce((value) => value + 1)} disabled={!source || mode !== "shuffle"} data-testid="tool039-reshuffle">{t.reshuffle}</button>
      </div>

      <div className={styles.editorCard} data-testid="tool039-result-card">
        <div className={styles.resultHead}><label className={styles.visibleLabel} htmlFor="tool039-result">{t.result}</label><span>{result.outputLines.toLocaleString(localeId)} {t.outputLines}</span></div>
        <textarea id="tool039-result" aria-label={t.result} aria-describedby="tool039-result-note" className={`${styles.textarea} ${styles.resultTextarea}`} value={result.output} readOnly placeholder={t.resultPlaceholder} data-testid="tool039-result" />
        <p id="tool039-result-note" className={styles.notice}>{mode === "numeric" && result.nonNumericLines > 0 ? t.nonNumeric(result.nonNumericLines) : t.changed}</p>
        <p className={styles.notice}>{t.limit}</p>
      </div>

      <section className={styles.stats} aria-label={t.result} data-testid="tool039-summary"><div className={styles.secondaryGrid}><article className={styles.secondaryCard}><span>{t.inputLines}</span><strong data-testid="tool039-input-lines">{result.inputLines.toLocaleString(localeId)}</strong></article><article className={styles.secondaryCard}><span>{t.outputLines}</span><strong data-testid="tool039-output-lines">{result.outputLines.toLocaleString(localeId)}</strong></article><article className={styles.secondaryCard}><span>{t.changed}</span><strong data-testid="tool039-change-stat">{changeSummary}</strong></article></div></section>

      <div className={styles.actionRow}><button type="button" className={styles.button} onClick={() => void copyResult()} disabled={!source} data-testid="tool039-copy">{t.copy}</button><button type="button" className={styles.primaryButton} onClick={downloadResult} disabled={!source} data-testid="tool039-download">{t.save}</button></div>
      {status && <p className={styles.copyStatus} role="status" aria-live="polite" data-testid="tool039-status">{status}</p>}
      {error && <p className={styles.error} role="alert" data-testid="tool039-error">{error}</p>}
    </section>

    {pendingFile && <div className={styles.dialogBackdrop} data-testid="tool039-replace-dialog-backdrop"><section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="tool039-replace-title" data-testid="tool039-replace-dialog"><h2 id="tool039-replace-title">{t.replaceFile}</h2><p>{t.replaceWarning}</p><div className={styles.dialogActions}><button type="button" className={styles.button} onClick={cancelFileReplace} data-testid="tool039-replace-cancel">{t.cancelReplace}</button><button type="button" className={styles.primaryButton} onClick={confirmFileReplace} data-testid="tool039-replace-confirm">{t.confirmReplace}</button></div></section></div>}
  </div>;
}
