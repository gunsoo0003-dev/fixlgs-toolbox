import { TOOL052_CITIES } from '@/lib/tool-052-timezone-data';

export const TOOL052_SERVICE_LIMITS = { maxCities: 12, meetingStepMinutes: 30, minYear: 1900, maxYear: 2100 } as const;
export type Tool052HourCycle = '12' | '24';
export type LocalParts = { year: number; month: number; day: number; hour: number; minute: number };

const formatterCache = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(zone: string) {
  const key = `parts:${zone}`;
  let f = formatterCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    formatterCache.set(key, f);
  }
  return f;
}

export function isValidZone(zone: string) {
  try { new Intl.DateTimeFormat('en', { timeZone: zone }).format(0); return true; } catch { return false; }
}

export function zonedParts(instantMs: number, zone: string): LocalParts & { second: number } {
  const out: Record<string, number> = {};
  for (const p of partsFormatter(zone).formatToParts(new Date(instantMs))) if (p.type !== 'literal') out[p.type] = Number(p.value);
  return { year: out.year, month: out.month, day: out.day, hour: out.hour, minute: out.minute, second: out.second };
}

export function getOffsetMinutes(instantMs: number, zone: string): number {
  const p = zonedParts(instantMs, zone);
  const representedAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((representedAsUtc - Math.floor(instantMs / 1000) * 1000) / 60000);
}

export function formatOffset(minutes: number) {
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

export function dstStatus(instantMs: number, zone: string) {
  const p = zonedParts(instantMs, zone);
  const jan = getOffsetMinutes(Date.UTC(p.year, 0, 15, 12), zone);
  const jul = getOffsetMinutes(Date.UTC(p.year, 6, 15, 12), zone);
  const current = getOffsetMinutes(instantMs, zone);
  const standard = Math.min(jan, jul);
  return { active: jan !== jul && current !== standard, offset: current, standardOffset: standard };
}

export function parseDateTime(date: string, time: string): LocalParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!m || !t) return null;
  const p = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]), hour: Number(t[1]), minute: Number(t[2]) };
  const check = new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute));
  if (p.year < TOOL052_SERVICE_LIMITS.minYear || p.year > TOOL052_SERVICE_LIMITS.maxYear || check.getUTCFullYear() !== p.year || check.getUTCMonth() !== p.month - 1 || check.getUTCDate() !== p.day || p.hour > 23 || p.minute > 59) return null;
  return p;
}

function sameLocal(a: LocalParts, b: LocalParts) { return a.year === b.year && a.month === b.month && a.day === b.day && a.hour === b.hour && a.minute === b.minute; }

export function resolveLocalDateTime(parts: LocalParts, zone: string): { kind: 'exact' | 'ambiguous' | 'nonexistent'; candidates: number[] } {
  if (!isValidZone(zone)) return { kind: 'nonexistent', candidates: [] };
  const naive = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  const probes = [naive - 172800000, naive - 86400000, naive, naive + 86400000, naive + 172800000, Date.UTC(parts.year, 0, 15, 12), Date.UTC(parts.year, 6, 15, 12)];
  const offsets = [...new Set(probes.map((ms) => getOffsetMinutes(ms, zone)))];
  const candidates = offsets.map((offset) => naive - offset * 60000).filter((ms) => sameLocal(parts, zonedParts(ms, zone))).sort((a, b) => a - b);
  const unique = [...new Set(candidates)];
  if (unique.length === 0) return { kind: 'nonexistent', candidates: [] };
  if (unique.length > 1) return { kind: 'ambiguous', candidates: unique };
  return { kind: 'exact', candidates: unique };
}

export function formatLocal(instantMs: number, zone: string, locale: 'ko' | 'en' | 'ja', cycle: Tool052HourCycle) {
  const language = locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US';
  const date = new Intl.DateTimeFormat(language, { timeZone: zone, year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }).format(new Date(instantMs));
  const time = new Intl.DateTimeFormat(language, { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: cycle === '12' }).format(new Date(instantMs));
  return { date, time, parts: zonedParts(instantMs, zone) };
}

export function differenceLabelMinutes(referenceZone: string, targetZone: string, instantMs: number) {
  return getOffsetMinutes(instantMs, targetZone) - getOffsetMinutes(instantMs, referenceZone);
}

export function searchCities(query: string) {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return TOOL052_CITIES.slice(0, 12);
  return TOOL052_CITIES.filter((item) => [item.id, item.zone, ...Object.values(item.city), ...Object.values(item.country)].some((value) => value.toLocaleLowerCase().includes(q))).slice(0, 12);
}

export function meetingOverlap(args: { referenceDate: string; referenceZone: string; cityIds: string[]; workingHours: Record<string, { start: string; end: string }> }) {
  const refMidnight = parseDateTime(args.referenceDate, '00:00');
  if (!refMidnight) return [];
  const resolved = resolveLocalDateTime(refMidnight, args.referenceZone);
  if (!resolved.candidates.length) return [];
  const startMs = resolved.candidates[0];
  const step = TOOL052_SERVICE_LIMITS.meetingStepMinutes * 60000;
  const slots: number[] = [];
  for (let ms = startMs; ms < startMs + 86400000; ms += step) {
    const ok = args.cityIds.every((id) => {
      const city = TOOL052_CITIES.find((x) => x.id === id);
      const hours = args.workingHours[id];
      if (!city || !hours) return false;
      const p = zonedParts(ms, city.zone);
      const localMinutes = p.hour * 60 + p.minute;
      const [sh, sm] = hours.start.split(':').map(Number); const [eh, em] = hours.end.split(':').map(Number);
      const a = sh * 60 + sm; const b = eh * 60 + em;
      return Number.isFinite(a) && Number.isFinite(b) && a < b && localMinutes >= a && localMinutes < b;
    });
    if (ok) slots.push(ms);
  }
  const ranges: { start: number; end: number }[] = [];
  for (const ms of slots) {
    const last = ranges[ranges.length - 1];
    if (last && last.end === ms) last.end = ms + step;
    else ranges.push({ start: ms, end: ms + step });
  }
  return ranges;
}
