export type Tool059Mode='pixels-to-print'|'print-to-pixels'|'effective-ppi';
export type Tool059Unit='in'|'cm'|'mm';
export const TOOL059_LIMITS={maxPixels:100000,maxPhysicalInches:10000,maxPpi:2400,maxPrecision:6,maxPresets:30} as const;
export const TOOL059_PPI_PRESETS=[72,96,150,200,240,300,600] as const;
export type Tool059Preset={id:string;label:string;width:number;height:number;unit:Tool059Unit;kind:'paper'|'photo'|'card'};
export const TOOL059_PRESETS:readonly Tool059Preset[]=[
 {id:'a4',label:'A4',width:210,height:297,unit:'mm',kind:'paper'},
 {id:'a5',label:'A5',width:148,height:210,unit:'mm',kind:'paper'},
 {id:'a6',label:'A6',width:105,height:148,unit:'mm',kind:'paper'},
 {id:'letter',label:'Letter',width:8.5,height:11,unit:'in',kind:'paper'},
 {id:'4x6',label:'4×6',width:4,height:6,unit:'in',kind:'photo'},
 {id:'5x7',label:'5×7',width:5,height:7,unit:'in',kind:'photo'},
 {id:'8x10',label:'8×10',width:8,height:10,unit:'in',kind:'photo'},
 {id:'business-card',label:'Business card',width:90,height:50,unit:'mm',kind:'card'},
] as const;
export function toInches(value:number,unit:Tool059Unit){if(unit==='in')return value;if(unit==='cm')return value/2.54;return value/25.4;}
export function fromInches(value:number,unit:Tool059Unit){if(unit==='in')return value;if(unit==='cm')return value*2.54;return value*25.4;}
export function assertPositive(value:number,code='INVALID_VALUE'){if(!Number.isFinite(value)||value<=0)throw new Error(code);return value;}
export function validatePixel(value:number){assertPositive(value,'INVALID_PIXEL');if(value>TOOL059_LIMITS.maxPixels)throw new Error('PIXEL_LIMIT');return value;}
export function validatePpi(value:number){assertPositive(value,'INVALID_PPI');if(value>TOOL059_LIMITS.maxPpi)throw new Error('PPI_LIMIT');return value;}
export function validatePhysical(value:number,unit:Tool059Unit){assertPositive(value,'INVALID_PHYSICAL');if(toInches(value,unit)>TOOL059_LIMITS.maxPhysicalInches)throw new Error('PHYSICAL_LIMIT');return value;}
export function pixelsToPrint(widthPx:number,heightPx:number,ppi:number){validatePixel(widthPx);validatePixel(heightPx);validatePpi(ppi);const widthIn=widthPx/ppi,heightIn=heightPx/ppi;return{widthIn,heightIn,widthCm:widthIn*2.54,heightCm:heightIn*2.54,widthMm:widthIn*25.4,heightMm:heightIn*25.4};}
export function printToPixels(width:number,height:number,unit:Tool059Unit,ppi:number){validatePhysical(width,unit);validatePhysical(height,unit);validatePpi(ppi);return{widthPx:Math.round(toInches(width,unit)*ppi),heightPx:Math.round(toInches(height,unit)*ppi)};}
export function effectivePpi(widthPx:number,heightPx:number,width:number,height:number,unit:Tool059Unit){validatePixel(widthPx);validatePixel(heightPx);validatePhysical(width,unit);validatePhysical(height,unit);return{widthPpi:widthPx/toInches(width,unit),heightPpi:heightPx/toInches(height,unit),effectivePpi:Math.min(widthPx/toInches(width,unit),heightPx/toInches(height,unit))};}
export function megapixels(widthPx:number,heightPx:number){validatePixel(widthPx);validatePixel(heightPx);return widthPx*heightPx/1_000_000;}
function gcd(a:number,b:number){a=Math.round(Math.abs(a));b=Math.round(Math.abs(b));while(b){const t=b;b=a%b;a=t;}return a||1;}
export function aspectRatio(width:number,height:number){assertPositive(width);assertPositive(height);const scale=10000;const wi=Math.round(width*scale),hi=Math.round(height*scale),d=gcd(wi,hi);return{label:`${wi/d}:${hi/d}`,decimal:width/height,orientation:width===height?'square':width>height?'landscape':'portrait'} as const;}
export function ratioMismatch(pixelW:number,pixelH:number,physicalW:number,physicalH:number){const a=pixelW/pixelH,b=physicalW/physicalH;return Math.abs(a-b)/Math.max(a,b)>0.005;}
export function formatTool059(value:number,precision=4){const p=Math.max(0,Math.min(TOOL059_LIMITS.maxPrecision,Math.trunc(precision)));return new Intl.NumberFormat('en-US',{maximumFractionDigits:p,useGrouping:true}).format(value);}
export function parseTool059(raw:string){const value=Number(raw.trim().replace(/,/g,''));return raw.trim()&&Number.isFinite(value)?value:null;}
export function readiness(ppi:number){if(ppi>=300)return'good';if(ppi>=200)return'caution';return'low';}
