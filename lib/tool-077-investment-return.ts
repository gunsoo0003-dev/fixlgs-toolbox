export type Tool077PeriodUnit='days'|'months'|'years';
export const TOOL077_LIMITS={amount:1e15,periodYears:100,inputChars:30,precision:8} as const;

export function parseTool077Number(raw:string):number|null{
 const normalized=raw.replace(/[\s,]/g,'').trim();
 if(!normalized)return null;
 const value=Number(normalized);
 return Number.isFinite(value)?value:null;
}

export function normalizeTool077Years(period:number,unit:Tool077PeriodUnit):number{
 if(!Number.isFinite(period)||period<=0)throw new Error('INVALID_PERIOD');
 const years=unit==='days'?period/365:unit==='months'?period/12:period;
 if(years>TOOL077_LIMITS.periodYears)throw new Error('PERIOD_LIMIT');
 return years;
}

export type Tool077Result={invested:number;current:number;gain:number;totalReturnPct:number;annualizedReturnPct:number;years:number;state:'profit'|'loss'|'even'};

export function calculateTool077(purchase:number,current:number,period:number,unit:Tool077PeriodUnit):Tool077Result{
 if(!Number.isFinite(purchase)||purchase<=0)throw new Error('INVALID_PURCHASE');
 if(!Number.isFinite(current)||current<0)throw new Error('INVALID_CURRENT');
 if(purchase>TOOL077_LIMITS.amount||current>TOOL077_LIMITS.amount)throw new Error('AMOUNT_LIMIT');
 const years=normalizeTool077Years(period,unit);
 const gain=current-purchase;
 const totalReturnPct=(gain/purchase)*100;
 const ratio=current/purchase;
 const annualizedReturnPct=(Math.pow(ratio,1/years)-1)*100;
 if(!Number.isFinite(annualizedReturnPct))throw new Error('ANNUALIZED_OVERFLOW');
 return {invested:purchase,current,gain,totalReturnPct,annualizedReturnPct,years,state:gain>0?'profit':gain<0?'loss':'even'};
}

export function formatTool077(value:number,precision=2,locale='ko-KR'){
 const safe=Math.min(TOOL077_LIMITS.precision,Math.max(0,Math.trunc(precision)));
 return new Intl.NumberFormat(locale,{maximumFractionDigits:safe}).format(value);
}
