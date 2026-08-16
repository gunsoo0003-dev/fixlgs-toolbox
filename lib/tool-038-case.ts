export type Tool038Mode='upper'|'lower'|'title'|'sentence'|'first';

const CASED_RE=/\p{Lowercase_Letter}|\p{Uppercase_Letter}|\p{Titlecase_Letter}/u;
const TITLE_SEP_RE=/[\s\-‐‑‒–—―'’ʼ]/u;
const SENTENCE_END_RE=/[.!?。！？]/u;

export function isCasedCharacter(char:string){return CASED_RE.test(char)}

export function toTitleCase038(source:string){
  let start=true;
  let out='';
  for(const char of source){
    if(isCasedCharacter(char)){
      out+=start?char.toUpperCase():char.toLowerCase();
      start=false;
    }else{
      out+=char;
      if(TITLE_SEP_RE.test(char))start=true;
    }
  }
  return out;
}

export function toSentenceCase038(source:string){
  const lower=source.toLowerCase();
  let start=true;
  let out='';
  for(const char of lower){
    if(isCasedCharacter(char)){
      out+=start?char.toUpperCase():char;
      start=false;
    }else{
      out+=char;
      if(char==='\n'||char==='\r'||SENTENCE_END_RE.test(char))start=true;
    }
  }
  return out;
}

export function capitalizeFirstCased038(source:string){
  let done=false;
  let out='';
  for(const char of source){
    if(!done&&isCasedCharacter(char)){
      out+=char.toUpperCase();
      done=true;
    }else out+=char;
  }
  return out;
}

export function transformTool038(source:string,mode:Tool038Mode){
  switch(mode){
    case 'upper': return source.toUpperCase();
    case 'lower': return source.toLowerCase();
    case 'title': return toTitleCase038(source);
    case 'sentence': return toSentenceCase038(source);
    case 'first': return capitalizeFirstCased038(source);
  }
}

export function countChangedCodePoints038(source:string,result:string){
  const a=Array.from(source),b=Array.from(result); const n=Math.max(a.length,b.length); let changed=0;
  for(let i=0;i<n;i++)if(a[i]!==b[i])changed++;
  return changed;
}
