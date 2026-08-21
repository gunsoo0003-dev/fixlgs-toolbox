import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-076-card-installment-page.tsx','scripts/tool-076/value-content-baseline.json','TOOL076'],{stdio:'inherit'});process.exitCode=r.status??1;
