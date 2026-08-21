import fs from 'node:fs';
const required=[
  'playwright.tool079.config.ts',
  'tests/tool-079/tool-079-state-matrix.spec.ts',
  'scripts/tool-079/run-validation-full.mjs',
  'package.json'
];
for(const f of required){if(!fs.existsSync(f))throw new Error(`missing browser-ready file ${f}`)}
const spec=fs.readFileSync('tests/tool-079/tool-079-state-matrix.spec.ts','utf8');
for(const token of ['test(','pageerror','console','tool079-']){if(!spec.includes(token))throw new Error(`spec contract missing ${token}`)}
if(/\.skip\(|\.fixme\(|test\.only\(|describe\.only\(/.test(spec))throw new Error('skip/fixme/only forbidden');
const cfg=fs.readFileSync('playwright.tool079.config.ts','utf8');
for(const token of ['desktop-chromium','mobile-chromium','dividend-yield-calculator']){if(!cfg.includes(token))throw new Error(`config contract missing ${token}`)}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const s of ['tool079:static','tool079:browser','tool079:final']){if(!pkg.scripts?.[s])throw new Error(`package script missing ${s}`)}
console.log('TOOL079 BROWSER READY PASS');
