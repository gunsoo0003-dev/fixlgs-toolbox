import { MOBILE_IMAGE_MAX_DIMENSION } from "@/lib/mobile-image-safety";

type WorkerFormat = "image/jpeg" | "image/png" | "image/webp";

type WorkerResult = { blob: Blob; width: number; height: number };


function getWorkerDiagnosticFault() {
  if (typeof window === "undefined") return { fault: "", timeoutMs: undefined as number | undefined };
  const host = window.location.hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
  if (!local) return { fault: "", timeoutMs: undefined as number | undefined };
  const diagnostic = (window as typeof window & { __TOOL001_WORKER_DIAGNOSTIC__?: { fault?: string; timeoutMs?: number } }).__TOOL001_WORKER_DIAGNOSTIC__;
  return {
    fault: typeof diagnostic?.fault === "string" ? diagnostic.fault : "",
    timeoutMs: typeof diagnostic?.timeoutMs === "number" ? diagnostic.timeoutMs : undefined,
  };
}

export function canUseTool001WorkerEngine() {
  return typeof window !== "undefined" && typeof Worker !== "undefined" && typeof Blob !== "undefined";
}

export function runTool001WorkerConversion(args: {
  blob: Blob;
  outputFormat: WorkerFormat;
  quality?: number;
  backgroundColor: string;
  sourceWidth?: number;
  sourceHeight?: number;
  maxPixels: number;
  mobile: boolean;
  timeoutMs?: number;
}): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    if (!canUseTool001WorkerEngine()) {
      reject(new Error("worker-unavailable"));
      return;
    }
    const worker = new Worker("/workers/tool001-image-worker.js");
    const diagnostic = getWorkerDiagnosticFault();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const timeout = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("worker-timeout"));
    }, diagnostic.timeoutMs ?? args.timeoutMs ?? 20_000);
    worker.onmessage = (event) => {
      const data = event.data;
      if (!data || data.id !== id) return;
      window.clearTimeout(timeout);
      worker.terminate();
      if (!data.ok) {
        if (typeof window !== "undefined" && data.error) {
          (window as typeof window & { __TOOL001_WORKER_LAST_ERROR__?: string }).__TOOL001_WORKER_LAST_ERROR__ = String(data.error);
        }
        reject(new Error(data.error || "worker-failed"));
        return;
      }
      if (typeof window !== "undefined" && data.diagnostic) {
        (window as typeof window & { __TOOL001_WORKER_LAST_DIAGNOSTIC__?: unknown }).__TOOL001_WORKER_LAST_DIAGNOSTIC__ = data.diagnostic;
      }
      resolve({ blob: data.blob, width: data.width, height: data.height });
    };
    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      reject(new Error("worker-runtime-error"));
    };
    worker.postMessage({
      id,
      blob: args.blob,
      outputFormat: args.outputFormat,
      quality: args.quality,
      backgroundColor: args.backgroundColor,
      sourceWidth: args.sourceWidth,
      sourceHeight: args.sourceHeight,
      maxPixels: args.maxPixels,
      maxDimension: args.mobile ? MOBILE_IMAGE_MAX_DIMENSION : 0,
      diagnosticFault: diagnostic.fault,
    });
  });
}
