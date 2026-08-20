export type Tool062Mode = 'discount' | 'reverse' | 'rate';
export type Tool062Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CAD' | 'AUD' | 'CNY';

export const TOOL062_LIMITS = {
  maxPrice: 1e15,
  maxDiscountPercent: 100,
  maxDiscountPrecision: 8,
  maxStackSteps: 3,
  maxInputLength: 30,
  maxCurrencies: 8,
} as const;

export const TOOL062_CURRENCIES: readonly Tool062Currency[] = ['KRW','USD','EUR','JPY','GBP','CAD','AUD','CNY'] as const;

export type Tool062Step = {
  index: number;
  rate: number;
  before: number;
  discountAmount: number;
  after: number;
};

export type Tool062DiscountResult = {
  original: number;
  steps: Tool062Step[];
  final: number;
  savings: number;
  effectiveRate: number;
};

function assertFinite(value: number, code: string) {
  if (!Number.isFinite(value)) throw new RangeError(code);
}

export function parseTool062Number(raw: string): number | null {
  const normalized = raw.trim().replace(/,/g, '');
  if (!normalized) return null;
  if (raw.length > TOOL062_LIMITS.maxInputLength) throw new RangeError('INPUT_LENGTH');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function validateTool062Price(value: number) {
  assertFinite(value, 'INVALID_PRICE');
  if (value < 0) throw new RangeError('NEGATIVE_PRICE');
  if (Math.abs(value) > TOOL062_LIMITS.maxPrice) throw new RangeError('PRICE_LIMIT');
  return value;
}

export function validateTool062Rate(value: number) {
  assertFinite(value, 'INVALID_RATE');
  if (value < 0 || value > TOOL062_LIMITS.maxDiscountPercent) throw new RangeError('RATE_RANGE');
  const decimals = String(value).split('.')[1]?.length ?? 0;
  if (decimals > TOOL062_LIMITS.maxDiscountPrecision) throw new RangeError('RATE_PRECISION');
  return value;
}

export function calculateTool062Discount(original: number, rates: readonly number[]): Tool062DiscountResult {
  validateTool062Price(original);
  if (rates.length < 1 || rates.length > TOOL062_LIMITS.maxStackSteps) throw new RangeError('STEP_COUNT');
  let current = original;
  const steps = rates.map((rawRate, i) => {
    const rate = validateTool062Rate(rawRate);
    const before = current;
    const discountAmount = before * rate / 100;
    const after = before * (1 - rate / 100);
    current = after;
    return { index: i + 1, rate, before, discountAmount, after };
  });
  const final = current;
  const savings = original - final;
  const effectiveRate = original === 0 ? 0 : (1 - final / original) * 100;
  return { original, steps, final, savings, effectiveRate };
}

export function reverseTool062Original(finalPrice: number, discountRate: number) {
  validateTool062Price(finalPrice);
  const rate = validateTool062Rate(discountRate);
  if (rate === 100) throw new RangeError('REVERSE_100');
  const original = finalPrice / (1 - rate / 100);
  validateTool062Price(original);
  return original;
}

export function findTool062DiscountRate(original: number, finalPrice: number) {
  validateTool062Price(original);
  validateTool062Price(finalPrice);
  if (original === 0) throw new RangeError('ZERO_ORIGINAL');
  if (finalPrice > original) throw new RangeError('FINAL_OVER_ORIGINAL');
  return ((original - finalPrice) / original) * 100;
}

export function formatTool062Number(value: number, maxFractionDigits = 2) {
  const safe = Math.max(0, Math.min(8, Math.trunc(maxFractionDigits)));
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: safe, useGrouping: true }).format(value);
}

export function formatTool062Money(value: number, currency: Tool062Currency, locale: 'ko'|'en'|'ja') {
  const localeCode = locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US';
  const digits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat(localeCode, {
    style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(value);
}
