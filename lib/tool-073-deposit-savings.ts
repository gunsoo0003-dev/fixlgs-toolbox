export const TOOL073_LIMITS = {
  maxAmount: 1e15,
  maxRate: 100,
  maxMonths: 1200,
  maxTaxRate: 100,
  maxInputChars: 30,
  maxDisplayPrecision: 8,
} as const;

export type Tool073Mode = 'deposit' | 'savings';
export type Tool073TermUnit = 'months' | 'years';

export type Tool073Result = {
  mode: Tool073Mode;
  principal: number;
  grossInterest: number;
  grossMaturity: number;
  afterTaxInterest: number;
  afterTaxMaturity: number;
  annualRate: number;
  months: number;
  referenceTaxRate: number;
  formula: string;
};

function assertFiniteNonNegative(value:number,label:string,max:number=TOOL073_LIMITS.maxAmount){
  if(!Number.isFinite(value)) throw new Error(`${label}_INVALID`);
  if(value<0) throw new Error(`${label}_NEGATIVE`);
  if(value>max) throw new Error(`${label}_LIMIT`);
}

export function parseTool073Number(raw:string):number|null{
  const normalized=raw.replace(/[,_\s₩¥$€]/g,'').trim();
  if(normalized==='') return null;
  if(normalized.length>TOOL073_LIMITS.maxInputChars) return null;
  const value=Number(normalized);
  return Number.isFinite(value)?value:null;
}

export function normalizeTool073Term(term:number,unit:Tool073TermUnit):number{
  if(!Number.isFinite(term)) throw new Error('TERM_INVALID');
  if(term<=0) throw new Error('TERM_NON_POSITIVE');
  const months=unit==='years'?term*12:term;
  if(!Number.isFinite(months)||months>TOOL073_LIMITS.maxMonths) throw new Error('TERM_LIMIT');
  if(Math.abs(months-Math.round(months))>1e-9) throw new Error('TERM_WHOLE_MONTHS');
  return Math.round(months);
}

export function validateTool073Rate(rate:number){
  assertFiniteNonNegative(rate,'RATE',TOOL073_LIMITS.maxRate);
}

export function validateTool073TaxRate(rate:number){
  assertFiniteNonNegative(rate,'TAX',TOOL073_LIMITS.maxTaxRate);
}

function applyReferenceTax(grossInterest:number,taxRate:number){
  const afterTaxInterest=grossInterest*(1-taxRate/100);
  return {afterTaxInterest};
}

export function calculateTool073Deposit(principal:number,annualRate:number,term:number,unit:Tool073TermUnit,referenceTaxRate=0):Tool073Result{
  assertFiniteNonNegative(principal,'AMOUNT');
  validateTool073Rate(annualRate);
  validateTool073TaxRate(referenceTaxRate);
  const months=normalizeTool073Term(term,unit);
  const grossInterest=principal*(annualRate/100)*(months/12);
  const {afterTaxInterest}=applyReferenceTax(grossInterest,referenceTaxRate);
  return {
    mode:'deposit',principal,grossInterest,grossMaturity:principal+grossInterest,
    afterTaxInterest,afterTaxMaturity:principal+afterTaxInterest,
    annualRate,months,referenceTaxRate,
    formula:`interest = principal × ${annualRate}/100 × ${months}/12`,
  };
}

export function calculateTool073Savings(monthlyDeposit:number,annualRate:number,term:number,unit:Tool073TermUnit,referenceTaxRate=0):Tool073Result{
  assertFiniteNonNegative(monthlyDeposit,'AMOUNT');
  validateTool073Rate(annualRate);
  validateTool073TaxRate(referenceTaxRate);
  const months=normalizeTool073Term(term,unit);
  const principal=monthlyDeposit*months;
  if(principal>TOOL073_LIMITS.maxAmount) throw new Error('TOTAL_PRINCIPAL_LIMIT');
  const grossInterest=monthlyDeposit*(annualRate/100)/12*(months*(months+1)/2);
  const {afterTaxInterest}=applyReferenceTax(grossInterest,referenceTaxRate);
  return {
    mode:'savings',principal,grossInterest,grossMaturity:principal+grossInterest,
    afterTaxInterest,afterTaxMaturity:principal+afterTaxInterest,
    annualRate,months,referenceTaxRate,
    formula:`interest = monthly deposit × ${annualRate}/100 ÷ 12 × (${months} × ${months+1} ÷ 2)`,
  };
}

export function formatTool073(value:number,precision=0,locale='ko-KR'){
  const digits=Math.max(0,Math.min(TOOL073_LIMITS.maxDisplayPrecision,precision));
  return new Intl.NumberFormat(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
}
