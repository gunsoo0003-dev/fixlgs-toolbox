export const TOOL063_LIMITS={maxAbsInput:1e15,maxPrecision:8,maxTerms:3,maxProportionFields:4,maxInputChars:30} as const;
export type Tool063Unknown='a'|'b'|'c'|'d';
export function parseTool063Number(raw:string):number|null{
 const s=raw.trim().replace(/,/g,''); if(!s||s.length>TOOL063_LIMITS.maxInputChars)return null;
 if(s.includes('/')){const p=s.split('/');if(p.length!==2)return null;const n=Number(p[0]),d=Number(p[1]);if(!Number.isFinite(n)||!Number.isFinite(d)||d===0)return null;return n/d}
 const n=Number(s);return Number.isFinite(n)?n:null;
}
function assertValue(n:number){if(!Number.isFinite(n))throw new Error('INVALID');if(n<0)throw new Error('NEGATIVE');if(Math.abs(n)>TOOL063_LIMITS.maxAbsInput)throw new Error('LIMIT')}
function gcdInt(a:number,b:number){a=Math.abs(Math.trunc(a));b=Math.abs(Math.trunc(b));while(b){[a,b]=[b,a%b]}return a||1}
function decimalPlaces(n:number){const s=Math.abs(n).toString().toLowerCase();if(s.includes('e-')){const [base,e]=s.split('e-');return Number(e)+(base.split('.')[1]?.length||0)}return s.split('.')[1]?.length||0}
function toIntegerTerms(values:number[]){const p=Math.min(TOOL063_LIMITS.maxPrecision,Math.max(...values.map(decimalPlaces)));const factor=10**p;return values.map(v=>Math.round(v*factor))}
export function simplifyRatio(values:number[]){if(values.length<2||values.length>3)throw new Error('TERMS');values.forEach(assertValue);if(values.every(v=>v===0))throw new Error('ZERO_RATIO');const ints=toIntegerTerms(values);let g=ints.reduce((a,b)=>gcdInt(a,b));if(g===0)g=1;return {values:ints.map(v=>v/g),gcd:g};}
export function equivalentRatio(a:number,b:number,c:number,d:number,tolerance=1e-10){[a,b,c,d].forEach(assertValue);if(b===0||d===0)throw new Error('ZERO_DENOMINATOR');const left=a*d,right=b*c;return {equivalent:Math.abs(left-right)<=tolerance*Math.max(1,Math.abs(left),Math.abs(right)),left,right};}
export function solveProportion(input:{a?:number;b?:number;c?:number;d?:number},unknown:Tool063Unknown){const x={...input};for(const k of ['a','b','c','d'] as const){if(k!==unknown){if(x[k]===undefined)throw new Error('MISSING');assertValue(x[k] as number)}}let result:number;
 if(unknown==='a'){if((x.d as number)===0)throw new Error('ZERO_DENOMINATOR');result=(x.b as number)*(x.c as number)/(x.d as number)}
 else if(unknown==='b'){if((x.c as number)===0)throw new Error('ZERO_DENOMINATOR');result=(x.a as number)*(x.d as number)/(x.c as number)}
 else if(unknown==='c'){if((x.b as number)===0)throw new Error('ZERO_DENOMINATOR');result=(x.a as number)*(x.d as number)/(x.b as number)}
 else {if((x.a as number)===0)throw new Error('ZERO_DENOMINATOR');result=(x.b as number)*(x.c as number)/(x.a as number)}
 assertValue(result);return result;}
export function scaleRatio(values:number[],multiplier:number){values.forEach(assertValue);assertValue(multiplier);return values.map(v=>v*multiplier)}
export function normalizeRatio(a:number,b:number,side:'one-left'|'one-right'){[a,b].forEach(assertValue);if(a===0||b===0)throw new Error('ZERO_DENOMINATOR');return side==='one-left'?[1,b/a]:[a/b,1]}
export function formatTool063(n:number,precision=6){const p=Math.max(0,Math.min(TOOL063_LIMITS.maxPrecision,precision));return new Intl.NumberFormat('en-US',{maximumFractionDigits:p,useGrouping:false}).format(Math.abs(n)<1e-12?0:n)}
