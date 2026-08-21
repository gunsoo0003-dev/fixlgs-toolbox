import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-075-loan-calculator-page.tsx','scripts/tool-075/value-content-baseline.json','TOOL075'],{stdio:'inherit'});process.exitCode=r.status??1;
