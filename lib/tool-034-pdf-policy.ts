export const TOOL034_SERVICE_LIMITS = {
  maxFiles: 1,
  maxBytes: 50 * 1024 * 1024,
  maxPasswordLength: 128,
  maxMetadataLength: 2000,
} as const;

export function formatTool034Bytes(bytes:number){
  if(bytes < 1024) return `${bytes} B`;
  if(bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/(1024*1024)).toFixed(1)} MB`;
}
export function normalizePdfBase(name:string){
  return name.replace(/\.pdf$/i,'').replace(/[\\/:*?"<>|]+/g,'-').trim() || 'document';
}
export function outputName(name:string, kind:'protected'|'unlocked'|'metadata'|'metadata-clean'){
  return `${normalizePdfBase(name)}-${kind}.pdf`;
}
export function passwordStrength(value:string):'weak'|'medium'|'strong'{
  let score=0;
  if(value.length>=10) score++;
  if(value.length>=16) score++;
  if(/[a-z]/.test(value)&&/[A-Z]/.test(value)) score++;
  if(/\d/.test(value)) score++;
  if(/[^A-Za-z0-9]/.test(value)) score++;
  return score>=4?'strong':score>=2?'medium':'weak';
}
