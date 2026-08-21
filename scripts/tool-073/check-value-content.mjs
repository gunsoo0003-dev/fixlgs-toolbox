import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-073-deposit-savings-calculator-page.tsx','scripts/tool-073/value-content-baseline.json','TOOL073'],{stdio:'inherit'});process.exitCode=r.status??1;
