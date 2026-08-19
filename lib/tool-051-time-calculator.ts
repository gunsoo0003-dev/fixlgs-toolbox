export const TOOL051_LIMITS = {
  maxDurationHours: 999,
  maxMinute: 59,
  maxSecond: 59,
} as const;

export type ClockTime = { hour: number; minute: number; second: number };
export type DurationParts = { hours: number; minutes: number; seconds: number };
export type ClockArithmeticResult = ClockTime & { dayOffset: number; totalSeconds: number };

const DAY_SECONDS = 24 * 60 * 60;

export function isClockTime(value: ClockTime): boolean {
  return Number.isInteger(value.hour) && value.hour >= 0 && value.hour <= 23 &&
    Number.isInteger(value.minute) && value.minute >= 0 && value.minute <= 59 &&
    Number.isInteger(value.second) && value.second >= 0 && value.second <= 59;
}

export function isDuration(value: DurationParts): boolean {
  return Number.isInteger(value.hours) && value.hours >= 0 && value.hours <= TOOL051_LIMITS.maxDurationHours &&
    Number.isInteger(value.minutes) && value.minutes >= 0 && value.minutes <= 59 &&
    Number.isInteger(value.seconds) && value.seconds >= 0 && value.seconds <= 59;
}

export function clockToSeconds(value: ClockTime): number {
  if (!isClockTime(value)) throw new RangeError('INVALID_CLOCK_TIME');
  return value.hour * 3600 + value.minute * 60 + value.second;
}

export function durationToSeconds(value: DurationParts): number {
  if (!isDuration(value)) throw new RangeError('INVALID_DURATION');
  return value.hours * 3600 + value.minutes * 60 + value.seconds;
}

export function secondsToClock(seconds: number): ClockTime {
  if (!Number.isInteger(seconds) || seconds < 0 || seconds >= DAY_SECONDS) throw new RangeError('INVALID_DAY_SECONDS');
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = seconds % 60;
  return { hour, minute, second };
}

export function secondsToDuration(seconds: number): DurationParts {
  if (!Number.isInteger(seconds) || seconds < 0) throw new RangeError('INVALID_DURATION_SECONDS');
  return {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

export function addOrSubtractTime(base: ClockTime, duration: DurationParts, operation: 'add' | 'subtract'): ClockArithmeticResult {
  const baseSeconds = clockToSeconds(base);
  const durationSeconds = durationToSeconds(duration);
  const raw = operation === 'add' ? baseSeconds + durationSeconds : baseSeconds - durationSeconds;
  const dayOffset = Math.floor(raw / DAY_SECONDS);
  const normalized = ((raw % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS;
  return { ...secondsToClock(normalized), dayOffset, totalSeconds: raw };
}

export function timeDifference(start: ClockTime, end: ClockTime, crossMidnight: boolean): DurationParts {
  const startSeconds = clockToSeconds(start);
  let endSeconds = clockToSeconds(end);
  if (endSeconds < startSeconds) {
    if (!crossMidnight) throw new RangeError('CROSS_MIDNIGHT_REQUIRED');
    endSeconds += DAY_SECONDS;
  }
  return secondsToDuration(endSeconds - startSeconds);
}

export function twelveToTwentyFour(hour12: number, minute: number, second: number, period: 'AM' | 'PM'): ClockTime {
  if (!Number.isInteger(hour12) || hour12 < 1 || hour12 > 12 || !Number.isInteger(minute) || minute < 0 || minute > 59 || !Number.isInteger(second) || second < 0 || second > 59) {
    throw new RangeError('INVALID_12_HOUR_TIME');
  }
  const hour = period === 'AM' ? (hour12 === 12 ? 0 : hour12) : (hour12 === 12 ? 12 : hour12 + 12);
  return { hour, minute, second };
}

export function twentyFourToTwelve(value: ClockTime): { hour: number; minute: number; second: number; period: 'AM' | 'PM' } {
  if (!isClockTime(value)) throw new RangeError('INVALID_CLOCK_TIME');
  const period = value.hour < 12 ? 'AM' : 'PM';
  const hour = value.hour % 12 === 0 ? 12 : value.hour % 12;
  return { hour, minute: value.minute, second: value.second, period };
}

export function format24(value: ClockTime, includeSeconds = false): string {
  if (!isClockTime(value)) throw new RangeError('INVALID_CLOCK_TIME');
  const base = `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
  return includeSeconds ? `${base}:${String(value.second).padStart(2, '0')}` : base;
}

export function format12(value: ClockTime, includeSeconds = false): string {
  const converted = twentyFourToTwelve(value);
  const base = `${converted.hour}:${String(converted.minute).padStart(2, '0')}`;
  return `${includeSeconds ? `${base}:${String(converted.second).padStart(2, '0')}` : base} ${converted.period}`;
}
