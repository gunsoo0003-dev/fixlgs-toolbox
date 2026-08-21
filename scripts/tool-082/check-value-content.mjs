import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-082-building-ratio-page.tsx','scripts/tool-082/value-content-baseline.json','TOOL082'],{stdio:'inherit'});process.exitCode=r.status??1;
