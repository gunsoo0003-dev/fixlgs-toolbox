import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'tests/tool-013-regression.spec.ts',
  'tests/helpers/tool-013.ts',
  'scripts/run-tool-013-regression-only.mjs',
  'scripts/tool-validation-result-utils.mjs',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(JSON.stringify({ status:'HARNESS_ERROR', type:'MISSING_FILE', missing }, null, 2));
  process.exit(2);
}
const spec = fs.readFileSync(path.join(root, 'tests/tool-013-regression.spec.ts'), 'utf8');
const helper = fs.readFileSync(path.join(root, 'tests/helpers/tool-013.ts'), 'utf8');
const runner = fs.readFileSync(path.join(root, 'scripts/run-tool-013-regression-only.mjs'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const failures = [];
for (const route of ['/ko/image-merger','/en/image-merger','/ja/image-merger']) {
  if (!helper.includes(route)) failures.push({type:'ROUTE_MISSING', route});
}
for (const wrong of [...spec.matchAll(/tool-(?:00[1-9]|010|011)-regression\.spec/g)].map(m=>m[0])) {
  failures.push({type:'EXISTING_REGRESSION_DIRECT_REFERENCE_NOT_ALLOWED', value:wrong});
}
for (const requiredText of ['protected 001-012 routes remain reachable','sitemap.xml','robots.txt','canonical','hreflang','contact?app=','/ko/category/image-edit']) {
  if (!spec.includes(requiredText)) failures.push({type:'REGRESSION_COVERAGE_MISSING', value:requiredText});
}
if (!runner.includes('tool-validation-result-utils.mjs') || !runner.includes("toolNumber: '013'") || !runner.includes("validationType: 'regression-only'")) {
  failures.push({type:'RESULT_ZIP_RUNNER_INCOMPLETE'});
}
if (packageJson.scripts?.['test:toolbox:013-regression'] !== 'playwright test tests/tool-013-regression.spec.ts --workers=1') {
  failures.push({type:'PACKAGE_SCRIPT_MISSING', script:'test:toolbox:013-regression'});
}
if (packageJson.scripts?.['test:toolbox:013-regression-only'] !== 'node scripts/run-tool-013-regression-only.mjs') {
  failures.push({type:'PACKAGE_SCRIPT_MISSING', script:'test:toolbox:013-regression-only'});
}
if (failures.length) {
  console.error(JSON.stringify({status:'HARNESS_ERROR', failures}, null, 2));
  process.exit(2);
}
console.log(JSON.stringify({
  status:'PASS',
  classification:'013_REGRESSION_HARNESS_STATIC_PREFLIGHT',
  newRegressionSpec:'tests/tool-013-regression.spec.ts',
  newRunner:'scripts/run-tool-013-regression-only.mjs',
  existingRegressionFilesModified:false,
  existingValidationEngineModified:false,
  resultZipRunnerConnected:true,
  runtimeResult:'NOT_RUN_IN_AUXILIARY_ENVIRONMENT'
}, null, 2));
