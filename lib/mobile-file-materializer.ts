export async function materializeImageBlob(file: Blob): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let type = file.type || "application/octet-stream";

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    type = "image/jpeg";
  } else if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    type = "image/png";
  } else if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    type = "image/webp";
  } else if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 12)).startsWith("ftyp")) {
    const brand = String.fromCharCode(...bytes.slice(8, Math.min(bytes.length, 32))).toLowerCase();
    if (brand.includes("avif") || brand.includes("avis")) type = "image/avif";
    else if (brand.includes("heic") || brand.includes("heix") || brand.includes("hevc") || brand.includes("hevx") || brand.includes("mif1") || brand.includes("msf1")) type = "image/heic";
  }

  return new Blob([buffer], { type });
}
