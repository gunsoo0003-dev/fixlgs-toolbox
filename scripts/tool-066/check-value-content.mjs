import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-066-vat-calculator-page.tsx','scripts/tool-066/value-content-baseline.json','TOOL066'],{stdio:'inherit'});process.exitCode=r.status??1;
