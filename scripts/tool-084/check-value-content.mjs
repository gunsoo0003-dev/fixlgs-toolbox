import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/check-value-content-common.mjs','components/tool-084-paint-wallpaper-calculator-page.tsx','scripts/tool-084/value-content-baseline.json','TOOL084'],{stdio:'inherit'});process.exitCode=r.status??1;
