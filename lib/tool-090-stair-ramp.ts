export type Tool090LengthUnit='mm'|'cm'|'m';
export type Tool090StairBasis='tread'|'run';
export type Tool090RampBasis='run'|'slope'|'angle';

export const TOOL090_LIMITS={maxLengthM:1e6,maxSteps:1000,maxTreadM:10,maxSlopePct:1000,maxAngleDeg:89.999,maxPrecision:8,maxInputChars:30} as const;

export type Tool090Geometry={riseM:number;runM:number;lengthM:number;slopePct:number;angleDeg:number};
export type Tool090StairResult=Tool090Geometry&{steps:number;riserM:number;treadM:number};
export type Tool090RampResult=Tool090Geometry;

export function parseTool090Number(raw:string):number|null{
 const value=raw.trim().replace(/,/g,'');
 if(value==='')return null;
 if(!/^(?:\d+\.?\d*|\.\d+)$/.test(value))return null;
 const n=Number(value);return Number.isFinite(n)?n:null;
}

export function toTool090Meters(value:number,unit:Tool090LengthUnit){
 if(!Number.isFinite(value)||value<=0)throw new Error('LENGTH_ZERO');
 const m=unit==='m'?value:unit==='cm'?value/100:value/1000;
 if(m>TOOL090_LIMITS.maxLengthM)throw new Error('LENGTH_LIMIT');
 return m;
}
export function fromTool090Meters(value:number,unit:Tool090LengthUnit){return unit==='m'?value:unit==='cm'?value*100:value*1000}

function geometry(riseM:number,runM:number):Tool090Geometry{
 if(!Number.isFinite(riseM)||riseM<=0)throw new Error('RISE_ZERO');
 if(!Number.isFinite(runM)||runM<=0)throw new Error('RUN_ZERO');
 if(riseM>TOOL090_LIMITS.maxLengthM||runM>TOOL090_LIMITS.maxLengthM)throw new Error('LENGTH_LIMIT');
 const slopePct=riseM/runM*100;
 if(slopePct>TOOL090_LIMITS.maxSlopePct)throw new Error('SLOPE_LIMIT');
 const angleDeg=Math.atan(riseM/runM)*180/Math.PI;
 const lengthM=Math.hypot(riseM,runM);
 return {riseM,runM,lengthM,slopePct,angleDeg};
}

export function calculateTool090Stair(args:{height:number;unit:Tool090LengthUnit;steps:number;basis:Tool090StairBasis;treadOrRun:number}):Tool090StairResult{
 const riseM=toTool090Meters(args.height,args.unit);
 if(!Number.isInteger(args.steps)||args.steps<=0)throw new Error('STEPS_INVALID');
 if(args.steps>TOOL090_LIMITS.maxSteps)throw new Error('STEPS_LIMIT');
 const inputM=toTool090Meters(args.treadOrRun,args.unit);
 let runM:number,treadM:number;
 if(args.basis==='tread'){
  treadM=inputM;if(treadM>TOOL090_LIMITS.maxTreadM)throw new Error('TREAD_LIMIT');runM=treadM*args.steps;
 }else{
  runM=inputM;treadM=runM/args.steps;if(treadM>TOOL090_LIMITS.maxTreadM)throw new Error('TREAD_LIMIT');
 }
 const g=geometry(riseM,runM);
 return {...g,steps:args.steps,riserM:riseM/args.steps,treadM};
}

export function calculateTool090Ramp(args:{height:number;unit:Tool090LengthUnit;basis:Tool090RampBasis;value:number}):Tool090RampResult{
 const riseM=toTool090Meters(args.height,args.unit);let runM:number;
 if(!Number.isFinite(args.value)||args.value<=0)throw new Error(args.basis==='run'?'RUN_ZERO':args.basis==='slope'?'SLOPE_ZERO':'ANGLE_ZERO');
 if(args.basis==='run') runM=toTool090Meters(args.value,args.unit);
 else if(args.basis==='slope'){
  if(args.value>TOOL090_LIMITS.maxSlopePct)throw new Error('SLOPE_LIMIT');runM=riseM/(args.value/100);
 }else{
  if(args.value>=TOOL090_LIMITS.maxAngleDeg)throw new Error('ANGLE_LIMIT');runM=riseM/Math.tan(args.value*Math.PI/180);
 }
 return geometry(riseM,runM);
}

export function formatTool090(value:number,precision=3,locale='ko-KR'){
 const p=Math.max(0,Math.min(TOOL090_LIMITS.maxPrecision,precision));
 return new Intl.NumberFormat(locale,{maximumFractionDigits:p}).format(value);
}
