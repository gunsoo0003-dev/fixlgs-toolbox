import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-078-stock-average-cost-calculator-page.tsx','scripts/tool-078/value-content-baseline.json','TOOL078'],{stdio:'inherit'});process.exitCode=r.status??1;
