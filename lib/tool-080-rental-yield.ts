export const TOOL080_LIMITS={maxAmount:1e15,maxInputChars:30,maxDisplayPrecision:8} as const;
export type LoanInterestUnit='monthly'|'annual';
export type Tool080Input={purchasePrice:number;deposit:number;monthlyRent:number;ownerMonthlyManagement:number;loanInterest:number;loanInterestUnit:LoanInterestUnit};
export type Tool080Result={annualRent:number;annualManagement:number;annualLoanInterest:number;investedCapital:number;grossYield:number;netYield:number;netIncome:number};
function validAmount(value:number,label:string){if(!Number.isFinite(value))throw new Error(`${label}_INVALID`);if(value<0)throw new Error(`${label}_NEGATIVE`);if(value>TOOL080_LIMITS.maxAmount)throw new Error(`${label}_LIMIT`)}
export function parseTool080Number(raw:string):number|null{const n=raw.replace(/[,_\s₩¥$€%]/g,'').trim();if(!n||n.length>TOOL080_LIMITS.maxInputChars)return null;const v=Number(n);return Number.isFinite(v)?v:null}
export function calculateTool080(input:Tool080Input):Tool080Result{
 validAmount(input.purchasePrice,'PURCHASE');validAmount(input.deposit,'DEPOSIT');validAmount(input.monthlyRent,'RENT');validAmount(input.ownerMonthlyManagement,'MANAGEMENT');validAmount(input.loanInterest,'INTEREST');
 if(input.purchasePrice<=0)throw new Error('PURCHASE_REQUIRED');
 if(input.deposit>=input.purchasePrice)throw new Error('DEPOSIT_GTE_PURCHASE');
 const annualRent=input.monthlyRent*12;const annualManagement=input.ownerMonthlyManagement*12;const annualLoanInterest=input.loanInterestUnit==='monthly'?input.loanInterest*12:input.loanInterest;
 const investedCapital=input.purchasePrice-input.deposit;const grossYield=annualRent/input.purchasePrice*100;const netIncome=annualRent-annualManagement-annualLoanInterest;const netYield=netIncome/investedCapital*100;
 if(![annualRent,annualManagement,annualLoanInterest,investedCapital,grossYield,netIncome,netYield].every(Number.isFinite))throw new Error('RESULT_INVALID');
 return {annualRent,annualManagement,annualLoanInterest,investedCapital,grossYield,netYield,netIncome};
}
export function formatTool080(value:number,precision=2,locale='ko-KR'){const d=Math.max(0,Math.min(TOOL080_LIMITS.maxDisplayPrecision,precision));return new Intl.NumberFormat(locale,{maximumFractionDigits:d,minimumFractionDigits:0}).format(value)}
