export const TOOL047_SERVICE_LIMITS = { minDate: '1900-01-01', maxDate: '2100-12-31', minMilestone: 1, maxMilestone: 10000 } as const;

export type Tool047Mode = 'dday' | 'birthday' | 'anniversary';
export type DdayStatus = { sign: 'D-' | 'D+' | 'D-Day'; days: number; label: string };

function parseDateOnly(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) throw new Error('INVALID_DATE');
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (date.getUTCFullYear() !== Number(m[1]) || date.getUTCMonth() !== Number(m[2]) - 1 || date.getUTCDate() !== Number(m[3])) throw new Error('INVALID_DATE');
  return date;
}

export function isSupportedDate(value: string): boolean {
  try { parseDateOnly(value); return value >= TOOL047_SERVICE_LIMITS.minDate && value <= TOOL047_SERVICE_LIMITS.maxDate; } catch { return false; }
}

export function addDays(value: string, days: number): string {
  if (!isSupportedDate(value)) throw new Error('DATE_OUT_OF_RANGE');
  const date = parseDateOnly(value);
  date.setUTCDate(date.getUTCDate() + days);
  const out = date.toISOString().slice(0, 10);
  if (!isSupportedDate(out)) throw new Error('DATE_OUT_OF_RANGE');
  return out;
}

export function diffDays(reference: string, target: string): number {
  const a = parseDateOnly(reference).getTime();
  const b = parseDateOnly(target).getTime();
  return Math.round((b - a) / 86400000);
}

export function ddayStatus(reference: string, target: string): DdayStatus {
  const diff = diffDays(reference, target);
  if (diff === 0) return { sign: 'D-Day', days: 0, label: 'D-Day' };
  if (diff > 0) return { sign: 'D-', days: diff, label: `D-${diff}` };
  return { sign: 'D+', days: Math.abs(diff), label: `D+${Math.abs(diff)}` };
}

function nextBirthday(today: string, month: number, day: number): string {
  const year = Number(today.slice(0, 4));
  const candidate = (y: number) => {
    const value = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return isValidCalendarDateForBirthday(value) ? value : null;
  };
  const current = candidate(year);
  if (current && current >= today) return current;
  for (let y = year + 1; y <= year + 8; y++) {
    const next = candidate(y);
    if (next && isSupportedDate(next)) return next;
  }
  throw new Error('BIRTHDAY_OUT_OF_RANGE');
}

function isValidCalendarDateForBirthday(value: string): boolean {
  return /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(value) && (() => {
    try { parseDateOnly(value); return true; } catch { return false; }
  })();
}

export function birthdayResult(today: string, monthDay: string) {
  const m = /^(\d{2})-(\d{2})$/.exec(monthDay);
  if (!m) throw new Error('INVALID_BIRTHDAY');
  const month = Number(m[1]); const day = Number(m[2]);
  const birthday = nextBirthday(today, month, day);
  return { date: birthday, status: ddayStatus(today, birthday) };
}

export function anniversaryMilestones(startDate: string, milestones: number[] = [100, 200, 300, 365, 500, 1000]) {
  if (!isSupportedDate(startDate)) throw new Error('INVALID_DATE');
  const values = [...new Set(milestones)].filter((n) => Number.isInteger(n) && n >= TOOL047_SERVICE_LIMITS.minMilestone && n <= TOOL047_SERVICE_LIMITS.maxMilestone);
  return values.map((days) => {
    try { return { days, date: addDays(startDate, days - 1) }; }
    catch { return { days, date: null as string | null }; }
  });
}

export function anniversaryYears(startDate: string, maxYears = 5) {
  const start = parseDateOnly(startDate);
  const month = start.getUTCMonth(); const day = start.getUTCDate();
  const result: { years: number; date: string | null; note?: 'NEXT_LEAP_YEAR' }[] = [];
  for (let years = 1; years <= maxYears; years++) {
    const year = start.getUTCFullYear() + years;
    const candidate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    result.push(isValidCalendarDateForBirthday(candidate) ? { years, date: candidate } : { years, date: null, note: 'NEXT_LEAP_YEAR' });
  }
  return result;
}
