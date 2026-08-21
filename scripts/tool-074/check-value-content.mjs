import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-074-compound-growth-page.tsx','scripts/tool-074/value-content-baseline.json','TOOL074'],{stdio:'inherit'});process.exitCode=r.status??1;
