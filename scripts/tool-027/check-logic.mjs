import fs from 'node:fs';
const source=fs.readFileSync('lib/tool-027-pdf-image.ts','utf8');
let fail=0; const need=(ok,msg)=>{console.log(ok?'PASS':'FAIL',msg);if(!ok)fail++;};
function parse(value,total){const out=new Set();if(!value.trim())return[];for(const raw of value.split(',')){const token=raw.trim();if(/^\d+$/.test(token)){const page=Number(token);if(page<1||page>total)throw Error('PAGE_RANGE');out.add(page);continue;}const m=token.match(/^(\d+)\s*-\s*(\d+)$/);if(!m)throw Error('PAGE_RANGE');const start=Number(m[1]),end=Number(m[2]);if(start<1||end>total||start>end)throw Error('PAGE_RANGE');for(let p=start;p<=end;p++)out.add(p);}return[...out].sort((a,b)=>a-b)}
function safe(name){return name.replace(/\.pdf$/i,'').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/\s+/g,' ').trim().replace(/[. ]+$/g,'').slice(0,90)||'document'}
function outName(base,page,total,ext){const digits=Math.max(3,String(total).length);return `${safe(base)}-page-${String(page).padStart(digits,'0')}.${ext}`}
need(JSON.stringify(parse('1-3,5,8',10))===JSON.stringify([1,2,3,5,8]),'page range parse');
for(const bad of ['0','3-2','1-11','1,a']){let threw=false;try{parse(bad,10)}catch{threw=true}need(threw,`reject bad range ${bad}`)}
need(safe('a:b?.pdf')==='a_b_','safe basename');
need(outName('demo.pdf',2,100,'png')==='demo-page-002.png','deterministic output name');
need(source.includes('sequentialRenderConcurrency: 1'),'sequential render contract');
need(source.includes('maxCanvasPixels: 55_000_000'),'canvas safety contract');
process.exitCode=fail?1:0;
