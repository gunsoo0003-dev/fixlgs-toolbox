import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-072-salary-converter-page.tsx','scripts/tool-072/value-content-baseline.json','TOOL072'],{stdio:'inherit'});process.exitCode=r.status??1;
