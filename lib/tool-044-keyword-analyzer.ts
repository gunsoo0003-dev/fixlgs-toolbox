export const TOOL044_SERVICE_LIMITS = {
  maxCharacters: 300_000,
  maxSentences: 30_000,
  maxUniqueKeywords: 50_000,
  defaultVisibleKeywords: 20,
} as const;

export type Tool044Locale = "ko" | "en" | "ja";
export type KeywordRow = Readonly<{rank:number; keyword:string; count:number; density:number; firstIndex:number}>;
export type DuplicateSentenceGroup = Readonly<{representative:string; originals:readonly string[]; count:number; positions:readonly number[]}>;
export type Tool044Result = Readonly<{
  totalWords:number;
  uniqueWords:number;
  sentenceCount:number;
  duplicateSentenceGroups:number;
  repeatedSentenceOccurrences:number;
  keywords:readonly KeywordRow[];
  topKeywords:readonly KeywordRow[];
  duplicates:readonly DuplicateSentenceGroup[];
}>;

function localeId(locale:Tool044Locale){return locale==="ko"?"ko-KR":locale==="ja"?"ja-JP":"en-US";}
function fold(value:string,locale:Tool044Locale){try{return value.toLocaleLowerCase(localeId(locale));}catch{return value.toLowerCase();}}
function isWordLikeFallback(value:string){return /[\p{L}\p{N}\p{M}]/u.test(value) && !/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(value);}

export function segmentWords(text:string,locale:Tool044Locale): readonly string[]{
  const Seg=(Intl as typeof Intl & {Segmenter?: typeof Intl.Segmenter}).Segmenter;
  if(Seg){
    const seg=new Seg(localeId(locale),{granularity:"word"});
    const out:string[]=[];
    for(const part of seg.segment(text)){
      const item=part as Intl.SegmentData;
      if(item.isWordLike===true && isWordLikeFallback(item.segment)) out.push(item.segment);
    }
    return out;
  }
  return text.match(/[\p{L}\p{M}\p{N}]+(?:['’\-][\p{L}\p{M}\p{N}]+)*/gu) ?? [];
}

export function segmentSentences(text:string,locale:Tool044Locale): readonly string[]{
  if(!text.trim()) return [];
  const Seg=(Intl as typeof Intl & {Segmenter?: typeof Intl.Segmenter}).Segmenter;
  if(Seg){
    const seg=new Seg(localeId(locale),{granularity:"sentence"});
    return Array.from(seg.segment(text),part=>part.segment).filter(x=>x.trim().length>0);
  }
  return text.match(/[^.!?。！？\n]+(?:[.!?。！？]+|\n+|$)/gu)?.filter(x=>x.trim().length>0) ?? [];
}

export function normalizeSentenceForDuplicate(value:string,locale:Tool044Locale){
  return fold(value.trim().replace(/\s+/gu," "),locale);
}

export function validateTool044(text:string,locale:Tool044Locale): readonly {code:"CHARACTER_LIMIT"|"SENTENCE_LIMIT"|"UNIQUE_KEYWORD_LIMIT";actual:number;limit:number}[]{
  const errors: {code:"CHARACTER_LIMIT"|"SENTENCE_LIMIT"|"UNIQUE_KEYWORD_LIMIT";actual:number;limit:number}[]=[];
  if(text.length>TOOL044_SERVICE_LIMITS.maxCharacters) errors.push({code:"CHARACTER_LIMIT",actual:text.length,limit:TOOL044_SERVICE_LIMITS.maxCharacters});
  const sentences=segmentSentences(text,locale);
  if(sentences.length>TOOL044_SERVICE_LIMITS.maxSentences) errors.push({code:"SENTENCE_LIMIT",actual:sentences.length,limit:TOOL044_SERVICE_LIMITS.maxSentences});
  if(!errors.length){
    const unique=new Set(segmentWords(text,locale).map(x=>fold(x,locale))).size;
    if(unique>TOOL044_SERVICE_LIMITS.maxUniqueKeywords) errors.push({code:"UNIQUE_KEYWORD_LIMIT",actual:unique,limit:TOOL044_SERVICE_LIMITS.maxUniqueKeywords});
  }
  return errors;
}

export function analyzeTool044(text:string,locale:Tool044Locale):Tool044Result{
  const errors=validateTool044(text,locale); if(errors.length) throw new Error(errors[0].code);
  const words=segmentWords(text,locale);
  const map=new Map<string,{display:string;count:number;firstIndex:number}>();
  words.forEach((word,index)=>{const key=fold(word,locale);const hit=map.get(key);if(hit)hit.count++;else map.set(key,{display:word,count:1,firstIndex:index});});
  const totalWords=words.length;
  const keywords=[...map.values()].sort((a,b)=>b.count-a.count||a.firstIndex-b.firstIndex).map((x,index)=>({rank:index+1,keyword:x.display,count:x.count,density:totalWords?x.count/totalWords*100:0,firstIndex:x.firstIndex}));
  const sentences=segmentSentences(text,locale);
  const sentenceMap=new Map<string,{representative:string; originals:string[]; positions:number[]}>();
  sentences.forEach((sentence,index)=>{const key=normalizeSentenceForDuplicate(sentence,locale);if(!key)return;const hit=sentenceMap.get(key);if(hit){hit.originals.push(sentence);hit.positions.push(index+1);}else sentenceMap.set(key,{representative:sentence,originals:[sentence],positions:[index+1]});});
  const duplicates=[...sentenceMap.values()].filter(x=>x.positions.length>=2).sort((a,b)=>b.positions.length-a.positions.length||a.positions[0]-b.positions[0]).map(x=>({representative:x.representative,originals:x.originals,count:x.positions.length,positions:x.positions}));
  return {totalWords,uniqueWords:map.size,sentenceCount:sentences.length,duplicateSentenceGroups:duplicates.length,repeatedSentenceOccurrences:duplicates.reduce((n,x)=>n+x.count,0),keywords,topKeywords:keywords.slice(0,TOOL044_SERVICE_LIMITS.defaultVisibleKeywords),duplicates};
}
