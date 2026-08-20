export type Rational={n:bigint;d:bigint};
export type Tool065Operator='add'|'sub'|'mul'|'div';
export const TOOL065_LIMITS={maxDigits:100,maxInputLength:120,decimalPrecision:12} as const;

export function gcd065(a:bigint,b:bigint){a=a<BigInt(0)?-a:a;b=b<BigInt(0)?-b:b;while(b!==BigInt(0)){const t=a%b;a=b;b=t;}return a;}
export function normalize065(n:bigint,d:bigint):Rational{if(d===BigInt(0))throw new Error('DENOMINATOR_ZERO');if(n===BigInt(0))return{n:BigInt(0),d:BigInt(1)};if(d<BigInt(0)){n=-n;d=-d;}const g=gcd065(n,d);return{n:n/g,d:d/g};}
function digitCount(v:bigint){return (v<BigInt(0)?-v:v).toString().length;}
export function assertLimit065(r:Rational){if(digitCount(r.n)>TOOL065_LIMITS.maxDigits||digitCount(r.d)>TOOL065_LIMITS.maxDigits)throw new Error('RATIONAL_LIMIT');return r;}
export function parseFraction065(raw:string):Rational{
 const s=raw.trim();if(!s||s.length>TOOL065_LIMITS.maxInputLength)throw new Error(s?'INPUT_LIMIT':'EMPTY_INPUT');
 if(/[eE]/.test(s))throw new Error('INVALID_SYNTAX');
 const mixed=s.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
 if(mixed){const whole=BigInt(mixed[1]),num=BigInt(mixed[2]),den=BigInt(mixed[3]);if(den===BigInt(0))throw new Error('DENOMINATOR_ZERO');const sign=whole<BigInt(0)?-BigInt(1):BigInt(1);const absWhole=whole<BigInt(0)?-whole:whole;return assertLimit065(normalize065(sign*(absWhole*den+num),den));}
 const frac=s.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
 if(frac)return assertLimit065(normalize065(BigInt(frac[1]),BigInt(frac[2])));
 if(/^[+-]?\d+$/.test(s))return assertLimit065(normalize065(BigInt(s),BigInt(1)));
 throw new Error('INVALID_SYNTAX');
}
export function parseDecimal065(raw:string):Rational{
 const s=raw.trim();if(!s||s.length>TOOL065_LIMITS.maxInputLength)throw new Error(s?'INPUT_LIMIT':'EMPTY_INPUT');if(/[eE]/.test(s)||!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(s))throw new Error('INVALID_DECIMAL');
 const neg=s.startsWith('-'),u=s.replace(/^[+-]/,'');const [a,b='']=u.split('.');if(b.length>TOOL065_LIMITS.maxDigits)throw new Error('DECIMAL_LIMIT');const den=BigInt(10)**BigInt(b.length);const n=BigInt((a||'0')+b)*(neg?-BigInt(1):BigInt(1));return assertLimit065(normalize065(n,den));
}
export function operate065(a:Rational,b:Rational,op:Tool065Operator):Rational{let r:Rational;switch(op){case'add':r=normalize065(a.n*b.d+b.n*a.d,a.d*b.d);break;case'sub':r=normalize065(a.n*b.d-b.n*a.d,a.d*b.d);break;case'mul':r=normalize065(a.n*b.n,a.d*b.d);break;case'div':if(b.n===BigInt(0))throw new Error('DIVISION_ZERO');r=normalize065(a.n*b.d,a.d*b.n);break;}return assertLimit065(r);}
export function fractionString065(r:Rational){return r.d===BigInt(1)?r.n.toString():`${r.n}/${r.d}`;}
export function mixedString065(r:Rational){const neg=r.n<BigInt(0),abs=neg?-r.n:r.n,whole=abs/r.d,rem=abs%r.d;if(rem===BigInt(0))return `${neg?'-':''}${whole}`;if(whole===BigInt(0))return `${neg?'-':''}${rem}/${r.d}`;return `${neg?'-':''}${whole} ${rem}/${r.d}`;}
export function decimalString065(r:Rational,precision:number=TOOL065_LIMITS.decimalPrecision){const p=Math.max(0,Math.min(TOOL065_LIMITS.decimalPrecision,Math.trunc(precision)));const neg=r.n<BigInt(0),abs=neg?-r.n:r.n,whole=abs/r.d;let rem=abs%r.d;if(rem===BigInt(0))return `${neg?'-':''}${whole}`;let digits='';for(let i=0;i<p&&rem!==BigInt(0);i++){rem*=BigInt(10);digits+=(rem/r.d).toString();rem%=r.d;}return `${neg?'-':''}${whole}.${digits||'0'}${rem!==BigInt(0)?'…':''}`;}
export function isTerminating065(r:Rational){let d=r.d;while(d%BigInt(2)===BigInt(0))d/=BigInt(2);while(d%BigInt(5)===BigInt(0))d/=BigInt(5);return d===BigInt(1);}
export function steps065(a:Rational,b:Rational|undefined,op:Tool065Operator|undefined,result:Rational){const out:string[]=[];if(op&&b){if(op==='add'||op==='sub')out.push(`Common denominator: ${a.d} × ${b.d} = ${a.d*b.d}`);if(op==='mul')out.push(`Multiply numerators and denominators: ${a.n}×${b.n} / ${a.d}×${b.d}`);if(op==='div')out.push(`Multiply by the reciprocal: ${a.n}/${a.d} × ${b.d}/${b.n}`);}const g=gcd065(result.n,result.d);out.push(`Lowest terms: ${fractionString065(result)}`);return out;}
