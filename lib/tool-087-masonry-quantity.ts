export const TOOL087_LIMITS={
  maxWallMeters:1e6,
  maxMaterialMeters:1e3,
  maxJointMeters:0.5,
  maxWasteRate:100,
  maxUnitPrice:1e15,
  maxInputChars:30,
  maxDisplayPrecision:8,
} as const;

export type Tool087Input={
  wallLengthM:number;
  wallHeightM:number;
  materialWidthMm:number;
  materialHeightMm:number;
  jointHorizontalMm:number;
  jointVerticalMm:number;
  wasteRate:number;
  unitPrice?:number|null;
};

export type Tool087Result={
  wallAreaM2:number;
  moduleWidthM:number;
  moduleHeightM:number;
  moduleAreaM2:number;
  rawQuantity:number;
  lossAdjustedQuantity:number;
  recommendedPurchaseQuantity:number;
  estimatedCost:number|null;
};

export function parseTool087Number(raw:string):number|null{
  const value=raw.trim().replace(/,/g,'');
  if(value==='')return null;
  if(!/^(?:\d+\.?\d*|\.\d+)$/.test(value))return null;
  const n=Number(value);
  return Number.isFinite(n)?n:null;
}

function finite(n:number){if(!Number.isFinite(n))throw new Error('INVALID')}
function positive(n:number,code:string){finite(n);if(n<=0)throw new Error(code)}
function nonNegative(n:number,code:string){finite(n);if(n<0)throw new Error(code)}

export function calculateTool087(input:Tool087Input):Tool087Result{
  const {wallLengthM,wallHeightM,materialWidthMm,materialHeightMm,jointHorizontalMm,jointVerticalMm,wasteRate}=input;
  positive(wallLengthM,'WALL_DIMENSION');positive(wallHeightM,'WALL_DIMENSION');
  if(wallLengthM>TOOL087_LIMITS.maxWallMeters||wallHeightM>TOOL087_LIMITS.maxWallMeters)throw new Error('WALL_LIMIT');
  positive(materialWidthMm,'MATERIAL_DIMENSION');positive(materialHeightMm,'MATERIAL_DIMENSION');
  const materialWidthM=materialWidthMm/1000,materialHeightM=materialHeightMm/1000;
  if(materialWidthM>TOOL087_LIMITS.maxMaterialMeters||materialHeightM>TOOL087_LIMITS.maxMaterialMeters)throw new Error('MATERIAL_LIMIT');
  nonNegative(jointHorizontalMm,'JOINT_NEGATIVE');nonNegative(jointVerticalMm,'JOINT_NEGATIVE');
  const jointHorizontalM=jointHorizontalMm/1000,jointVerticalM=jointVerticalMm/1000;
  if(jointHorizontalM>TOOL087_LIMITS.maxJointMeters||jointVerticalM>TOOL087_LIMITS.maxJointMeters)throw new Error('JOINT_LIMIT');
  nonNegative(wasteRate,'WASTE_NEGATIVE');if(wasteRate>TOOL087_LIMITS.maxWasteRate)throw new Error('WASTE_LIMIT');
  if(input.unitPrice!=null){nonNegative(input.unitPrice,'PRICE_NEGATIVE');if(input.unitPrice>TOOL087_LIMITS.maxUnitPrice)throw new Error('PRICE_LIMIT')}

  const wallAreaM2=wallLengthM*wallHeightM;
  const moduleWidthM=materialWidthM+jointHorizontalM;
  const moduleHeightM=materialHeightM+jointVerticalM;
  const moduleAreaM2=moduleWidthM*moduleHeightM;
  const rawQuantity=wallAreaM2/moduleAreaM2;
  const lossAdjustedQuantity=rawQuantity*(1+wasteRate/100);
  const recommendedPurchaseQuantity=Math.ceil(lossAdjustedQuantity);
  const estimatedCost=input.unitPrice==null?null:recommendedPurchaseQuantity*input.unitPrice;
  for(const n of [wallAreaM2,moduleWidthM,moduleHeightM,moduleAreaM2,rawQuantity,lossAdjustedQuantity,recommendedPurchaseQuantity])finite(n);
  return {wallAreaM2,moduleWidthM,moduleHeightM,moduleAreaM2,rawQuantity,lossAdjustedQuantity,recommendedPurchaseQuantity,estimatedCost};
}

export function formatTool087(value:number,precision=2,locale='ko-KR'){
  const digits=Math.max(0,Math.min(TOOL087_LIMITS.maxDisplayPrecision,precision));
  return new Intl.NumberFormat(locale,{maximumFractionDigits:digits}).format(value);
}
