export type Tool088LengthUnit='mm'|'cm'|'m';

export const TOOL088_LIMITS={
 maxLengthM:1e6,
 maxWidthM:1e6,
 maxThicknessM:1e3,
 maxExtraRate:100,
 maxDeliveryM3:1e6,
 maxInputChars:30,
 maxDisplayPrecision:8,
} as const;

export type Tool088Dimensions={lengthM:number;widthM:number;thicknessM:number};
export type Tool088Result={
 dimensions:Tool088Dimensions;
 extraRate:number;
 baseVolumeM3:number;
 adjustedVolumeM3:number;
 deliveryVolumeM3:number|null;
 referenceDeliveries:number|null;
};

export function parseTool088Number(raw:string):number|null{
 const value=raw.trim().replace(/,/g,'');
 if(value==='')return null;
 if(!/^(?:\d+\.?\d*|\.\d+)$/.test(value))return null;
 const n=Number(value);
 return Number.isFinite(n)?n:null;
}

function assertFinite(value:number){if(!Number.isFinite(value))throw new Error('INVALID')}

export function normalizeTool088Length(value:number,unit:Tool088LengthUnit):number{
 assertFinite(value);
 if(value<=0)throw new Error('DIMENSION_ZERO');
 const meters=unit==='m'?value:unit==='cm'?value/100:value/1000;
 if(!Number.isFinite(meters))throw new Error('INVALID');
 return meters;
}

export function calculateTool088ConcreteVolume(input:{
 length:number;lengthUnit:Tool088LengthUnit;
 width:number;widthUnit:Tool088LengthUnit;
 thickness:number;thicknessUnit:Tool088LengthUnit;
 extraRate:number;
 deliveryVolume?:number|null;
}):Tool088Result{
 const lengthM=normalizeTool088Length(input.length,input.lengthUnit);
 const widthM=normalizeTool088Length(input.width,input.widthUnit);
 const thicknessM=normalizeTool088Length(input.thickness,input.thicknessUnit);
 if(lengthM>TOOL088_LIMITS.maxLengthM)throw new Error('LENGTH_LIMIT');
 if(widthM>TOOL088_LIMITS.maxWidthM)throw new Error('WIDTH_LIMIT');
 if(thicknessM>TOOL088_LIMITS.maxThicknessM)throw new Error('THICKNESS_LIMIT');
 assertFinite(input.extraRate);
 if(input.extraRate<0||input.extraRate>TOOL088_LIMITS.maxExtraRate)throw new Error('EXTRA_RANGE');
 let deliveryVolumeM3:number|null=null;
 if(input.deliveryVolume!=null){
  assertFinite(input.deliveryVolume);
  if(input.deliveryVolume<=0)throw new Error('DELIVERY_ZERO');
  if(input.deliveryVolume>TOOL088_LIMITS.maxDeliveryM3)throw new Error('DELIVERY_LIMIT');
  deliveryVolumeM3=input.deliveryVolume;
 }
 const baseVolumeM3=lengthM*widthM*thicknessM;
 if(!Number.isFinite(baseVolumeM3))throw new Error('VOLUME_LIMIT');
 const adjustedVolumeM3=baseVolumeM3*(1+input.extraRate/100);
 if(!Number.isFinite(adjustedVolumeM3))throw new Error('VOLUME_LIMIT');
 return {
  dimensions:{lengthM,widthM,thicknessM},extraRate:input.extraRate,
  baseVolumeM3,adjustedVolumeM3,deliveryVolumeM3,
  referenceDeliveries:deliveryVolumeM3==null?null:Math.ceil(adjustedVolumeM3/deliveryVolumeM3),
 };
}

export function formatTool088(value:number,precision=2,locale='ko-KR'){
 const digits=Math.max(0,Math.min(TOOL088_LIMITS.maxDisplayPrecision,precision));
 return new Intl.NumberFormat(locale,{minimumFractionDigits:0,maximumFractionDigits:digits}).format(value);
}
