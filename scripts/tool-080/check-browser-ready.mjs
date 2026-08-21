import fs from 'node:fs';
const required=[
  'playwright.tool080.config.ts',
  'tests/tool-080/tool-080-state-matrix.spec.ts',
  'scripts/tool-080/run-validation-full.mjs',
  'package.json'
];
for(const f of required){if(!fs.existsSync(f))throw new Error(`missing browser-ready file ${f}`)}
const spec=fs.readFileSync('tests/tool-080/tool-080-state-matrix.spec.ts','utf8');
for(const token of ['test(','pageerror','console','tool080-']){if(!spec.includes(token))throw new Error(`spec contract missing ${token}`)}
if(/\.skip\(|\.fixme\(|test\.only\(|describe\.only\(/.test(spec))throw new Error('skip/fixme/only forbidden');
const cfg=fs.readFileSync('playwright.tool080.config.ts','utf8');
for(const token of ['desktop-chromium','mobile-chromium','rental-yield-calculator']){if(!cfg.includes(token))throw new Error(`config contract missing ${token}`)}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const s of ['tool080:static','tool080:browser','tool080:final']){if(!pkg.scripts?.[s])throw new Error(`package script missing ${s}`)}
console.log('TOOL080 BROWSER READY PASS');
