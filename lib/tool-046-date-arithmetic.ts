export type DateUnit = "day" | "week" | "month" | "year";
export type DateDirection = "add" | "subtract";

export interface CalendarDate { year: number; month: number; day: number }

export const TOOL046_LIMITS = {
  minYear: 1,
  maxYear: 9999,
  maxQuantity: 100000,
} as const;

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0;
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function parseIsoDate(value: string): CalendarDate | null {
  const match = ISO_DATE_RE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < TOOL046_LIMITS.minYear || year > TOOL046_LIMITS.maxYear) return null;
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function formatIsoDate(date: CalendarDate): string {
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function toUtcDate(date: CalendarDate): Date {
  const d = new Date(0);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCFullYear(date.year, date.month - 1, date.day);
  return d;
}

function fromUtcDate(date: Date): CalendarDate {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function addDays(date: CalendarDate, days: number): CalendarDate {
  const d = toUtcDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtcDate(d);
}

function addMonthsClamped(date: CalendarDate, months: number): CalendarDate {
  const monthIndex = date.year * 12 + (date.month - 1) + months;
  const targetYear = Math.floor(monthIndex / 12);
  const targetMonthIndex = ((monthIndex % 12) + 12) % 12;
  const targetMonth = targetMonthIndex + 1;
  if (targetYear < TOOL046_LIMITS.minYear || targetYear > TOOL046_LIMITS.maxYear) {
    throw new RangeError("DATE_OUT_OF_RANGE");
  }
  return { year: targetYear, month: targetMonth, day: Math.min(date.day, daysInMonth(targetYear, targetMonth)) };
}

function addYearsClamped(date: CalendarDate, years: number): CalendarDate {
  const targetYear = date.year + years;
  if (targetYear < TOOL046_LIMITS.minYear || targetYear > TOOL046_LIMITS.maxYear) {
    throw new RangeError("DATE_OUT_OF_RANGE");
  }
  return { year: targetYear, month: date.month, day: Math.min(date.day, daysInMonth(targetYear, date.month)) };
}

export function calculateDate(input: string, direction: DateDirection, unit: DateUnit, quantity: number): string {
  const date = parseIsoDate(input);
  if (!date) throw new TypeError("INVALID_DATE");
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > TOOL046_LIMITS.maxQuantity) throw new RangeError("INVALID_QUANTITY");
  const signed = direction === "subtract" ? -quantity : quantity;
  let result: CalendarDate;
  if (unit === "year") result = addYearsClamped(date, signed);
  else if (unit === "month") result = addMonthsClamped(date, signed);
  else if (unit === "week") result = addDays(date, signed * 7);
  else result = addDays(date, signed);
  if (result.year < TOOL046_LIMITS.minYear || result.year > TOOL046_LIMITS.maxYear) throw new RangeError("DATE_OUT_OF_RANGE");
  return formatIsoDate(result);
}

export function weekdayIndex(input: string): number {
  const date = parseIsoDate(input);
  if (!date) throw new TypeError("INVALID_DATE");
  return toUtcDate(date).getUTCDay();
}
