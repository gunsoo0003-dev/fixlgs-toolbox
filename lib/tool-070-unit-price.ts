export type Tool070Mode='items'|'weight'|'volume'|'bundle-weight'|'bundle-volume';
export type Tool070WeightUnit='g'|'kg';
export type Tool070VolumeUnit='mL'|'L';
export type Tool070Unit=Tool070WeightUnit|Tool070VolumeUnit|'item';
export type Tool070DisplayUnit='item'|'100g'|'1kg'|'100mL'|'1L';

export const TOOL070_LIMITS={maxPrice:1e15,maxQuantity:1e15,maxBundleCount:1e6,maxInputChars:30,maxDisplayPrecision:8} as const;

export type Tool070OptionInput={price:number;quantity:number;unit:Tool070Unit;count?:number};
export type Tool070OptionResult={price:number,totalBaseQuantity:number,normalizedUnitPrice:number,displayUnitPrice:number,formula:string};
export type Tool070Comparison={a:Tool070OptionResult;b:Tool070OptionResult;winner:'A'|'B'|'equal';difference:number;savings:number;savingsRate:number;basisQuantity:number;basisLabel:Tool070DisplayUnit};

const DISPLAY_BASIS:Record<Tool070DisplayUnit,number>={item:1,'100g':100,'1kg':1000,'100mL':100,'1L':1000};

export function parseTool070Number(raw:string):number|null{
 const value=raw.trim().replace(/,/g,'');
 if(value==='')return null;
 if(!/^(?:\d+\.?\d*|\.\d+)$/.test(value))return null;
 const n=Number(value);
 return Number.isFinite(n)?n:null;
}

export function weightToGrams(value:number,unit:Tool070WeightUnit){assertQuantity(value);return unit==='kg'?value*1000:value}
export function volumeToMl(value:number,unit:Tool070VolumeUnit){assertQuantity(value);return unit==='L'?value*1000:value}
export function gramsToWeight(value:number,unit:Tool070WeightUnit){assertFiniteNonNegative(value);return unit==='kg'?value/1000:value}
export function mlToVolume(value:number,unit:Tool070VolumeUnit){assertFiniteNonNegative(value);return unit==='L'?value/1000:value}

function assertFiniteNonNegative(value:number){if(!Number.isFinite(value))throw new Error('INVALID');if(value<0)throw new Error('NEGATIVE')}
function assertPrice(value:number){assertFiniteNonNegative(value);if(value>TOOL070_LIMITS.maxPrice)throw new Error('PRICE_LIMIT')}
function assertQuantity(value:number){if(!Number.isFinite(value))throw new Error('INVALID');if(value<=0)throw new Error('QUANTITY_ZERO');if(value>TOOL070_LIMITS.maxQuantity)throw new Error('QUANTITY_LIMIT')}
function assertBundleCount(value:number){if(!Number.isFinite(value))throw new Error('INVALID');if(value<=0)throw new Error('BUNDLE_COUNT_ZERO');if(value>TOOL070_LIMITS.maxBundleCount)throw new Error('BUNDLE_COUNT_LIMIT')}

export function allowedDisplayUnits(mode:Tool070Mode):Tool070DisplayUnit[]{
 if(mode==='items')return ['item'];
 if(mode==='weight'||mode==='bundle-weight')return ['100g','1kg'];
 return ['100mL','1L'];
}

export function defaultDisplayUnit(mode:Tool070Mode):Tool070DisplayUnit{
 if(mode==='items')return 'item';
 if(mode==='weight'||mode==='bundle-weight')return '100g';
 return '100mL';
}

export function normalizeQuantity(mode:Tool070Mode,input:Tool070OptionInput):number{
 if(mode==='items'){
  if(input.unit!=='item')throw new Error('UNIT_CATEGORY_MISMATCH');
  assertQuantity(input.quantity);return input.quantity;
 }
 if(mode==='weight'){
  if(input.unit!=='g'&&input.unit!=='kg')throw new Error('UNIT_CATEGORY_MISMATCH');
  return weightToGrams(input.quantity,input.unit);
 }
 if(mode==='volume'){
  if(input.unit!=='mL'&&input.unit!=='L')throw new Error('UNIT_CATEGORY_MISMATCH');
  return volumeToMl(input.quantity,input.unit);
 }
 assertBundleCount(input.count??0);
 assertQuantity(input.quantity);
 if(mode==='bundle-weight'){
  if(input.unit!=='g'&&input.unit!=='kg')throw new Error('UNIT_CATEGORY_MISMATCH');
  const perItem=weightToGrams(input.quantity,input.unit);const total=perItem*(input.count as number);if(total>TOOL070_LIMITS.maxQuantity)throw new Error('QUANTITY_LIMIT');return total;
 }
 if(input.unit!=='mL'&&input.unit!=='L')throw new Error('UNIT_CATEGORY_MISMATCH');
 const perItem=volumeToMl(input.quantity,input.unit);const total=perItem*(input.count as number);if(total>TOOL070_LIMITS.maxQuantity)throw new Error('QUANTITY_LIMIT');return total;
}

export function calculateTool070Option(mode:Tool070Mode,input:Tool070OptionInput,displayUnit:Tool070DisplayUnit):Tool070OptionResult{
 assertPrice(input.price);
 if(!allowedDisplayUnits(mode).includes(displayUnit))throw new Error('DISPLAY_UNIT_MISMATCH');
 const totalBaseQuantity=normalizeQuantity(mode,input);
 const normalizedUnitPrice=input.price/totalBaseQuantity;
 const basis=DISPLAY_BASIS[displayUnit];
 const displayUnitPrice=normalizedUnitPrice*basis;
 const formula=(mode==='bundle-weight'||mode==='bundle-volume')
  ? `unit price = total price ÷ (count × per-item quantity); display = normalized × ${basis}`
  : `unit price = total price ÷ total quantity; display = normalized × ${basis}`;
 return {price:input.price,totalBaseQuantity,normalizedUnitPrice,displayUnitPrice,formula};
}

export function compareTool070(mode:Tool070Mode,aInput:Tool070OptionInput,bInput:Tool070OptionInput,displayUnit:Tool070DisplayUnit):Tool070Comparison{
 const a=calculateTool070Option(mode,aInput,displayUnit);const b=calculateTool070Option(mode,bInput,displayUnit);
 const epsilon=Math.max(1,Math.abs(a.normalizedUnitPrice),Math.abs(b.normalizedUnitPrice))*Number.EPSILON*16;
 const delta=a.normalizedUnitPrice-b.normalizedUnitPrice;
 const winner=Math.abs(delta)<=epsilon?'equal':delta<0?'A':'B';
 const basisQuantity=DISPLAY_BASIS[displayUnit];
 const difference=Math.abs(a.displayUnitPrice-b.displayUnitPrice);
 const expensive=Math.max(a.displayUnitPrice,b.displayUnitPrice);
 const savings=winner==='equal'?0:difference;
 const savingsRate=winner==='equal'||expensive===0?0:(savings/expensive)*100;
 return {a,b,winner,difference,savings,savingsRate,basisQuantity,basisLabel:displayUnit};
}

export function formatTool070(value:number,precision=2,locale='ko-KR'){
 const digits=Math.max(0,Math.min(TOOL070_LIMITS.maxDisplayPrecision,precision));
 return new Intl.NumberFormat(locale,{minimumFractionDigits:0,maximumFractionDigits:digits}).format(value);
}
