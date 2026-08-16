import fs from 'node:fs';
import { transformTool038 } from '../../lib/tool-038-case.ts';
const cases=JSON.parse(fs.readFileSync(new URL('../../tests/fixtures/tool-038/cases.json',import.meta.url),'utf8'));
let pass=0,fail=0;
for(const c of cases){for(const [mode,expected] of Object.entries(c.expected)){const got=transformTool038(c.source,mode);const ok=got===expected;console.log(`${ok?'PASS':'FAIL'} | ${c.id} | ${mode}`);if(ok)pass++;else fail++;}}
console.log(`RESULT ${pass} PASS / ${fail} FAIL`);process.exitCode=fail?1:0;
