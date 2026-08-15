"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { Locale } from "@/lib/site";
import {
  TOOL030_LIMIT_DISPLAY,
  TOOL030_LIMITS,
  clonePageState,
  insertBlankPage,
  moveSelected,
  normalizeRotation,
  organizedFilename,
  resolveBlankPageSize,
  summarizeChanges,
  type Tool030BlankPosition,
  type Tool030BlankSize,
  type Tool030PageState,
} from "@/lib/tool-030-pdf";
import styles from "./pdf-page-organizer-tool.module.css";

type PdfJsPage = {
  getViewport: (options: { scale: number; rotation?: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number }; canvas: HTMLCanvasElement }) => { promise: Promise<void>; cancel?: () => void };
};
type PdfJsDocument = { getPage: (pageNumber: number) => Promise<PdfJsPage>; destroy?: () => Promise<void> | void };

type Verification = { pageCount: number; rotationMatches: boolean; sizeMatches: boolean };

const ui = {
  ko: {
    choose: "PDF 선택", replace: "새 PDF", local: "파일은 브라우저 안에서만 처리됩니다.", drop: "PDF를 끌어놓거나 선택하세요", dropSub: `1개 PDF · ${TOOL030_LIMIT_DISPLAY.maxFileMiB}MB / 원본 ${TOOL030_LIMIT_DISPLAY.maxSourcePages}페이지`,
    selected: "선택", pages: "페이지", all: "전체 선택", clear: "선택 해제", delete: "삭제", duplicate: "복제", left: "왼쪽 회전", right: "오른쪽 회전", blank: "빈 페이지 추가", reverse: "역순 정렬", undo: "실행 취소", redo: "다시 실행",
    moveUp: "위로", moveDown: "아래로", moveFirst: "맨 앞으로", moveLast: "맨 뒤로", current: "현재", original: "원본", duplicateBadge: "복제", blankBadge: "빈 페이지", drag: "드래그 이동",
    blankTitle: "빈 페이지 설정", position: "삽입 위치", before: "선택 페이지 앞", after: "선택 페이지 뒤", first: "맨 앞", last: "맨 뒤", size: "페이지 크기", adjacent: "인접 페이지와 동일", a4: "A4", letter: "Letter", add: "추가", cancel: "닫기",
    result: "결과 PDF", filename: "결과 파일명", summary: "변경 요약", save: "PDF 저장", download: "다운로드", continueEdit: "계속 편집", reset: "초기화", verified: "결과 재검증 완료", creating: "PDF 생성 중…",
    deleteConfirm: "선택한 페이지를 삭제합니다.", reverseConfirm: "전체 페이지 순서를 반대로 바꿉니다. 실행 취소로 되돌릴 수 있습니다. 계속할까요?", lastPage: "최소 1페이지는 남아 있어야 합니다.", selectFirst: "먼저 페이지를 선택하세요.", selectAnchor: "선택 페이지 앞/뒤에 넣으려면 기준 페이지를 하나 이상 선택하세요.", limit: `편집 후 페이지는 최대 ${TOOL030_LIMIT_DISPLAY.maxEditedPages}페이지입니다.`, invalid: "정상 PDF 파일을 선택하세요.", encrypted: "암호화된 PDF는 암호 우회 없이 처리하지 않습니다.", damaged: "PDF를 읽을 수 없습니다. 손상되었거나 지원되지 않는 구조일 수 있습니다.", tooLarge: `PDF는 ${TOOL030_LIMIT_DISPLAY.maxFileMiB}MB 이하만 처리합니다.`, tooMany: `원본 PDF는 ${TOOL030_LIMIT_DISPLAY.maxSourcePages}페이지 이하만 처리합니다.`, zero: "페이지가 없는 PDF는 처리할 수 없습니다.", error: "처리 중 오류가 발생했습니다. 다른 PDF로 다시 시도할 수 있습니다.", noSelection: "선택 없음",
    changeDeleted: "삭제", changeDuplicated: "복제", changeRotated: "회전 상태", changeBlanks: "빈 페이지", resultPages: "결과 페이지", rotateBadge: "회전",
  },
  en: {
    choose: "Choose PDF", replace: "New PDF", local: "The file is processed only in your browser.", drop: "Drop a PDF here or choose a file", dropSub: `1 PDF · ${TOOL030_LIMIT_DISPLAY.maxFileMiB}MB / ${TOOL030_LIMIT_DISPLAY.maxSourcePages} source pages`,
    selected: "Selected", pages: "pages", all: "Select all", clear: "Clear selection", delete: "Delete", duplicate: "Duplicate", left: "Rotate left", right: "Rotate right", blank: "Add blank page", reverse: "Reverse order", undo: "Undo", redo: "Redo",
    moveUp: "Move up", moveDown: "Move down", moveFirst: "Move to first", moveLast: "Move to last", current: "Current", original: "Original", duplicateBadge: "Duplicate", blankBadge: "Blank page", drag: "Drag to reorder",
    blankTitle: "Blank page settings", position: "Insert position", before: "Before selected page", after: "After selected page", first: "First", last: "Last", size: "Page size", adjacent: "Match adjacent page", a4: "A4", letter: "Letter", add: "Add", cancel: "Close",
    result: "Result PDF", filename: "Result filename", summary: "Change summary", save: "Save PDF", download: "Download", continueEdit: "Continue editing", reset: "Reset", verified: "Result recheck passed", creating: "Creating PDF…",
    deleteConfirm: "Delete the selected pages.", reverseConfirm: "Reverse the entire page order? You can undo this action.", lastPage: "At least one page must remain.", selectFirst: "Select one or more pages first.", selectAnchor: "Select a page before inserting before or after it.", limit: `The edited-page limit is ${TOOL030_LIMIT_DISPLAY.maxEditedPages}.`, invalid: "Choose a valid PDF file.", encrypted: "Encrypted PDFs are not bypassed or decrypted by this tool.", damaged: "The PDF could not be read. It may be damaged or unsupported.", tooLarge: `The PDF size limit is ${TOOL030_LIMIT_DISPLAY.maxFileMiB}MB.`, tooMany: `The source-page limit is ${TOOL030_LIMIT_DISPLAY.maxSourcePages}.`, zero: "A zero-page PDF cannot be processed.", error: "An error occurred. You can choose another PDF and try again.", noSelection: "No selection",
    changeDeleted: "Deleted", changeDuplicated: "Duplicates", changeRotated: "Rotated state", changeBlanks: "Blank pages", resultPages: "Result pages", rotateBadge: "rotation",
  },
  ja: {
    choose: "PDF を選択", replace: "新しいPDF", local: "ファイルはブラウザ内だけで処理します。", drop: "PDFをドロップするか選択してください", dropSub: `PDF 1個 · ${TOOL030_LIMIT_DISPLAY.maxFileMiB}MB / 元PDF ${TOOL030_LIMIT_DISPLAY.maxSourcePages}ページ`,
    selected: "選択", pages: "ページ", all: "すべて選択", clear: "選択解除", delete: "ページを削除", duplicate: "複製", left: "左に回転", right: "右に回転", blank: "空白ページを追加", reverse: "逆順に並べる", undo: "元に戻す", redo: "やり直す",
    moveUp: "上へ", moveDown: "下へ", moveFirst: "先頭へ移動", moveLast: "末尾へ移動", current: "現在", original: "元", duplicateBadge: "複製", blankBadge: "空白ページ", drag: "ドラッグで移動",
    blankTitle: "空白ページ設定", position: "挿入位置", before: "選択ページの前", after: "選択ページの後", first: "先頭", last: "末尾", size: "ページサイズ", adjacent: "隣接ページと同じ", a4: "A4", letter: "Letter", add: "追加", cancel: "閉じる",
    result: "結果PDF", filename: "結果ファイル名", summary: "変更概要", save: "PDF を保存", download: "ダウンロード", continueEdit: "編集を続ける", reset: "リセット", verified: "結果の再検証完了", creating: "PDFを作成中…",
    deleteConfirm: "選択したページを削除します。", reverseConfirm: "全ページを逆順に並べます。元に戻すことができます。続けますか？", lastPage: "最低1ページは残してください。", selectFirst: "先にページを選択してください。", selectAnchor: "前後に追加する場合は基準ページを選択してください。", limit: `編集後ページ数の上限は ${TOOL030_LIMIT_DISPLAY.maxEditedPages}ページです。`, invalid: "有効なPDFファイルを選択してください。", encrypted: "暗号化PDFのパスワード回避・解除は行いません。", damaged: "PDFを読み込めません。破損または未対応構造の可能性があります。", tooLarge: `PDFサイズの上限は ${TOOL030_LIMIT_DISPLAY.maxFileMiB}MBです。`, tooMany: `元PDFの上限は ${TOOL030_LIMIT_DISPLAY.maxSourcePages}ページです。`, zero: "0ページPDFは処理できません。", error: "処理中にエラーが発生しました。別のPDFで再試行できます。", noSelection: "選択なし",
    changeDeleted: "削除", changeDuplicated: "複製", changeRotated: "回転状態", changeBlanks: "空白ページ", resultPages: "結果ページ", rotateBadge: "回転",
  },
} as const;

function makeId(prefix = "p") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

let thumbnailActive = 0;
const thumbnailQueue: Array<() => void> = [];
function scheduleThumbnailRender<T>(job: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const start = () => {
      thumbnailActive += 1;
      job().then(resolve, reject).finally(() => {
        thumbnailActive = Math.max(0, thumbnailActive - 1);
        thumbnailQueue.shift()?.();
      });
    };
    if (thumbnailActive < TOOL030_LIMITS.thumbnailConcurrency) start();
    else thumbnailQueue.push(start);
  });
}

function PdfThumbnail({ doc, item, label }: { doc: PdfJsDocument | null; item: Tool030PageState; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!doc || item.isBlank || item.sourcePageIndex === null) return;
    let cancelled = false;
    let renderTask: { promise: Promise<void>; cancel?: () => void } | null = null;
    void scheduleThumbnailRender(async () => {
      try {
        if (cancelled) return;
        const page = await doc.getPage(item.sourcePageIndex! + 1);
        if (cancelled) return;
        const raw = page.getViewport({ scale: 1, rotation: item.rotation });
        const scale = Math.min(1.2, 190 / Math.max(raw.width, 1));
        const viewport = page.getViewport({ scale, rotation: item.rotation });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(viewport.width * ratio));
        canvas.height = Math.max(1, Math.round(viewport.height * ratio));
        canvas.style.width = `${Math.round(viewport.width)}px`;
        canvas.style.height = `${Math.round(viewport.height)}px`;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("NO_CONTEXT");
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        renderTask = page.render({ canvasContext: context, viewport, canvas });
        await renderTask.promise;
        if (!cancelled) setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      }
    });
    return () => { cancelled = true; renderTask?.cancel?.(); };
  }, [doc, item.sourcePageIndex, item.rotation, item.isBlank]);

  if (item.isBlank) return <div className={styles.blankPreview} aria-label={label}><span>PDF</span></div>;
  return <div className={styles.canvasFrame}>{failed ? <div className={styles.previewFallback}>PDF</div> : null}<canvas ref={canvasRef} aria-label={label} /></div>;
}

export function PdfPageOrganizerTool({ locale }: { locale: Locale }) {
  const t = ui[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const previewDocRef = useRef<PdfJsDocument | null>(null);
  const loadGeneration = useRef(0);
  const lastSelectedIndex = useRef<number | null>(null);
  const dragIds = useRef<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [workspaceDragging, setWorkspaceDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [sourceCount, setSourceCount] = useState(0);
  const [pages, setPages] = useState<Tool030PageState[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [past, setPast] = useState<Tool030PageState[][]>([]);
  const [future, setFuture] = useState<Tool030PageState[][]>([]);
  const [previewDoc, setPreviewDoc] = useState<PdfJsDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [blankOpen, setBlankOpen] = useState(false);
  const [blankPosition, setBlankPosition] = useState<Tool030BlankPosition>("after");
  const [blankSize, setBlankSize] = useState<Tool030BlankSize>("adjacent");
  const [outputName, setOutputName] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultBytes, setResultBytes] = useState(0);
  const [verification, setVerification] = useState<Verification | null>(null);

  const hasPdf = pages.length > 0 && sourceBytes !== null;
  const summary = useMemo(() => summarizeChanges(pages, sourceCount), [pages, sourceCount]);
  const selectedCount = selected.size;
  const dragActive = dragging || workspaceDragging;

  const clearResult = useCallback(() => {
    setVerification(null); setResultBytes(0);
    setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return ""; });
  }, []);

  const resetAll = useCallback(() => {
    clearResult();
    loadGeneration.current += 1;
    const currentPreview = previewDocRef.current;
    previewDocRef.current = null;
    void currentPreview?.destroy?.();
    setPreviewDoc(null); setSourceBytes(null); setPages([]); setSelected(new Set()); setPast([]); setFuture([]); setFileName(""); setFileSize(0); setSourceCount(0); setError(""); setStatus(""); setBlankOpen(false); setOutputName("");
    if (inputRef.current) inputRef.current.value = "";
  }, [clearResult]);

  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  const commit = useCallback((next: Tool030PageState[], message = "") => {
    if (next.length > TOOL030_LIMITS.maxEditedPages) { setError(t.limit); return false; }
    setPast((old) => [...old.slice(-(TOOL030_LIMITS.historySteps - 1)), clonePageState(pages)]);
    setFuture([]); setPages(next); setSelected((old) => new Set([...old].filter((id) => next.some((p) => p.id === id)))); setError(""); setStatus(message); clearResult();
    return true;
  }, [pages, t.limit, clearResult]);

  const loadPdf = useCallback(async (file: File) => {
    const generation = ++loadGeneration.current;
    setError(""); setStatus(""); clearResult();
    if (file.size <= 0 || file.size > TOOL030_LIMITS.maxFileBytes) { setError(file.size > TOOL030_LIMITS.maxFileBytes ? t.tooLarge : t.invalid); return; }
    if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { setError(t.invalid); return; }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const signature = new TextDecoder("latin1").decode(bytes.slice(0, 5));
      if (signature !== "%PDF-") throw new Error("INVALID_PDF");
      const [{ PDFDocument }, pdfjs] = await Promise.all([import("pdf-lib"), import("pdfjs-dist/webpack.mjs")]);
      let parsed;
      try { parsed = await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false }); }
      catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (/encrypt|password/i.test(message)) throw new Error("ENCRYPTED_PDF");
        throw e;
      }
      const sourcePages = parsed.getPages();
      if (!sourcePages.length) throw new Error("ZERO_PAGES");
      if (sourcePages.length > TOOL030_LIMITS.maxSourcePages) throw new Error("TOO_MANY_PAGES");
      const pageState: Tool030PageState[] = sourcePages.map((page, i) => {
        const { width, height } = page.getSize();
        return { id: makeId("src"), sourcePageIndex: i, originalPageNumber: i + 1, rotation: normalizeRotation(page.getRotation().angle), isDuplicate: false, isBlank: false, width, height };
      });

      const previousPreview = previewDocRef.current;
      previewDocRef.current = null;
      setPreviewDoc(null);
      await previousPreview?.destroy?.();
      if (generation !== loadGeneration.current) return;

      const task = pdfjs.getDocument({ data: bytes.slice() });
      const nextPreviewDoc = await task.promise as unknown as PdfJsDocument;
      if (generation !== loadGeneration.current) {
        await nextPreviewDoc.destroy?.();
        return;
      }
      previewDocRef.current = nextPreviewDoc;
      setPreviewDoc(nextPreviewDoc);
      setSourceBytes(bytes); setFileName(file.name); setFileSize(file.size); setSourceCount(pageState.length); setPages(pageState); setSelected(new Set()); setPast([]); setFuture([]); setOutputName(organizedFilename(file.name)); setBlankOpen(false); setStatus(`${file.name} · ${pageState.length} ${t.pages}`);
    } catch (e) {
      if (generation !== loadGeneration.current) return;
      const message = e instanceof Error ? e.message : String(e);
      if (message === "ENCRYPTED_PDF") setError(t.encrypted);
      else if (message === "ZERO_PAGES") setError(t.zero);
      else if (message === "TOO_MANY_PAGES") setError(t.tooMany);
      else if (message === "INVALID_PDF") setError(t.invalid);
      else setError(t.damaged);
    } finally {
      if (generation === loadGeneration.current) setBusy(false);
    }
  }, [clearResult, t]);

  const onFiles = useCallback((files: FileList | File[]) => { const file = Array.from(files)[0]; if (file) void loadPdf(file); }, [loadPdf]);
  const openFilePicker = useCallback(() => {
    const input = inputRef.current;
    if (!input || busy) return;
    input.value = "";
    input.click();
  }, [busy]);
  const onFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length) onFiles(files);
  }, [onFiles]);

  const dropPdfFile = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    setDragging(false);
    setWorkspaceDragging(false);
    if (!busy) onFiles(event.dataTransfer.files);
  };

  const toggleSelection = useCallback((id: string, index: number, shift = false) => {
    setSelected((old) => {
      const next = new Set(old);
      if (shift && lastSelectedIndex.current !== null) {
        const start = Math.min(lastSelectedIndex.current, index), end = Math.max(lastSelectedIndex.current, index);
        for (let i = start; i <= end; i += 1) next.add(pages[i].id);
      } else if (next.has(id)) next.delete(id); else next.add(id);
      lastSelectedIndex.current = index;
      return next;
    });
  }, [pages]);

  const deleteSelected = () => {
    if (!selected.size) return setError(t.selectFirst);
    const next = pages.filter((p) => !selected.has(p.id));
    if (!next.length) return setError(t.lastPage);
    if (selected.size >= Math.max(5, Math.ceil(pages.length / 2)) && !window.confirm(t.deleteConfirm)) return;
    commit(next, t.delete);
  };

  const duplicateSelected = () => {
    if (!selected.size) return setError(t.selectFirst);
    const count = pages.length + selected.size;
    if (count > TOOL030_LIMITS.maxEditedPages) return setError(t.limit);
    const next: Tool030PageState[] = [];
    for (const item of pages) {
      next.push({ ...item });
      if (selected.has(item.id)) next.push({ ...item, id: makeId("dup"), isDuplicate: true });
    }
    commit(next, t.duplicate);
  };

  const rotateSelected = (delta: number) => {
    if (!selected.size) return setError(t.selectFirst);
    commit(pages.map((p) => selected.has(p.id) ? { ...p, rotation: normalizeRotation(p.rotation + delta) } : { ...p }), delta < 0 ? t.left : t.right);
  };

  const moveSelection = (direction: "up" | "down" | "first" | "last", forceId?: string) => {
    const ids = forceId ? new Set([forceId]) : selected;
    if (!ids.size) return setError(t.selectFirst);
    commit(moveSelected(pages, ids, direction), direction === "up" ? t.moveUp : direction === "down" ? t.moveDown : direction === "first" ? t.moveFirst : t.moveLast);
  };

  const reverseOrder = () => { if (window.confirm(t.reverseConfirm)) commit([...pages].reverse().map((p) => ({ ...p })), t.reverse); };

  const addBlank = () => {
    if ((blankPosition === "before" || blankPosition === "after") && !selected.size) return setError(t.selectAnchor);
    if (pages.length + 1 > TOOL030_LIMITS.maxEditedPages) return setError(t.limit);
    const size = resolveBlankPageSize(pages, selected, blankPosition, blankSize);
    const blank: Tool030PageState = { id: makeId("blank"), sourcePageIndex: null, originalPageNumber: null, rotation: 0, isDuplicate: false, isBlank: true, width: size.width, height: size.height };
    if (commit(insertBlankPage(pages, selected, blankPosition, blank), t.blank)) setBlankOpen(false);
  };

  const undo = () => {
    const previous = past[past.length - 1]; if (!previous) return;
    setPast((old) => old.slice(0, -1)); setFuture((old) => [clonePageState(pages), ...old].slice(0, TOOL030_LIMITS.historySteps)); setPages(clonePageState(previous)); setSelected(new Set()); setError(""); setStatus(t.undo); clearResult();
  };
  const redo = () => {
    const next = future[0]; if (!next) return;
    setFuture((old) => old.slice(1)); setPast((old) => [...old.slice(-(TOOL030_LIMITS.historySteps - 1)), clonePageState(pages)]); setPages(clonePageState(next)); setSelected(new Set()); setError(""); setStatus(t.redo); clearResult();
  };

  const dropBefore = (targetId: string) => {
    const ids = dragIds.current;
    if (!ids.length || ids.includes(targetId)) return;
    const idSet = new Set(ids);
    const moving = pages.filter((p) => idSet.has(p.id));
    const remaining = pages.filter((p) => !idSet.has(p.id));
    const targetIndex = remaining.findIndex((p) => p.id === targetId);
    if (targetIndex < 0) return;
    commit([...remaining.slice(0, targetIndex), ...moving, ...remaining.slice(targetIndex)], t.moveUp);
  };

  const createPdf = async () => {
    if (!sourceBytes || !pages.length) return;
    setBusy(true); setError(""); setStatus(t.creating); clearResult();
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const source = await PDFDocument.load(sourceBytes, { ignoreEncryption: false, updateMetadata: false });
      const output = await PDFDocument.create();
      for (const item of pages) {
        if (item.isBlank || item.sourcePageIndex === null) {
          const page = output.addPage([item.width, item.height]);
          page.setRotation(degrees(item.rotation));
        } else {
          const [copied] = await output.copyPages(source, [item.sourcePageIndex]);
          copied.setRotation(degrees(item.rotation));
          output.addPage(copied);
        }
      }
      const bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
      const verify = await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false });
      const resultPages = verify.getPages();
      const rotationMatches = resultPages.every((p, i) => normalizeRotation(p.getRotation().angle) === pages[i].rotation);
      const sizeMatches = resultPages.every((p, i) => {
        const size = p.getSize(); return Math.abs(size.width - pages[i].width) < 0.5 && Math.abs(size.height - pages[i].height) < 0.5;
      });
      if (resultPages.length !== pages.length || !rotationMatches || !sizeMatches) throw new Error("RESULT_VERIFY_FAILED");
      const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
      setResultBytes(blob.size); setVerification({ pageCount: resultPages.length, rotationMatches, sizeMatches }); setStatus(t.verified);
    } catch { setError(t.error); setStatus(""); }
    finally { setBusy(false); }
  };

  const download = () => {
    if (!resultUrl) return;
    const anchor = document.createElement("a"); anchor.href = resultUrl; anchor.download = organizedFilename(outputName || fileName); document.body.appendChild(anchor); anchor.click(); anchor.remove();
  };

  const summaryItems = [
    [t.resultPages, summary.pages], [t.changeDeleted, summary.deleted], [t.changeDuplicated, summary.duplicates], [t.changeRotated, summary.rotated], [t.changeBlanks, summary.blanks],
  ] as const;

  return <div className={styles.root} data-testid="tool030-root">
    <p className={styles.localNote}><strong>LOCAL ONLY</strong><span>{t.local}</span></p>
    <input ref={inputRef} className={styles.hiddenInput} type="file" accept="application/pdf,.pdf" onChange={onFileInputChange} data-testid="tool030-file-input" />
    {!hasPdf ? <section className={`${styles.dropzone} ${dragActive ? styles.dragging : ""}`}
      onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setDragging(true); } }}
      onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setDragging(true); } }}
      onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setDragging(false); }}
      onDrop={dropPdfFile}
      data-drag-active={dragActive ? "true" : "false"}
      data-testid="tool030-dropzone">
      <strong>{t.drop}</strong>
      <span>{t.dropSub}</span>
      <button type="button" className={styles.chooseButton} onClick={openFilePicker} disabled={busy}>{t.choose}</button>
    </section> : <section className={`${styles.uploadedFileBar} ${dragActive ? styles.dragging : ""}`}
      onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setDragging(true); } }}
      onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setDragging(true); } }}
      onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setDragging(false); }}
      onDrop={dropPdfFile}
      data-drag-active={dragActive ? "true" : "false"}
      data-testid="tool030-uploaded-file">
      <div className={styles.uploadedFileInfo}><strong>{fileName}</strong><span>{formatBytes(fileSize)} · {sourceCount} {t.pages}</span></div>
      <button type="button" className={styles.chooseButton} onClick={openFilePicker} disabled={busy}>{t.replace}</button>
    </section>}
    {error ? <div className={styles.error} role="alert" data-testid="tool030-error">{error}</div> : null}
    {status ? <div className={styles.status} aria-live="polite" data-testid="tool030-status">{status}</div> : null}

    {hasPdf ? <div
      className={`${styles.workspace} ${dragActive ? styles.workspaceDragging : ""}`}
      data-testid="tool030-workspace"
      data-drop-target="pdf-replace"
      data-drag-active={dragActive ? "true" : "false"}
      onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setWorkspaceDragging(true); } }}
      onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setWorkspaceDragging(true); } }}
      onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setWorkspaceDragging(false); }}
      onDrop={dropPdfFile}
    >
      <section className={styles.toolbar} aria-label={t.summary}>
        <div className={styles.selectionLine}><strong>{t.selected} {selectedCount}</strong><span>/ {pages.length} {t.pages}</span><button type="button" onClick={() => setSelected(new Set(pages.map((p) => p.id)))}>{t.all}</button><button type="button" onClick={() => setSelected(new Set())}>{t.clear}</button></div>
        <div className={styles.primaryActions}>
          <button type="button" onClick={deleteSelected} disabled={!selectedCount}>{t.delete}</button>
          <button type="button" onClick={duplicateSelected} disabled={!selectedCount}>{t.duplicate}</button>
          <button type="button" onClick={() => rotateSelected(-90)} disabled={!selectedCount}>{t.left}</button>
          <button type="button" onClick={() => rotateSelected(90)} disabled={!selectedCount}>{t.right}</button>
          <button type="button" className={styles.actionPrimary} onClick={() => setBlankOpen((v) => !v)}>{t.blank}</button>
        </div>
        <div className={styles.secondaryActions}>
          <button type="button" onClick={() => moveSelection("first")} disabled={!selectedCount}>{t.moveFirst}</button><button type="button" onClick={() => moveSelection("up")} disabled={!selectedCount}>{t.moveUp}</button><button type="button" onClick={() => moveSelection("down")} disabled={!selectedCount}>{t.moveDown}</button><button type="button" onClick={() => moveSelection("last")} disabled={!selectedCount}>{t.moveLast}</button>
          <button type="button" onClick={reverseOrder}>{t.reverse}</button><button type="button" onClick={undo} disabled={!past.length}>{t.undo}</button><button type="button" onClick={redo} disabled={!future.length}>{t.redo}</button>
        </div>
      </section>

      {blankOpen ? <section className={styles.blankPanel} data-testid="tool030-blank-panel"><div><strong>{t.blankTitle}</strong><span>{pages.length + 1} / {TOOL030_LIMIT_DISPLAY.maxEditedPages} {t.pages}</span></div><label>{t.position}<select value={blankPosition} onChange={(e) => setBlankPosition(e.target.value as Tool030BlankPosition)} data-testid="tool030-blank-position"><option value="before">{t.before}</option><option value="after">{t.after}</option><option value="first">{t.first}</option><option value="last">{t.last}</option></select></label><label>{t.size}<select value={blankSize} onChange={(e) => setBlankSize(e.target.value as Tool030BlankSize)} data-testid="tool030-blank-size"><option value="adjacent">{t.adjacent}</option><option value="a4">{t.a4}</option><option value="letter">{t.letter}</option></select></label><div className={styles.blankActions}><button type="button" className={styles.actionPrimary} onClick={addBlank}>{t.add}</button><button type="button" onClick={() => setBlankOpen(false)}>{t.cancel}</button></div></section> : null}

      <section className={styles.pageGrid} data-testid="tool030-page-grid">
        {pages.map((item, index) => {
          const isSelected = selected.has(item.id);
          return <article key={item.id} className={styles.pageCard} data-selected={isSelected ? "true" : "false"} data-current-index={index + 1} data-source-page={item.originalPageNumber ?? "blank"} data-rotation={item.rotation} data-duplicate={item.isDuplicate ? "true" : "false"} data-blank={item.isBlank ? "true" : "false"} data-testid="tool030-page-card"
            onDragOver={(e) => { if (!Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault(); }}
            onDrop={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) return; e.preventDefault(); dropBefore(item.id); }}>
            <div className={styles.cardHead}><label className={styles.checkLabel}><input type="checkbox" checked={isSelected} onChange={(e) => toggleSelection(item.id, index, (e.nativeEvent as MouseEvent).shiftKey)} aria-label={`${t.current} ${index + 1}`} /><span>{t.current} {index + 1}</span></label><span className={styles.sourceNo}>{item.originalPageNumber ? `${t.original} ${item.originalPageNumber}` : t.blankBadge}</span></div>
            <div className={styles.preview}><PdfThumbnail doc={previewDoc} item={item} label={`${t.current} ${index + 1}`} />{item.isDuplicate ? <span className={styles.badge}>{t.duplicateBadge}</span> : null}{item.isBlank ? <span className={styles.badge}>{t.blankBadge}</span> : null}{item.rotation ? <span className={`${styles.badge} ${styles.rotationBadge}`}>{item.rotation}°</span> : null}</div>
            <div className={styles.cardMeta}><span>{Math.round(item.width)}×{Math.round(item.height)} pt</span><span>{item.rotation}° {t.rotateBadge}</span></div>
            <div className={styles.cardMoves}><button type="button" title={t.moveFirst} onClick={() => moveSelection("first", item.id)}>⇤</button><button type="button" title={t.moveUp} onClick={() => moveSelection("up", item.id)}>↑</button><button type="button" className={styles.dragHandle} title={t.drag} draggable onDragStart={() => { dragIds.current = isSelected ? pages.filter((p) => selected.has(p.id)).map((p) => p.id) : [item.id]; }}>⋮⋮</button><button type="button" title={t.moveDown} onClick={() => moveSelection("down", item.id)}>↓</button><button type="button" title={t.moveLast} onClick={() => moveSelection("last", item.id)}>⇥</button></div>
          </article>;
        })}
      </section>

      <section className={styles.resultPanel} data-testid="tool030-result-panel">
        <div className={styles.resultHead}><div><span>PDF</span><strong>{t.result}</strong></div><div className={styles.summaryGrid}>{summaryItems.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>
        <label className={styles.filename}>{t.filename}<input value={outputName} maxLength={140} onChange={(e) => { setOutputName(e.target.value); clearResult(); }} data-testid="tool030-output-name" /></label>
        {verification ? <div className={styles.verification} data-testid="tool030-result-verification"><strong>{t.verified}</strong><span>{verification.pageCount} {t.pages} · {resultBytes ? formatBytes(resultBytes) : ""}</span></div> : null}
        <div className={styles.resultActions}><button type="button" className={styles.actionPrimary} onClick={() => void createPdf()} disabled={busy} data-testid="tool030-save">{busy ? t.creating : t.save}</button><button type="button" onClick={download} disabled={!resultUrl} data-testid="tool030-download">{t.download}</button><button type="button" onClick={() => { clearResult(); setStatus(t.continueEdit); }}>{t.continueEdit}</button><button type="button" onClick={resetAll}>{t.reset}</button></div>
      </section>
    </div> : null}
  </div>;
}
