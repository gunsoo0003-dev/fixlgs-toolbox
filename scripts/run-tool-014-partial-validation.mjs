import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';
import { cleanupProjectValidationArtifacts, createValidationResultPackage, parseCounts } from './tool-validation-result-utils.mjs';

const mode = process.argv[2];
const defs = {
  'core-only': ['run', 'test:toolbox:014-core'],
  'boundary-only': ['run', 'test:toolbox:014-boundary'],
};
if (!defs[mode]) process.exit(2);
const npmCli = process.env.npm_execpath;
const cmd = npmCli && existsSync(npmCli)
  ? { exe: process.execPath, prefix: [npmCli] }
  : process.platform === 'win32'
    ? { exe: 'cmd.exe', prefix: ['/d','/s','/c','npm'] }
    : { exe: 'npm', prefix: [] };
const startedAt = new Date();
const started = Date.now();
const full = [...cmd.prefix, ...defs[mode]];
const run = spawnSync(cmd.exe, full, { cwd:process.cwd(), env:{...process.env,FORCE_COLOR:'0'}, encoding:'utf8', windowsHide:true, shell:false, maxBuffer:1024*1024*300 });
const stdout=run.stdout||'', stderr=run.stderr||'';
const code=typeof run.status==='number'?run.status:1;
process.stdout.write(stdout); process.stderr.write(stderr);
const steps=[{name:mode,status:code===0?'passed':'failed',exitCode:code,durationSeconds:Math.round((Date.now()-started)/100)/10,counts:parseCounts(`${stdout}\n${stderr}`),command:`${cmd.exe} ${full.join(' ')}`,stdout,stderr}];
const pkg=createValidationResultPackage({toolNumber:'014',validationType:mode,status:code===0?'passed':'failed',startedAt,endedAt:new Date(),steps});
cleanupProjectValidationArtifacts();
console.log(`014 ${mode.toUpperCase()} RESULT: ${code===0?'PASSED':'FAILED'}`);
console.log(`결과 ZIP: ${pkg.zipPath}`);
process.exit(code===0 && pkg.zipCreated ? 0 : 1);
