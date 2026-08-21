export const TOOL075_LIMITS = {
  maxPrincipal: 1e15,
  maxAnnualRate: 100,
  maxMonths: 1200,
  maxPrecision: 8,
  maxInputChars: 30,
} as const;

export type Tool075Method = 'equal-payment' | 'equal-principal' | 'bullet';
export type Tool075TermUnit = 'months' | 'years';

export type Tool075ScheduleRow = {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type Tool075LoanResult = {
  method: Tool075Method;
  principal: number;
  annualRate: number;
  monthlyRate: number;
  months: number;
  firstPayment: number;
  regularPayment: number;
  lastPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalRepayment: number;
  schedule: Tool075ScheduleRow[];
  formula: string;
};

export function parseTool075Number(raw:string):number|null {
  const normalized = raw.replace(/[,_\s₩¥$€]/g, '').trim();
  if (!normalized || normalized.length > TOOL075_LIMITS.maxInputChars) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function normalizeTool075Term(value:number, unit:Tool075TermUnit):number {
  if (!Number.isFinite(value)) throw new Error('TERM_INVALID');
  if (value <= 0) throw new Error('TERM_NON_POSITIVE');
  const rawMonths = unit === 'years' ? value * 12 : value;
  if (!Number.isInteger(rawMonths)) throw new Error('TERM_MONTHS_INTEGER');
  if (rawMonths > TOOL075_LIMITS.maxMonths) throw new Error('TERM_LIMIT');
  return rawMonths;
}

export function validateTool075Inputs(principal:number, annualRate:number, months:number) {
  if (!Number.isFinite(principal)) throw new Error('PRINCIPAL_INVALID');
  if (principal < 0) throw new Error('PRINCIPAL_NEGATIVE');
  if (principal > TOOL075_LIMITS.maxPrincipal) throw new Error('PRINCIPAL_LIMIT');
  if (!Number.isFinite(annualRate)) throw new Error('RATE_INVALID');
  if (annualRate < 0) throw new Error('RATE_NEGATIVE');
  if (annualRate > TOOL075_LIMITS.maxAnnualRate) throw new Error('RATE_LIMIT');
  if (!Number.isInteger(months) || months <= 0) throw new Error('TERM_INVALID');
  if (months > TOOL075_LIMITS.maxMonths) throw new Error('TERM_LIMIT');
}

function cleanTiny(value:number) {
  return Math.abs(value) < 1e-8 ? 0 : value;
}

function totals(method:Tool075Method, principal:number, annualRate:number, months:number, schedule:Tool075ScheduleRow[], formula:string):Tool075LoanResult {
  const totalPrincipal = schedule.reduce((sum,row)=>sum+row.principal,0);
  const totalInterest = schedule.reduce((sum,row)=>sum+row.interest,0);
  const totalRepayment = totalPrincipal + totalInterest;
  const firstPayment = schedule[0]?.payment ?? 0;
  const lastPayment = schedule.at(-1)?.payment ?? 0;
  const regularPayment = method === 'equal-payment' ? firstPayment : method === 'bullet' ? (schedule[0]?.interest ?? 0) : firstPayment;
  return {method,principal,annualRate,monthlyRate:annualRate/1200,months,firstPayment,regularPayment,lastPayment,totalPrincipal,totalInterest,totalRepayment,schedule,formula};
}

function zeroPrincipalSchedule(months:number):Tool075ScheduleRow[] {
  return Array.from({length:months},(_,i)=>({period:i+1,payment:0,principal:0,interest:0,balance:0}));
}

export function calculateTool075EqualPayment(principal:number, annualRate:number, months:number):Tool075LoanResult {
  validateTool075Inputs(principal,annualRate,months);
  if (principal === 0) return totals('equal-payment',principal,annualRate,months,zeroPrincipalSchedule(months),'P = 0');
  const r = annualRate / 1200;
  const payment = r === 0 ? principal / months : principal * r * ((1+r) ** months) / (((1+r) ** months) - 1);
  let balance = principal;
  const schedule:Tool075ScheduleRow[] = [];
  for (let period=1; period<=months; period++) {
    const interest = r === 0 ? 0 : balance * r;
    const principalPart = period === months ? balance : Math.min(balance, payment - interest);
    const actualPayment = principalPart + interest;
    balance = period === months ? 0 : cleanTiny(balance - principalPart);
    schedule.push({period,payment:actualPayment,principal:principalPart,interest,balance});
  }
  return totals('equal-payment',principal,annualRate,months,schedule,r===0?'payment = principal ÷ months':'PMT = P × r × (1+r)^n ÷ ((1+r)^n − 1)');
}

export function calculateTool075EqualPrincipal(principal:number, annualRate:number, months:number):Tool075LoanResult {
  validateTool075Inputs(principal,annualRate,months);
  if (principal === 0) return totals('equal-principal',principal,annualRate,months,zeroPrincipalSchedule(months),'P = 0');
  const r = annualRate / 1200;
  const basePrincipal = principal / months;
  let balance = principal;
  const schedule:Tool075ScheduleRow[] = [];
  for (let period=1; period<=months; period++) {
    const interest = r === 0 ? 0 : balance * r;
    const principalPart = period === months ? balance : Math.min(balance,basePrincipal);
    const payment = principalPart + interest;
    balance = period === months ? 0 : cleanTiny(balance-principalPart);
    schedule.push({period,payment,principal:principalPart,interest,balance});
  }
  return totals('equal-principal',principal,annualRate,months,schedule,'principal/month = P ÷ n; interest = opening balance × r');
}

export function calculateTool075Bullet(principal:number, annualRate:number, months:number):Tool075LoanResult {
  validateTool075Inputs(principal,annualRate,months);
  const r = annualRate / 1200;
  const monthlyInterest = principal * r;
  const schedule:Tool075ScheduleRow[] = Array.from({length:months},(_,i)=>{
    const isLast = i === months-1;
    const principalPart = isLast ? principal : 0;
    return {period:i+1,payment:monthlyInterest+principalPart,principal:principalPart,interest:monthlyInterest,balance:isLast?0:principal};
  });
  return totals('bullet',principal,annualRate,months,schedule,'monthly interest = P × r; final payment = P + monthly interest');
}

export function calculateTool075(principal:number, annualRate:number, months:number, method:Tool075Method):Tool075LoanResult {
  if (method === 'equal-payment') return calculateTool075EqualPayment(principal,annualRate,months);
  if (method === 'equal-principal') return calculateTool075EqualPrincipal(principal,annualRate,months);
  if (method === 'bullet') return calculateTool075Bullet(principal,annualRate,months);
  throw new Error('METHOD_INVALID');
}

export function compareTool075(principal:number, annualRate:number, months:number) {
  return (['equal-payment','equal-principal','bullet'] as const).map(method=>calculateTool075(principal,annualRate,months,method));
}

export function formatTool075Money(value:number, locale='ko-KR', currency='KRW') {
  return new Intl.NumberFormat(locale,{style:'currency',currency,maximumFractionDigits:0}).format(value);
}

export function roundTool075(value:number, precision=0) {
  const digits = Math.max(0,Math.min(TOOL075_LIMITS.maxPrecision,precision));
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
