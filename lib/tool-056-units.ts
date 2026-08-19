export type Tool056Category='mass'|'temperature'|'pressure';
export type Tool056LinearUnit={id:string;symbol:string;factor:number;names:{ko:string;en:string;ja:string}};
export type Tool056TemperatureUnit={id:'c'|'f'|'k';symbol:string;names:{ko:string;en:string;ja:string}};
export const TOOL056_LIMITS={maxAbsInput:1e15,maxPrecision:8,maxSummaryUnits:6,minKelvin:0} as const;
export const TOOL056_DEFAULT_PRECISION=4;
export const TOOL056_MASS_UNITS:readonly Tool056LinearUnit[]=[
 {id:'mg',symbol:'mg',factor:1e-6,names:{ko:'밀리그램',en:'Milligram',ja:'ミリグラム'}},
 {id:'g',symbol:'g',factor:1e-3,names:{ko:'그램',en:'Gram',ja:'グラム'}},
 {id:'kg',symbol:'kg',factor:1,names:{ko:'킬로그램',en:'Kilogram',ja:'キログラム'}},
 {id:'t',symbol:'t',factor:1000,names:{ko:'톤',en:'Metric tonne',ja:'トン'}},
 {id:'oz',symbol:'oz',factor:0.028349523125,names:{ko:'온스',en:'Ounce',ja:'オンス'}},
 {id:'lb',symbol:'lb',factor:0.45359237,names:{ko:'파운드',en:'Pound',ja:'ポンド'}},
] as const;
export const TOOL056_TEMPERATURE_UNITS:readonly Tool056TemperatureUnit[]=[
 {id:'c',symbol:'°C',names:{ko:'섭씨',en:'Celsius',ja:'摂氏'}},
 {id:'f',symbol:'°F',names:{ko:'화씨',en:'Fahrenheit',ja:'華氏'}},
 {id:'k',symbol:'K',names:{ko:'켈빈',en:'Kelvin',ja:'ケルビン'}},
] as const;
export const TOOL056_PRESSURE_UNITS:readonly Tool056LinearUnit[]=[
 {id:'pa',symbol:'Pa',factor:1,names:{ko:'파스칼',en:'Pascal',ja:'パスカル'}},
 {id:'kpa',symbol:'kPa',factor:1000,names:{ko:'킬로파스칼',en:'Kilopascal',ja:'キロパスカル'}},
 {id:'mpa',symbol:'MPa',factor:1e6,names:{ko:'메가파스칼',en:'Megapascal',ja:'メガパスカル'}},
 {id:'bar',symbol:'bar',factor:100000,names:{ko:'바',en:'Bar',ja:'バール'}},
 {id:'atm',symbol:'atm',factor:101325,names:{ko:'표준기압',en:'Standard atmosphere',ja:'標準気圧'}},
 {id:'psi',symbol:'psi',factor:6894.757293168,names:{ko:'PSI',en:'PSI',ja:'PSI'}},
 {id:'mmhg',symbol:'mmHg',factor:133.3224,names:{ko:'수은주 밀리미터',en:'Millimeter of mercury',ja:'水銀柱ミリメートル'}},
] as const;
export const TOOL056_DEFAULTS:Record<Tool056Category,{from:string;to:string;summary:readonly string[]}>= {
 mass:{from:'kg',to:'lb',summary:['mg','g','kg','t','oz','lb']},
 temperature:{from:'c',to:'f',summary:['c','f','k']},
 pressure:{from:'kpa',to:'psi',summary:['pa','kpa','bar','atm','psi','mmhg']},
};
export const TOOL056_SOURCE_NOTE='NIST SP 811 / NIST OWM unit conversion references; temperature formulas exact, display rounding separated from calculation.';
export function getTool056Units(category:Tool056Category){return category==='mass'?TOOL056_MASS_UNITS:category==='pressure'?TOOL056_PRESSURE_UNITS:TOOL056_TEMPERATURE_UNITS;}
export function getTool056Unit(category:Tool056Category,id:string){const unit=getTool056Units(category).find(u=>u.id===id);if(!unit)throw new Error('INVALID_UNIT');return unit;}
export function parseTool056Number(raw:string){const normalized=raw.trim().replace(/,/g,'');if(normalized==='')return null;const value=Number(normalized);return Number.isFinite(value)?value:null;}
function toCelsius(value:number,fromId:string){if(fromId==='c')return value;if(fromId==='f')return (value-32)/1.8;if(fromId==='k')return value-273.15;throw new Error('INVALID_UNIT');}
function fromCelsius(celsius:number,toId:string){if(toId==='c')return celsius;if(toId==='f')return celsius*1.8+32;if(toId==='k')return celsius+273.15;throw new Error('INVALID_UNIT');}
export function convertTool056(value:number,category:Tool056Category,fromId:string,toId:string){
 if(!Number.isFinite(value))throw new Error('INVALID_VALUE');
 if(Math.abs(value)>TOOL056_LIMITS.maxAbsInput)throw new Error('VALUE_LIMIT');
 if(category==='mass'||category==='pressure'){
  if(value<0)throw new Error('NEGATIVE_VALUE');
  const from=getTool056Unit(category,fromId) as Tool056LinearUnit,to=getTool056Unit(category,toId) as Tool056LinearUnit;
  return value*from.factor/to.factor;
 }
 const celsius=toCelsius(value,fromId),kelvin=celsius+273.15;
 if(kelvin<TOOL056_LIMITS.minKelvin-1e-12)throw new Error('BELOW_ABSOLUTE_ZERO');
 const result=fromCelsius(celsius,toId);
 if(toId==='k'&&result<TOOL056_LIMITS.minKelvin-1e-12)throw new Error('BELOW_ABSOLUTE_ZERO');
 return Math.abs(result)<1e-12?0:result;
}
export function formatTool056(value:number,precision=TOOL056_DEFAULT_PRECISION){const safe=Math.max(0,Math.min(TOOL056_LIMITS.maxPrecision,Math.trunc(precision)));if(value===0)return '0';const abs=Math.abs(value);if(abs>=1e15||abs<1e-8)return value.toExponential(safe).replace(/\.0+e/,'e').replace(/(\.\d*?)0+e/,'$1e');return new Intl.NumberFormat('en-US',{maximumFractionDigits:safe,useGrouping:true}).format(value);}
export function summarizeTool056(value:number,category:Tool056Category,fromId:string){return TOOL056_DEFAULTS[category].summary.slice(0,TOOL056_LIMITS.maxSummaryUnits).map(id=>({unit:getTool056Unit(category,id),value:convertTool056(value,category,fromId,id)}));}
