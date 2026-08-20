export type Tool061Mode='percentageOf'|'partOfWhole'|'percentChange'|'applyPercent'|'reversePercent';
export type Tool061Direction='increase'|'decrease';
export const TOOL061_LIMITS={maxAbs:1e15,maxPrecision:8,maxInputLength:30} as const;
export type Tool061Result={value:number;formula:string;difference?:number;direction?:'increase'|'decrease'|'same'};
const ensureFinite=(value:number,label:string)=>{if(!Number.isFinite(value))throw new Error(`${label}:INVALID`);if(Math.abs(value)>TOOL061_LIMITS.maxAbs)throw new Error(`${label}:LIMIT`)};
export function calculateTool061(mode:Tool061Mode,values:{a:number;b:number;p?:number;direction?:Tool061Direction}):Tool061Result{
 const {a,b}=values; ensureFinite(a,'A'); ensureFinite(b,'B'); if(values.p!==undefined)ensureFinite(values.p,'P');
 if(mode==='percentageOf'){const v=a/100*b; ensureFinite(v,'RESULT'); return{value:v,formula:`(${a} ÷ 100) × ${b} = ${v}`};}
 if(mode==='partOfWhole'){if(b===0)throw new Error('WHOLE_ZERO');const v=a/b*100;ensureFinite(v,'RESULT');return{value:v,formula:`${a} ÷ ${b} × 100 = ${v}%`};}
 if(mode==='percentChange'){if(a===0)throw new Error('ORIGINAL_ZERO');const diff=b-a,v=diff/a*100;ensureFinite(v,'RESULT');return{value:v,difference:diff,direction:v>0?'increase':v<0?'decrease':'same',formula:`(${b} - ${a}) ÷ ${a} × 100 = ${v}%`};}
 const p=values.p??b, direction=values.direction??'increase', sign=direction==='increase'?1:-1;
 if(mode==='applyPercent'){const factor=1+sign*p/100,v=a*factor;ensureFinite(v,'RESULT');return{value:v,difference:v-a,direction:direction,formula:`${a} × (1 ${sign>0?'+':'-'} ${p} ÷ 100) = ${v}`};}
 const divisor=1+sign*p/100;if(divisor===0)throw new Error('REVERSE_SINGULAR');const v=a/divisor;ensureFinite(v,'RESULT');return{value:v,difference:a-v,direction:direction,formula:`${a} ÷ (1 ${sign>0?'+':'-'} ${p} ÷ 100) = ${v}`};
}
export function formatTool061(value:number,precision:number){const safe=Math.max(0,Math.min(TOOL061_LIMITS.maxPrecision,Math.trunc(precision)));return new Intl.NumberFormat('en-US',{maximumFractionDigits:safe,useGrouping:true}).format(Object.is(value,-0)?0:value)}
