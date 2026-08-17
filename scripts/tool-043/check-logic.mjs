import fs from 'node:fs';
import { compareTool043, createTool043Report, reconstructTool043, validateTool043, TOOL043_SERVICE_LIMITS } from '../../lib/tool-043-text-diff.ts';
const core=JSON.parse(fs.readFileSync('tests/fixtures/tool-043/core.json','utf8'));
const boundary=JSON.parse(fs.readFileSync('tests/fixtures/tool-043/boundary.json','utf8'));
let fail=0,pass=0; const check=(name,ok,extra='')=>{console.log(`[${ok?'PASS':'FAIL'}] ${name}${extra?` ${extra}`:''}`);ok?pass++:fail++;};
for(const f of core){const r=compareTool043(f.a,f.b,f.id==='ja'?'ja':'ko'),rec=reconstructTool043(r);check(`${f.id} reconstruct A`,rec.a===f.a);check(`${f.id} reconstruct B`,rec.b===f.b);for(const k of ['added','removed','changed'])check(`${f.id} stats ${k}`,r.stats[k]===f.stats[k],`got=${r.stats[k]}`);}
for(const f of boundary){const r=compareTool043(f.a,f.b,'ko'),rec=reconstructTool043(r);check(`${f.id} reconstruct A`,rec.a===f.a);check(`${f.id} reconstruct B`,rec.b===f.b);if(f.id==='nfc-nfd')check('NFC/NFD treated different',!r.identical);if(f.id==='trailing-space')check('trailing whitespace treated different',!r.identical);}
const same=compareTool043('same','same','en');check('identical contract',same.identical&&same.stats.added===0&&same.stats.removed===0&&same.stats.changed===0);
const report=createTool043Report(compareTool043('가격 1000원','가격 1200원','ko'),{summary:'요약',added:'추가',removed:'삭제',changed:'변경',before:'기존',after:'변경',line:'줄'});check('plain-text report',report.includes('[요약]')&&report.includes('~ 변경')&&report.includes('- 기존:')&&report.includes('+ 변경:'));
check('character limit A',validateTool043('A'.repeat(TOOL043_SERVICE_LIMITS.maxCharactersPerText+1),'').some(e=>e.code==='CHARACTER_LIMIT'&&e.side==='A'));
check('line limit B',validateTool043('',('x\n').repeat(TOOL043_SERVICE_LIMITS.maxLinesPerText)+'x').some(e=>e.code==='LINE_LIMIT'&&e.side==='B'));
console.log(`TOOL043 LOGIC PASS=${pass} FAIL=${fail}`);process.exitCode=fail?1:0;
