export const TOOL019_SERVICE_LIMITS = {
  maxFileBytes: 20 * 1024 * 1024,
  maxSide: 10000,
  maxPixels: 40_000_000,
  candidateMaxPixels: 48_000_000,
  maxTitleChars: 120,
  maxSubtitleChars: 200,
  maxHistory: 25,
} as const;

export function validateTool019ImageDimensions(width:number,height:number){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return false;
  return width<=TOOL019_SERVICE_LIMITS.maxSide && height<=TOOL019_SERVICE_LIMITS.maxSide && width*height<=TOOL019_SERVICE_LIMITS.maxPixels;
}
export function validateTool019FileBytes(bytes:number){return Number.isFinite(bytes)&&bytes>=0&&bytes<=TOOL019_SERVICE_LIMITS.maxFileBytes;}
