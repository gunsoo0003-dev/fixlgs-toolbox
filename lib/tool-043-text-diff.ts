export const TOOL043_SERVICE_LIMITS = {
  maxCharactersPerText: 200_000,
  maxLinesPerText: 20_000,
  maxWordTokensPerChangedBlock: 20_000,
} as const;

export type DiffStatus = "unchanged" | "added" | "removed" | "changed";
export type WordPart = Readonly<{ status: "unchanged" | "added" | "removed"; text: string }>;
export type DiffBlock = Readonly<{
  id: number;
  status: DiffStatus;
  aText: string;
  bText: string;
  aStart: number | null;
  bStart: number | null;
  aCount: number;
  bCount: number;
  wordPartsA?: readonly WordPart[];
  wordPartsB?: readonly WordPart[];
}>;
export type DiffStats = Readonly<{ added: number; removed: number; changed: number; unchanged: number }>;
export type Tool043Result = Readonly<{ blocks: readonly DiffBlock[]; stats: DiffStats; identical: boolean }>;

export type Tool043ValidationError = Readonly<{
  code: "CHARACTER_LIMIT" | "LINE_LIMIT";
  side: "A" | "B";
  value: number;
}>;

function splitLines(text: string): string[] {
  if (text === "") return [];
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text.charCodeAt(i);
    if (ch === 13 || ch === 10) {
      if (ch === 13 && text.charCodeAt(i + 1) === 10) i += 1;
      out.push(text.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < text.length) out.push(text.slice(start));
  return out;
}

function lineCount(text: string): number {
  return splitLines(text).length;
}

export function validateTool043(aText: string, bText: string): readonly Tool043ValidationError[] {
  const errors: Tool043ValidationError[] = [];
  for (const [side, text] of [["A", aText], ["B", bText]] as const) {
    if (text.length > TOOL043_SERVICE_LIMITS.maxCharactersPerText) {
      errors.push({ code: "CHARACTER_LIMIT", side, value: text.length });
    }
    const lines = lineCount(text);
    if (lines > TOOL043_SERVICE_LIMITS.maxLinesPerText) {
      errors.push({ code: "LINE_LIMIT", side, value: lines });
    }
  }
  return errors;
}

type RawOp = Readonly<{ kind: "equal" | "delete" | "insert"; text: string; aLine: number | null; bLine: number | null }>;

function myersDiff(a: readonly string[], b: readonly string[]): RawOp[] {
  const n = a.length, m = b.length;
  if (!n && !m) return [];
  if (!n) return b.map((text, i) => ({ kind: "insert" as const, text, aLine: null, bLine: i + 1 }));
  if (!m) return a.map((text, i) => ({ kind: "delete" as const, text, aLine: i + 1, bLine: null }));

  const max = n + m;
  // Avoid pathological trace growth. The fallback is exact and deterministic,
  // preserving both originals, while treating the unmatched middle as replacement.
  if (max > 8000 && n * m > 25_000_000) {
    let prefix = 0;
    while (prefix < n && prefix < m && a[prefix] === b[prefix]) prefix += 1;
    let suffix = 0;
    while (suffix < n - prefix && suffix < m - prefix && a[n - 1 - suffix] === b[m - 1 - suffix]) suffix += 1;
    const out: RawOp[] = [];
    for (let i = 0; i < prefix; i += 1) out.push({ kind: "equal", text: a[i], aLine: i + 1, bLine: i + 1 });
    for (let i = prefix; i < n - suffix; i += 1) out.push({ kind: "delete", text: a[i], aLine: i + 1, bLine: null });
    for (let i = prefix; i < m - suffix; i += 1) out.push({ kind: "insert", text: b[i], aLine: null, bLine: i + 1 });
    for (let i = 0; i < suffix; i += 1) {
      const ai = n - suffix + i, bi = m - suffix + i;
      out.push({ kind: "equal", text: a[ai], aLine: ai + 1, bLine: bi + 1 });
    }
    return out;
  }

  const offset = max;
  let v = new Int32Array(max * 2 + 1);
  v.fill(-1); v[offset + 1] = 0;
  const trace: Int32Array[] = [];
  let finalD = 0;
  outer: for (let d = 0; d <= max; d += 1) {
    trace.push(v.slice());
    const next = v.slice();
    for (let k = -d; k <= d; k += 2) {
      const idx = offset + k;
      let x: number;
      if (k === -d || (k !== d && v[idx - 1] < v[idx + 1])) x = v[idx + 1];
      else x = v[idx - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x += 1; y += 1; }
      next[idx] = x;
      if (x >= n && y >= m) { v = next; finalD = d; break outer; }
    }
    v = next;
  }

  let x = n, y = m;
  const reversed: RawOp[] = [];
  for (let d = finalD; d >= 0; d -= 1) {
    const prev = trace[d];
    const k = x - y;
    let prevK: number;
    if (d === 0) prevK = 0;
    else if (k === -d || (k !== d && prev[offset + k - 1] < prev[offset + k + 1])) prevK = k + 1;
    else prevK = k - 1;
    const prevX = d === 0 ? 0 : prev[offset + prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      reversed.push({ kind: "equal", text: a[x - 1], aLine: x, bLine: y }); x -= 1; y -= 1;
    }
    if (d === 0) break;
    if (x === prevX) { reversed.push({ kind: "insert", text: b[y - 1], aLine: null, bLine: y }); y -= 1; }
    else { reversed.push({ kind: "delete", text: a[x - 1], aLine: x, bLine: null }); x -= 1; }
  }
  return reversed.reverse();
}

function tokenizeWords(text: string, locale: string): string[] {
  if (!text) return [];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
      return Array.from(segmenter.segment(text), (part) => part.segment);
    } catch { /* fallback below */ }
  }
  return Array.from(text);
}

function wordDiff(aText: string, bText: string, locale: string): { a: WordPart[]; b: WordPart[] } {
  const a = tokenizeWords(aText, locale), b = tokenizeWords(bText, locale);
  if (a.length + b.length > TOOL043_SERVICE_LIMITS.maxWordTokensPerChangedBlock) {
    return {
      a: aText ? [{ status: "removed", text: aText }] : [],
      b: bText ? [{ status: "added", text: bText }] : [],
    };
  }
  const raw = myersDiff(a, b);
  const aParts: WordPart[] = [], bParts: WordPart[] = [];
  const push = (parts: WordPart[], status: WordPart["status"], text: string) => {
    const last = parts.at(-1);
    if (last?.status === status) parts[parts.length - 1] = { status, text: last.text + text };
    else parts.push({ status, text });
  };
  for (const op of raw) {
    if (op.kind === "equal") { push(aParts, "unchanged", op.text); push(bParts, "unchanged", op.text); }
    if (op.kind === "delete") push(aParts, "removed", op.text);
    if (op.kind === "insert") push(bParts, "added", op.text);
  }
  return { a: aParts, b: bParts };
}

function groupOps(raw: readonly RawOp[], locale: string): DiffBlock[] {
  const groups: Array<{ kind: RawOp["kind"]; ops: RawOp[] }> = [];
  for (const op of raw) {
    const last = groups.at(-1);
    if (last?.kind === op.kind) last.ops.push(op); else groups.push({ kind: op.kind, ops: [op] });
  }
  const blocks: DiffBlock[] = [];
  let id = 1;
  for (let i = 0; i < groups.length; i += 1) {
    const g = groups[i];
    const next = groups[i + 1];
    if (g.kind === "delete" && next?.kind === "insert") {
      const aText = g.ops.map((o) => o.text).join("");
      const bText = next.ops.map((o) => o.text).join("");
      const words = wordDiff(aText, bText, locale);
      blocks.push({ id:id++, status:"changed", aText, bText, aStart:g.ops[0].aLine, bStart:next.ops[0].bLine, aCount:g.ops.length, bCount:next.ops.length, wordPartsA:words.a, wordPartsB:words.b });
      i += 1; continue;
    }
    const text = g.ops.map((o) => o.text).join("");
    const status: DiffStatus = g.kind === "equal" ? "unchanged" : g.kind === "delete" ? "removed" : "added";
    blocks.push({ id:id++, status, aText:g.kind === "insert" ? "" : text, bText:g.kind === "delete" ? "" : text, aStart:g.ops[0].aLine, bStart:g.ops[0].bLine, aCount:g.kind === "insert" ? 0 : g.ops.length, bCount:g.kind === "delete" ? 0 : g.ops.length });
  }
  return blocks;
}

export function compareTool043(aText: string, bText: string, locale = "en"): Tool043Result {
  const validation = validateTool043(aText, bText);
  if (validation.length) throw new RangeError(`${validation[0].side}_${validation[0].code}`);
  if (aText === bText) {
    const blocks = aText ? groupOps(myersDiff(splitLines(aText), splitLines(bText)), locale) : [];
    return { blocks, stats:{added:0,removed:0,changed:0,unchanged:splitLines(aText).length}, identical:true };
  }
  const blocks = groupOps(myersDiff(splitLines(aText), splitLines(bText)), locale);
  const stats = blocks.reduce<DiffStats>((s,b)=>({
    added:s.added+(b.status==="added"?b.bCount:0),
    removed:s.removed+(b.status==="removed"?b.aCount:0),
    changed:s.changed+(b.status==="changed"?Math.max(b.aCount,b.bCount):0),
    unchanged:s.unchanged+(b.status==="unchanged"?b.aCount:0),
  }),{added:0,removed:0,changed:0,unchanged:0});
  return { blocks, stats, identical:false };
}

function stripLineEnding(text: string): string { return text.replace(/(?:\r\n|\r|\n)$/u, ""); }
export function createTool043Report(result: Tool043Result, labels?: Partial<Record<"summary"|"added"|"removed"|"changed"|"unchanged"|"before"|"after"|"line", string>>): string {
  const l={summary:"Summary",added:"added",removed:"removed",changed:"changed",unchanged:"unchanged",before:"Before",after:"After",line:"Line",...labels};
  const lines=[`[${l.summary}] ${l.added} ${result.stats.added} / ${l.removed} ${result.stats.removed} / ${l.changed} ${result.stats.changed}`];
  for(const b of result.blocks){
    if(b.status==="unchanged") continue;
    const ref=b.aStart??b.bStart??0;
    if(b.status==="changed"){
      lines.push(`[${l.line} ${ref}] ~ ${l.changed}`);
      lines.push(`- ${l.before}: ${stripLineEnding(b.aText)}`);
      lines.push(`+ ${l.after}: ${stripLineEnding(b.bText)}`);
    } else if(b.status==="removed") lines.push(`[${l.line} ${ref}] - ${l.removed}: ${stripLineEnding(b.aText)}`);
    else lines.push(`[${l.line} ${ref}] + ${l.added}: ${stripLineEnding(b.bText)}`);
  }
  return lines.join("\n");
}

export function reconstructTool043(result: Tool043Result): { a: string; b: string } {
  return { a: result.blocks.map((b)=>b.aText).join(""), b: result.blocks.map((b)=>b.bText).join("") };
}
