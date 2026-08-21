export const TOOL083_LIMITS={maxDimension:1e6,maxOpeningRows:100,maxOpeningCount:1000,maxInputChars:30,maxDisplayPrecision:8} as const;
export type OpeningKind='door'|'window';
export type Tool083Opening={kind:OpeningKind;width:number;height:number;count:number};
export type Tool083Input={width:number;length:number;height:number;openings:Tool083Opening[]};
export type Tool083Result={floorArea:number;ceilingArea:number;wallArea:number;doorArea:number;windowArea:number;openingArea:number;netWallArea:number;totalConstructionArea:number};
function validDimension(value:number,label:string){if(!Number.isFinite(value)||value<=0)throw new Error(`${label}_INVALID`);if(value>TOOL083_LIMITS.maxDimension)throw new Error(`${label}_LIMIT`)}
export function parseTool083Number(raw:string):number|null{const n=raw.replace(/[,_\s㎡m²]/g,'').trim();if(!n||n.length>TOOL083_LIMITS.maxInputChars)return null;const v=Number(n);return Number.isFinite(v)?v:null}
export function calculateTool083(input:Tool083Input):Tool083Result{
 validDimension(input.width,'WIDTH');validDimension(input.length,'LENGTH');validDimension(input.height,'HEIGHT');
 if(input.openings.length>TOOL083_LIMITS.maxOpeningRows)throw new Error('OPENING_ROWS_LIMIT');
 const floorArea=input.width*input.length;const ceilingArea=floorArea;const wallArea=2*(input.width*input.height)+2*(input.length*input.height);
 let doorArea=0,windowArea=0;
 for(const opening of input.openings){validDimension(opening.width,'OPENING_WIDTH');validDimension(opening.height,'OPENING_HEIGHT');if(!Number.isInteger(opening.count)||opening.count<=0||opening.count>TOOL083_LIMITS.maxOpeningCount)throw new Error('OPENING_COUNT_INVALID');const area=opening.width*opening.height*opening.count;if(!Number.isFinite(area))throw new Error('OPENING_AREA_INVALID');if(opening.kind==='door')doorArea+=area;else windowArea+=area}
 const openingArea=doorArea+windowArea;if(openingArea>wallArea)throw new Error('OPENING_GT_WALL');const netWallArea=wallArea-openingArea;const totalConstructionArea=floorArea+ceilingArea+netWallArea;
 if(![floorArea,ceilingArea,wallArea,doorArea,windowArea,openingArea,netWallArea,totalConstructionArea].every(Number.isFinite))throw new Error('RESULT_INVALID');
 return {floorArea,ceilingArea,wallArea,doorArea,windowArea,openingArea,netWallArea,totalConstructionArea};
}
export function formatTool083(value:number,precision=2,locale='ko-KR'){const d=Math.max(0,Math.min(TOOL083_LIMITS.maxDisplayPrecision,precision));return new Intl.NumberFormat(locale,{maximumFractionDigits:d,minimumFractionDigits:0}).format(value)}
