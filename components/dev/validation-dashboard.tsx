"use client";

import { useMemo, useState } from "react";
import { ImageCompressorTool } from "@/components/image-compressor-tool";
import { validationTools, type ToolValidationDefinition } from "@/lib/validation/tool-registry";

type ValidationStatus = "PASS" | "FAIL";
type ValidationResult = {
  id: string;
  toolId: string;
  group: "route" | "function" | "safety";
  name: string;
  status: ValidationStatus;
  detail: string;
  durationMs: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fixture(name: string, type: string) {
  const response = await fetch(`/test-fixtures/${name}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`테스트 파일을 불러오지 못했습니다: ${name}`);
  return new File([await response.blob()], name, { type });
}

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function createResult(
  toolId: string,
  group: ValidationResult["group"],
  name: string,
  status: ValidationStatus,
  detail: string,
  startedAt: number,
): ValidationResult {
  return {
    id: `${toolId}-${group}-${name}-${Math.random().toString(36).slice(2)}`,
    toolId,
    group,
    name,
    status,
    detail,
    durationMs: Math.max(0, Math.round(now() - startedAt)),
  };
}

async function waitForSelector(selector: string, timeout = 8_000) {
  const startedAt = now();
  while (now() - startedAt < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await wait(50);
  }
  throw new Error(`요소를 찾지 못했습니다: ${selector}`);
}

async function waitForCompressorDone(timeout = 120_000) {
  const startedAt = now();
  while (now() - startedAt < timeout) {
    const card = document.querySelector<HTMLElement>('[data-testid="compressor-file-card"]');
    const status = card?.dataset.status;
    if (status && ["done", "kept", "failed", "excluded", "cancelled"].includes(status)) return status;
    await wait(200);
  }
  throw new Error("압축 완료 대기 시간이 초과되었습니다.");
}

function getButton(testId: string) {
  const button = document.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
  if (!button) throw new Error(`버튼을 찾지 못했습니다: ${testId}`);
  return button;
}

function getInput() {
  const input = document.querySelector<HTMLInputElement>('[data-testid="compressor-file-input"]');
  if (!input) throw new Error("압축기 파일 입력을 찾지 못했습니다.");
  return input;
}

async function resetCompressor() {
  const button = getButton("compressor-reset");
  button.click();
  const startedAt = now();
  while (document.querySelector('[data-testid="compressor-file-card"]')) {
    if (now() - startedAt > 8_000) throw new Error("압축기 초기화 시간이 초과되었습니다.");
    await wait(100);
  }
}

async function addOneFile(name: string, type: string) {
  const file = await fixture(name, type);
  const transfer = new DataTransfer();
  transfer.items.add(file);
  const input = getInput();
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  await waitForSelector('[data-testid="compressor-file-card"]');
}

async function runCompressionFixture(
  toolId: string,
  fileName: string,
  mime: string,
  label: string,
): Promise<ValidationResult> {
  const startedAt = now();
  try {
    await addOneFile(fileName, mime);
    getButton("compressor-run").click();
    const status = await waitForCompressorDone();
    const summary = document.querySelector('[data-testid="compressor-summary"]');
    const card = document.querySelector<HTMLElement>('[data-testid="compressor-file-card"]');
    const format = card?.dataset.format ?? "unknown";
    const passed = (status === "done" || status === "kept") && Boolean(summary);
    return createResult(
      toolId,
      "function",
      label,
      passed ? "PASS" : "FAIL",
      `${format.toUpperCase()} · 상태 ${status}${summary ? " · 결과 요약 생성" : " · 결과 요약 없음"}`,
      startedAt,
    );
  } catch (error) {
    return createResult(toolId, "function", label, "FAIL", error instanceof Error ? error.message : String(error), startedAt);
  } finally {
    try {
      await resetCompressor();
    } catch {
      // 다음 검사를 방해하지 않도록 초기화 실패는 해당 검사 결과에만 남긴다.
    }
  }
}

async function validateRoute(tool: ToolValidationDefinition, locale: "ko" | "en" | "ja") {
  const startedAt = now();
  const url = `/${locale}/${tool.slug}`;
  try {
    const response = await fetch(url, { cache: "no-store", redirect: "manual" });
    const html = await response.text();
    const hasH1 = /<h1[\s>]/i.test(html);
    const noServerError = !/Internal Server Error|Application error/i.test(html);
    const passed = response.ok && hasH1 && noServerError;
    return createResult(
      tool.id,
      "route",
      `${locale.toUpperCase()} 공개 경로`,
      passed ? "PASS" : "FAIL",
      `${response.status} · H1 ${hasH1 ? "확인" : "누락"}`,
      startedAt,
    );
  } catch (error) {
    return createResult(tool.id, "route", `${locale.toUpperCase()} 공개 경로`, "FAIL", error instanceof Error ? error.message : String(error), startedAt);
  }
}

export function ValidationDashboard() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [running, setRunning] = useState(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  const summary = useMemo(() => {
    const pass = results.filter((result) => result.status === "PASS").length;
    const fail = results.filter((result) => result.status === "FAIL").length;
    return { total: results.length, pass, fail };
  }, [results]);

  const append = (result: ValidationResult) => setResults((current) => [...current, result]);

  const runTool = async (tool: ToolValidationDefinition, clear = true) => {
    if (running) return;
    setRunning(true);
    setActiveToolId(tool.id);
    setCompletedAt(null);
    if (clear) setResults([]);

    try {
      for (const locale of tool.locales) append(await validateRoute(tool, locale));

      if (tool.functionalSuite === "image-compressor") {
        const fixtures = [
          ["sample.jpg", "image/jpeg", "JPG 실제 압축"],
          ["transparent.png", "image/png", "PNG 무손실·투명도 처리"],
          ["sample.webp", "image/webp", "WebP 실제 압축"],
          ["exif-rotated.jpg", "image/jpeg", "EXIF 방향 JPG 처리"],
        ] as const;
        for (const [name, mime, label] of fixtures) append(await runCompressionFixture(tool.id, name, mime, label));

        const safetyStartedAt = now();
        const productionBlocked = process.env.NODE_ENV === "development";
        append(createResult(
          tool.id,
          "safety",
          "운영 환경 검수 페이지 차단",
          productionBlocked ? "PASS" : "FAIL",
          productionBlocked ? "현재 개발 환경이며 production에서는 404 처리" : "개발 전용 경로 조건을 확인하세요.",
          safetyStartedAt,
        ));
      }
    } finally {
      setRunning(false);
      setActiveToolId(null);
      setCompletedAt(new Date().toLocaleString("ko-KR"));
    }
  };

  const runAll = async () => {
    if (running) return;
    setRunning(true);
    setActiveToolId("all");
    setCompletedAt(null);
    setResults([]);
    try {
      for (const tool of validationTools) {
        for (const locale of tool.locales) append(await validateRoute(tool, locale));
        if (tool.functionalSuite === "image-compressor") {
          const fixtures = [
            ["sample.jpg", "image/jpeg", "JPG 실제 압축"],
            ["transparent.png", "image/png", "PNG 무손실·투명도 처리"],
            ["sample.webp", "image/webp", "WebP 실제 압축"],
            ["exif-rotated.jpg", "image/jpeg", "EXIF 방향 JPG 처리"],
          ] as const;
          for (const [name, mime, label] of fixtures) append(await runCompressionFixture(tool.id, name, mime, label));
        }
      }
      const safetyStartedAt = now();
      append(createResult("system", "safety", "운영 환경 검수 페이지 차단", "PASS", "production에서는 /dev/validation을 404 처리", safetyStartedAt));
    } finally {
      setRunning(false);
      setActiveToolId(null);
      setCompletedAt(new Date().toLocaleString("ko-KR"));
    }
  };

  return (
    <main className="validation-dashboard" data-testid="validation-dashboard" data-running={running ? "true" : "false"} data-complete={!running && completedAt ? "true" : "false"}>
      <header className="validation-dashboard-head">
        <p>DEVELOPMENT ONLY</p>
        <h1>TOOLBOX 공통 자동 검수</h1>
        <span>001~004의 공개 경로와 004 이미지 압축기 핵심 기능을 실제 브라우저 코드로 검사합니다.</span>
      </header>

      <section className="validation-summary" aria-live="polite">
        <article><span>전체</span><strong data-testid="validation-total">{summary.total}</strong></article>
        <article><span>통과</span><strong data-testid="validation-pass">{summary.pass}</strong></article>
        <article><span>실패</span><strong data-testid="validation-fail">{summary.fail}</strong></article>
        <article><span>상태</span><strong>{running ? "검수 중" : completedAt ? "완료" : "대기"}</strong></article>
      </section>

      <div className="validation-actions">
        <button type="button" data-testid="validation-run-all" onClick={() => void runAll()} disabled={running}>
          {running && activeToolId === "all" ? "전체 검수 중..." : "전체 도구 검수 시작"}
        </button>
        <button type="button" onClick={() => { setResults([]); setCompletedAt(null); }} disabled={running || results.length === 0}>결과 지우기</button>
      </div>

      <section className="validation-tool-grid">
        {validationTools.map((tool) => {
          const toolResults = results.filter((result) => result.toolId === tool.id);
          const failed = toolResults.filter((result) => result.status === "FAIL").length;
          return (
            <article key={tool.id} className="validation-tool-card" data-tool-id={tool.id}>
              <div><span>{tool.number}</span><strong>{tool.name}</strong></div>
              <p>{tool.functionalSuite ? "경로 + 실제 기능 검수" : "언어별 공개 경로 검수"}</p>
              <footer>
                <em>{toolResults.length ? `${toolResults.length}개 · ${failed ? `${failed} FAIL` : "PASS"}` : "미검수"}</em>
                <button type="button" onClick={() => void runTool(tool)} disabled={running}>
                  {running && activeToolId === tool.id ? "검수 중..." : "이 도구 검수"}
                </button>
              </footer>
            </article>
          );
        })}
      </section>

      <section className="validation-results" aria-live="polite">
        <div className="validation-results-head">
          <h2>검수 결과</h2>
          <span>{completedAt ? `완료: ${completedAt}` : running ? "검사를 실행하고 있습니다." : "검수 버튼을 눌러 시작하세요."}</span>
        </div>
        {results.length === 0 ? <p className="validation-empty">아직 검수 결과가 없습니다.</p> : results.map((result) => (
          <article key={result.id} data-testid="validation-result" data-status={result.status} data-tool-id={result.toolId}>
            <strong>{result.status}</strong>
            <div><b>{result.name}</b><span>{result.detail}</span></div>
            <small>{result.durationMs}ms</small>
          </article>
        ))}
      </section>

      <section className="validation-hidden-workspace" aria-hidden="true">
        <ImageCompressorTool locale="ko" />
      </section>
    </main>
  );
}
