import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-081-area-price-calculator-page.tsx','scripts/tool-081/value-content-baseline.json','TOOL081'],{stdio:'inherit'});process.exitCode=r.status??1;
