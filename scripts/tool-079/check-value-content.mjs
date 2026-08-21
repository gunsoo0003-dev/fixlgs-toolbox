import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-079-dividend-yield-calculator-page.tsx','scripts/tool-079/value-content-baseline.json','TOOL079'],{stdio:'inherit'});process.exitCode=r.status??1;
