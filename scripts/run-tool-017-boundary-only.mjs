import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { cleanupProjectValidationArtifacts, createValidationResultPackage, parseCounts, resolveDesktopPath } from './tool-validation-result-utils.mjs';

const startedAt = new Date();
const started = Date.now();
const local = resolve(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');
let exe, args;
if (existsSync(local)) { exe = process.execPath; args = [local, 'test', 'tests/tool-017-boundary.spec.ts', '--workers=1', '--project=desktop-chromium', '--config=playwright.tool017-runtime.config.ts']; }
else if (process.platform === 'win32') { exe = 'cmd.exe'; args = ['/d','/s','/c','npm','exec','--','playwright','test','tests/tool-017-boundary.spec.ts','--workers=1','--project=desktop-chromium','--config=playwright.tool017-runtime.config.ts']; }
else { exe = 'npm'; args = ['exec','--','playwright','test','tests/tool-017-boundary.spec.ts','--workers=1','--project=desktop-chromium','--config=playwright.tool017-runtime.config.ts']; }
const run = spawnSync(exe,args,{cwd:process.cwd(),env:{...process.env,FORCE_COLOR:'0'},encoding:'utf8',windowsHide:true,shell:false,maxBuffer:1024*1024*200});
const stdout=run.stdout||'', stderr=run.stderr||'', code=typeof run.status==='number'?run.status:1;
process.stdout.write(stdout); process.stderr.write(stderr);
const text=`${stdout}\n${stderr}`;
const status=code===0?'passed':/\[HARNESS_ERROR\]/.test(text)&&!/\[PRODUCT_FAIL\]/.test(text)?'harness_error':'failed';
const steps=[{name:'boundary-only',status,exitCode:code,durationSeconds:Math.round((Date.now()-started)/100)/10,counts:parseCounts(text),command:`${exe} ${args.join(' ')}`,stdout,stderr:run.error?`${stderr}\n${run.error.message}`:stderr}];
const pkg=createValidationResultPackage({toolNumber:'017',validationType:'boundary-only',status,startedAt,endedAt:new Date(),steps});
cleanupProjectValidationArtifacts();
let finalZip=pkg.zipPath;
if(pkg.zipCreated){const fixed=resolve(resolveDesktopPath(),'017_boundary-only_검수결과.zip');try{rmSync(fixed,{force:true});renameSync(pkg.zipPath,fixed);finalZip=fixed;}catch(e){console.error(`[HARNESS_ERROR] fixed result ZIP rename failed: ${e instanceof Error?e.message:String(e)}`);}}
console.log(`017 BOUNDARY-ONLY RESULT: ${status.toUpperCase()}`);console.log(`결과 ZIP: ${finalZip}`);
process.exit(code===0&&pkg.zipCreated?0:status==='harness_error'?2:1);
