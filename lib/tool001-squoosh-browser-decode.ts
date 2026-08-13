export type Tool001SquooshMime = "image/jpeg" | "image/png" | "image/webp";

const signatures: Array<[RegExp, Tool001SquooshMime]> = [
  [/^\x89PNG\x0D\x0A\x1A\x0A/, "image/png"],
  [/^\xFF\xD8\xFF/, "image/jpeg"],
  [/^RIFF[\s\S]{4}WEBPVP8[LX ]/, "image/webp"],
];

const decodeSupportCache = new Map<string, Promise<boolean>>();

function bytesToBinaryString(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (value) => String.fromCodePoint(value)).join("");
}

export async function tool001SquooshSniffMimeType(blob: Blob): Promise<Tool001SquooshMime | ""> {
  // Squoosh reads only the first 16 bytes via Response(blob).arrayBuffer().
  const firstChunk = await new Response(blob.slice(0, 16)).arrayBuffer();
  const binary = bytesToBinaryString(firstChunk);
  for (const [pattern, mime] of signatures) {
    if (pattern.test(binary)) return mime;
  }
  return "";
}

export function tool001SquooshCanDecodeImageType(type: string): Promise<boolean> {
  const cached = decodeSupportCache.get(type);
  if (cached) return cached;
  const result = (async () => {
    const picture = document.createElement("picture");
    const image = document.createElement("img");
    const source = document.createElement("source");
    source.srcset = "data:,x";
    source.type = type;
    picture.append(source, image);
    await 0;
    return !!image.currentSrc;
  })();
  decodeSupportCache.set(type, result);
  return result;
}

async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image loading error"));
    });
    if (typeof image.decode === "function") {
      await image.decode().catch(() => undefined);
    }
    await loaded;
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawableToImageData(drawable: ImageBitmap | HTMLImageElement): ImageData {
  const width = drawable.width;
  const height = drawable.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create canvas context");
  context.drawImage(drawable, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

export async function tool001SquooshDecodeImage(blob: Blob): Promise<{ mime: Tool001SquooshMime; data: ImageData }> {
  const mime = await tool001SquooshSniffMimeType(blob);
  if (!mime) throw new Error("Unsupported image signature");

  const canDecode = await tool001SquooshCanDecodeImageType(mime);
  if (!canDecode) {
    // Squoosh routes unsupported formats to its WASM decoders. TOOL001 only accepts
    // JPG/PNG/WebP; on the target Chrome path these formats are browser-decodable.
    throw new Error(`Browser cannot decode ${mime}`);
  }

  let drawable: ImageBitmap | HTMLImageElement;
  if ("createImageBitmap" in self) {
    drawable = await createImageBitmap(blob);
  } else {
    drawable = await blobToImage(blob);
  }

  try {
    return { mime, data: drawableToImageData(drawable) };
  } finally {
    if (typeof ImageBitmap !== "undefined" && drawable instanceof ImageBitmap) drawable.close();
  }
}
