import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-083-room-area-calculator-page.tsx','scripts/tool-083/value-content-baseline.json','TOOL083'],{stdio:'inherit'});process.exitCode=r.status??1;
