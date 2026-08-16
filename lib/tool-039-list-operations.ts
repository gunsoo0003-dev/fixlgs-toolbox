export type Tool039Locale = "ko" | "en" | "ja";
export type Tool039Mode = "dedupe" | "text" | "numeric" | "reverse" | "shuffle";

export const TOOL039_LIMIT_CANDIDATES = Object.freeze({
  maxCharacters: 500_000,
  maxLines: 50_000,
  maxSingleLineCharacters: 50_000,
});

export type Tool039TransformResult = Readonly<{
  output: string;
  inputLines: number;
  outputLines: number;
  removedDuplicates: number;
  nonNumericLines: number;
}>;

const STRICT_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export function parseTool039Lines(sourceText: string): string[] {
  if (sourceText === "") return [];
  return sourceText.split(/\r\n|\n|\r/);
}

export function isTool039StrictFiniteNumber(line: string): boolean {
  const candidate = line.trim();
  if (!candidate || !STRICT_NUMBER.test(candidate)) return false;
  return Number.isFinite(Number(candidate));
}

export function dedupeTool039Lines(lines: readonly string[]): { lines: string[]; removed: number } {
  const seen = new Set<string>();
  const result: string[] = [];
  let removed = 0;
  for (const line of lines) {
    if (seen.has(line)) { removed += 1; continue; }
    seen.add(line);
    result.push(line);
  }
  return { lines: result, removed };
}

export function textSortTool039Lines(lines: readonly string[], locale: Tool039Locale): string[] {
  const collator = new Intl.Collator(locale, { usage: "sort", sensitivity: "base" });
  return lines
    .map((line, index) => ({ line, index }))
    .sort((a, b) => collator.compare(a.line, b.line) || a.index - b.index)
    .map(({ line }) => line);
}

export function numericSortTool039Lines(lines: readonly string[]): { lines: string[]; nonNumeric: number } {
  const numeric: Array<{ line: string; value: number; index: number }> = [];
  const nonNumeric: Array<{ line: string; index: number }> = [];
  lines.forEach((line, index) => {
    if (isTool039StrictFiniteNumber(line)) numeric.push({ line, value: Number(line.trim()), index });
    else nonNumeric.push({ line, index });
  });
  numeric.sort((a, b) => a.value - b.value || a.index - b.index);
  return { lines: [...numeric.map(({ line }) => line), ...nonNumeric.map(({ line }) => line)], nonNumeric: nonNumeric.length };
}

function randomUint32(maxExclusive: number): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) return 0;
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
    const buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function shuffleTool039Lines(lines: readonly string[], rng: (maxExclusive: number) => number = randomUint32): string[] {
  const result = [...lines];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = rng(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function transformTool039(mode: Tool039Mode, sourceText: string, locale: Tool039Locale): Tool039TransformResult {
  const lines = parseTool039Lines(sourceText);
  let outputLines = [...lines];
  let removedDuplicates = 0;
  let nonNumericLines = 0;

  if (mode === "dedupe") {
    const result = dedupeTool039Lines(lines);
    outputLines = result.lines;
    removedDuplicates = result.removed;
  } else if (mode === "text") {
    outputLines = textSortTool039Lines(lines, locale);
  } else if (mode === "numeric") {
    const result = numericSortTool039Lines(lines);
    outputLines = result.lines;
    nonNumericLines = result.nonNumeric;
  } else if (mode === "reverse") {
    outputLines = [...lines].reverse();
  } else if (mode === "shuffle") {
    outputLines = shuffleTool039Lines(lines);
  }

  return {
    output: outputLines.join("\n"),
    inputLines: lines.length,
    outputLines: outputLines.length,
    removedDuplicates,
    nonNumericLines,
  };
}
