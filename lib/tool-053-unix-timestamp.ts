export const TOOL053_SERVICE_LIMITS = {
  minMilliseconds: -8640000000000000,
  maxMilliseconds: 8640000000000000,
} as const;

export type TimestampUnit = "seconds" | "milliseconds";

export type TimestampConversion = {
  milliseconds: number;
  seconds: number;
  iso: string;
  utc: string;
  local: string;
  weekday: string;
};

const localeTag = (locale: "ko" | "en" | "ja") => locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";

export function normalizeIntegerInput(value: string): number | null {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const numeric = Number(trimmed);
  return Number.isSafeInteger(numeric) ? numeric : null;
}

export function unitMismatchHint(value: string, unit: TimestampUnit): "likely-seconds" | "likely-milliseconds" | null {
  const trimmed = value.trim().replace(/^-/, "");
  if (!/^\d+$/.test(trimmed)) return null;
  if (unit === "seconds" && trimmed.length >= 13) return "likely-milliseconds";
  if (unit === "milliseconds" && trimmed.length === 10) return "likely-seconds";
  return null;
}

export function toMilliseconds(value: number, unit: TimestampUnit): number {
  const milliseconds = unit === "seconds" ? value * 1000 : value;
  if (!Number.isSafeInteger(milliseconds)) throw new RangeError("unsafe-integer");
  if (milliseconds < TOOL053_SERVICE_LIMITS.minMilliseconds || milliseconds > TOOL053_SERVICE_LIMITS.maxMilliseconds) {
    throw new RangeError("date-range");
  }
  return milliseconds;
}

export function timestampToDate(value: number, unit: TimestampUnit, locale: "ko" | "en" | "ja"): TimestampConversion {
  const milliseconds = toMilliseconds(value, unit);
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) throw new RangeError("date-range");
  const tag = localeTag(locale);
  const base: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" };
  const utc = new Intl.DateTimeFormat(tag, { ...base, timeZone: "UTC", timeZoneName: "short" }).format(date);
  const local = new Intl.DateTimeFormat(tag, { ...base, timeZoneName: "short" }).format(date);
  const weekday = new Intl.DateTimeFormat(tag, { weekday: "long" }).format(date);
  return { milliseconds, seconds: Math.trunc(milliseconds / 1000), iso: date.toISOString(), utc, local, weekday };
}

export function localDateTimeToTimestamp(dateValue: string, timeValue: string) {
  if (!/^\d{4,}-\d{2}-\d{2}$/.test(dateValue) || !/^\d{2}:\d{2}(:\d{2})?$/.test(timeValue)) throw new RangeError("invalid-local-datetime");
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute, second = 0] = timeValue.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute, second, 0);
  if (
    Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day ||
    date.getHours() !== hour || date.getMinutes() !== minute || date.getSeconds() !== second
  ) throw new RangeError("invalid-local-datetime");
  const milliseconds = date.getTime();
  if (milliseconds < TOOL053_SERVICE_LIMITS.minMilliseconds || milliseconds > TOOL053_SERVICE_LIMITS.maxMilliseconds) throw new RangeError("date-range");
  return { milliseconds, seconds: Math.trunc(milliseconds / 1000), iso: date.toISOString() };
}
