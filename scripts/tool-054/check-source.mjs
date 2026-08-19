import fs from 'node:fs';import assert from 'node:assert/strict';
const files=['lib/tool-054-timer-stopwatch.ts','components/timer-stopwatch-tool.tsx','components/timer-stopwatch-tool.module.css','components/timer-stopwatch-page.tsx','app/[locale]/timer-stopwatch/page.tsx'];for(const f of files)assert.ok(fs.existsSync(f),`missing ${f}`);
const tool=fs.readFileSync('components/timer-stopwatch-tool.tsx','utf8');const page=fs.readFileSync('components/timer-stopwatch-page.tsx','utf8');const route=fs.readFileSync('app/[locale]/timer-stopwatch/page.tsx','utf8');
for(const s of ['tool054-root','tool054-primary','tool054-lap','tool054-reset','tool054-clock','tool054-fullscreen','tool054-mode-${m}'])assert.ok(tool.includes(s),`selector pattern missing ${s}`);
for(const s of ['performance.now','visibilitychange','AudioContext','requestFullscreen','navigator.clipboard'])assert.ok(tool.includes(s),`feature source missing ${s}`);
for(const lang of ['ko:','en:','ja:'])assert.ok(tool.includes(lang)&&page.includes(lang),`locale missing ${lang}`);
for(const s of ['canonical','x-default','timer-stopwatch'])assert.ok(route.includes(s),`route metadata missing ${s}`);
assert.ok(page.includes('WebApplication')&&page.includes('BreadcrumbList')&&page.includes('FAQPage'),'structured data missing');
console.log('TOOL054 SOURCE PASS');
