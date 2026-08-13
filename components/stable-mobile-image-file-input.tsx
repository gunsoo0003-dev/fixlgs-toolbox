"use client";

import { forwardRef, useEffect, useState, type ChangeEvent, type InputHTMLAttributes } from "react";

function detectAndroidChromeMobile() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const android = /Android/i.test(ua);
  const chrome = /Chrome\//i.test(ua) && !/(EdgA|OPR|SamsungBrowser|Firefox|FxiOS)\//i.test(ua);
  const mobile = /Mobile/i.test(ua);
  return android && chrome && mobile;
}

type MobileCaptureMode = "pixels" | "original";
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  type?: "file";
  mobileCaptureMode?: MobileCaptureMode;
};

type Tool016PipelineDiag = {
  stage: string;
  selected?: { name: string; size: number; type: string; lastModified: number };
  bitmap?: { width: number; height: number };
  canvas?: { width: number; height: number };
  owned?: { name: string; size: number; type: string; lastModified: number };
  ownedBitmap?: { width: number; height: number };
  error?: string;
  at: string;
};

function isTool016Input(input: HTMLInputElement) {
  return Boolean(input.closest('[data-testid="tool016-root"]'));
}

function publishTool016PipelineDiag(diag: Tool016PipelineDiag) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    (window as typeof window & { __tool016PipelineDiag?: Tool016PipelineDiag }).__tool016PipelineDiag = diag;
    window.localStorage.setItem("TOOL016_PIPELINE_DIAG", JSON.stringify(diag));
  } catch {
    // Diagnostic persistence must never alter the product flow.
  }

  let overlay = document.getElementById("tool016-pipeline-diag-overlay");
  if (!overlay) {
    overlay = document.createElement("pre");
    overlay.id = "tool016-pipeline-diag-overlay";
    overlay.setAttribute("data-testid", "tool016-pipeline-diag-overlay");
    Object.assign(overlay.style, {
      position: "fixed",
      left: "8px",
      right: "8px",
      bottom: "8px",
      zIndex: "2147483647",
      maxHeight: "48vh",
      overflow: "auto",
      margin: "0",
      padding: "12px",
      border: "2px solid #f3c400",
      borderRadius: "10px",
      background: "#0b0b0b",
      color: "#fff",
      fontSize: "12px",
      lineHeight: "1.45",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    });
    document.body.appendChild(overlay);
  }
  overlay.textContent = `[TOOL016 INPUT PIPELINE DIAG]\n${JSON.stringify(diag, null, 2)}`;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mime, mime === "image/png" ? undefined : 0.98);
  });
}

function extensionFor(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function baseName(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

async function createOwnedPixelFile(
  file: File,
  onDiag?: (patch: Partial<Tool016PipelineDiag>) => void,
) {
  // TOOL001 V57R2 golden boundary: provider File -> createImageBitmap -> canvas -> app-owned File.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  onDiag?.({ stage: "BITMAP_DECODED", bitmap: { width: bitmap.width, height: bitmap.height } });
  const canvas = document.createElement("canvas");
  try {
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    onDiag?.({ stage: "CANVAS_SIZED", canvas: { width: canvas.width, height: canvas.height } });
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas-context");

    const requestedMime = file.type === "image/png" || file.type === "image/webp" || file.type === "image/jpeg"
      ? file.type
      : "image/png";
    if (requestedMime === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(bitmap, 0, 0);
    const blob = await canvasToBlob(canvas, requestedMime);
    if (!blob || blob.size <= 0) throw new Error("snapshot-export");
    const owned = new File([blob], `${baseName(file.name)}.${extensionFor(requestedMime)}`, {
      type: requestedMime,
      lastModified: file.lastModified || Date.now(),
    });
    onDiag?.({
      stage: "OWNED_FILE_CREATED",
      owned: { name: owned.name, size: owned.size, type: owned.type, lastModified: owned.lastModified },
    });
    return owned;
  } finally {
    bitmap.close();
    canvas.width = 1;
    canvas.height = 1;
  }
}

function eventWithFiles(
  event: ChangeEvent<HTMLInputElement>,
  input: HTMLInputElement,
  files: File[],
) {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;

  // React clears ChangeEvent.currentTarget after the synchronous handler returns.
  // Mobile pixel capture awaits createImageBitmap/canvas, so preserve the actual
  // input element and hand downstream handlers a stable ChangeEvent shape.
  return {
    ...event,
    target: input,
    currentTarget: input,
  } as ChangeEvent<HTMLInputElement>;
}

export const StableMobileImageFileInput = forwardRef<HTMLInputElement, Props>(function StableMobileImageFileInput(
  { accept, multiple, onChange, mobileCaptureMode = "pixels", ...props },
  ref,
) {
  const [androidChromeMobile, setAndroidChromeMobile] = useState(false);

  useEffect(() => {
    setAndroidChromeMobile(detectAndroidChromeMobile());
  }, []);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!androidChromeMobile) {
      onChange?.(event);
      return;
    }

    const input = event.currentTarget;
    const selected = Array.from(input.files ?? []);
    // Release the native picker selection immediately, before any provider read/retry path can retain it.
    input.value = "";
    if (!selected.length) return;

    const first = selected[0];
    if (mobileCaptureMode === "original") {
      onChange?.(eventWithFiles(event, input, [first]));
      return;
    }

    const tool016DiagEnabled = isTool016Input(input);
    let tool016Diag: Tool016PipelineDiag | null = tool016DiagEnabled ? {
      stage: "PICKER_FILE_RECEIVED",
      selected: {
        name: first.name,
        size: first.size,
        type: first.type,
        lastModified: first.lastModified,
      },
      at: new Date().toISOString(),
    } : null;
    const updateTool016Diag = (patch: Partial<Tool016PipelineDiag>) => {
      if (!tool016Diag) return;
      tool016Diag = { ...tool016Diag, ...patch, at: new Date().toISOString() };
      publishTool016PipelineDiag(tool016Diag);
    };
    if (tool016Diag) publishTool016PipelineDiag(tool016Diag);

    try {
      const owned = await createOwnedPixelFile(first, tool016Diag ? updateTool016Diag : undefined);
      if (tool016Diag) {
        try {
          const ownedBitmap = await createImageBitmap(owned, { imageOrientation: "from-image" });
          try {
            updateTool016Diag({
              stage: "OWNED_FILE_REDECODED",
              ownedBitmap: { width: ownedBitmap.width, height: ownedBitmap.height },
            });
          } finally {
            ownedBitmap.close();
          }
        } catch (diagError) {
          updateTool016Diag({
            stage: "OWNED_FILE_REDECODE_DIAG_ERROR",
            error: diagError instanceof Error ? `${diagError.name}: ${diagError.message}` : String(diagError),
          });
        }
      }
      onChange?.(eventWithFiles(event, input, [owned]));
    } catch (captureError) {
      if (tool016Diag) {
        updateTool016Diag({
          stage: "CAPTURE_FAILED_FALLBACK_ORIGINAL",
          error: captureError instanceof Error ? `${captureError.name}: ${captureError.message}` : String(captureError),
        });
      }
      // Do not add retries/fallback reader chains. One direct pass only; existing tool validation owns the error state.
      onChange?.(eventWithFiles(event, input, [first]));
    }
  }

  return (
    <input
      {...props}
      ref={ref}
      type="file"
      accept={androidChromeMobile ? undefined : accept}
      multiple={androidChromeMobile ? false : multiple}
      onChange={(event) => { void handleChange(event); }}
      data-mobile-stable-input={androidChromeMobile ? "android-chrome" : undefined}
    />
  );
});
