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

async function createOwnedPixelFile(file: File) {
  // TOOL001 V57R2 golden boundary: provider File -> createImageBitmap -> canvas -> app-owned File.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  try {
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
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
    return new File([blob], `${baseName(file.name)}.${extensionFor(requestedMime)}`, {
      type: requestedMime,
      lastModified: file.lastModified || Date.now(),
    });
  } finally {
    bitmap.close();
    canvas.width = 1;
    canvas.height = 1;
  }
}

function eventWithFiles(event: ChangeEvent<HTMLInputElement>, files: File[]) {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  event.currentTarget.files = transfer.files;
  event.target.files = transfer.files;
  return event;
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

    const selected = Array.from(event.currentTarget.files ?? []);
    // Release the native picker selection immediately, before any provider read/retry path can retain it.
    event.currentTarget.value = "";
    if (!selected.length) return;

    const first = selected[0];
    if (mobileCaptureMode === "original") {
      onChange?.(eventWithFiles(event, [first]));
      return;
    }

    try {
      const owned = await createOwnedPixelFile(first);
      onChange?.(eventWithFiles(event, [owned]));
    } catch {
      // Do not add retries/fallback reader chains. One direct pass only; existing tool validation owns the error state.
      onChange?.(eventWithFiles(event, [first]));
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
