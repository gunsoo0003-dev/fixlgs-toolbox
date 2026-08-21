import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-069-break-even-calculator-page.tsx','scripts/tool-069/value-content-baseline.json','TOOL069'],{stdio:'inherit'});process.exitCode=r.status??1;
