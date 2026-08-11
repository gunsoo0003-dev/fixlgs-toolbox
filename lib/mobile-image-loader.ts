export type LoadedBrowserImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

function waitForImage(image: HTMLImageElement, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => { image.onload = null; image.onerror = null; };
    image.onload = () => { if (settled) return; settled = true; cleanup(); resolve(); };
    image.onerror = () => { if (settled) return; settled = true; cleanup(); reject(new Error('IMAGE_DECODE_FAILED')); };
    image.src = url;
    // Safari/iOS can reject HTMLImageElement.decode() even though a later load event succeeds.
    // The load/error events are therefore authoritative; decode() is only a best-effort warm-up.
    if (typeof image.decode === 'function') void image.decode().catch(() => undefined);
  });
}

export async function loadBrowserImage(
  file: Blob,
  imageOrientation: 'from-image' | 'none' = 'from-image',
): Promise<LoadedBrowserImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation });
      if (bitmap.width && bitmap.height) return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
      bitmap.close();
    } catch {
      try {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width && bitmap.height) return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
        bitmap.close();
      } catch {
        // Fall through to HTMLImageElement for partial mobile createImageBitmap implementations.
      }
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    await waitForImage(image, url);
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('IMAGE_DECODE_FAILED');
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export async function createBrowserSafePreviewUrl(file: Blob, maxSide = 960): Promise<string> {
  const loaded = await loadBrowserImage(file, 'from-image');
  try {
    const scale = Math.min(1, maxSide / Math.max(loaded.width, loaded.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(loaded.width * scale));
    canvas.height = Math.max(1, Math.round(loaded.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('PREVIEW_CANVAS_FAILED');
    ctx.drawImage(loaded.source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((next) => next ? resolve(next) : reject(new Error('PREVIEW_ENCODE_FAILED')), 'image/png');
    });
    canvas.width = 1;
    canvas.height = 1;
    return URL.createObjectURL(blob);
  } finally {
    loaded.close();
  }
}
