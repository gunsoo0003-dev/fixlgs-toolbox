import {spawnSync} from 'node:child_process';
const scripts=['check-source.mjs','check-harness.mjs','check-design-static.mjs','check-css-protection.mjs','check-localization.mjs','check-logic.mjs','check-main-integration.mjs'];
for(const f of scripts){const r=spawnSync(process.execPath,[`scripts/tool-037/${f}`],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1)}
console.log('TOOL037 STATIC VALIDATION PASS');
