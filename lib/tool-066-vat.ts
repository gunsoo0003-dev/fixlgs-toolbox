export const TOOL066_LIMITS = {
  maxAmount: 1e15,
  maxRate: 100,
  maxInputChars: 30,
  maxDisplayPrecision: 2,
} as const;

export type Tool066Mode = 'exclusive' | 'inclusive' | 'reverse-rate';

export type Tool066Breakdown = {
  supply: number;
  vat: number;
  total: number;
  rate: number;
  formula: string;
};

function assertFiniteNonNegative(value:number, label:string){
  if(!Number.isFinite(value)) throw new Error(`${label}_INVALID`);
  if(value<0) throw new Error(`${label}_NEGATIVE`);
  if(Math.abs(value)>TOOL066_LIMITS.maxAmount) throw new Error(`${label}_LIMIT`);
}

export function parseTool066Number(raw:string):number|null{
  const normalized=raw.replace(/[,_\s₩¥$€]/g,'').trim();
  if(normalized==='') return null;
  if(normalized.length>TOOL066_LIMITS.maxInputChars) return null;
  const value=Number(normalized);
  return Number.isFinite(value)?value:null;
}

export function validateTool066Rate(rate:number){
  if(!Number.isFinite(rate)) throw new Error('RATE_INVALID');
  if(rate<0) throw new Error('RATE_NEGATIVE');
  if(rate>TOOL066_LIMITS.maxRate) throw new Error('RATE_LIMIT');
}

export function calculateExclusive(supply:number,rate:number):Tool066Breakdown{
  assertFiniteNonNegative(supply,'AMOUNT');
  validateTool066Rate(rate);
  const vat=supply*(rate/100);
  const total=supply+vat;
  return {supply,vat,total,rate,formula:`VAT = supply × ${rate}/100; total = supply + VAT`};
}

export function calculateInclusive(total:number,rate:number):Tool066Breakdown{
  assertFiniteNonNegative(total,'AMOUNT');
  validateTool066Rate(rate);
  const divisor=1+(rate/100);
  const supply=divisor===0?total:total/divisor;
  const vat=total-supply;
  return {supply,vat,total,rate,formula:`supply = total ÷ (1 + ${rate}/100); VAT = total − supply`};
}

export function calculateEffectiveRate(supply:number,vat:number):Tool066Breakdown{
  assertFiniteNonNegative(supply,'AMOUNT');
  assertFiniteNonNegative(vat,'VAT');
  if(supply===0 && vat>0) throw new Error('ZERO_SUPPLY_RATE');
  const rate=supply===0?0:(vat/supply)*100;
  if(rate>TOOL066_LIMITS.maxRate) throw new Error('RATE_LIMIT');
  const total=supply+vat;
  return {supply,vat,total,rate,formula:'rate = VAT ÷ supply × 100'};
}

export function formatTool066(value:number,precision=0,locale='ko-KR'){
  const digits=Math.max(0,Math.min(TOOL066_LIMITS.maxDisplayPrecision,precision));
  return new Intl.NumberFormat(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
}

export function roundTool066Display(value:number,precision=0){
  const digits=Math.max(0,Math.min(TOOL066_LIMITS.maxDisplayPrecision,precision));
  const factor=10**digits;
  return Math.round((value+Number.EPSILON)*factor)/factor;
}
