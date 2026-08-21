import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-070-unit-price-comparison-page.tsx','scripts/tool-070/value-content-baseline.json','TOOL070'],{stdio:'inherit'});process.exitCode=r.status??1;
