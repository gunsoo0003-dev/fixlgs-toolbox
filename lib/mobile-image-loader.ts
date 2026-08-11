export type LoadedBrowserImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

export async function loadBrowserImage(
  file: Blob,
  imageOrientation: 'from-image' | 'none' = 'from-image',
): Promise<LoadedBrowserImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      try {
        const bitmap = await createImageBitmap(file);
        return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
      } catch {
        // Fall through to HTMLImageElement for mobile browsers/files that reject createImageBitmap.
      }
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    if (typeof image.decode === 'function') {
      await image.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
      });
    }
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
