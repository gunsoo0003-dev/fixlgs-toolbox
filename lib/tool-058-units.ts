export type Tool058Category='data'|'cooking';
export type Tool058Notation='decimal'|'binary';
export type Tool058DataUnitId='bit'|'byte'|'kb'|'mb'|'gb'|'tb';
export type Tool058CookingUnitId='cup'|'tbsp'|'tsp'|'ml';
export type Tool058Locale='ko'|'en'|'ja';
export type Tool058DataUnit={id:Tool058DataUnitId;decimalSymbol:string;binarySymbol:string;power:number|null;bitsPerUnit:number|null;names:Record<Tool058Locale,string>};
export type Tool058CookingUnit={id:Tool058CookingUnitId;symbol:string;mlFactor:number;names:Record<Tool058Locale,string>};

export const TOOL058_LIMITS={maxAbsInput:1e15,maxPrecision:8,maxSummaryUnits:6} as const;
export const TOOL058_DEFAULT_PRECISION=6;
export const TOOL058_COOKING_REFERENCE={id:'fda-nutrition-labeling',cupMl:240,tablespoonMl:15,teaspoonMl:5} as const;

export const TOOL058_DATA_UNITS:readonly Tool058DataUnit[]=[
 {id:'bit',decimalSymbol:'bit',binarySymbol:'bit',power:null,bitsPerUnit:1,names:{ko:'비트',en:'Bit',ja:'ビット'}},
 {id:'byte',decimalSymbol:'B',binarySymbol:'B',power:null,bitsPerUnit:8,names:{ko:'바이트',en:'Byte',ja:'バイト'}},
 {id:'kb',decimalSymbol:'KB',binarySymbol:'KiB',power:1,bitsPerUnit:null,names:{ko:'킬로바이트',en:'Kilobyte',ja:'キロバイト'}},
 {id:'mb',decimalSymbol:'MB',binarySymbol:'MiB',power:2,bitsPerUnit:null,names:{ko:'메가바이트',en:'Megabyte',ja:'メガバイト'}},
 {id:'gb',decimalSymbol:'GB',binarySymbol:'GiB',power:3,bitsPerUnit:null,names:{ko:'기가바이트',en:'Gigabyte',ja:'ギガバイト'}},
 {id:'tb',decimalSymbol:'TB',binarySymbol:'TiB',power:4,bitsPerUnit:null,names:{ko:'테라바이트',en:'Terabyte',ja:'テラバイト'}},
] as const;

export const TOOL058_COOKING_UNITS:readonly Tool058CookingUnit[]=[
 {id:'cup',symbol:'cup',mlFactor:TOOL058_COOKING_REFERENCE.cupMl,names:{ko:'컵',en:'Cup',ja:'カップ'}},
 {id:'tbsp',symbol:'tbsp',mlFactor:TOOL058_COOKING_REFERENCE.tablespoonMl,names:{ko:'큰술',en:'Tablespoon',ja:'大さじ'}},
 {id:'tsp',symbol:'tsp',mlFactor:TOOL058_COOKING_REFERENCE.teaspoonMl,names:{ko:'작은술',en:'Teaspoon',ja:'小さじ'}},
 {id:'ml',symbol:'mL',mlFactor:1,names:{ko:'밀리리터',en:'Milliliter',ja:'ミリリットル'}},
] as const;

export const TOOL058_DEFAULTS={
 data:{from:'gb' as Tool058DataUnitId,to:'mb' as Tool058DataUnitId,summary:['bit','byte','kb','mb','gb','tb'] as readonly Tool058DataUnitId[]},
 cooking:{from:'cup' as Tool058CookingUnitId,to:'ml' as Tool058CookingUnitId,summary:['cup','tbsp','tsp','ml'] as readonly Tool058CookingUnitId[]},
} as const;

export function parseTool058Number(raw:string){const normalized=raw.trim().replace(/,/g,'');if(normalized==='')return null;const value=Number(normalized);return Number.isFinite(value)?value:null;}
export function validateTool058Value(value:number){if(!Number.isFinite(value))throw new Error('INVALID_VALUE');if(value<0)throw new Error('NEGATIVE_VALUE');if(Math.abs(value)>TOOL058_LIMITS.maxAbsInput)throw new Error('VALUE_LIMIT');return value;}
export function getTool058DataUnit(id:string){const unit=TOOL058_DATA_UNITS.find(u=>u.id===id);if(!unit)throw new Error('INVALID_UNIT');return unit;}
export function getTool058CookingUnit(id:string){const unit=TOOL058_COOKING_UNITS.find(u=>u.id===id);if(!unit)throw new Error('INVALID_UNIT');return unit;}
export function getTool058DataSymbol(id:Tool058DataUnitId,notation:Tool058Notation){const u=getTool058DataUnit(id);return notation==='binary'?u.binarySymbol:u.decimalSymbol;}
export function getTool058DataBytesFactor(id:Tool058DataUnitId,notation:Tool058Notation){const u=getTool058DataUnit(id);if(u.id==='bit')return 1/8;if(u.id==='byte')return 1;const base=notation==='binary'?1024:1000;return base**(u.power??0);}
export function convertTool058Data(value:number,notation:Tool058Notation,fromId:Tool058DataUnitId,toId:Tool058DataUnitId){validateTool058Value(value);return value*getTool058DataBytesFactor(fromId,notation)/getTool058DataBytesFactor(toId,notation);}
export function convertTool058Cooking(value:number,fromId:Tool058CookingUnitId,toId:Tool058CookingUnitId){validateTool058Value(value);const from=getTool058CookingUnit(fromId),to=getTool058CookingUnit(toId);return value*from.mlFactor/to.mlFactor;}
export function formatTool058(value:number,precision=TOOL058_DEFAULT_PRECISION){const safe=Math.max(0,Math.min(TOOL058_LIMITS.maxPrecision,Math.trunc(precision)));if(value===0)return'0';const abs=Math.abs(value);if(abs>=1e15||abs<1e-8)return value.toExponential(safe).replace(/\.0+e/,'e').replace(/(\.\d*?)0+e/,'$1e');return new Intl.NumberFormat('en-US',{maximumFractionDigits:safe,useGrouping:true}).format(value);}
export function summarizeTool058Data(value:number,notation:Tool058Notation,fromId:Tool058DataUnitId){return TOOL058_DEFAULTS.data.summary.slice(0,TOOL058_LIMITS.maxSummaryUnits).map(id=>({unit:getTool058DataUnit(id),symbol:getTool058DataSymbol(id,notation),value:convertTool058Data(value,notation,fromId,id)}));}
export function summarizeTool058Cooking(value:number,fromId:Tool058CookingUnitId){return TOOL058_DEFAULTS.cooking.summary.map(id=>({unit:getTool058CookingUnit(id),symbol:getTool058CookingUnit(id).symbol,value:convertTool058Cooking(value,fromId,id)}));}
