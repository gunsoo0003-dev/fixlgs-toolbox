export const IMAGE_INPUT_CAPTURE_MAX_FILE_BYTES = 20 * 1024 * 1024;
export const IMAGE_INPUT_CAPTURE_BASE_TIMEOUT_MS = 8_000;
export const IMAGE_INPUT_CAPTURE_PER_MB_TIMEOUT_MS = 1_200;
export const IMAGE_INPUT_CAPTURE_MAX_ATTEMPT_TIMEOUT_MS = 32_000;
export const IMAGE_INPUT_CAPTURE_MAX_OVERALL_TIMEOUT_MS = 45_000;
const CAPTURE_RETRY_DELAYS_MS = [0, 160, 480] as const;

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
        const buffer = await read(timeout);
        return validateBuffer(file, buffer);
      } catch (error) {
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
  throw wrapped;
}

export async function capturePickerFile(file: File): Promise<File> {
  const buffer = await captureBytes(file);
  const ownedBlob = new Blob([buffer], { type: file.type || "application/octet-stream" });
  return new File([ownedBlob], file.name || `image-${Date.now()}`, {
    type: file.type || ownedBlob.type,
    lastModified: file.lastModified || Date.now(),
  });
}
