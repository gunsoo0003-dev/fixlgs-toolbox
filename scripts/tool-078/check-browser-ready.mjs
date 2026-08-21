import fs from 'node:fs';
const required=[
  'playwright.tool078.config.ts',
  'tests/tool-078/tool-078-main.spec.ts',
  'scripts/tool-078/run-validation-full.mjs',
  'package.json'
];
for(const f of required){if(!fs.existsSync(f))throw new Error(`missing browser-ready file ${f}`)}
const spec=fs.readFileSync('tests/tool-078/tool-078-main.spec.ts','utf8');
for(const token of ['test(','pageerror','console','tool078-']){if(!spec.includes(token))throw new Error(`spec contract missing ${token}`)}
if(/\.skip\(|\.fixme\(|test\.only\(|describe\.only\(/.test(spec))throw new Error('skip/fixme/only forbidden');
const cfg=fs.readFileSync('playwright.tool078.config.ts','utf8');
for(const token of ['desktop-chromium','mobile-chromium','stock-average-cost-calculator']){if(!cfg.includes(token))throw new Error(`config contract missing ${token}`)}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const s of ['tool078:static','tool078:browser','tool078:final']){if(!pkg.scripts?.[s])throw new Error(`package script missing ${s}`)}
console.log('TOOL078 BROWSER READY PASS');
