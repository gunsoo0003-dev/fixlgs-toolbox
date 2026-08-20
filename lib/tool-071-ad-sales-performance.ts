export const TOOL071_LIMITS={maxAmount:1e15,maxCount:1e12,maxInputChars:30,maxDisplayPrecision:8,maxCompareSets:2} as const;

export type Tool071MetricId='ctr'|'cpc'|'cpm'|'cvr'|'cac'|'roas'|'roi'|'aov';
export type Tool071ValueKind='amount'|'count';
export type Tool071InputDef={key:'a'|'b';labelKey:string;kind:Tool071ValueKind;denominator?:boolean};
export type Tool071MetricSchema={id:Tool071MetricId;short:string;inputA:Tool071InputDef;inputB:Tool071InputDef;formula:string;denominatorKey:string;output:'percent'|'currency'|'roas'};

export const TOOL071_METRICS:Record<Tool071MetricId,Tool071MetricSchema>={
 ctr:{id:'ctr',short:'CTR',inputA:{key:'a',labelKey:'clicks',kind:'count'},inputB:{key:'b',labelKey:'impressions',kind:'count',denominator:true},formula:'clicks / impressions × 100',denominatorKey:'impressions',output:'percent'},
 cpc:{id:'cpc',short:'CPC',inputA:{key:'a',labelKey:'spend',kind:'amount'},inputB:{key:'b',labelKey:'clicks',kind:'count',denominator:true},formula:'ad spend / clicks',denominatorKey:'clicks',output:'currency'},
 cpm:{id:'cpm',short:'CPM',inputA:{key:'a',labelKey:'spend',kind:'amount'},inputB:{key:'b',labelKey:'impressions',kind:'count',denominator:true},formula:'ad spend / impressions × 1,000',denominatorKey:'impressions',output:'currency'},
 cvr:{id:'cvr',short:'CVR',inputA:{key:'a',labelKey:'conversions',kind:'count'},inputB:{key:'b',labelKey:'clicks',kind:'count',denominator:true},formula:'conversions / clicks × 100',denominatorKey:'clicks',output:'percent'},
 cac:{id:'cac',short:'CAC',inputA:{key:'a',labelKey:'acquisitionSpend',kind:'amount'},inputB:{key:'b',labelKey:'newCustomers',kind:'count',denominator:true},formula:'acquisition spend / new customers',denominatorKey:'newCustomers',output:'currency'},
 roas:{id:'roas',short:'ROAS',inputA:{key:'a',labelKey:'attributedRevenue',kind:'amount'},inputB:{key:'b',labelKey:'adSpend',kind:'amount',denominator:true},formula:'attributed revenue / ad spend',denominatorKey:'adSpend',output:'roas'},
 roi:{id:'roi',short:'ROI',inputA:{key:'a',labelKey:'return',kind:'amount'},inputB:{key:'b',labelKey:'cost',kind:'amount',denominator:true},formula:'(return - cost) / cost × 100',denominatorKey:'cost',output:'percent'},
 aov:{id:'aov',short:'AOV',inputA:{key:'a',labelKey:'revenue',kind:'amount'},inputB:{key:'b',labelKey:'orders',kind:'count',denominator:true},formula:'revenue / orders',denominatorKey:'orders',output:'currency'},
};

export type Tool071Result={metric:Tool071MetricId;value:number;percentValue?:number;ratioValue?:number;formula:string;denominatorKey:string;denominatorValue:number};

export function parseTool071Number(raw:string):number|null{
 const normalized=raw.replace(/[,_\s₩¥$€%]/g,'').trim();
 if(!normalized||normalized.length>TOOL071_LIMITS.maxInputChars)return null;
 const value=Number(normalized);
 return Number.isFinite(value)?value:null;
}

function assertInput(value:number,kind:Tool071ValueKind,label:string){
 if(!Number.isFinite(value))throw new Error(`${label}_INVALID`);
 if(value<0)throw new Error(`${label}_NEGATIVE`);
 const max=kind==='count'?TOOL071_LIMITS.maxCount:TOOL071_LIMITS.maxAmount;
 if(value>max)throw new Error(`${label}_LIMIT`);
}

export function calculateTool071(metric:Tool071MetricId,a:number,b:number):Tool071Result{
 const schema=TOOL071_METRICS[metric];
 assertInput(a,schema.inputA.kind,'A');assertInput(b,schema.inputB.kind,'B');
 if(b===0)throw new Error('ZERO_DENOMINATOR');
 let value=0,ratioValue: number|undefined,percentValue:number|undefined;
 switch(metric){
  case 'ctr': value=(a/b)*100; percentValue=value; break;
  case 'cpc': value=a/b; break;
  case 'cpm': value=(a/b)*1000; break;
  case 'cvr': value=(a/b)*100; percentValue=value; break;
  case 'cac': value=a/b; break;
  case 'roas': ratioValue=a/b; percentValue=ratioValue*100; value=ratioValue; break;
  case 'roi': value=((a-b)/b)*100; percentValue=value; break;
  case 'aov': value=a/b; break;
 }
 if(!Number.isFinite(value))throw new Error('RESULT_INVALID');
 return {metric,value,ratioValue,percentValue,formula:schema.formula,denominatorKey:schema.denominatorKey,denominatorValue:b};
}

export function formatTool071(value:number,precision=2,locale='ko-KR'){
 const digits=Math.max(0,Math.min(TOOL071_LIMITS.maxDisplayPrecision,precision));
 return new Intl.NumberFormat(locale,{maximumFractionDigits:digits,minimumFractionDigits:0}).format(value);
}
