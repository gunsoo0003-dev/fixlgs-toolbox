export const TOOL067_LIMITS={maxAbsAmount:1e15,maxPrecision:8,maxInputChars:30,minTargetMargin:0,maxTargetMarginExclusive:100} as const;
export const TOOL067_CURRENCIES=['KRW','USD','JPY','EUR'] as const;
export type Tool067Currency=(typeof TOOL067_CURRENCIES)[number];
export type Tool067Mode='margin'|'target'|'allowed';

function finite(value:number,code='INVALID_NUMBER'){
 if(!Number.isFinite(value))throw new RangeError(code);
 if(Math.abs(value)>TOOL067_LIMITS.maxAbsAmount)throw new RangeError('AMOUNT_LIMIT');
 return value;
}
export function validateTool067Amount(value:number){finite(value);if(value<0)throw new RangeError('NEGATIVE_AMOUNT');return value;}
export function validateTool067TargetMargin(value:number){finite(value);if(value<TOOL067_LIMITS.minTargetMargin||value>=TOOL067_LIMITS.maxTargetMarginExclusive)throw new RangeError('TARGET_MARGIN_RANGE');return value;}
export function parseTool067Number(raw:string){const s=raw.trim().replace(/[,_\s]/g,'');if(!s)return null;if(s.length>TOOL067_LIMITS.maxInputChars)throw new RangeError('INPUT_LENGTH');const n=Number(s);finite(n);return n;}

export function calculateTool067Margin(cost:number,selling:number){
 validateTool067Amount(cost);validateTool067Amount(selling);if(selling===0)throw new RangeError('ZERO_SELLING');
 const profit=selling-cost;const margin=(profit/selling)*100;const markup=cost===0?null:(profit/cost)*100;
 return {cost,selling,profit,margin,markup,loss:profit<0};
}
export function calculateTool067TargetPrice(cost:number,targetMargin:number){validateTool067Amount(cost);validateTool067TargetMargin(targetMargin);return cost/(1-targetMargin/100);}
export function calculateTool067AllowedCost(selling:number,targetMargin:number){validateTool067Amount(selling);validateTool067TargetMargin(targetMargin);return selling*(1-targetMargin/100);}
export function reverseTool067Cost(selling:number,profit:number){validateTool067Amount(selling);finite(profit);const cost=selling-profit;if(cost<0)throw new RangeError('NEGATIVE_COST');return cost;}
export function formatTool067Number(value:number,digits=4){if(!Number.isFinite(value))return '—';return value.toLocaleString('en-US',{maximumFractionDigits:Math.min(Math.max(digits,0),TOOL067_LIMITS.maxPrecision)});}
export function formatTool067Money(value:number,currency:Tool067Currency,locale:'ko'|'en'|'ja'){
 const localeCode=locale==='ko'?'ko-KR':locale==='ja'?'ja-JP':'en-US';
 return new Intl.NumberFormat(localeCode,{style:'currency',currency,maximumFractionDigits:currency==='KRW'||currency==='JPY'?0:2}).format(value);
}
