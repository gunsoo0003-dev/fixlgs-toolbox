export const TOOL078_LIMITS={
 maxShares:1e9,
 maxPrice:1e15,
 maxRows:100,
 maxPrecision:8,
 maxInputChars:30,
 maxAbsTargetReturn:100000,
} as const;

export type Tool078PurchaseLot={qty:number;price:number};
export type Tool078Result={
 existingCost:number;
 additionalQty:number;
 additionalCost:number;
 totalShares:number;
 totalCost:number;
 averageCost:number;
 breakEvenPrice:number;
 targetReturn:number|null;
 targetSellPrice:number|null;
};

export function parseTool078Number(raw:string){
 const normalized=raw.trim().replace(/,/g,'');
 if(!normalized||normalized.length>TOOL078_LIMITS.maxInputChars)return null;
 const value=Number(normalized);
 return Number.isFinite(value)?value:null;
}

function assertFinite(value:number,label:string){
 if(!Number.isFinite(value))throw new Error(`${label}_INVALID`);
}
function assertShares(value:number,label:string){
 assertFinite(value,label);
 if(value<=0)throw new Error(`${label}_NON_POSITIVE`);
 if(value>TOOL078_LIMITS.maxShares)throw new Error(`${label}_LIMIT`);
}
function assertPrice(value:number,label:string,allowZero=false){
 assertFinite(value,label);
 if(allowZero?value<0:value<=0)throw new Error(`${label}_${allowZero?'NEGATIVE':'NON_POSITIVE'}`);
 if(value>TOOL078_LIMITS.maxPrice)throw new Error(`${label}_LIMIT`);
}

export function calculateTool078(existingQty:number,existingPrice:number,lots:Tool078PurchaseLot[],targetReturn?:number|null):Tool078Result{
 assertShares(existingQty,'EXISTING_QTY');
 assertPrice(existingPrice,'EXISTING_PRICE');
 if(lots.length>TOOL078_LIMITS.maxRows)throw new Error('ROWS_LIMIT');
 let additionalQty=0,additionalCost=0;
 for(const [index,lot] of lots.entries()){
  assertShares(lot.qty,`LOT_${index+1}_QTY`);
  assertPrice(lot.price,`LOT_${index+1}_PRICE`,true);
  additionalQty+=lot.qty;
  additionalCost+=lot.qty*lot.price;
 }
 const existingCost=existingQty*existingPrice;
 const totalShares=existingQty+additionalQty;
 const totalCost=existingCost+additionalCost;
 if(!Number.isFinite(totalShares)||totalShares<=0)throw new Error('TOTAL_SHARES_INVALID');
 if(!Number.isFinite(totalCost))throw new Error('TOTAL_COST_INVALID');
 const averageCost=totalCost/totalShares;
 const breakEvenPrice=averageCost;
 let normalizedReturn:number|null=null,targetSellPrice:number|null=null;
 if(targetReturn!==undefined&&targetReturn!==null){
  assertFinite(targetReturn,'TARGET_RETURN');
  if(Math.abs(targetReturn)>TOOL078_LIMITS.maxAbsTargetReturn)throw new Error('TARGET_RETURN_LIMIT');
  normalizedReturn=targetReturn;
  targetSellPrice=averageCost*(1+targetReturn/100);
  if(!Number.isFinite(targetSellPrice))throw new Error('TARGET_SELL_INVALID');
 }
 return {existingCost,additionalQty,additionalCost,totalShares,totalCost,averageCost,breakEvenPrice,targetReturn:normalizedReturn,targetSellPrice};
}

export function formatTool078(value:number,precision=2,locale='ko-KR'){
 const digits=Math.max(0,Math.min(TOOL078_LIMITS.maxPrecision,Math.trunc(precision)));
 return new Intl.NumberFormat(locale,{maximumFractionDigits:digits,minimumFractionDigits:0}).format(value);
}
