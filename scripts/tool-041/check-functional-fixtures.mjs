import { spawnSync } from 'node:child_process';
const r=spawnSync(process.execPath,['--experimental-strip-types','scripts/tool-041/check-functional-fixtures-runner.mjs'],{cwd:process.cwd(),stdio:'inherit'});process.exitCode=r.status??1;
