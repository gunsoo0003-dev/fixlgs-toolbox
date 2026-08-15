import fs from 'node:fs';
const tool=fs.readFileSync('components/split-extract-pdf-tool.tsx','utf8');
const specs=['tests/tool-029-preflight.spec.ts','tests/tool-029-core.spec.ts','tests/tool-029-boundary.spec.ts','tests/tool-029-feature.spec.ts','tests/tool-029-regression.spec.ts','tests/tool-029-limit.spec.ts'];
const selectors=['tool029-root','tool029-file-input','tool029-dropzone','tool029-settings','tool029-range-input','tool029-selection-input','tool029-plan','tool029-process','tool029-thumbnails','tool029-workspace','tool029-new-pdf','tool029-results','tool029-download-all'];
const fail=[];for(const s of selectors)if(!tool.includes(`data-testid="${s}"`))fail.push(`selector ${s}`);for(const f of specs)if(!fs.existsSync(f))fail.push(`spec ${f}`);
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));for(const s of ['test:toolbox:029-preflight','test:toolbox:029-core-only','test:toolbox:029-boundary-only','test:toolbox:029-feature-only','test:toolbox:029-regression-only','test:toolbox:029-limit-only'])if(!pkg.scripts[s])fail.push(`script ${s}`);
if(fail.length){console.error('TOOL029 HARNESS STRUCTURE FAIL');fail.forEach(x=>console.error('-',x));process.exit(1)}console.log('TOOL029 HARNESS STRUCTURE PASS');
