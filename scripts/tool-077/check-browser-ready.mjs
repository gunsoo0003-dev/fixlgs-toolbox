import fs from 'node:fs';
const required=[
  'playwright.tool077.config.ts',
  'tests/tool-077/tool-077-state-matrix.spec.ts',
  'scripts/tool-077/run-validation-full.mjs',
  'package.json'
];
for(const f of required){if(!fs.existsSync(f))throw new Error(`missing browser-ready file ${f}`)}
const spec=fs.readFileSync('tests/tool-077/tool-077-state-matrix.spec.ts','utf8');
for(const token of ['test(','pageerror','console','tool077-']){if(!spec.includes(token))throw new Error(`spec contract missing ${token}`)}
if(/\.skip\(|\.fixme\(|test\.only\(|describe\.only\(/.test(spec))throw new Error('skip/fixme/only forbidden');
const cfg=fs.readFileSync('playwright.tool077.config.ts','utf8');
for(const token of ['desktop-chromium','mobile-chromium','investment-return-calculator']){if(!cfg.includes(token))throw new Error(`config contract missing ${token}`)}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const s of ['tool077:static','tool077:browser','tool077:final']){if(!pkg.scripts?.[s])throw new Error(`package script missing ${s}`)}
console.log('TOOL077 BROWSER READY PASS');
