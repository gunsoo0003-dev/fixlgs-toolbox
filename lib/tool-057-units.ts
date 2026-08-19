export type Tool057Group='speed'|'fuel'|'energy'|'power';
export type Tool057Category='speed'|'fuel'|'energyPower';
export type Tool057Unit={id:string;symbol:string;factor:number;names:{ko:string;en:string;ja:string}};
export const TOOL057_LIMITS={maxAbsInput:1e15,maxPrecision:8,maxSummaryUnits:6} as const;
export const TOOL057_DEFAULT_PRECISION=6;
export const TOOL057_UNITS:Record<Tool057Group,readonly Tool057Unit[]>={
 speed:[
  {id:'kmh',symbol:'km/h',factor:1/3.6,names:{ko:'킬로미터/시간',en:'Kilometers/hour',ja:'キロメートル/時'}},
  {id:'mph',symbol:'mph',factor:0.44704,names:{ko:'마일/시간',en:'Miles/hour',ja:'マイル/時'}},
  {id:'ms',symbol:'m/s',factor:1,names:{ko:'미터/초',en:'Meters/second',ja:'メートル/秒'}},
  {id:'knot',symbol:'kn',factor:1852/3600,names:{ko:'노트',en:'Knot',ja:'ノット'}},
  {id:'fts',symbol:'ft/s',factor:0.3048,names:{ko:'피트/초',en:'Feet/second',ja:'フィート/秒'}},
 ],
 fuel:[
  {id:'kml',symbol:'km/L',factor:1,names:{ko:'킬로미터/리터',en:'Kilometers/liter',ja:'キロメートル/リットル'}},
  {id:'l100km',symbol:'L/100km',factor:1,names:{ko:'리터/100km',en:'Liters/100km',ja:'リットル/100km'}},
  {id:'mpgus',symbol:'MPG (US)',factor:1.609344/3.785411784,names:{ko:'MPG (미국)',en:'MPG (US)',ja:'MPG (米国)'}},
  {id:'mpguk',symbol:'MPG (UK)',factor:1.609344/4.54609,names:{ko:'MPG (영국)',en:'MPG (UK)',ja:'MPG (英国)'}},
 ],
 energy:[
  {id:'j',symbol:'J',factor:1,names:{ko:'줄',en:'Joule',ja:'ジュール'}},
  {id:'kj',symbol:'kJ',factor:1e3,names:{ko:'킬로줄',en:'Kilojoule',ja:'キロジュール'}},
  {id:'mj',symbol:'MJ',factor:1e6,names:{ko:'메가줄',en:'Megajoule',ja:'メガジュール'}},
  {id:'wh',symbol:'Wh',factor:3600,names:{ko:'와트시',en:'Watt-hour',ja:'ワット時'}},
  {id:'kwh',symbol:'kWh',factor:3.6e6,names:{ko:'킬로와트시',en:'Kilowatt-hour',ja:'キロワット時'}},
  {id:'cal',symbol:'cal',factor:4.184,names:{ko:'칼로리',en:'Calorie',ja:'カロリー'}},
  {id:'kcal',symbol:'kcal',factor:4184,names:{ko:'킬로칼로리',en:'Kilocalorie',ja:'キロカロリー'}},
  {id:'btu',symbol:'BTU',factor:1055.05585262,names:{ko:'BTU',en:'BTU',ja:'BTU'}},
 ],
 power:[
  {id:'w',symbol:'W',factor:1,names:{ko:'와트',en:'Watt',ja:'ワット'}},
  {id:'kw',symbol:'kW',factor:1e3,names:{ko:'킬로와트',en:'Kilowatt',ja:'キロワット'}},
  {id:'mw',symbol:'MW',factor:1e6,names:{ko:'메가와트',en:'Megawatt',ja:'メガワット'}},
  {id:'hp',symbol:'hp',factor:745.6998715822702,names:{ko:'마력 (hp)',en:'Horsepower (hp)',ja:'馬力 (hp)'}},
  {id:'ps',symbol:'PS',factor:735.49875,names:{ko:'미터마력 (PS)',en:'Metric horsepower (PS)',ja:'仏馬力 (PS)'}},
  {id:'btuh',symbol:'BTU/h',factor:0.2930710701722222,names:{ko:'BTU/시간',en:'BTU/hour',ja:'BTU/時'}},
 ],
};
export const TOOL057_DEFAULTS:Record<Tool057Group,{from:string;to:string;summary:readonly string[]}>= {
 speed:{from:'kmh',to:'mph',summary:['kmh','mph','ms','knot','fts']},
 fuel:{from:'kml',to:'l100km',summary:['kml','l100km','mpgus','mpguk']},
 energy:{from:'kwh',to:'mj',summary:['j','kj','mj','wh','kwh','btu']},
 power:{from:'kw',to:'hp',summary:['w','kw','mw','hp','ps','btuh']},
};
export function getTool057Unit(group:Tool057Group,id:string){const unit=TOOL057_UNITS[group].find(u=>u.id===id);if(!unit)throw new Error('INVALID_UNIT');return unit;}
export function parseTool057Number(raw:string){const normalized=raw.trim().replace(/,/g,'');if(normalized==='')return null;const value=Number(normalized);return Number.isFinite(value)?value:null;}
function validate(value:number,group:Tool057Group){if(!Number.isFinite(value))throw new Error('INVALID_VALUE');if(Math.abs(value)>TOOL057_LIMITS.maxAbsInput)throw new Error('VALUE_LIMIT');if(group==='fuel'&&value<=0)throw new Error('FUEL_NON_POSITIVE');if(group!=='fuel'&&value<0)throw new Error('NEGATIVE_VALUE');}
export function toTool057Canonical(value:number,group:Tool057Group,fromId:string){validate(value,group);const from=getTool057Unit(group,fromId);if(group!=='fuel')return value*from.factor;if(fromId==='l100km')return 100/value;return value*from.factor;}
export function fromTool057Canonical(canonical:number,group:Tool057Group,toId:string){const to=getTool057Unit(group,toId);if(group!=='fuel')return canonical/to.factor;if(toId==='l100km')return 100/canonical;return canonical/to.factor;}
export function convertTool057(value:number,group:Tool057Group,fromId:string,toId:string){const canonical=toTool057Canonical(value,group,fromId);return fromTool057Canonical(canonical,group,toId);}
export function formatTool057(value:number,precision=TOOL057_DEFAULT_PRECISION){const safe=Math.max(0,Math.min(TOOL057_LIMITS.maxPrecision,Math.trunc(precision)));if(value===0)return '0';const abs=Math.abs(value);if(abs>=1e15||abs<1e-8)return value.toExponential(safe).replace(/\.0+e/,'e').replace(/(\.\d*?)0+e/,'$1e');return new Intl.NumberFormat('en-US',{maximumFractionDigits:safe,useGrouping:true}).format(value);}
export function summarizeTool057(value:number,group:Tool057Group,fromId:string){return TOOL057_DEFAULTS[group].summary.slice(0,TOOL057_LIMITS.maxSummaryUnits).map(id=>({unit:getTool057Unit(group,id),value:convertTool057(value,group,fromId,id)}));}
