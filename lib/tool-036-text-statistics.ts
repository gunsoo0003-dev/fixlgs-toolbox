export const TOOL036_DEFAULT_WPM = 200 as const;
export const TOOL036_WPM_PRESETS = [150, 200, 250] as const;
export const TOOL036_MAX_GRAPHEMES = 300_000 as const;
export const TOOL036_LIMIT_CANDIDATES = Object.freeze({ conservative: TOOL036_MAX_GRAPHEMES, extended: 500_000 });

export type Tool036Locale = "ko" | "en" | "ja";

export type Tool036Statistics = Readonly<{
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  utf8Bytes: number;
  readingSeconds: number;
}>;

type SegmenterGranularity = "grapheme" | "word" | "sentence";

type Segment = { segment: string; isWordLike?: boolean };

function localeTag(locale: Tool036Locale): string {
  if (locale === "ko") return "ko-KR";
  if (locale === "ja") return "ja-JP";
  return "en-US";
}

function segmentWithIntl(text: string, locale: Tool036Locale, granularity: SegmenterGranularity): Segment[] | null {
  const IntlWithSegmenter = Intl as typeof Intl & {
    Segmenter?: new (locale?: string | string[], options?: { granularity: SegmenterGranularity }) => {
      segment(input: string): Iterable<Segment>;
    };
  };
  if (typeof IntlWithSegmenter.Segmenter !== "function") return null;
  const segmenter = new IntlWithSegmenter.Segmenter(localeTag(locale), { granularity });
  return Array.from(segmenter.segment(text));
}


export type Tool036LimitResult = Readonly<{
  text: string;
  graphemes: number;
  truncated: boolean;
}>;

export function limitTool036Text(text: string, locale: Tool036Locale, maxGraphemes = TOOL036_MAX_GRAPHEMES): Tool036LimitResult {
  if (!text) return { text: "", graphemes: 0, truncated: false };
  const segments = segmentWithIntl(text, locale, "grapheme");
  if (segments) {
    if (segments.length <= maxGraphemes) return { text, graphemes: segments.length, truncated: false };
    return { text: segments.slice(0, maxGraphemes).map((item) => item.segment).join(""), graphemes: maxGraphemes, truncated: true };
  }
  const chars = Array.from(text);
  if (chars.length <= maxGraphemes) return { text, graphemes: chars.length, truncated: false };
  return { text: chars.slice(0, maxGraphemes).join(""), graphemes: maxGraphemes, truncated: true };
}

export function countTool036Graphemes(text: string, locale: Tool036Locale): number {
  if (!text) return 0;
  const segments = segmentWithIntl(text, locale, "grapheme");
  return segments ? segments.length : Array.from(text).length;
}

export function stripTool036UnicodeWhitespace(text: string): string {
  try {
    return text.replace(/\p{White_Space}/gu, "");
  } catch {
    return text.replace(/[\s\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, "");
  }
}

function fallbackWordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  try {
    const tokens = trimmed.match(/[\p{L}\p{N}\p{M}]+(?:['’\-][\p{L}\p{N}\p{M}]+)*/gu);
    return tokens?.length ?? 0;
  } catch {
    return trimmed.split(/\s+/).filter(Boolean).length;
  }
}

export function countTool036Words(text: string, locale: Tool036Locale): number {
  if (!text.trim()) return 0;
  const segments = segmentWithIntl(text, locale, "word");
  if (!segments) return fallbackWordCount(text);
  return segments.reduce((count, item) => count + (item.isWordLike ? 1 : 0), 0);
}

function fallbackSentenceCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(/(?<=[.!?。！？])(?:\s+|$)|[\r\n\u2028\u2029]+/u).filter((part) => part.trim().length > 0);
  return Math.max(1, parts.length);
}

export function countTool036Sentences(text: string, locale: Tool036Locale): number {
  if (!text.trim()) return 0;
  const segments = segmentWithIntl(text, locale, "sentence");
  if (!segments) return fallbackSentenceCount(text);
  return segments.reduce((count, item) => count + (item.segment.trim().length > 0 ? 1 : 0), 0);
}

export function countTool036ParagraphsPortable(text: string): number {
  if (!text.trim()) return 0;
  const normalized = text.replace(/\r\n?/g, "\n").replace(/[\u2028\u2029]/g, "\n");
  return normalized.split(/\n[\t \f\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]*\n+/g).map((part) => part.trim()).filter(Boolean).length;
}

export function countTool036Lines(text: string): number {
  if (text.length === 0) return 0;
  return text.split(/\r\n|\r|\n|\u2028|\u2029/g).length;
}

export function tool036Utf8Bytes(text: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).length;
  let bytes = 0;
  for (const char of Array.from(text)) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint <= 0x7f) bytes += 1;
    else if (codePoint <= 0x7ff) bytes += 2;
    else if (codePoint <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

export function tool036ReadingSeconds(words: number, wordsPerMinute: number): number {
  if (words <= 0 || wordsPerMinute <= 0) return 0;
  return Math.ceil((words / wordsPerMinute) * 60);
}

export function calculateTool036Statistics(text: string, locale: Tool036Locale, wordsPerMinute: number = TOOL036_DEFAULT_WPM): Tool036Statistics {
  const words = countTool036Words(text, locale);
  return {
    charactersWithSpaces: countTool036Graphemes(text, locale),
    charactersWithoutSpaces: countTool036Graphemes(stripTool036UnicodeWhitespace(text), locale),
    words,
    sentences: countTool036Sentences(text, locale),
    paragraphs: countTool036ParagraphsPortable(text),
    lines: countTool036Lines(text),
    utf8Bytes: tool036Utf8Bytes(text),
    readingSeconds: tool036ReadingSeconds(words, wordsPerMinute),
  };
}
