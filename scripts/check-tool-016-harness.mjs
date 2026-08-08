import fs from 'node:fs';
const files=[
  'tests/helpers/tool-016.ts',
  'tests/tool-016-preflight.spec.ts',
  'tests/tool-016-core.spec.ts',
  'tests/tool-016-boundary.spec.ts',
  'tests/tool-016-regression.spec.ts',
  'tests/tool-016-limit.spec.ts',
  'scripts/run-tool-016-preflight.mjs',
  'scripts/run-tool-016-partial-validation.mjs',
];
for(const f of files){if(!fs.existsSync(f)){console.error('MISSING',f);process.exit(1)}}
const all=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const x of [
  'add-text-to-image','tool016-file-input','tool016-download','016 core-only','016 boundary-only','016 limit-only',
  '016 harness connection preflight','이미지에 글자 넣기','Add Text to Image','画像文字入れツール',
  'core-only','boundary-only','regression-only','limit-only','createValidationResultPackage'
]) if(!all.includes(x)){console.error('HARNESS TOKEN MISSING',x);process.exit(1)}
console.log('016 HARNESS CHECK: PASSED');
