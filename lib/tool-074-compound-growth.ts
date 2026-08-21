export const TOOL074_LIMITS = {
  maxAmount: 1e15,
  maxRate: 100,
  maxMonths: 1200,
  maxYears: 100,
  maxPrecision: 8,
  maxInputChars: 30,
} as const;

export type CompoundingFrequency = 'monthly' | 'annual';
export type ContributionTiming = 'end' | 'beginning';
export type TermUnit = 'months' | 'years';

export type Tool074Input = {
  principal: number;
  contribution: number;
  annualRate: number;
  term: number;
  termUnit: TermUnit;
  frequency: CompoundingFrequency;
  timing: ContributionTiming;
  goal?: number;
};

export type Tool074Result = {
  periods: number;
  periodicRate: number;
  compoundFactor: number;
  annuityFactor: number;
  principalFutureValue: number;
  contributionFutureValue: number;
  totalContributions: number;
  totalInvested: number;
  growth: number;
  futureValue: number;
  goal: number | null;
  goalGap: number | null;
  goalReached: boolean | null;
  requiredContribution: number | null;
  requiredPrincipal: number | null;
};

function finiteNonNegative(value:number, code:string, max:number=TOOL074_LIMITS.maxAmount){
  if(!Number.isFinite(value)) throw new Error(`${code}_INVALID`);
  if(value<0) throw new Error(`${code}_NEGATIVE`);
  if(value>max) throw new Error(`${code}_LIMIT`);
}

export function parseTool074Number(raw:string):number|null{
  const normalized=raw.replace(/[,_\s₩¥$€]/g,'').trim();
  if(normalized==='' || normalized.length>TOOL074_LIMITS.maxInputChars) return null;
  const value=Number(normalized);
  return Number.isFinite(value)?value:null;
}

export function normalizeTool074Periods(term:number,unit:TermUnit,frequency:CompoundingFrequency){
  if(!Number.isFinite(term) || term<=0) throw new Error('TERM_INVALID');
  if(unit==='months'){
    if(term>TOOL074_LIMITS.maxMonths) throw new Error('TERM_LIMIT');
    if(frequency==='annual'){
      const years=term/12;
      if(Math.abs(years-Math.round(years))>1e-12) throw new Error('TERM_FREQUENCY_MISMATCH');
      return Math.round(years);
    }
    if(Math.abs(term-Math.round(term))>1e-12) throw new Error('TERM_INTEGER_REQUIRED');
    return Math.round(term);
  }
  if(term>TOOL074_LIMITS.maxYears) throw new Error('TERM_LIMIT');
  if(frequency==='monthly') return Math.round(term*12);
  if(Math.abs(term-Math.round(term))>1e-12) throw new Error('TERM_INTEGER_REQUIRED');
  return Math.round(term);
}

export function calculateTool074(input:Tool074Input):Tool074Result{
  finiteNonNegative(input.principal,'PRINCIPAL');
  finiteNonNegative(input.contribution,'CONTRIBUTION');
  finiteNonNegative(input.annualRate,'RATE',TOOL074_LIMITS.maxRate);
  if(input.goal!==undefined) finiteNonNegative(input.goal,'GOAL');

  const periods=normalizeTool074Periods(input.term,input.termUnit,input.frequency);
  const m=input.frequency==='monthly'?12:1;
  const periodicRate=(input.annualRate/100)/m;
  const compoundFactor=periodicRate===0?1:(1+periodicRate)**periods;
  if(!Number.isFinite(compoundFactor)) throw new Error('OVERFLOW');

  const baseAnnuity=periodicRate===0?periods:(compoundFactor-1)/periodicRate;
  const timingFactor=input.timing==='beginning'?(1+periodicRate):1;
  const annuityFactor=baseAnnuity*timingFactor;
  const principalFutureValue=input.principal*compoundFactor;
  const contributionFutureValue=input.contribution*annuityFactor;
  const totalContributions=input.contribution*periods;
  const totalInvested=input.principal+totalContributions;
  const futureValue=principalFutureValue+contributionFutureValue;
  const growth=futureValue-totalInvested;
  if(![annuityFactor,principalFutureValue,contributionFutureValue,totalContributions,totalInvested,futureValue,growth].every(Number.isFinite)) throw new Error('OVERFLOW');

  const goal=input.goal??null;
  const goalGap=goal===null?null:goal-futureValue;
  const goalReached=goal===null?null:goalGap!<=0;
  let requiredContribution:number|null=null;
  let requiredPrincipal:number|null=null;
  if(goal!==null){
    if(annuityFactor>0) requiredContribution=Math.max(0,(goal-principalFutureValue)/annuityFactor);
    if(compoundFactor>0) requiredPrincipal=Math.max(0,(goal-contributionFutureValue)/compoundFactor);
  }

  return {periods,periodicRate,compoundFactor,annuityFactor,principalFutureValue,contributionFutureValue,totalContributions,totalInvested,growth,futureValue,goal,goalGap,goalReached,requiredContribution,requiredPrincipal};
}

export function formatTool074(value:number,precision=0,locale='ko-KR'){
  const digits=Math.max(0,Math.min(TOOL074_LIMITS.maxPrecision,precision));
  return new Intl.NumberFormat(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
}
