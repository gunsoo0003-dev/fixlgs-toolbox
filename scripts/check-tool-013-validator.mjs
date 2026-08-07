import fs from 'node:fs';

const required = [
  'tests/tool-013-core.spec.ts',
  'tests/tool-013-boundary.spec.ts',
  'tests/tool-013-regression.spec.ts',
  'tests/tool-013-limit.spec.ts',
  'scripts/run-tool-013-partial-validation.mjs',
  'tests/helpers/tool-013.ts',
];
let failed = 0;
for (const file of required) {
  const ok = fs.existsSync(file);
  console.log(`${ok ? 'PASS' : 'FAIL'}\t${file}`);
  if (!ok) failed++;
}
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
for (const script of ['test:toolbox:013-core','test:toolbox:013-core-only','test:toolbox:013-boundary','test:toolbox:013-boundary-only','test:toolbox:013-regression-only','test:toolbox:013-limit-only']) {
  const ok = typeof pkg.scripts?.[script] === 'string';
  console.log(`${ok ? 'PASS' : 'FAIL'}\tpackage script ${script}`);
  if (!ok) failed++;
}
const regression = fs.readFileSync('tests/tool-013-regression.spec.ts','utf8');
const has012 = regression.includes('/ko/image-border-rounded-corners-tool');
console.log(`${has012 ? 'PASS' : 'FAIL'}\tregression protects completed tool 012`);
if (!has012) failed++;
const core = fs.readFileSync('tests/tool-013-core.spec.ts','utf8');
const boundary = fs.readFileSync('tests/tool-013-boundary.spec.ts','utf8');
for (const [name, text, needles] of [
  ['core assertions', core, ['download creates a real file','vertical and horizontal','reorder buttons','reset settings']],
  ['boundary assertions', boundary, ['unsupported, empty and corrupted','clamp negatives','custom size clamps','filename sanitizes']],
]) {
  const ok = needles.every(n => text.includes(n));
  console.log(`${ok ? 'PASS' : 'FAIL'}\t${name}`);
  if (!ok) failed++;
}
console.log(`\nVALIDATOR PASS ${14-failed} / FAIL ${failed}`);
process.exitCode = failed ? 1 : 0;
