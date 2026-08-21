import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-071-ad-sales-performance-calculator-page.tsx','scripts/tool-071/value-content-baseline.json','TOOL071'],{stdio:'inherit'});process.exitCode=r.status??1;
