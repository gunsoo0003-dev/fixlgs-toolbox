import fs from 'node:fs';
const src=fs.readFileSync(new URL('../../lib/tool-038-case.ts',import.meta.url),'utf8');
const checks=[['five modes',/upper'\|'lower'\|'title'\|'sentence'\|'first/],['unicode casing',/toUpperCase\(\)/],['title helper',/toTitleCase038/],['sentence helper',/toSentenceCase038/],['first helper',/capitalizeFirstCased038/],['newline sentence boundary',/char==='\\n'\|\|char==='\\r'/]];
let fail=0;for(const [n,re] of checks){const ok=re.test(src);console.log(`${ok?'PASS':'FAIL'} | ${n}`);if(!ok)fail++}console.log(`RESULT ${checks.length-fail} PASS / ${fail} FAIL`);process.exitCode=fail?1:0;
