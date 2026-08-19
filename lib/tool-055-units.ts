export type Tool055Dimension='length'|'area'|'volume';
export type Tool055Unit={id:string;symbol:string;factor:number;names:{ko:string;en:string;ja:string}};
export const TOOL055_LIMITS={maxAbsInput:1e15,maxPrecision:8,maxSummaryUnits:6} as const;
export const TOOL055_DEFAULT_PRECISION=6;
export const TOOL055_UNITS:Record<Tool055Dimension,readonly Tool055Unit[]>={
 length:[
  {id:'mm',symbol:'mm',factor:0.001,names:{ko:'밀리미터',en:'Millimeter',ja:'ミリメートル'}},
  {id:'cm',symbol:'cm',factor:0.01,names:{ko:'센티미터',en:'Centimeter',ja:'センチメートル'}},
  {id:'m',symbol:'m',factor:1,names:{ko:'미터',en:'Meter',ja:'メートル'}},
  {id:'km',symbol:'km',factor:1000,names:{ko:'킬로미터',en:'Kilometer',ja:'キロメートル'}},
  {id:'in',symbol:'in',factor:0.0254,names:{ko:'인치',en:'Inch',ja:'インチ'}},
  {id:'ft',symbol:'ft',factor:0.3048,names:{ko:'피트',en:'Foot',ja:'フィート'}},
  {id:'yd',symbol:'yd',factor:0.9144,names:{ko:'야드',en:'Yard',ja:'ヤード'}},
  {id:'mi',symbol:'mi',factor:1609.344,names:{ko:'마일',en:'Mile',ja:'マイル'}},
 ],
 area:[
  {id:'mm2',symbol:'mm²',factor:1e-6,names:{ko:'제곱밀리미터',en:'Square millimeter',ja:'平方ミリメートル'}},
  {id:'cm2',symbol:'cm²',factor:1e-4,names:{ko:'제곱센티미터',en:'Square centimeter',ja:'平方センチメートル'}},
  {id:'m2',symbol:'m²',factor:1,names:{ko:'제곱미터',en:'Square meter',ja:'平方メートル'}},
  {id:'km2',symbol:'km²',factor:1e6,names:{ko:'제곱킬로미터',en:'Square kilometer',ja:'平方キロメートル'}},
  {id:'pyeong',symbol:'평',factor:400/121,names:{ko:'평',en:'Pyeong',ja:'坪'}},
  {id:'ft2',symbol:'ft²',factor:0.09290304,names:{ko:'제곱피트',en:'Square foot',ja:'平方フィート'}},
  {id:'in2',symbol:'in²',factor:0.00064516,names:{ko:'제곱인치',en:'Square inch',ja:'平方インチ'}},
  {id:'yd2',symbol:'yd²',factor:0.83612736,names:{ko:'제곱야드',en:'Square yard',ja:'平方ヤード'}},
  {id:'acre',symbol:'acre',factor:4046.8564224,names:{ko:'에이커',en:'Acre',ja:'エーカー'}},
  {id:'ha',symbol:'ha',factor:10000,names:{ko:'헥타르',en:'Hectare',ja:'ヘクタール'}},
 ],
 volume:[
  {id:'ml',symbol:'mL',factor:1e-6,names:{ko:'밀리리터',en:'Milliliter',ja:'ミリリットル'}},
  {id:'l',symbol:'L',factor:0.001,names:{ko:'리터',en:'Liter',ja:'リットル'}},
  {id:'cm3',symbol:'cm³',factor:1e-6,names:{ko:'세제곱센티미터',en:'Cubic centimeter',ja:'立方センチメートル'}},
  {id:'m3',symbol:'m³',factor:1,names:{ko:'세제곱미터',en:'Cubic meter',ja:'立方メートル'}},
  {id:'in3',symbol:'in³',factor:0.000016387064,names:{ko:'세제곱인치',en:'Cubic inch',ja:'立方インチ'}},
  {id:'ft3',symbol:'ft³',factor:0.028316846592,names:{ko:'세제곱피트',en:'Cubic foot',ja:'立方フィート'}},
  {id:'yd3',symbol:'yd³',factor:0.764554857984,names:{ko:'세제곱야드',en:'Cubic yard',ja:'立方ヤード'}},
  {id:'usgal',symbol:'US gal',factor:0.003785411784,names:{ko:'미국 갤런',en:'US gallon',ja:'米ガロン'}},
 ],
};
export const TOOL055_DEFAULTS:Record<Tool055Dimension,{from:string;to:string;summary:readonly string[]}>= {
 length:{from:'m',to:'cm',summary:['mm','cm','m','km','in','ft']},
 area:{from:'m2',to:'pyeong',summary:['m2','pyeong','ft2','acre','ha','km2']},
 volume:{from:'l',to:'ml',summary:['ml','l','cm3','m3','ft3','usgal']},
};
export function getTool055Unit(dimension:Tool055Dimension,id:string){const unit=TOOL055_UNITS[dimension].find(u=>u.id===id);if(!unit)throw new Error('INVALID_UNIT');return unit;}
export function parseTool055Number(raw:string){const normalized=raw.trim().replace(/,/g,'');if(normalized==='')return null;const value=Number(normalized);return Number.isFinite(value)?value:null;}
export function convertTool055(value:number,dimension:Tool055Dimension,fromId:string,toId:string){if(!Number.isFinite(value))throw new Error('INVALID_VALUE');if(value<0)throw new Error('NEGATIVE_VALUE');if(Math.abs(value)>TOOL055_LIMITS.maxAbsInput)throw new Error('VALUE_LIMIT');const from=getTool055Unit(dimension,fromId),to=getTool055Unit(dimension,toId);return value*from.factor/to.factor;}
export function formatTool055(value:number,precision=TOOL055_DEFAULT_PRECISION){const safe=Math.max(0,Math.min(TOOL055_LIMITS.maxPrecision,Math.trunc(precision)));if(value===0)return '0';const abs=Math.abs(value);if(abs>=1e15||abs<1e-8)return value.toExponential(safe).replace(/\.0+e/,'e').replace(/(\.\d*?)0+e/,'$1e');return new Intl.NumberFormat('en-US',{maximumFractionDigits:safe,useGrouping:true}).format(value);}
export function summarizeTool055(value:number,dimension:Tool055Dimension,fromId:string){return TOOL055_DEFAULTS[dimension].summary.slice(0,TOOL055_LIMITS.maxSummaryUnits).map(id=>({unit:getTool055Unit(dimension,id),value:convertTool055(value,dimension,fromId,id)}));}
