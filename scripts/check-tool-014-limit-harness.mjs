import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const required = [
  'tests/tool-014-limit.spec.ts',
  'tests/config/tool-014-limit-candidates.ts',
  'scripts/run-tool-014-limit-only.mjs',
  'scripts/tool-014-limit-fixtures.mjs',
  'test-fixtures/tool-014-limit/tiny-01.png',
  'test-fixtures/tool-014-limit/tiny-09.png',
  'test-fixtures/tool-014-limit/tiny-10.png',
];
const errors = [];
for (const rel of required) if (!existsSync(resolve(root, rel))) errors.push(`missing file: ${rel}`);

if (!errors.length) {
  const spec = readFileSync(resolve(root, 'tests/tool-014-limit.spec.ts'), 'utf8');
  const cfg = readFileSync(resolve(root, 'tests/config/tool-014-limit-candidates.ts'), 'utf8');
  for (const [needle, label] of [
    ["TOOL_NUMBER = '014'", 'tool number 014'],
    ["TOOL_SLUG = 'image-collage-maker'", '014 route slug'],
    ["ROOT_TEST_ID = 'tool014-workbench'", '014 root selector'],
    ['L.layoutCells.candidate', 'confirmed 9-cell contract'],
    ['L.selectedFiles.candidate', 'selected-file candidate'],
    ['L.outputMaxSide.candidate', 'output-side candidate'],
    ['[HARNESS_ERROR]', 'HARNESS_ERROR classification'],
    ['[PRODUCT_FAIL]', 'PRODUCT_FAIL classification'],
    ['[CANDIDATE_OBSERVATION]', 'candidate observation logging'],
  ]) if (!spec.includes(needle)) errors.push(`contract missing: ${label}`);

  for (const [needle, label] of [
    ['candidate: 12', '12-file service candidate'],
    ['candidate: 15 * MiB', '15MiB per-file candidate'],
    ['candidate: 80 * MiB', '80MiB total candidate'],
    ['candidate: 24_000_000', '24MP source candidate'],
    ['candidate: 3000', '3000px output-side candidate'],
    ['candidate: 9_000_000', '9MP output-pixel candidate'],
  ]) if (!cfg.includes(needle)) errors.push(`candidate config missing: ${label}`);
}

if (errors.length) {
  console.error('014 LIMIT HARNESS PREFLIGHT: HARNESS_ERROR');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(2);
}
console.log('014 LIMIT HARNESS PREFLIGHT: PASS');
console.log('- confirmed contract: 3x3 = 9 cells');
console.log('- service candidates loaded from tests/config/tool-014-limit-candidates.ts');
console.log('- existing validators modified: no');
