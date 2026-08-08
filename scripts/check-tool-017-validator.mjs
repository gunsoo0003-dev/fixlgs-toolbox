import { existsSync, readFileSync } from 'node:fs';

const files = [
  'tests/helpers/tool-017.ts', 'tests/tool-017-preflight.spec.ts', 'tests/tool-017-core.spec.ts', 'tests/tool-017-regression.spec.ts', 'tests/tool-017-limit.spec.ts', 'tests/config/tool-017-limit-candidates.ts',
  'scripts/check-tool-017-source.mjs', 'scripts/check-tool-017-harness.mjs', 'scripts/run-tool-017-preflight.mjs', 'scripts/run-tool-017-core.mjs', 'scripts/run-tool-017-regression-only.mjs', 'scripts/run-tool-017-limit-only.mjs',
];
const errors = [];
for (const file of files) if (!existsSync(file)) errors.push(`missing ${file}`);

function validateCrossCheck(source, config, preflight, regressionRunner, limitRunner) {
  const found = [];
  const expected = [
    ['maxFiles: 20', 'candidate:20'],
    ['maxPerFile: 15 * 1024 * 1024', 'candidate:15*MiB'],
    ['maxTotalBytes: 80 * 1024 * 1024', 'candidate:80*MiB'],
    ['maxPixelsPerFile: 24_000_000', 'candidate:24_000_000'],
    ['maxOutputPixels: 24_000_000', 'outputPixels'],
  ];
  for (const [productNeedle, configNeedle] of expected) {
    if (!source.includes(productNeedle) || !config.includes(configNeedle)) found.push(`cross-check mismatch: ${productNeedle} / ${configNeedle}`);
  }
  if (!preflight.includes('createValidationResultPackage') || !preflight.includes("validationType:'preflight'")) found.push('preflight ZIP result packaging missing');
  if (!regressionRunner.includes("017_regression-only_검수결과.zip")) found.push('regression-only fixed ZIP name missing');
  if (!limitRunner.includes("017_limit-only_검수결과.zip")) found.push('limit-only fixed ZIP name missing');
  return found;
}

if (!errors.length) {
  const source = readFileSync('components/image-watermark-tool.tsx', 'utf8');
  const config = readFileSync('tests/config/tool-017-limit-candidates.ts', 'utf8');
  const preflight = readFileSync('scripts/run-tool-017-preflight.mjs', 'utf8');
  const regressionRunner = readFileSync('scripts/run-tool-017-regression-only.mjs', 'utf8');
  const limitRunner = readFileSync('scripts/run-tool-017-limit-only.mjs', 'utf8');
  errors.push(...validateCrossCheck(source, config, preflight, regressionRunner, limitRunner));

  // Negative self-test: deliberately corrupt a product constant. The validator must detect it.
  const corruptedSource = source.replace('maxFiles: 20', 'maxFiles: 999');
  const negative = validateCrossCheck(corruptedSource, config, preflight, regressionRunner, limitRunner);
  if (!negative.some((entry) => entry.includes('maxFiles: 20'))) errors.push('negative self-test failed: corrupted maxFiles was not detected');

  // Negative self-test for fixed-name runner policy.
  const corruptedLimitRunner = limitRunner.replace('017_limit-only_검수결과.zip', '017_limit-only_검수결과_TIMESTAMP.zip');
  const negativeRunner = validateCrossCheck(source, config, preflight, regressionRunner, corruptedLimitRunner);
  if (!negativeRunner.some((entry) => entry.includes('limit-only fixed ZIP name missing'))) errors.push('negative self-test failed: broken fixed ZIP name was not detected');
}

if (errors.length) {
  console.error('017 VALIDATOR SELF-CHECK: FAIL');
  errors.forEach((error) => console.error('-', error));
  process.exit(1);
}
console.log('017 VALIDATOR SELF-CHECK: PASS');
console.log(`validator files: ${files.length}`);
console.log('- negative self-test: corrupted product constant detected');
console.log('- negative self-test: broken fixed ZIP runner name detected');
