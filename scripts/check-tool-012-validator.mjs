import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const exists = f => fs.existsSync(path.join(root, f));
const required = [
  'tests/tool-012-core.spec.ts',
  'tests/tool-012-boundary.spec.ts',
  'tests/tool-012-regression.spec.ts',
  'tests/tool-012-limit.spec.ts',
  'scripts/run-tool-012-partial-validation.mjs',
  'scripts/run-tool-012-final-validation.mjs',
  'scripts/tool-validation-result-utils.mjs',
];
for (const file of required) if (!exists(file)) failures.push(`missing ${file}`);
if (!failures.length) {
  const test = read('tests/tool-012-core.spec.ts');
  const boundary = read('tests/tool-012-boundary.spec.ts');
  const regression = read('tests/tool-012-regression.spec.ts');
  const limit = read('tests/tool-012-limit.spec.ts');
  const runner = read('scripts/run-tool-012-partial-validation.mjs');
  const finalRunner = read('scripts/run-tool-012-final-validation.mjs');
  const pkg = JSON.parse(read('package.json'));
  for (const marker of ['tool012-root','tool012-file','tool012-mode-circle','tool012-border-toggle','tool012-shadow-toggle','tool012-download','transparent corner pixels']) {
    if (!test.includes(marker)) failures.push(`core marker ${marker}`);
  }
  for (const marker of ['unsupported, empty, MIME-mismatched','temporary blank state','image-safe maximum','maximum thickness','maximum blur/spread','maximum extra padding','transparent background','filename sanitizes']) {
    if (!boundary.includes(marker)) failures.push(`boundary marker ${marker}`);
  }
  for (const marker of ['general-user service ceiling','pixel-ceiling-pass','pixel-ceiling-first-over-block','side-ceiling-pass','side-ceiling-first-over-block','mobile-realistic-24mp-pass','effect-expanded-result-blocked','finalServiceCeiling']) {
    if (!limit.includes(marker)) failures.push(`limit marker ${marker}`);
  }
  for (const marker of ['001-011 protected routes remain reachable','image-border-rounded-corners-tool','image-padding-background-tool','WebApplication','FAQPage','BreadcrumbList','sitemap.xml']) {
    if (!regression.includes(marker)) failures.push(`regression marker ${marker}`);
  }
  if (!runner.includes("toolNumber: '012'")) failures.push('runner tool number');
  if (!pkg.scripts?.['test:toolbox:012-core']) failures.push('missing 012-core npm script');
  if (!pkg.scripts?.['test:toolbox:012-core-only']) failures.push('missing 012-core-only npm script');
  if (!pkg.scripts?.['test:toolbox:012-boundary']) failures.push('missing 012-boundary npm script');
  if (!pkg.scripts?.['test:toolbox:012-boundary-only']) failures.push('missing 012-boundary-only npm script');
  if (!pkg.scripts?.['test:toolbox:012-regression']) failures.push('missing 012-regression npm script');
  if (!pkg.scripts?.['test:toolbox:012-regression-only']) failures.push('missing 012-regression-only npm script');
  if (!pkg.scripts?.['test:toolbox:012-limit']) failures.push('missing 012-limit npm script');
  if (!pkg.scripts?.['test:toolbox:012-limit-only']) failures.push('missing 012-limit-only npm script');
  if (!pkg.scripts?.['test:toolbox:012-final']) failures.push('missing 012-final npm script');
  if (!runner.includes("'limit-only': ['run', 'test:toolbox:012-limit']")) failures.push('runner limit-only mapping');
  if (!runner.includes('tool-012-limit-report.json')) failures.push('runner limit report packaging');
  for (const marker of ['check:tool012-validator','check:tool012-source','check:ja-terms','build','test:toolbox:common-additive','test:toolbox:012-core','test:toolbox:012-boundary','test:toolbox:012-regression','test:toolbox:012-limit','tool-012-limit-report.json']) {
    if (!finalRunner.includes(marker)) failures.push(`final runner marker ${marker}`);
  }
}
if (failures.length) {
  console.error(JSON.stringify({ status: 'FAIL', tool: '012', failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: 'PASS', tool: '012', coreValidator: true, resultZip: true }, null, 2));
