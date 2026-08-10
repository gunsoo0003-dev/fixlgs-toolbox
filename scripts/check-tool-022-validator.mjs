import fs from 'node:fs';
const tool=fs.readFileSync('components/blog-open-graph-image-maker-tool.tsx','utf8');
const tests=['tests/helpers/tool-022.ts','tests/tool-022-preflight.spec.ts','tests/tool-022-core.spec.ts','tests/tool-022-boundary.spec.ts'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const checks=[
 ['tool-022-root',tool.includes('tool-022-root')&&tests.includes('tool-022-root')],
 ['tool022-preset-*',tool.includes('tool022-preset-${p.id}')&&tests.includes('tool022-preset-')],
 ['tool022-download-current',tool.includes('tool022-download-current')&&tests.includes('tool022-download-current')],
 ['tool022-download-zip',tool.includes('tool022-download-zip')&&tests.includes('tool022-download-zip')],
 ['tool022-select-current',tool.includes('tool022-select-current')&&tests.includes('tool022-select-current')],
 ['tool022-error',tool.includes('tool022-error')&&tests.includes('tool022-error')],
];
let fail=false;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} selector ${name}`);if(!ok)fail=true;}process.exit(fail?1:0);
