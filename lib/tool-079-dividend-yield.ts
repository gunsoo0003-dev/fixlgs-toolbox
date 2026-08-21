export const TOOL079_LIMITS={maxSharePrice:1e15,maxAnnualDps:1e15,maxShares:1e9,maxInputChars:30,maxDisplayPrecision:8,maxScenarios:4} as const;

export type Tool079Input={sharePrice:number;annualDps:number;shares:number};
export type Tool079Result=Tool079Input&{expectedAnnualDividend:number;dividendYield:number};

export function parseTool079Number(raw:string):number|null{
 const normalized=raw.replace(/[,_\s₩¥$€%]/g,'').trim();
 if(!normalized||normalized.length>TOOL079_LIMITS.maxInputChars)return null;
 const value=Number(normalized);
 return Number.isFinite(value)?value:null;
}

export function calculateTool079(input:Tool079Input):Tool079Result{
 const {sharePrice,annualDps,shares}=input;
 for(const [key,value] of Object.entries(input))if(!Number.isFinite(value))throw new Error(`${key.toUpperCase()}_INVALID`);
 if(sharePrice<=0)throw new Error('SHARE_PRICE_ZERO_OR_NEGATIVE');
 if(annualDps<0)throw new Error('ANNUAL_DPS_NEGATIVE');
 if(shares<0)throw new Error('SHARES_NEGATIVE');
 if(sharePrice>TOOL079_LIMITS.maxSharePrice)throw new Error('SHARE_PRICE_LIMIT');
 if(annualDps>TOOL079_LIMITS.maxAnnualDps)throw new Error('ANNUAL_DPS_LIMIT');
 if(shares>TOOL079_LIMITS.maxShares)throw new Error('SHARES_LIMIT');
 const expectedAnnualDividend=annualDps*shares;
 const dividendYield=(annualDps/sharePrice)*100;
 if(!Number.isFinite(expectedAnnualDividend)||!Number.isFinite(dividendYield))throw new Error('RESULT_INVALID');
 return {...input,expectedAnnualDividend,dividendYield};
}

export function formatTool079(value:number,precision=2,locale='ko-KR'){
 const digits=Math.max(0,Math.min(TOOL079_LIMITS.maxDisplayPrecision,precision));
 return new Intl.NumberFormat(locale,{maximumFractionDigits:digits,minimumFractionDigits:0}).format(value);
}
