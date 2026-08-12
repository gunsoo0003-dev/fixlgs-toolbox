export const IMAGE_INPUT_CAPTURE_TIMEOUT_MS = 9_000;
const CAPTURE_ATTEMPT_TIMEOUT_MS = 2_200;
const CAPTURE_RETRY_DELAYS_MS = [0, 60, 140, 300, 650] as const;

function captureTimeoutMs() {
  if (typeof window === "undefined") return IMAGE_INPUT_CAPTURE_TIMEOUT_MS;
  const host = window.location.hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const override = (window as typeof window & { __TOOL001_CAPTURE_TEST_TIMEOUT_MS__?: number }).__TOOL001_CAPTURE_TEST_TIMEOUT_MS__;
  return local && typeof override === "number" && override > 0 ? override : IMAGE_INPUT_CAPTURE_TIMEOUT_MS;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function withTimer<T>(promise: Promise<T>, timeoutMs: number, code: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(code)), timeoutMs);
    promise.then((value) => {
      window.clearTimeout(timer);
      resolve(value);
    }, (error) => {
      window.clearTimeout(timer);
      reject(error);
    });
  });
}

function readWithFileReader(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error("capture-filereader-result"));
    reader.onerror = () => reject(reader.error ?? new Error("capture-filereader"));
    reader.onabort = () => reject(new Error("capture-filereader-abort"));
    reader.readAsArrayBuffer(file);
  });
}

async function readWithStream(file: Blob): Promise<ArrayBuffer> {
  if (typeof file.stream !== "function") throw new Error("capture-stream-unsupported");
  const reader = file.stream().getReader();
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
}

async function readWithResponse(file: Blob): Promise<ArrayBuffer> {
  return new Response(file).arrayBuffer();
}

function validateBuffer(file: File, buffer: ArrayBuffer) {
  if (file.size > 0 && buffer.byteLength !== file.size) throw new Error("capture-size-mismatch");
  return buffer;
}

function normalizeCaptureError(error: unknown) {
  if (error instanceof DOMException) return `${error.name}:${error.message}`;
  if (error instanceof Error) return `${error.name}:${error.message}`;
  return String(error);
}

/**
 * Android 15 / Samsung Chrome may expose a Photo Picker File before the provider
 * handoff is stably readable. Retry the original provider handle for a short,
 * bounded window using independent browser read primitives. The first complete
 * byte snapshot wins; after that, the provider-backed File is never used again.
 */
async function captureBytes(file: File) {
  const overallDeadline = Date.now() + captureTimeoutMs();
  let lastError: unknown = new Error("capture-failed");
  const errors: string[] = [];

  for (let round = 0; round < CAPTURE_RETRY_DELAYS_MS.length; round += 1) {
    const delay = CAPTURE_RETRY_DELAYS_MS[round];
    if (delay > 0) await sleep(delay);
    if (Date.now() >= overallDeadline) break;

    const attempts: Array<[string, () => Promise<ArrayBuffer>]> = [
      ["arrayBuffer", () => file.arrayBuffer()],
      ["response", () => readWithResponse(file)],
      ["stream", () => readWithStream(file)],
      ["fileReader", () => readWithFileReader(file)],
    ];

    for (const [name, attempt] of attempts) {
      const remaining = overallDeadline - Date.now();
      if (remaining <= 0) break;
      try {
        const timeout = Math.max(250, Math.min(CAPTURE_ATTEMPT_TIMEOUT_MS, remaining));
        const buffer = await withTimer(attempt(), timeout, `capture-${name}-timeout`);
        return validateBuffer(file, buffer);
      } catch (error) {
        lastError = error;
        errors.push(`r${round + 1}:${name}:${normalizeCaptureError(error)}`);
        await sleep(24);
      }
    }
  }

  const final = lastError instanceof Error ? lastError : new Error(String(lastError));
  const detail = errors.slice(-10).join(" | ");
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
