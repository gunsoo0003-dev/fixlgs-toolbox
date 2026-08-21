import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-077-investment-return-calculator-page.tsx','scripts/tool-077/value-content-baseline.json','TOOL077'],{stdio:'inherit'});process.exitCode=r.status??1;
