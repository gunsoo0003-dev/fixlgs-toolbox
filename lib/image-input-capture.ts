export const IMAGE_INPUT_CAPTURE_MAX_FILE_BYTES = 20 * 1024 * 1024;
export const IMAGE_INPUT_CAPTURE_BASE_TIMEOUT_MS = 8_000;
export const IMAGE_INPUT_CAPTURE_PER_MB_TIMEOUT_MS = 1_200;
export const IMAGE_INPUT_CAPTURE_MAX_ATTEMPT_TIMEOUT_MS = 32_000;
export const IMAGE_INPUT_CAPTURE_MAX_OVERALL_TIMEOUT_MS = 45_000;
const CAPTURE_RETRY_DELAYS_MS = [0, 160, 480] as const;


type CaptureDiagnosticDetail = Record<string, unknown>;

function emitCaptureDiagnostic(detail: CaptureDiagnosticDetail) {
  try {
    window.dispatchEvent(new CustomEvent("tool001:capture-diagnostic", {
      detail: { at: Date.now(), ...detail },
    }));
  } catch { /* diagnostics must never affect product behavior */ }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function normalizeCaptureError(error: unknown) {
  if (error instanceof DOMException) return `${error.name}:${error.message}`;
  if (error instanceof Error) return `${error.name}:${error.message}`;
  return String(error);
}

function sizeAwareAttemptTimeoutMs(fileSize: number) {
  const megabytes = Math.max(1, fileSize / (1024 * 1024));
  return Math.min(
    IMAGE_INPUT_CAPTURE_MAX_ATTEMPT_TIMEOUT_MS,
    Math.ceil(IMAGE_INPUT_CAPTURE_BASE_TIMEOUT_MS + megabytes * IMAGE_INPUT_CAPTURE_PER_MB_TIMEOUT_MS),
  );
}

function captureOverallTimeoutMs(fileSize: number) {
  const attempt = sizeAwareAttemptTimeoutMs(fileSize);
  return Math.min(IMAGE_INPUT_CAPTURE_MAX_OVERALL_TIMEOUT_MS, attempt + 12_000);
}

function readWithAbortableFileReader(file: Blob, timeoutMs: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      fn();
    };
    const timer = window.setTimeout(() => {
      try { reader.abort(); } catch { /* no-op */ }
      finish(() => reject(new Error("capture-filereader-timeout")));
    }, timeoutMs);

    reader.onload = () => finish(() => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("capture-filereader-result"));
    });
    reader.onerror = () => finish(() => reject(reader.error ?? new Error("capture-filereader")));
    reader.onabort = () => finish(() => reject(new Error("capture-filereader-abort")));

    try {
      reader.readAsArrayBuffer(file);
    } catch (error) {
      finish(() => reject(error));
    }
  });
}

async function readWithAbortableStream(file: Blob, timeoutMs: number): Promise<ArrayBuffer> {
  if (typeof file.stream !== "function") throw new Error("capture-stream-unsupported");
  const reader = file.stream().getReader();
  let timer: number | undefined;

  const readPromise = (async () => {
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        chunks.push(value);
        total += value.byteLength;
      }
    } finally {
      try { reader.releaseLock(); } catch { /* no-op */ }
    }

    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return merged.buffer;
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => {
      void reader.cancel("capture-stream-timeout").catch(() => undefined);
      reject(new Error("capture-stream-timeout"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([readPromise, timeoutPromise]);
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

function validateBuffer(file: File, buffer: ArrayBuffer) {
  if (file.size > 0 && buffer.byteLength !== file.size) throw new Error("capture-size-mismatch");
  return buffer;
}


function sniffCapturedBytes(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let signature = "unknown";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) signature = "jpeg";
  else if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) signature = "png";
  else if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") signature = "webp";
  const limit = Math.min(bytes.length, 128 * 1024);
  let hasExif = false;
  for (let i = 0; i + 5 < limit; i += 1) {
    if (bytes[i] === 0x45 && bytes[i+1] === 0x78 && bytes[i+2] === 0x69 && bytes[i+3] === 0x66 && bytes[i+4] === 0x00 && bytes[i+5] === 0x00) { hasExif = true; break; }
  }
  return { signature, hasExif, headHex: Array.from(bytes.slice(0, 16)).map(v => v.toString(16).padStart(2, "0")).join("") };
}

function isProviderTransient(error: unknown) {
  const text = normalizeCaptureError(error).toLowerCase();
  return text.includes("notreadableerror")
    || text.includes("not readable")
    || text.includes("upload_file_changed")
    || text.includes("file changed")
    || text.includes("abort")
    || text.includes("timeout")
    || text.includes("networkerror");
}

/**
 * Android/Samsung Photo Picker may expose a provider-backed File whose read becomes
 * unstable when multiple browser read operations overlap. Large real-world images
 * made the old fixed 2.2s timeout especially risky: a timed-out arrayBuffer() could
 * continue in the background while the next primitive started reading the same URI.
 *
 * This implementation therefore:
 *  - uses file-size-aware time budgets up to the product's 20MB file limit;
 *  - uses only abortable/cancellable readers while the provider handle is live;
 *  - never starts a second primitive until the previous one has actually ended;
 *  - snapshots bytes once, then returns an app-owned File used by all later work.
 */
async function captureBytes(file: File) {
  emitCaptureDiagnostic({ phase: "capture-bytes-start", name: file.name, type: file.type, size: file.size, lastModified: file.lastModified });
  const overallDeadline = Date.now() + captureOverallTimeoutMs(file.size);
  const perAttemptBudget = sizeAwareAttemptTimeoutMs(file.size);
  let lastError: unknown = new Error("capture-failed");
  const errors: string[] = [];

  for (let round = 0; round < CAPTURE_RETRY_DELAYS_MS.length; round += 1) {
    const delay = CAPTURE_RETRY_DELAYS_MS[round];
    if (delay > 0) await sleep(delay);

    let remaining = overallDeadline - Date.now();
    if (remaining <= 0) break;

    const readers: Array<[string, (timeoutMs: number) => Promise<ArrayBuffer>]> = [
      ["fileReader", (timeoutMs) => readWithAbortableFileReader(file, timeoutMs)],
      ["stream", (timeoutMs) => readWithAbortableStream(file, timeoutMs)],
    ];

    for (const [name, read] of readers) {
      remaining = overallDeadline - Date.now();
      if (remaining <= 0) break;

      try {
        const timeout = Math.max(1_500, Math.min(perAttemptBudget, remaining));
        const startedAt = Date.now();
        emitCaptureDiagnostic({ phase: "reader-start", round: round + 1, reader: name, timeoutMs: timeout, size: file.size });
        const buffer = await read(timeout);
        const validated = validateBuffer(file, buffer);
        emitCaptureDiagnostic({ phase: "reader-pass", round: round + 1, reader: name, elapsedMs: Date.now() - startedAt, bytes: validated.byteLength, size: file.size });
        return validated;
      } catch (error) {
        emitCaptureDiagnostic({ phase: "reader-fail", round: round + 1, reader: name, error: normalizeCaptureError(error), size: file.size });
        lastError = error;
        errors.push(`r${round + 1}:${name}:${normalizeCaptureError(error)}`);
        if (!isProviderTransient(error)) break;
        await sleep(80);
      }
    }
  }

  const final = lastError instanceof Error ? lastError : new Error(String(lastError));
  const detail = errors.slice(-8).join(" | ");
  const wrapped = new Error(detail ? `capture-provider-unreadable: ${detail}` : final.message);
  wrapped.name = final.name || "Error";
  emitCaptureDiagnostic({ phase: "capture-bytes-fail", error: wrapped.message, name: file.name, type: file.type, size: file.size, errors });
  throw wrapped;
}


type Tool001FileSystemFileHandle = {
  getFile: () => Promise<File>;
};

type Tool001ShowOpenFilePicker = (options?: {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
}) => Promise<Tool001FileSystemFileHandle[]>;

function getTool001ShowOpenFilePicker(): Tool001ShowOpenFilePicker | null {
  if (typeof window === "undefined") return null;
  const candidate = (window as Window & { showOpenFilePicker?: Tool001ShowOpenFilePicker }).showOpenFilePicker;
  return typeof candidate === "function" ? candidate.bind(window) : null;
}




export type Tool001V41PickerMode = "FS_IMAGE_FILTERED" | "FS_ACCEPT_ALL" | "LEGACY_IMAGE_INPUT";

export function getTool001V41PickerMode(): Tool001V41PickerMode | null {
  if (typeof window === "undefined") return null;
  const value = (window as Window & { __TOOL001_V41_PICKER_MODE__?: string }).__TOOL001_V41_PICKER_MODE__;
  if (value === "FS_IMAGE_FILTERED" || value === "FS_ACCEPT_ALL" || value === "LEGACY_IMAGE_INPUT") return value;
  return null;
}

export type Tool001V40CaptureMode = "FIRST_GETFILE_IMMEDIATE" | "FRESH_REACQUIRE_IMMEDIATE" | "STABILIZED_REACQUIRE";

function getTool001V40CaptureMode(): Tool001V40CaptureMode | null {
  if (typeof window === "undefined") return null;
  const value = (window as Window & { __TOOL001_V40_CAPTURE_MODE__?: string }).__TOOL001_V40_CAPTURE_MODE__;
  if (value === "FIRST_GETFILE_IMMEDIATE" || value === "FRESH_REACQUIRE_IMMEDIATE" || value === "STABILIZED_REACQUIRE") return value;
  return null;
}

async function captureTool001V40DiagnosticHandle(handle: Tool001FileSystemFileHandle, mode: Tool001V40CaptureMode): Promise<File> {
  emitCaptureDiagnostic({ phase: "v40-strategy-start", mode });

  let source: File;
  if (mode === "FIRST_GETFILE_IMMEDIATE") {
    emitCaptureDiagnostic({ phase: "v40-getfile-start", mode, sequence: 1 });
    source = await handle.getFile();
    emitCaptureDiagnostic({ phase: "v40-getfile-pass", mode, sequence: 1, name: source.name, type: source.type, size: source.size, lastModified: source.lastModified });
  } else {
    emitCaptureDiagnostic({ phase: "v40-getfile-start", mode, sequence: 1 });
    const first = await handle.getFile();
    emitCaptureDiagnostic({ phase: "v40-getfile-pass", mode, sequence: 1, name: first.name, type: first.type, size: first.size, lastModified: first.lastModified });
    if (mode === "STABILIZED_REACQUIRE") {
      emitCaptureDiagnostic({ phase: "v40-stabilize-start", mode, delayMs: 500 });
      await sleep(500);
      emitCaptureDiagnostic({ phase: "v40-stabilize-pass", mode, delayMs: 500 });
    }
    emitCaptureDiagnostic({ phase: "v40-getfile-start", mode, sequence: 2 });
    source = await handle.getFile();
    emitCaptureDiagnostic({ phase: "v40-getfile-pass", mode, sequence: 2, name: source.name, type: source.type, size: source.size, lastModified: source.lastModified });
  }

  emitCaptureDiagnostic({ phase: "v40-read-start", mode, size: source.size });
  try {
    const buffer = validateBuffer(source, await source.arrayBuffer());
    emitCaptureDiagnostic({ phase: "v40-read-pass", mode, bytes: buffer.byteLength });
    const ownedBlob = new Blob([buffer], { type: source.type || "application/octet-stream" });
    const owned = new File([ownedBlob], source.name || `image-${Date.now()}`, {
      type: source.type || ownedBlob.type,
      lastModified: source.lastModified || Date.now(),
    });
    emitCaptureDiagnostic({ phase: "v40-owned-pass", mode, name: owned.name, type: owned.type, size: owned.size });
    return owned;
  } catch (error) {
    emitCaptureDiagnostic({ phase: "v40-read-fail", mode, error: normalizeCaptureError(error) });
    throw error;
  }
}

export function canUseTool001StableAndroidPicker() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent) && getTool001ShowOpenFilePicker() !== null;
}

export async function showTool001StableAndroidPicker(maxFiles = 10) {
  const picker = getTool001ShowOpenFilePicker();
  if (!picker) throw new Error("tool001-stable-picker-unsupported");
  emitCaptureDiagnostic({ phase: "stable-picker-open", maxFiles });
  const v41Mode = getTool001V41PickerMode();
  const pickerOptions = v41Mode === "FS_ACCEPT_ALL"
    ? {
        multiple: maxFiles > 1,
        excludeAcceptAllOption: false,
      }
    : {
        multiple: maxFiles > 1,
        excludeAcceptAllOption: true,
        types: [{
          description: "Images",
          accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
          },
        }],
      };
  emitCaptureDiagnostic({ phase: "v41-picker-options", mode: v41Mode ?? "FS_IMAGE_FILTERED", acceptAll: v41Mode === "FS_ACCEPT_ALL" });
  const handles = await picker(pickerOptions);
  const sliced = handles.slice(0, Math.max(1, maxFiles));
  emitCaptureDiagnostic({ phase: "stable-picker-selected", count: sliced.length });
  return sliced;
}

/**
 * Android Chrome 132+ File System Access path.
 *
 * Unlike <input type=file>, this route retains a FileSystemFileHandle. If a
 * provider-backed File becomes unreadable, we can reacquire a fresh File from
 * the same handle instead of hammering the same stale File object with another
 * read API. Each successful read is immediately copied into an app-owned File.
 */
export async function captureTool001FileHandle(handle: Tool001FileSystemFileHandle): Promise<File> {
  const v40Mode = getTool001V40CaptureMode();
  if (v40Mode) return captureTool001V40DiagnosticHandle(handle, v40Mode);

  const delays = [0, 80, 240] as const;
  let lastError: unknown = new Error("stable-picker-capture-failed");

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt] > 0) await sleep(delays[attempt]);
    try {
      emitCaptureDiagnostic({ phase: "stable-handle-getfile-start", attempt: attempt + 1 });
      const source = await handle.getFile();
      emitCaptureDiagnostic({
        phase: "stable-handle-getfile-pass",
        attempt: attempt + 1,
        name: source.name,
        type: source.type,
        size: source.size,
        lastModified: source.lastModified,
      });

      // No timeout race here: arrayBuffer() is allowed to settle before any
      // reacquire attempt begins. This avoids overlapping reads on one provider URI.
      emitCaptureDiagnostic({ phase: "stable-handle-read-start", attempt: attempt + 1, size: source.size });
      const buffer = validateBuffer(source, await source.arrayBuffer());
      emitCaptureDiagnostic({ phase: "stable-handle-read-pass", attempt: attempt + 1, bytes: buffer.byteLength });

      const ownedBlob = new Blob([buffer], { type: source.type || "application/octet-stream" });
      const owned = new File([ownedBlob], source.name || `image-${Date.now()}`, {
        type: source.type || ownedBlob.type,
        lastModified: source.lastModified || Date.now(),
      });
      emitCaptureDiagnostic({
        phase: "stable-handle-owned-pass",
        attempt: attempt + 1,
        name: owned.name,
        type: owned.type,
        size: owned.size,
      });
      return owned;
    } catch (error) {
      lastError = error;
      emitCaptureDiagnostic({
        phase: "stable-handle-attempt-fail",
        attempt: attempt + 1,
        error: normalizeCaptureError(error),
      });
      if (!isProviderTransient(error)) break;
    }
  }

  emitCaptureDiagnostic({ phase: "stable-handle-final-fail", error: normalizeCaptureError(lastError) });
  throw lastError;
}

export async function capturePickerFile(file: File): Promise<File> {
  emitCaptureDiagnostic({ phase: "picker-file-start", name: file.name, type: file.type, size: file.size, lastModified: file.lastModified });
  try {
    const buffer = await captureBytes(file);
    const sniff = sniffCapturedBytes(buffer);
    emitCaptureDiagnostic({ phase: "capture-byte-signature", name: file.name, type: file.type, size: file.size, ...sniff });
    const ownedBlob = new Blob([buffer], { type: file.type || "application/octet-stream" });
    const owned = new File([ownedBlob], file.name || `image-${Date.now()}`, {
      type: file.type || ownedBlob.type,
      lastModified: file.lastModified || Date.now(),
    });
    emitCaptureDiagnostic({ phase: "picker-file-pass", name: owned.name, type: owned.type, size: owned.size, originalSize: file.size });
    return owned;
  } catch (error) {
    emitCaptureDiagnostic({ phase: "picker-file-fail", name: file.name, type: file.type, size: file.size, error: normalizeCaptureError(error) });
    throw error;
  }
}
