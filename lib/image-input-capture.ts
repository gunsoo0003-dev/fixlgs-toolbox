export const IMAGE_INPUT_CAPTURE_TIMEOUT_MS = 12_000;

function captureTimeoutMs() {
  if (typeof window === "undefined") return IMAGE_INPUT_CAPTURE_TIMEOUT_MS;
  const host = window.location.hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const override = (window as typeof window & { __TOOL001_CAPTURE_TEST_TIMEOUT_MS__?: number }).__TOOL001_CAPTURE_TEST_TIMEOUT_MS__;
  return local && typeof override === "number" && override > 0 ? override : IMAGE_INPUT_CAPTURE_TIMEOUT_MS;
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

async function captureBytes(file: File) {
  const attempts: Array<() => Promise<ArrayBuffer>> = [
    () => file.arrayBuffer(),
    () => readWithStream(file),
    () => readWithFileReader(file),
  ];
  let lastError: unknown = new Error("capture-failed");
  for (const attempt of attempts) {
    try {
      const buffer = await withTimer(attempt(), captureTimeoutMs(), "capture-timeout");
      if (file.size > 0 && buffer.byteLength !== file.size) throw new Error("capture-size-mismatch");
      return buffer;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => window.setTimeout(resolve, 80));
    }
  }
  throw lastError;
}

/**
 * Android/Samsung pickers may expose a content-provider-backed File whose backing
 * handle is not reliable across later async work. Capture it once while the input
 * selection is alive, then use only this app-owned File afterwards.
 */
export async function capturePickerFile(file: File): Promise<File> {
  const buffer = await captureBytes(file);
  const ownedBlob = new Blob([buffer], { type: file.type || "application/octet-stream" });
  return new File([ownedBlob], file.name || `image-${Date.now()}`, {
    type: file.type || ownedBlob.type,
    lastModified: file.lastModified || Date.now(),
  });
}
