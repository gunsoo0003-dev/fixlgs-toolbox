export const TOOL041_MAX_CHARS = 300_000 as const;
export const TOOL041_MAX_MATCHES_PER_TYPE = 10_000 as const;
export const TOOL041_MAX_TOTAL_RESULTS = 30_000 as const;
export const TOOL041_LIMIT_CANDIDATES = Object.freeze({
  conservative: { chars: 300_000, perType: 10_000, total: 30_000 },
  extended: { chars: 500_000, perType: 30_000, total: 50_000 },
});

export type Tool041Type = "numbers" | "korean" | "english" | "emails" | "urls" | "phones" | "hashtags";
export type Tool041Locale = "ko" | "en" | "ja";
export type Tool041Match = Readonly<{ value: string; startIndex: number; endIndex: number; type: Tool041Type }>;
export type Tool041Results = Record<Tool041Type, Tool041Match[]>;

const empty = (): Tool041Results => ({ numbers: [], korean: [], english: [], emails: [], urls: [], phones: [], hashtags: [] });

function collect(text: string, type: Tool041Type, re: RegExp, limit = TOOL041_MAX_MATCHES_PER_TYPE + 1): Tool041Match[] {
  const out: Tool041Match[] = [];
  for (const match of text.matchAll(re)) {
    const value = match[0];
    const startIndex = match.index ?? 0;
    out.push({ value, startIndex, endIndex: startIndex + value.length, type });
    if (out.length >= limit) break;
  }
  return out;
}

function trimTrailingUrlPunctuation(value: string): string {
  let end = value.length;
  while (end > 0 && /[),.!?;:\]}]/u.test(value[end - 1])) end -= 1;
  let candidate = value.slice(0, end);
  while (/\($/u.test(candidate) && /\)/u.test(candidate)) candidate = candidate.slice(0, -1);
  return candidate;
}

function collectUrls(text: string): Tool041Match[] {
  const re = /(?:https?:\/\/|www\.)[^\s<>"'`]+/giu;
  const out: Tool041Match[] = [];
  for (const match of text.matchAll(re)) {
    const raw = match[0];
    const startIndex = match.index ?? 0;
    const value = trimTrailingUrlPunctuation(raw);
    if (!value) continue;
    out.push({ value, startIndex, endIndex: startIndex + value.length, type: "urls" });
    if (out.length >= TOOL041_MAX_MATCHES_PER_TYPE + 1) break;
  }
  return out;
}

function collectPhones(text: string): Tool041Match[] {
  const re = /(?<![\d])(?:\+\d{1,3}[ -]?(?:\(?\d{1,4}\)?[ -]?)?\d{2,4}[ -]?\d{2,4}[ -]?\d{2,4}|\(?0\d{1,3}\)?[ -]?\d{3,4}[ -]?\d{4})(?!\d)/gu;
  return collect(text, "phones", re);
}

export function extractTool041(text: string, types: readonly Tool041Type[] = ["numbers", "korean", "english", "emails", "urls", "phones", "hashtags"]): Tool041Results {
  if (!text) return empty();
  const active = new Set(types);
  const results = empty();
  if (active.has("numbers")) results.numbers = collect(text, "numbers", /(?<![\p{L}\p{N}_])[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?(?![\p{L}\p{N}_])/gu);
  if (active.has("korean")) results.korean = collect(text, "korean", /\p{Script=Hangul}+/gu);
  if (active.has("english")) results.english = collect(text, "english", /\p{Script=Latin}+/gu);
  if (active.has("emails")) results.emails = collect(text, "emails", /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+/giu);
  if (active.has("urls")) results.urls = collectUrls(text);
  if (active.has("phones")) results.phones = collectPhones(text);
  if (active.has("hashtags")) results.hashtags = collect(text, "hashtags", /(?<![\p{L}\p{N}_/?=&])#[\p{L}\p{N}_]+/gu);
  return results;
}

export function allTool041Matches(results: Tool041Results): Tool041Match[] {
  return Object.values(results).flat().sort((a, b) => a.startIndex - b.startIndex || a.endIndex - b.endIndex);
}

export function countTool041Results(results: Tool041Results): number {
  return Object.values(results).reduce((sum, list) => sum + list.length, 0);
}

export function overTool041Limit(text: string, results: Tool041Results): boolean {
  if (text.length > TOOL041_MAX_CHARS) return true;
  if (Object.values(results).some((list) => list.length > TOOL041_MAX_MATCHES_PER_TYPE)) return true;
  return countTool041Results(results) > TOOL041_MAX_TOTAL_RESULTS;
}
