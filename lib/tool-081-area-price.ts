export type Tool081AreaUnit='sqm'|'pyeong';

export const TOOL081_PYEONG_SQM=3.305785;
export const TOOL081_LIMITS={maxAreaSqm:1e9,maxPrice:1e15,maxInputChars:30,maxDisplayPrecision:8} as const;

export type Tool081ConvertedArea={sqm:number;pyeong:number};
export type Tool081UnitPriceResult={area:Tool081ConvertedArea;pricePerSqm:number;pricePerPyeong:number;formulaSqm:string;formulaPyeong:string};
export type Tool081PriceComparison={totalPrice:number;supply:Tool081UnitPriceResult|null;exclusive:Tool081UnitPriceResult|null};

export function parseTool081Number(raw:string):number|null{
 const value=raw.trim().replace(/,/g,'');
 if(value==='')return null;
 if(!/^(?:\d+\.?\d*|\.\d+)$/.test(value))return null;
 const n=Number(value);
 return Number.isFinite(n)?n:null;
}

function assertFinite(value:number){if(!Number.isFinite(value))throw new Error('INVALID')}
function assertAreaSqm(value:number){assertFinite(value);if(value<=0)throw new Error('AREA_ZERO');if(value>TOOL081_LIMITS.maxAreaSqm)throw new Error('AREA_LIMIT')}
function assertPrice(value:number){assertFinite(value);if(value<0)throw new Error('PRICE_NEGATIVE');if(value>TOOL081_LIMITS.maxPrice)throw new Error('PRICE_LIMIT')}

export function areaToSqm(value:number,unit:Tool081AreaUnit):number{
 assertFinite(value);if(value<=0)throw new Error('AREA_ZERO');
 const sqm=unit==='sqm'?value:value*TOOL081_PYEONG_SQM;
 assertAreaSqm(sqm);return sqm;
}

export function convertTool081Area(value:number,unit:Tool081AreaUnit):Tool081ConvertedArea{
 const sqm=areaToSqm(value,unit);return {sqm,pyeong:sqm/TOOL081_PYEONG_SQM};
}

export function calculateTool081UnitPrice(totalPrice:number,areaValue:number,unit:Tool081AreaUnit):Tool081UnitPriceResult{
 assertPrice(totalPrice);const area=convertTool081Area(areaValue,unit);
 return {area,pricePerSqm:totalPrice/area.sqm,pricePerPyeong:totalPrice/area.pyeong,formulaSqm:'price per m² = total price ÷ area(m²)',formulaPyeong:'price per pyeong = total price ÷ area(pyeong)'};
}

export function calculateTool081Comparison(totalPrice:number,supplyValue?:number|null,supplyUnit:Tool081AreaUnit='sqm',exclusiveValue?:number|null,exclusiveUnit:Tool081AreaUnit='sqm'):Tool081PriceComparison{
 assertPrice(totalPrice);
 const supply=supplyValue==null?null:calculateTool081UnitPrice(totalPrice,supplyValue,supplyUnit);
 const exclusive=exclusiveValue==null?null:calculateTool081UnitPrice(totalPrice,exclusiveValue,exclusiveUnit);
 if(!supply&&!exclusive)throw new Error('AREA_REQUIRED');
 return {totalPrice,supply,exclusive};
}

export function formatTool081(value:number,precision=2,locale='ko-KR'){
 const digits=Math.max(0,Math.min(TOOL081_LIMITS.maxDisplayPrecision,precision));
 return new Intl.NumberFormat(locale,{minimumFractionDigits:0,maximumFractionDigits:digits}).format(value);
}
