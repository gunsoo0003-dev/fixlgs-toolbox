export type Tool085Material='vinyl'|'tile'|'wood';
export const TOOL085_LIMITS={maxFloorArea:1e7,maxDimensionMm:1e6,maxAreaPerPurchaseUnit:1e7,maxUnitsPerBox:100000,maxWasteRate:100,maxPrice:1e15,maxInputChars:30,maxPrecision:6} as const;
export type Tool085Input={material:Tool085Material;floorArea:number;wasteRate:number;unitWidthMm?:number|null;unitHeightMm?:number|null;usableAreaPerUnit?:number|null;unitsPerBox?:number|null;areaPerBox?:number|null;unitPrice?:number|null;boxPrice?:number|null};
export type Tool085Result={material:Tool085Material;floorArea:number;adjustedArea:number;usableAreaPerUnit:number;requiredUnits:number;boxCount:number|null;purchaseUnits:number;estimatedCost:number|null;costBasis:'unit'|'box'|null};
function finite(n:number){if(!Number.isFinite(n))throw new Error('INVALID')}
function gt0(n:number,code:string,max:number){finite(n);if(n<=0)throw new Error(code);if(n>max)throw new Error('LIMIT')}
function optionalNonnegative(n:number|null|undefined){if(n==null)return;finite(n);if(n<0)throw new Error('PRICE_NEGATIVE');if(n>TOOL085_LIMITS.maxPrice)throw new Error('LIMIT')}
export function parseTool085Number(raw:string):number|null{const v=raw.trim().replace(/,/g,'');if(v==='')return null;if(!/^(?:\d+\.?\d*|\.\d+)$/.test(v))return null;const n=Number(v);return Number.isFinite(n)?n:null}
export function calculateTool085(input:Tool085Input):Tool085Result{
 gt0(input.floorArea,'FLOOR_AREA_ZERO',TOOL085_LIMITS.maxFloorArea);finite(input.wasteRate);if(input.wasteRate<0)throw new Error('WASTE_NEGATIVE');if(input.wasteRate>TOOL085_LIMITS.maxWasteRate)throw new Error('LIMIT');
 optionalNonnegative(input.unitPrice);optionalNonnegative(input.boxPrice);
 const adjustedArea=input.floorArea*(1+input.wasteRate/100);let usableAreaPerUnit=0;
 if(input.material==='tile'){
  gt0(input.unitWidthMm??0,'SPEC_ZERO',TOOL085_LIMITS.maxDimensionMm);gt0(input.unitHeightMm??0,'SPEC_ZERO',TOOL085_LIMITS.maxDimensionMm);
  usableAreaPerUnit=((input.unitWidthMm as number)/1000)*((input.unitHeightMm as number)/1000);
 }else{
  gt0(input.usableAreaPerUnit??0,'SPEC_ZERO',TOOL085_LIMITS.maxAreaPerPurchaseUnit);usableAreaPerUnit=input.usableAreaPerUnit as number;
 }
 const requiredUnits=Math.ceil(adjustedArea/usableAreaPerUnit);let boxCount:number|null=input.material==='wood'?requiredUnits:null;
 if(input.areaPerBox!=null){gt0(input.areaPerBox,'BOX_SPEC_ZERO',TOOL085_LIMITS.maxAreaPerPurchaseUnit);boxCount=Math.ceil(adjustedArea/input.areaPerBox)}
 else if(input.unitsPerBox!=null){gt0(input.unitsPerBox,'BOX_SPEC_ZERO',TOOL085_LIMITS.maxUnitsPerBox);boxCount=Math.ceil(requiredUnits/input.unitsPerBox)}
 const purchaseUnits=boxCount??requiredUnits;
 let estimatedCost:number|null=null,costBasis:'unit'|'box'|null=null;
 if(boxCount!=null&&input.boxPrice!=null){estimatedCost=boxCount*input.boxPrice;costBasis='box'}else if(input.unitPrice!=null){estimatedCost=requiredUnits*input.unitPrice;costBasis='unit'}
 return {material:input.material,floorArea:input.floorArea,adjustedArea,usableAreaPerUnit,requiredUnits,boxCount,purchaseUnits,estimatedCost,costBasis};
}
export function formatTool085(value:number,precision=2,locale='ko-KR'){return new Intl.NumberFormat(locale,{maximumFractionDigits:Math.max(0,Math.min(TOOL085_LIMITS.maxPrecision,precision))}).format(value)}
