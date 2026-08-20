export type Tool064ModeState='none'|'single'|'multiple';
export type Tool064InvalidReason='invalid'|'scientific'|'precision'|'token-length'|'value-limit'|'count-limit';
export type Tool064InvalidToken={token:string;reason:Tool064InvalidReason;index:number};
export type Tool064Stats={count:number;sum:number;mean:number;median:number;modes:number[];modeFrequency:number;modeState:Tool064ModeState;min:number;max:number;range:number;sorted:number[]};
export const TOOL064_LIMITS={maxCount:10_000,maxAbsValue:1e15,maxDecimalPlaces:8,maxTokenLength:30,displayPrecision:8} as const;
const DECIMAL_RE=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
export function splitTool064Tokens(raw:string){return raw.split(/[\s,]+/).map(v=>v.trim()).filter(Boolean);}
export function parseTool064Input(raw:string){
 const tokens=splitTool064Tokens(raw),values:number[]=[],invalid:Tool064InvalidToken[]=[];
 if(tokens.length>TOOL064_LIMITS.maxCount){invalid.push({token:String(tokens.length),reason:'count-limit',index:TOOL064_LIMITS.maxCount});}
 const usable=tokens.slice(0,TOOL064_LIMITS.maxCount);
 usable.forEach((token,index)=>{
  if(token.length>TOOL064_LIMITS.maxTokenLength){invalid.push({token,reason:'token-length',index});return;}
  if(/[eE]/.test(token)){invalid.push({token,reason:'scientific',index});return;}
  if(!DECIMAL_RE.test(token)){invalid.push({token,reason:'invalid',index});return;}
  const frac=token.replace(/^[+-]/,'').split('.')[1]??'';
  if(frac.length>TOOL064_LIMITS.maxDecimalPlaces){invalid.push({token,reason:'precision',index});return;}
  const value=Number(token);
  if(!Number.isFinite(value)){invalid.push({token,reason:'invalid',index});return;}
  if(Math.abs(value)>TOOL064_LIMITS.maxAbsValue){invalid.push({token,reason:'value-limit',index});return;}
  values.push(Object.is(value,-0)?0:value);
 });
 return{tokens,values,invalid,overCount:tokens.length>TOOL064_LIMITS.maxCount};
}
export function calculateTool064Stats(values:readonly number[]):Tool064Stats|null{
 if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),count=values.length,sum=values.reduce((a,b)=>a+b,0),mean=sum/count;
 const mid=Math.floor(count/2),median=count%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
 const freq=new Map<number,number>();for(const value of values)freq.set(value,(freq.get(value)??0)+1);
 let modeFrequency=0;for(const n of freq.values())modeFrequency=Math.max(modeFrequency,n);
 let modes:number[]=[];
 if(count===1){modes=[values[0]];modeFrequency=1;} else if(modeFrequency>1){modes=[...freq].filter(([,n])=>n===modeFrequency).map(([v])=>v).sort((a,b)=>a-b);}
 const modeState:Tool064ModeState=modes.length===0?'none':modes.length===1?'single':'multiple';
 return{count,sum,mean,median,modes,modeFrequency,modeState,min:sorted[0],max:sorted[sorted.length-1],range:sorted[sorted.length-1]-sorted[0],sorted};
}
export function formatTool064Number(value:number,precision=TOOL064_LIMITS.displayPrecision){
 const p=Math.max(0,Math.min(TOOL064_LIMITS.displayPrecision,Math.trunc(precision)));
 if(!Number.isFinite(value))return '—'; if(value===0)return '0'; const abs=Math.abs(value);
 if(abs>=1e15||abs<1e-8)return value.toExponential(p).replace(/(\.\d*?[1-9])0+e/,'$1e').replace(/\.0+e/,'e');
 return new Intl.NumberFormat('en-US',{maximumFractionDigits:p,useGrouping:true}).format(value);
}
export function copyTool064Summary(stats:Tool064Stats,noneLabel:string){const mode=stats.modes.length?stats.modes.map(v=>formatTool064Number(v)).join(', '):noneLabel;return `Count: ${stats.count}\nSum: ${formatTool064Number(stats.sum)}\nMean: ${formatTool064Number(stats.mean)}\nMedian: ${formatTool064Number(stats.median)}\nMode: ${mode}\nMin: ${formatTool064Number(stats.min)}\nMax: ${formatTool064Number(stats.max)}\nRange: ${formatTool064Number(stats.range)}`;}
