import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const runner=fs.readFileSync(path.join(root,'scripts/tool-039/run-validation.mjs'),'utf8');
const summary=fs.readFileSync(path.join(root,'scripts/tool-039/run-step-summary.mjs'),'utf8');
const checks=[
 ['step summary runner exists', fs.existsSync(path.join(root,'scripts/tool-039/run-step-summary.mjs'))],
 ['static uses desktop zip runner', String(pkg.scripts['check:tool039-static']).includes('run-step-summary.mjs static')],
 ['main uses desktop zip runner', String(pkg.scripts['check:tool039-main']).includes('run-step-summary.mjs main')],
 ['source uses desktop zip runner', String(pkg.scripts['check:tool039-source']).includes('run-step-summary.mjs source')],
 ['step summary emits 검수결과.zip', summary.includes('검수결과.zip')],
 ['step summary emits ZIP path', summary.includes('ZIP=${zipPath}')],
 ['step summary no old LOCAL_RESULT contract', !summary.includes('TOOL039_LOCAL_RESULT.txt')],
 ['runtime runner emits 검수결과.zip', runner.includes('검수결과.zip')],
 ['runtime runner emits ZIP path', runner.includes('ZIP=${zipPath}')],
 ['runtime runner handles interrupt', runner.includes('INTERRUPTED')],
];
let bad=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} | ${n}`); if(!ok) bad++;}
process.exitCode=bad?1:0;
