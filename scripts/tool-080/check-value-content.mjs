import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-080-rental-yield-calculator-page.tsx','scripts/tool-080/value-content-baseline.json','TOOL080'],{stdio:'inherit'});process.exitCode=r.status??1;
