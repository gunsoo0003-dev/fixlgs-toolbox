import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-068-seller-fee-settlement-calculator-page.tsx','scripts/tool-068/value-content-baseline.json','TOOL068'],{stdio:'inherit'});process.exitCode=r.status??1;
