import fs from 'node:fs';

const required = [
  'components/add-text-to-image-page.tsx','components/add-text-to-image-tool.tsx','components/add-text-to-image-tool.module.css',
  'lib/tool-016-service-limits.ts',
  'tests/helpers/tool-016.ts','tests/tool-016-preflight.spec.ts','tests/tool-016-core.spec.ts','tests/tool-016-boundary.spec.ts','tests/tool-016-regression.spec.ts','tests/tool-016-limit.spec.ts',
  'scripts/tool-016-limit-fixtures.mjs','scripts/check-tool-016-source.mjs','scripts/check-tool-016-harness.mjs','scripts/check-tool-016-design-structure.mjs','scripts/check-tool-016-validator.mjs','scripts/check-tool-016-delivery-readiness.mjs','scripts/run-tool-016-preflight.mjs','scripts/run-tool-016-partial-validation.mjs','scripts/run-tool-016-final-validation.mjs',
  'docs/016-service-limit-candidates.md','docs/016-service-limit-applied.md','docs/016-design-static-check.md','CHANGE_MAP_016.txt','FAILURE_RESPONSE_MAP_016.txt','HANDOFF_016.txt','016_RUN_COMMANDS.txt','handoff-source/웹도구_016_이미지에글자넣기_최종제작전달서_원본.md',
  'test-fixtures/tool016-pixels-before.png','test-fixtures/tool016-pixels-limit.png','test-fixtures/tool016-pixels-over.png','test-fixtures/tool016-side-before.png','test-fixtures/tool016-side-limit.png','test-fixtures/tool016-side-over.png',
];
for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error('DELIVERY FILE MISSING', file);
    process.exit(1);
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const scripts = pkg.scripts || {};
for (const key of [
  'check:tool016-validator','check:tool016-source','check:tool016-harness','check:tool016-design','check:tool016-delivery',
  'test:toolbox:016-preflight','test:toolbox:016-core-only','test:toolbox:016-boundary-only','test:toolbox:016-regression-only','test:toolbox:016-limit-only','test:toolbox:016-final',
]) {
  if (!scripts[key]) {
    console.error('PACKAGE SCRIPT MISSING', key);
    process.exit(1);
  }
}

const handoff = fs.readFileSync('HANDOFF_016.txt','utf8');
for (const token of ['서비스 유효상한 적용','15 MiB','12,000,000','001~015','주작업장 이식','preflight','core-only','boundary-only','regression-only','limit-only','FINAL','RUNTIME_NOT_VERIFIED']) {
  if (!handoff.includes(token)) {
    console.error('HANDOFF TOKEN MISSING', token);
    process.exit(1);
  }
}

const changeMap = fs.readFileSync('CHANGE_MAP_016.txt','utf8');
for (const token of ['lib/tool-016-service-limits.ts','check-tool-016-validator.mjs','run-tool-016-final-validation.mjs','tool-016-limit-fixtures.mjs','app/sitemap.ts','package.json','016_RUN_COMMANDS.txt','웹도구_016_최종제작전달서_원본.md']) {
  if (!changeMap.includes(token)) {
    console.error('CHANGE MAP TOKEN MISSING', token);
    process.exit(1);
  }
}

console.log('016 DELIVERY READINESS STATIC CHECK: PASSED');
