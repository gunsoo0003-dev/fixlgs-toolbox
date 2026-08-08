export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'unknown';
export type MetadataGroup = 'Basic' | 'EXIF' | 'Camera' | 'Capture' | 'GPS' | 'Date' | 'Color' | 'Software' | 'Other';

export type MetadataEntry = {
  group: MetadataGroup;
  tag: string;
  label: string;
  value: string;
  rawValue?: unknown;
};

export type ResolutionMetadata = {
  x: number;
  y: number;
  unit: 'inch' | 'centimeter' | 'unknown';
  ppiX?: number;
  ppiY?: number;
  source: 'EXIF' | 'JFIF' | 'PNG pHYs';
};

export type ImageMetadataAnalysis = {
  name: string;
  format: ImageFormat;
  formatLabel: string;
  mime: string;
  declaredMime: string;
  extensionMismatch: boolean;
  size: number;
  width: number;
  height: number;
  bitsPerSample?: number;
  hasAlpha: boolean;
  totalPixels: number;
  megapixels: number;
  aspectRatio: string;
  orientation: 'landscape' | 'portrait' | 'square' | 'unknown';
  pixelOrientation: 'landscape' | 'portrait' | 'square' | 'unknown';
  exifOrientation?: number;
  resolution?: ResolutionMetadata;
  dateTaken?: string;
  dateDigitized?: string;
  metadataModified?: string;
  fileModified?: string;
  make?: string;
  model?: string;
  lensMake?: string;
  lensModel?: string;
  lensSpecification?: number[];
  software?: string;
  artist?: string;
  copyright?: string;
  iso?: number;
  exposureTime?: number;
  fNumber?: number;
  focalLength?: number;
  focalLength35mm?: number;
  exposureBias?: number;
  flash?: string;
  whiteBalance?: string;
  meteringMode?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    date?: string;
    time?: string;
    direction?: number;
  };
  hasExif: boolean;
  hasGps: boolean;
  hasXmp: boolean;
  hasIptc: boolean;
  hasIcc: boolean;
  metadataEntryCount: number;
  entries: MetadataEntry[];
  warnings: string[];
};

export const TOOL018_LIMITS = {
  maxFiles: 20,
  maxFileBytes: 15 * 1024 * 1024,
  maxTotalBytes: 100 * 1024 * 1024,
  maxPixels: 48_000_000,
  maxMetadataTextLength: 20_000,
} as const;

const JPEG_SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
const GROUP_ORDER: MetadataGroup[] = ['Basic', 'EXIF', 'Camera', 'Capture', 'GPS', 'Date', 'Color', 'Software', 'Other'];

const IFD0_TAGS: Record<number, [string, string, MetadataGroup]> = {
  0x010e: ['ImageDescription', 'Image Description', 'Other'],
  0x010f: ['Make', 'Camera Make', 'Camera'],
  0x0110: ['Model', 'Camera Model', 'Camera'],
  0x0112: ['Orientation', 'EXIF Orientation', 'EXIF'],
  0x011a: ['XResolution', 'X Resolution', 'EXIF'],
  0x011b: ['YResolution', 'Y Resolution', 'EXIF'],
  0x0128: ['ResolutionUnit', 'Resolution Unit', 'EXIF'],
  0x0131: ['Software', 'Software', 'Software'],
  0x0132: ['DateTime', 'Metadata Modified', 'Date'],
  0x013b: ['Artist', 'Artist', 'Other'],
  0x8298: ['Copyright', 'Copyright', 'Other'],
  0x8769: ['ExifIFDPointer', 'EXIF IFD', 'EXIF'],
  0x8825: ['GPSInfoIFDPointer', 'GPS IFD', 'GPS'],
  // Some writers incorrectly place EXIF capture tags directly in IFD0. Read them defensively.
  0x829a: ['ExposureTime', 'Exposure Time', 'Capture'],
  0x829d: ['FNumber', 'F Number', 'Capture'],
  0x8827: ['ISOSpeedRatings', 'ISO', 'Capture'],
  0x9003: ['DateTimeOriginal', 'Date Taken', 'Date'],
  0x9004: ['DateTimeDigitized', 'Date Digitized', 'Date'],
  0x9204: ['ExposureBiasValue', 'Exposure Compensation', 'Capture'],
  0x9207: ['MeteringMode', 'Metering Mode', 'Capture'],
  0x9209: ['Flash', 'Flash', 'Capture'],
  0x920a: ['FocalLength', 'Focal Length', 'Capture'],
  0xa403: ['WhiteBalance', 'White Balance', 'Capture'],
  0xa405: ['FocalLengthIn35mmFilm', '35mm-equivalent Focal Length', 'Capture'],
  0xa432: ['LensSpecification', 'Lens Specification', 'Camera'],
  0xa433: ['LensMake', 'Lens Make', 'Camera'],
  0xa434: ['LensModel', 'Lens Model', 'Camera'],
};

const EXIF_TAGS: Record<number, [string, string, MetadataGroup]> = {
  0x829a: ['ExposureTime', 'Exposure Time', 'Capture'],
  0x829d: ['FNumber', 'F Number', 'Capture'],
  0x8827: ['ISOSpeedRatings', 'ISO', 'Capture'],
  0x8833: ['PhotographicSensitivity', 'Photographic Sensitivity', 'Capture'],
  0x9003: ['DateTimeOriginal', 'Date Taken', 'Date'],
  0x9004: ['DateTimeDigitized', 'Date Digitized', 'Date'],
  0x9204: ['ExposureBiasValue', 'Exposure Compensation', 'Capture'],
  0x9207: ['MeteringMode', 'Metering Mode', 'Capture'],
  0x9209: ['Flash', 'Flash', 'Capture'],
  0x920a: ['FocalLength', 'Focal Length', 'Capture'],
  0x927c: ['MakerNote', 'Maker Note', 'Other'],
  0x9286: ['UserComment', 'User Comment', 'Other'],
  0xa001: ['ColorSpace', 'Color Space', 'Color'],
  0xa002: ['PixelXDimension', 'Pixel Width', 'Basic'],
  0xa003: ['PixelYDimension', 'Pixel Height', 'Basic'],
  0xa402: ['ExposureMode', 'Exposure Mode', 'Capture'],
  0xa403: ['WhiteBalance', 'White Balance', 'Capture'],
  0xa405: ['FocalLengthIn35mmFilm', '35mm-equivalent Focal Length', 'Capture'],
  0xa406: ['SceneCaptureType', 'Scene Capture Type', 'Capture'],
  0xa420: ['ImageUniqueID', 'Image Unique ID', 'Other'],
  0xa432: ['LensSpecification', 'Lens Specification', 'Camera'],
  0xa433: ['LensMake', 'Lens Make', 'Camera'],
  0xa434: ['LensModel', 'Lens Model', 'Camera'],
};

const GPS_TAGS: Record<number, [string, string, MetadataGroup]> = {
  0x0000: ['GPSVersionID', 'GPS Version', 'GPS'],
  0x0001: ['GPSLatitudeRef', 'Latitude Reference', 'GPS'],
  0x0002: ['GPSLatitude', 'Latitude', 'GPS'],
  0x0003: ['GPSLongitudeRef', 'Longitude Reference', 'GPS'],
  0x0004: ['GPSLongitude', 'Longitude', 'GPS'],
  0x0005: ['GPSAltitudeRef', 'Altitude Reference', 'GPS'],
  0x0006: ['GPSAltitude', 'Altitude', 'GPS'],
  0x0007: ['GPSTimeStamp', 'GPS Time', 'GPS'],
  0x0010: ['GPSImgDirectionRef', 'Direction Reference', 'GPS'],
  0x0011: ['GPSImgDirection', 'Direction', 'GPS'],
  0x001d: ['GPSDateStamp', 'GPS Date', 'GPS'],
};

type ParsedExif = {
  entries: MetadataEntry[];
  values: Map<string, unknown>;
  warnings: string[];
};

function isRange(bytes: Uint8Array, start: number, length: number) {
  return start >= 0 && length >= 0 && start + length <= bytes.length;
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  if (!isRange(bytes, start, length)) return '';
  let out = '';
  const end = Math.min(start + length, bytes.length);
  for (let i = start; i < end; i++) {
    if (bytes[i] === 0) break;
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

function readU16BE(bytes: Uint8Array, offset: number) {
  if (!isRange(bytes, offset, 2)) return 0;
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readU32BE(bytes: Uint8Array, offset: number) {
  if (!isRange(bytes, offset, 4)) return 0;
  return ((bytes[offset] * 0x1000000) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]) >>> 0;
}

function readU32LE(bytes: Uint8Array, offset: number) {
  if (!isRange(bytes, offset, 4)) return 0;
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] * 0x1000000)) >>> 0;
}

function readU24LE(bytes: Uint8Array, offset: number) {
  if (!isRange(bytes, offset, 3)) return 0;
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function detectImageFormat(bytes: Uint8Array): ImageFormat {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'png';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  return 'unknown';
}

function formatLabel(format: ImageFormat) {
  return format === 'jpeg' ? 'JPEG' : format === 'png' ? 'PNG' : format === 'webp' ? 'WebP' : 'Unknown';
}

function mimeForFormat(format: ImageFormat) {
  return format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'application/octet-stream';
}

function extensionMatches(name: string, format: ImageFormat) {
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (format === 'jpeg') return ext === 'jpg' || ext === 'jpeg';
  if (format === 'png') return ext === 'png';
  if (format === 'webp') return ext === 'webp';
  return false;
}

function gcd(a: number, b: number) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function aspectRatio(width: number, height: number) {
  if (!width || !height) return '-';
  const d = gcd(width, height);
  return `${Math.round(width / d)}:${Math.round(height / d)}`;
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${units[index]}`;
}

export function formatExifDate(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  const match = /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(.*)$/.exec(trimmed);
  return match ? `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}${match[7] || ''}` : trimmed;
}

function valueToString(value: unknown) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map((item) => typeof item === 'number' ? trimNumber(item) : String(item)).join(', ');
  if (typeof value === 'number') return trimNumber(value);
  return String(value);
}

function trimNumber(value: number, digits = 6) {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  return String(rounded);
}

function typeSize(type: number) {
  return ({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 } as Record<number, number>)[type] ?? 0;
}

function parseTiff(bytes: Uint8Array, tiffStart: number): ParsedExif {
  const entries: MetadataEntry[] = [];
  const values = new Map<string, unknown>();
  const warnings: string[] = [];
  if (!isRange(bytes, tiffStart, 8)) return { entries, values, warnings: ['Truncated TIFF header'] };
  const order = ascii(bytes, tiffStart, 2);
  const little = order === 'II';
  if (!little && order !== 'MM') return { entries, values, warnings: ['Unsupported TIFF byte order'] };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (offset: number) => isRange(bytes, offset, 2) ? view.getUint16(offset, little) : 0;
  const u32 = (offset: number) => isRange(bytes, offset, 4) ? view.getUint32(offset, little) : 0;
  const i32 = (offset: number) => isRange(bytes, offset, 4) ? view.getInt32(offset, little) : 0;
  if (u16(tiffStart + 2) !== 42) warnings.push('Unexpected TIFF marker');

  const readValue = (entryOffset: number, type: number, count: number): unknown => {
    const size = typeSize(type);
    if (!size || count > 1_000_000) return undefined;
    const total = size * count;
    const dataStart = total <= 4 ? entryOffset + 8 : tiffStart + u32(entryOffset + 8);
    if (!isRange(bytes, dataStart, total)) return undefined;
    const getRational = (offset: number, signed: boolean) => {
      const numerator = signed ? i32(offset) : u32(offset);
      const denominator = signed ? i32(offset + 4) : u32(offset + 4);
      return denominator ? numerator / denominator : 0;
    };
    if (type === 2) return ascii(bytes, dataStart, count).trim();
    if (type === 1 || type === 7) {
      if (count === 1) return bytes[dataStart];
      if (type === 7 && count > 64) return `[${count} bytes]`;
      return Array.from(bytes.slice(dataStart, dataStart + count));
    }
    if (type === 3) {
      const arr = Array.from({ length: count }, (_, i) => u16(dataStart + i * 2));
      return count === 1 ? arr[0] : arr;
    }
    if (type === 4) {
      const arr = Array.from({ length: count }, (_, i) => u32(dataStart + i * 4));
      return count === 1 ? arr[0] : arr;
    }
    if (type === 5 || type === 10) {
      const arr = Array.from({ length: count }, (_, i) => getRational(dataStart + i * 8, type === 10));
      return count === 1 ? arr[0] : arr;
    }
    if (type === 9) {
      const arr = Array.from({ length: count }, (_, i) => i32(dataStart + i * 4));
      return count === 1 ? arr[0] : arr;
    }
    return undefined;
  };

  const parseIfd = (relativeOffset: number, tagMap: Record<number, [string, string, MetadataGroup]>, label: string, depth = 0) => {
    if (!relativeOffset || depth > 3) return;
    const start = tiffStart + relativeOffset;
    if (!isRange(bytes, start, 2)) {
      warnings.push(`${label} offset is outside the file`);
      return;
    }
    const count = Math.min(u16(start), 4096);
    for (let i = 0; i < count; i++) {
      const entryOffset = start + 2 + i * 12;
      if (!isRange(bytes, entryOffset, 12)) {
        warnings.push(`${label} entry is truncated`);
        break;
      }
      const tag = u16(entryOffset);
      const type = u16(entryOffset + 2);
      const valueCount = u32(entryOffset + 4);
      const value = readValue(entryOffset, type, valueCount);
      const known = tagMap[tag];
      const key = known?.[0] ?? `Tag0x${tag.toString(16).toUpperCase().padStart(4, '0')}`;
      const itemLabel = known?.[1] ?? `Tag 0x${tag.toString(16).toUpperCase().padStart(4, '0')}`;
      const group = known?.[2] ?? 'Other';
      if (value !== undefined) {
        values.set(key, value);
        if (key !== 'ExifIFDPointer' && key !== 'GPSInfoIFDPointer') {
          entries.push({ group, tag: key, label: itemLabel, value: valueToString(value), rawValue: value });
        }
      }
    }
    if (tagMap === IFD0_TAGS) {
      const exifOffset = Number(values.get('ExifIFDPointer') ?? 0);
      const gpsOffset = Number(values.get('GPSInfoIFDPointer') ?? 0);
      if (exifOffset) parseIfd(exifOffset, EXIF_TAGS, 'EXIF IFD', depth + 1);
      if (gpsOffset) parseIfd(gpsOffset, GPS_TAGS, 'GPS IFD', depth + 1);
    }
  };

  parseIfd(u32(tiffStart + 4), IFD0_TAGS, 'IFD0');
  return { entries, values, warnings };
}

function dmsToDecimal(value: unknown, ref: unknown) {
  if (!Array.isArray(value) || value.length < 3) return undefined;
  const [d, m, s] = value.map(Number);
  if (![d, m, s].every(Number.isFinite)) return undefined;
  let result = Math.abs(d) + Math.abs(m) / 60 + Math.abs(s) / 3600;
  const r = String(ref ?? '').toUpperCase();
  if (r === 'S' || r === 'W') result *= -1;
  return result;
}

function parseFlash(value: unknown) {
  if (typeof value !== 'number') return undefined;
  return value & 1 ? 'Fired' : 'Did not fire';
}

function parseWhiteBalance(value: unknown) {
  if (value === 0) return 'Auto';
  if (value === 1) return 'Manual';
  return typeof value === 'number' ? String(value) : undefined;
}

function parseMeteringMode(value: unknown) {
  if (typeof value !== 'number') return undefined;
  return ({ 0: 'Unknown', 1: 'Average', 2: 'Center-weighted average', 3: 'Spot', 4: 'Multi-spot', 5: 'Pattern', 6: 'Partial', 255: 'Other' } as Record<number, string>)[value] ?? String(value);
}

function valueNumberArray(values: Map<string, unknown> | undefined, key: string) {
  const value = values?.get(key);
  if (!Array.isArray(value)) return undefined;
  const result = value.map(Number).filter(Number.isFinite);
  return result.length ? result : undefined;
}

function pixelOrientation(width: number, height: number): ImageMetadataAnalysis['pixelOrientation'] {
  if (!width || !height) return 'unknown';
  return width === height ? 'square' : width > height ? 'landscape' : 'portrait';
}

function displayOrientation(width: number, height: number, exifOrientation?: number): ImageMetadataAnalysis['orientation'] {
  const raw = pixelOrientation(width, height);
  if (raw === 'square') return raw;
  return exifOrientation && [5, 6, 7, 8].includes(exifOrientation)
    ? (raw === 'landscape' ? 'portrait' : raw === 'portrait' ? 'landscape' : raw)
    : raw;
}

function parseResolution(values: Map<string, unknown>, source: ResolutionMetadata['source']): ResolutionMetadata | undefined {
  const x = Number(values.get('XResolution'));
  const y = Number(values.get('YResolution'));
  if (!(x > 0) || !(y > 0)) return undefined;
  const unitCode = Number(values.get('ResolutionUnit'));
  const unit = unitCode === 2 ? 'inch' : unitCode === 3 ? 'centimeter' : 'unknown';
  const ppiX = unit === 'inch' ? x : unit === 'centimeter' ? x * 2.54 : undefined;
  const ppiY = unit === 'inch' ? y : unit === 'centimeter' ? y * 2.54 : undefined;
  return { x, y, unit, ppiX, ppiY, source };
}

function readJpeg(bytes: Uint8Array) {
  let width = 0, height = 0, bitsPerSample: number | undefined;
  let resolution: ResolutionMetadata | undefined;
  let exif: ParsedExif | undefined;
  let hasExif = false, hasXmp = false, hasIptc = false, hasIcc = false;
  const entries: MetadataEntry[] = [];
  const warnings: string[] = [];
  let sawSof = false, sawScan = false, sawEoi = false;
  let pos = 2;
  while (pos + 1 < bytes.length) {
    if (bytes[pos] !== 0xff) { pos++; continue; }
    while (pos < bytes.length && bytes[pos] === 0xff) pos++;
    if (pos >= bytes.length) break;
    const marker = bytes[pos++];
    if (marker === 0xd9) { sawEoi = true; break; }
    if (marker === 0xda) { sawScan = true; break; }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (!isRange(bytes, pos, 2)) break;
    const length = readU16BE(bytes, pos);
    if (length < 2 || !isRange(bytes, pos, length)) { warnings.push('Truncated JPEG segment'); break; }
    const dataStart = pos + 2;
    const dataLength = length - 2;
    if (marker === 0xe0 && ascii(bytes, dataStart, 5) === 'JFIF\0' && dataLength >= 12) {
      const units = bytes[dataStart + 7];
      const x = readU16BE(bytes, dataStart + 8);
      const y = readU16BE(bytes, dataStart + 10);
      if (x && y && units) {
        const unit = units === 1 ? 'inch' : units === 2 ? 'centimeter' : 'unknown';
        resolution = { x, y, unit, ppiX: unit === 'inch' ? x : unit === 'centimeter' ? x * 2.54 : undefined, ppiY: unit === 'inch' ? y : unit === 'centimeter' ? y * 2.54 : undefined, source: 'JFIF' };
        entries.push({ group: 'EXIF', tag: 'JFIFDensity', label: 'JFIF Resolution', value: `${x} × ${y} ${unit === 'inch' ? 'dpi' : unit === 'centimeter' ? 'dpcm' : ''}`.trim() });
      }
    } else if (marker === 0xe1) {
      if (ascii(bytes, dataStart, 6) === 'Exif') {
        hasExif = true;
        const parsed = parseTiff(bytes, dataStart + 6);
        exif = parsed;
        entries.push(...parsed.entries);
        warnings.push(...parsed.warnings);
        resolution = parseResolution(parsed.values, 'EXIF') ?? resolution;
      } else if (ascii(bytes, dataStart, 29).startsWith('http://ns.adobe.com/xap/1.0/')) {
        hasXmp = true;
        entries.push({ group: 'Other', tag: 'XMP', label: 'XMP Metadata', value: `${dataLength} bytes` });
      }
    } else if (marker === 0xe2 && ascii(bytes, dataStart, 12).startsWith('ICC_PROFILE')) {
      hasIcc = true;
      entries.push({ group: 'Color', tag: 'ICCProfile', label: 'ICC Profile', value: 'Present' });
    } else if (marker === 0xed) {
      hasIptc = true;
      entries.push({ group: 'Other', tag: 'IPTC', label: 'IPTC / APP13', value: `${dataLength} bytes` });
    } else if (marker === 0xfe) {
      entries.push({ group: 'Other', tag: 'Comment', label: 'JPEG Comment', value: ascii(bytes, dataStart, Math.min(dataLength, TOOL018_LIMITS.maxMetadataTextLength)) || `${dataLength} bytes` });
    } else if (JPEG_SOF.has(marker) && dataLength >= 6) {
      bitsPerSample = bytes[dataStart];
      height = readU16BE(bytes, dataStart + 1);
      width = readU16BE(bytes, dataStart + 3);
      sawSof = true;
    }
    pos += length;
  }
  if (sawScan) sawEoi = bytes.length >= 2 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
  return { width, height, bitsPerSample, hasAlpha: false, resolution, exif, hasExif, hasXmp, hasIptc, hasIcc, entries, warnings, validStructure: sawSof && sawScan && sawEoi };
}

function decodePngText(bytes: Uint8Array, start: number, length: number, type: string) {
  const end = start + length;
  let nul = start;
  while (nul < end && bytes[nul] !== 0) nul++;
  const keyword = ascii(bytes, start, nul - start) || type;
  if (type === 'tEXt' && nul < end) return { keyword, value: ascii(bytes, nul + 1, Math.min(end - nul - 1, TOOL018_LIMITS.maxMetadataTextLength)) };
  if (type === 'iTXt' && nul + 3 < end) {
    const compressionFlag = bytes[nul + 1];
    let cursor = nul + 3;
    while (cursor < end && bytes[cursor] !== 0) cursor++;
    cursor++;
    while (cursor < end && bytes[cursor] !== 0) cursor++;
    cursor++;
    if (compressionFlag === 0 && cursor < end) {
      try { return { keyword, value: new TextDecoder().decode(bytes.slice(cursor, Math.min(end, cursor + TOOL018_LIMITS.maxMetadataTextLength))) }; } catch { /* noop */ }
    }
  }
  return { keyword, value: `[${type} metadata: ${length} bytes]` };
}

function readPng(bytes: Uint8Array) {
  let width = 0, height = 0, bitsPerSample: number | undefined, hasAlpha = false;
  let resolution: ResolutionMetadata | undefined;
  let exif: ParsedExif | undefined;
  let hasExif = false, hasXmp = false, hasIcc = false;
  const entries: MetadataEntry[] = [];
  const warnings: string[] = [];
  let sawIhdr = false, sawIdat = false, sawIend = false;
  let pos = 8;
  while (pos + 12 <= bytes.length) {
    const length = readU32BE(bytes, pos);
    const type = ascii(bytes, pos + 4, 4);
    const dataStart = pos + 8;
    if (!isRange(bytes, dataStart, length) || !isRange(bytes, dataStart + length, 4)) { warnings.push(`Truncated PNG chunk ${type || '?'}`); break; }
    if (type === 'IHDR' && length >= 13) {
      sawIhdr = true;
      width = readU32BE(bytes, dataStart);
      height = readU32BE(bytes, dataStart + 4);
      bitsPerSample = bytes[dataStart + 8];
      const colorType = bytes[dataStart + 9];
      hasAlpha = colorType === 4 || colorType === 6;
      entries.push({ group: 'Color', tag: 'PNGColorType', label: 'PNG Color Type', value: String(colorType) });
      entries.push({ group: 'Color', tag: 'BitDepth', label: 'Bit Depth', value: String(bitsPerSample) });
    } else if (type === 'IDAT') {
      sawIdat = true;
    } else if (type === 'IEND') {
      sawIend = true;
    } else if (type === 'tRNS') {
      hasAlpha = true;
      entries.push({ group: 'Color', tag: 'Transparency', label: 'Transparency', value: 'Present' });
    } else if (type === 'pHYs' && length >= 9) {
      const x = readU32BE(bytes, dataStart), y = readU32BE(bytes, dataStart + 4), unitByte = bytes[dataStart + 8];
      if (x && y) {
        if (unitByte === 1) {
          resolution = { x, y, unit: 'unknown', ppiX: x * 0.0254, ppiY: y * 0.0254, source: 'PNG pHYs' };
          entries.push({ group: 'EXIF', tag: 'pHYs', label: 'PNG Physical Resolution', value: `${trimNumber(x * 0.0254, 2)} × ${trimNumber(y * 0.0254, 2)} PPI` });
        } else entries.push({ group: 'EXIF', tag: 'pHYs', label: 'PNG Physical Resolution', value: `${x} × ${y} pixels per unit` });
      }
    } else if (type === 'eXIf') {
      hasExif = true;
      exif = parseTiff(bytes, dataStart);
      entries.push(...exif.entries);
      warnings.push(...exif.warnings);
      resolution = parseResolution(exif.values, 'EXIF') ?? resolution;
    } else if (type === 'iCCP') {
      hasIcc = true;
      entries.push({ group: 'Color', tag: 'ICCProfile', label: 'ICC Profile', value: 'Present' });
    } else if (type === 'sRGB') {
      entries.push({ group: 'Color', tag: 'sRGB', label: 'sRGB Rendering Intent', value: length ? String(bytes[dataStart]) : 'Present' });
    } else if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') {
      const item = decodePngText(bytes, dataStart, length, type);
      if (/xmp/i.test(item.keyword) || /adobe/i.test(item.keyword) && /xml/i.test(item.value)) hasXmp = true;
      entries.push({ group: 'Other', tag: item.keyword, label: `PNG ${type}: ${item.keyword}`, value: item.value });
    }
    pos = dataStart + length + 4;
    if (type === 'IEND') break;
  }
  return { width, height, bitsPerSample, hasAlpha, resolution, exif, hasExif, hasXmp, hasIptc: false, hasIcc, entries, warnings, validStructure: sawIhdr && sawIdat && sawIend };
}

function readWebp(bytes: Uint8Array) {
  let width = 0, height = 0, bitsPerSample: number | undefined = 8, hasAlpha = false;
  let exif: ParsedExif | undefined;
  let hasExif = false, hasXmp = false, hasIcc = false;
  const entries: MetadataEntry[] = [];
  const warnings: string[] = [];
  let sawImageData = false;
  let pos = 12;
  while (pos + 8 <= bytes.length) {
    const type = ascii(bytes, pos, 4);
    const length = readU32LE(bytes, pos + 4);
    const dataStart = pos + 8;
    if (!isRange(bytes, dataStart, length)) { warnings.push(`Truncated WebP chunk ${type || '?'}`); break; }
    if (type === 'VP8X' && length >= 10) {
      const flags = bytes[dataStart];
      hasAlpha = Boolean(flags & 0x10);
      width = readU24LE(bytes, dataStart + 4) + 1;
      height = readU24LE(bytes, dataStart + 7) + 1;
      if (flags & 0x20) hasIcc = true;
      if (flags & 0x08) hasExif = true;
      if (flags & 0x04) hasXmp = true;
    } else if (type === 'VP8 ' && length >= 10) {
      sawImageData = true;
      if (!width && bytes[dataStart + 3] === 0x9d && bytes[dataStart + 4] === 0x01 && bytes[dataStart + 5] === 0x2a) {
        width = (bytes[dataStart + 6] | (bytes[dataStart + 7] << 8)) & 0x3fff;
        height = (bytes[dataStart + 8] | (bytes[dataStart + 9] << 8)) & 0x3fff;
      }
    } else if (type === 'VP8L' && length >= 5 && bytes[dataStart] === 0x2f) {
      sawImageData = true;
      const b1 = bytes[dataStart + 1], b2 = bytes[dataStart + 2], b3 = bytes[dataStart + 3], b4 = bytes[dataStart + 4];
      if (!width) {
        width = 1 + (b1 | ((b2 & 0x3f) << 8));
        height = 1 + ((b2 >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10));
      }
      hasAlpha = Boolean(b4 & 0x10);
    } else if (type === 'ANMF') {
      sawImageData = true;
    } else if (type === 'ALPH') {
      hasAlpha = true;
    } else if (type === 'EXIF') {
      hasExif = true;
      const tiffStart = ascii(bytes, dataStart, 6) === 'Exif' ? dataStart + 6 : dataStart;
      exif = parseTiff(bytes, tiffStart);
      entries.push(...exif.entries);
      warnings.push(...exif.warnings);
    } else if (type === 'XMP ') {
      hasXmp = true;
      entries.push({ group: 'Other', tag: 'XMP', label: 'XMP Metadata', value: `${length} bytes` });
    } else if (type === 'ICCP') {
      hasIcc = true;
      entries.push({ group: 'Color', tag: 'ICCProfile', label: 'ICC Profile', value: 'Present' });
    }
    pos = dataStart + length + (length & 1);
  }
  return { width, height, bitsPerSample, hasAlpha, resolution: exif ? parseResolution(exif.values, 'EXIF') : undefined, exif, hasExif, hasXmp, hasIptc: false, hasIcc, entries, warnings, validStructure: sawImageData };
}

function valueNumber(values: Map<string, unknown> | undefined, ...keys: string[]) {
  if (!values) return undefined;
  for (const key of keys) {
    const v = Number(values.get(key));
    if (Number.isFinite(v)) return v;
  }
  return undefined;
}

function valueString(values: Map<string, unknown> | undefined, ...keys: string[]) {
  if (!values) return undefined;
  for (const key of keys) {
    const v = values.get(key);
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

function inferGps(values: Map<string, unknown> | undefined) {
  if (!values) return undefined;
  const latitude = dmsToDecimal(values.get('GPSLatitude'), values.get('GPSLatitudeRef'));
  const longitude = dmsToDecimal(values.get('GPSLongitude'), values.get('GPSLongitudeRef'));
  const altitudeRaw = valueNumber(values, 'GPSAltitude');
  const altitudeRef = valueNumber(values, 'GPSAltitudeRef');
  const altitude = altitudeRaw == null ? undefined : altitudeRef === 1 ? -Math.abs(altitudeRaw) : altitudeRaw;
  const direction = valueNumber(values, 'GPSImgDirection');
  const date = valueString(values, 'GPSDateStamp');
  const timeRaw = values.get('GPSTimeStamp');
  const time = Array.isArray(timeRaw) ? timeRaw.map((v) => String(Math.round(Number(v))).padStart(2, '0')).join(':') : undefined;
  if (latitude == null && longitude == null && altitude == null && !date && !time && direction == null) return undefined;
  return { latitude, longitude, altitude, direction, date, time };
}

function sortEntries(entries: MetadataEntry[]) {
  return [...entries].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.label.localeCompare(b.label));
}

export async function analyzeImageFile(file: File): Promise<ImageMetadataAnalysis> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detectImageFormat(bytes);
  if (format === 'unknown') throw new Error('UNSUPPORTED_IMAGE');
  const parsed = format === 'jpeg' ? readJpeg(bytes) : format === 'png' ? readPng(bytes) : readWebp(bytes);
  if (!parsed.width || !parsed.height || !parsed.validStructure) throw new Error('UNREADABLE_IMAGE');
  const exifValues = parsed.exif?.values;
  const totalPixels = parsed.width * parsed.height;
  const gps = inferGps(exifValues);
  const entries = sortEntries(parsed.entries);
  return {
    name: file.name,
    format,
    formatLabel: formatLabel(format),
    mime: mimeForFormat(format),
    declaredMime: file.type || '-',
    extensionMismatch: !extensionMatches(file.name, format),
    size: file.size,
    width: parsed.width,
    height: parsed.height,
    bitsPerSample: parsed.bitsPerSample,
    hasAlpha: parsed.hasAlpha,
    totalPixels,
    megapixels: totalPixels / 1_000_000,
    aspectRatio: aspectRatio(parsed.width, parsed.height),
    pixelOrientation: pixelOrientation(parsed.width, parsed.height),
    orientation: displayOrientation(parsed.width, parsed.height, valueNumber(exifValues, 'Orientation')),
    exifOrientation: valueNumber(exifValues, 'Orientation'),
    resolution: parsed.resolution,
    dateTaken: formatExifDate(valueString(exifValues, 'DateTimeOriginal')),
    dateDigitized: formatExifDate(valueString(exifValues, 'DateTimeDigitized')),
    metadataModified: formatExifDate(valueString(exifValues, 'DateTime')),
    fileModified: file.lastModified ? new Date(file.lastModified).toLocaleString() : undefined,
    make: valueString(exifValues, 'Make'),
    model: valueString(exifValues, 'Model'),
    lensMake: valueString(exifValues, 'LensMake'),
    lensModel: valueString(exifValues, 'LensModel'),
    lensSpecification: valueNumberArray(exifValues, 'LensSpecification'),
    software: valueString(exifValues, 'Software'),
    artist: valueString(exifValues, 'Artist'),
    copyright: valueString(exifValues, 'Copyright'),
    iso: valueNumber(exifValues, 'PhotographicSensitivity', 'ISOSpeedRatings'),
    exposureTime: valueNumber(exifValues, 'ExposureTime'),
    fNumber: valueNumber(exifValues, 'FNumber'),
    focalLength: valueNumber(exifValues, 'FocalLength'),
    focalLength35mm: valueNumber(exifValues, 'FocalLengthIn35mmFilm'),
    exposureBias: valueNumber(exifValues, 'ExposureBiasValue'),
    flash: parseFlash(exifValues?.get('Flash')),
    whiteBalance: parseWhiteBalance(exifValues?.get('WhiteBalance')),
    meteringMode: parseMeteringMode(exifValues?.get('MeteringMode')),
    gps,
    hasExif: parsed.hasExif,
    hasGps: Boolean(gps) || entries.some((entry) => entry.group === 'GPS'),
    hasXmp: parsed.hasXmp,
    hasIptc: parsed.hasIptc,
    hasIcc: parsed.hasIcc,
    metadataEntryCount: entries.length,
    entries,
    warnings: parsed.warnings,
  };
}

export function validateTool018Files(files: File[]) {
  const errors: string[] = [];
  if (!files.length) return errors;
  if (files.length > TOOL018_LIMITS.maxFiles) errors.push('TOO_MANY_FILES');
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > TOOL018_LIMITS.maxTotalBytes) errors.push('TOTAL_TOO_LARGE');
  for (const file of files) if (file.size > TOOL018_LIMITS.maxFileBytes) errors.push(`FILE_TOO_LARGE:${file.name}`);
  return errors;
}

export function estimatedPrintSize(width: number, height: number, ppi: number) {
  const safePpi = Math.max(1, Number(ppi) || 1);
  const widthIn = width / safePpi;
  const heightIn = height / safePpi;
  return { widthIn, heightIn, widthCm: widthIn * 2.54, heightCm: heightIn * 2.54 };
}

export function formatExposureTime(seconds?: number) {
  if (!(seconds != null && Number.isFinite(seconds) && seconds > 0)) return undefined;
  if (seconds >= 1) return `${trimNumber(seconds, 2)} s`;
  const reciprocal = Math.round(1 / seconds);
  return reciprocal > 1 ? `1/${reciprocal} s` : `${trimNumber(seconds, 4)} s`;
}

function concatBytes(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, item) => sum + item.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length; }
  return out;
}

function minimalOrientationExif(orientation: number) {
  const payload = new Uint8Array(6 + 8 + 2 + 12 + 4);
  payload.set([0x45,0x78,0x69,0x66,0,0], 0);
  const t = 6;
  payload.set([0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00], t);
  payload[t + 8] = 1; payload[t + 9] = 0;
  const e = t + 10;
  payload[e] = 0x12; payload[e + 1] = 0x01;
  payload[e + 2] = 0x03; payload[e + 3] = 0;
  payload[e + 4] = 1; payload[e + 5] = 0; payload[e + 6] = 0; payload[e + 7] = 0;
  payload[e + 8] = orientation & 0xff; payload[e + 9] = (orientation >> 8) & 0xff;
  const length = payload.length + 2;
  const segment = new Uint8Array(4 + payload.length);
  segment.set([0xff, 0xe1, (length >> 8) & 0xff, length & 0xff], 0);
  segment.set(payload, 4);
  return segment;
}

function stripJpeg(bytes: Uint8Array, orientation?: number) {
  const chunks: Uint8Array[] = [bytes.slice(0, 2)];
  if (orientation && orientation !== 1) chunks.push(minimalOrientationExif(orientation));
  let pos = 2;
  while (pos + 1 < bytes.length) {
    if (bytes[pos] !== 0xff) {
      chunks.push(bytes.slice(pos));
      break;
    }
    const markerStart = pos;
    while (pos < bytes.length && bytes[pos] === 0xff) pos++;
    if (pos >= bytes.length) break;
    const marker = bytes[pos++];
    if (marker === 0xda) { chunks.push(bytes.slice(markerStart)); break; }
    if (marker === 0xd9) { chunks.push(bytes.slice(markerStart, pos)); break; }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { chunks.push(bytes.slice(markerStart, pos)); continue; }
    if (!isRange(bytes, pos, 2)) break;
    const length = readU16BE(bytes, pos);
    if (length < 2 || !isRange(bytes, pos, length)) throw new Error('UNREADABLE_IMAGE');
    const dataStart = pos + 2;
    const isExif = marker === 0xe1 && ascii(bytes, dataStart, 6) === 'Exif';
    const isXmp = marker === 0xe1 && ascii(bytes, dataStart, 29).startsWith('http://ns.adobe.com/xap/1.0/');
    const remove = isExif || isXmp || marker === 0xed || marker === 0xfe;
    if (!remove) chunks.push(bytes.slice(markerStart, pos + length));
    pos += length;
  }
  return concatBytes(chunks);
}

function stripPng(bytes: Uint8Array) {
  const chunks: Uint8Array[] = [bytes.slice(0, 8)];
  let pos = 8;
  while (pos + 12 <= bytes.length) {
    const length = readU32BE(bytes, pos);
    const type = ascii(bytes, pos + 4, 4);
    const total = 12 + length;
    if (!isRange(bytes, pos, total)) throw new Error('UNREADABLE_IMAGE');
    if (!['eXIf', 'tEXt', 'zTXt', 'iTXt'].includes(type)) chunks.push(bytes.slice(pos, pos + total));
    pos += total;
    if (type === 'IEND') break;
  }
  return concatBytes(chunks);
}

function writeU32LE(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function stripWebp(bytes: Uint8Array) {
  const chunkBytes: Uint8Array[] = [];
  let pos = 12;
  while (pos + 8 <= bytes.length) {
    const type = ascii(bytes, pos, 4);
    const length = readU32LE(bytes, pos + 4);
    const total = 8 + length + (length & 1);
    if (!isRange(bytes, pos, total)) throw new Error('UNREADABLE_IMAGE');
    if (type !== 'EXIF' && type !== 'XMP ') {
      const chunk = bytes.slice(pos, pos + total);
      if (type === 'VP8X' && length >= 10) chunk[8] &= ~0x0c;
      chunkBytes.push(chunk);
    }
    pos += total;
  }
  const payloadLength = 4 + chunkBytes.reduce((sum, chunk) => sum + chunk.length, 0);
  const header = new Uint8Array(12);
  header.set([0x52,0x49,0x46,0x46], 0);
  writeU32LE(header, 4, payloadLength);
  header.set([0x57,0x45,0x42,0x50], 8);
  return concatBytes([header, ...chunkBytes]);
}

export async function stripPrivacyMetadata(file: File, analysis?: ImageMetadataAnalysis) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detectImageFormat(bytes);
  if (format === 'unknown') throw new Error('UNSUPPORTED_IMAGE');
  const cleaned = format === 'jpeg' ? stripJpeg(bytes, analysis?.exifOrientation) : format === 'png' ? stripPng(bytes) : stripWebp(bytes);
  const mime = mimeForFormat(format);
  return new Blob([cleaned], { type: mime });
}

export function cleanFilename(name: string, format?: ImageFormat) {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const originalExt = dot > 0 ? name.slice(dot).toLocaleLowerCase() : '';
  let ext = originalExt;
  if (format === 'jpeg') ext = originalExt === '.jpeg' || originalExt === '.jpg' ? originalExt : '.jpg';
  if (format === 'png') ext = '.png';
  if (format === 'webp') ext = '.webp';
  return `${base}-clean${ext}`;
}

export function uniqueNames(names: string[]) {
  const used = new Map<string, number>();
  return names.map((name) => {
    const key = name.toLocaleLowerCase();
    const count = used.get(key) ?? 0;
    used.set(key, count + 1);
    if (!count) return name;
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    return `${base}-${count + 1}${ext}`;
  });
}
