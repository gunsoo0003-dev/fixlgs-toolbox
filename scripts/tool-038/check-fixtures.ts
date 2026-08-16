import fs from 'node:fs';
import {transformTool038,type Tool038Mode} from '../../lib/tool-038-case';
const cases=JSON.parse(fs.readFileSync('tests/fixtures/tool-038/cases.json','utf8')) as Array<{id:string;source:string;expected:Record<Tool038Mode,string>}>;
const modes:Tool038Mode[]=['upper','lower','title','sentence','first']; let pass=0,fail=0;
for(const c of cases){for(const m of modes){const actual=transformTool038(c.source,m);const ok=actual===c.expected[m];console.log(`${ok?'PASS':'FAIL'} | ${c.id} | ${m}${ok?'':`\n expected=${JSON.stringify(c.expected[m])}\n actual=${JSON.stringify(actual)}`}`);ok?pass++:fail++}}
console.log(`RESULT ${pass} PASS / ${fail} FAIL`); if(fail)process.exitCode=1;
