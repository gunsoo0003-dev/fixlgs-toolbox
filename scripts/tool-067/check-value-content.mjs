import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-067-selling-price-margin-calculator-page.tsx','scripts/tool-067/value-content-baseline.json','TOOL067'],{stdio:'inherit'});process.exitCode=r.status??1;
