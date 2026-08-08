import { existsSync, readFileSync } from 'node:fs';

const required = [
  'tests/helpers/tool-017.ts', 'tests/tool-017-preflight.spec.ts', 'tests/tool-017-core.spec.ts', 'tests/tool-017-regression.spec.ts', 'tests/tool-017-limit.spec.ts', 'tests/config/tool-017-limit-candidates.ts',
  'scripts/run-tool-017-preflight.mjs', 'scripts/run-tool-017-core.mjs', 'scripts/run-tool-017-boundary-only.mjs', 'scripts/run-tool-017-regression-only.mjs', 'scripts/run-tool-017-limit-only.mjs', 'scripts/run-tool-017-final-validation.mjs',
  'playwright.tool017-runtime.config.ts', 'playwright.tool017-core.config.ts', 'playwright.tool017-regression.config.ts', 'tests/tool-017-boundary.spec.ts', 'tests/tool-017-mobile-core.spec.ts', 'tests/tool-017-mobile-regression.spec.ts', 'package.json', '.gitignore',
  'components/image-watermark-tool.tsx', 'components/image-watermark-page.tsx',
  'test-fixtures/tool017-24mp.png', 'test-fixtures/tool017-over-24mp.png',
];
const errors = [];

function pngSize(file) {
  const bytes = readFileSync(file);
  if (bytes.length < 24 || bytes.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
for (const file of required) if (!existsSync(file)) errors.push(`missing ${file}`);

if (!errors.length) {
  const helper = readFileSync('tests/helpers/tool-017.ts', 'utf8');
  const core = readFileSync('tests/tool-017-core.spec.ts', 'utf8');
  const reg = readFileSync('tests/tool-017-regression.spec.ts', 'utf8');
  const lim = readFileSync('tests/tool-017-limit.spec.ts', 'utf8');
  const tool = readFileSync('components/image-watermark-tool.tsx', 'utf8');
  const page = readFileSync('components/image-watermark-page.tsx', 'utf8');
  const boundary = readFileSync('tests/tool-017-boundary.spec.ts', 'utf8');
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const finalRunner = readFileSync('scripts/run-tool-017-final-validation.mjs', 'utf8');

  const coreRunner = readFileSync('scripts/run-tool-017-core.mjs', 'utf8');
  const coreConfig = readFileSync('playwright.tool017-core.config.ts', 'utf8');
  const regressionConfig = readFileSync('playwright.tool017-regression.config.ts', 'utf8');
  const gitignore = readFileSync('.gitignore', 'utf8');

  if (!coreRunner.includes('--config=playwright.tool017-core.config.ts')) errors.push('core runner must always use dedicated tool017 core config');
  if (!coreConfig.includes('desktop-core') || !coreConfig.includes('mobile-core') || !coreConfig.includes('tool-017-mobile-core')) errors.push('core PC/mobile split config missing');
  if (!coreConfig.includes('reuseExistingServer: false') || !coreConfig.includes('TOOL017_RUNTIME')) errors.push('core current-source server isolation missing');
  if (!regressionConfig.includes('desktop-regression') || !regressionConfig.includes('mobile-regression') || !regressionConfig.includes('tool-017-mobile-regression')) errors.push('regression PC/mobile split config missing');
  if (!regressionConfig.includes('reuseExistingServer: false') || !regressionConfig.includes('TOOL017_REGRESSION')) errors.push('regression current-source server isolation missing');
  for (const ignored of ['/.next-tool017-regression/', '/.next-tool017-runtime/', '/test-results/', '/playwright-report/']) {
    if (!gitignore.includes(ignored)) errors.push(`gitignore missing validation artifact rule: ${ignored}`);
  }

  for (const scriptName of ['check:tool017-source','check:tool017-harness','check:tool017-validator','check:tool017-design','test:toolbox:017-preflight','test:toolbox:017-core-only','test:toolbox:017-boundary-only','test:toolbox:017-regression-only','test:toolbox:017-limit-only','test:toolbox:017-final']) {
    if (!pkg.scripts?.[scriptName]) errors.push(`package.json script missing: ${scriptName}`);
  }
  for (const marker of ["['core', ['run','test:toolbox:017-core-only']]", "['boundary', ['run','test:toolbox:017-boundary-only']]", "['regression', ['run','test:toolbox:017-regression-only']]", "['service-limit', ['run','test:toolbox:017-limit-only']]"]) {
    if (!finalRunner.includes(marker)) errors.push(`FINAL standalone runner reuse missing: ${marker}`);
  }
  if (!boundary.includes('repeat mode exposes density and spacing controls while single-position mode does not')) errors.push('boundary repeat/single-position visibility coverage missing');

  if (!helper.includes('/ko/image-watermark-tool') || !helper.includes('/en/image-watermark-tool') || !helper.includes('/ja/image-watermark-tool')) errors.push('locale route helper contract missing');
  if (!helper.includes('TOOL017_INITIAL_TESTIDS') || !helper.includes('TOOL017_EDITOR_TESTIDS') || !helper.includes('assertTool017EditorReady')) errors.push('helper must separate initial DOM selectors from post-upload editor selectors');
  if (!helper.includes('await assertTool017EditorReady(page)')) errors.push('upload helper must validate post-upload editor selectors after state is ready');

  const helperTestIds = [...helper.matchAll(/'((?:tool017-)[^']+)'/g)].map((match) => match[1]);
  const uniqueIds = [...new Set(helperTestIds)];
  for (const id of uniqueIds) {
    if (!tool.includes(`data-testid="${id}"`)) errors.push(`helper selector is not present in product DOM source: ${id}`);
  }

  if (!core.includes("toHaveText('017 · IMAGE EDIT')")) errors.push('core must exact-match hero eyebrow with toHaveText');
  if (core.includes("toContainText('017 · IMAGE EDIT')")) errors.push('substring hero assertion remains in core');
  if (!page.includes('<p className="toolbox-subpage-eyebrow">017 · IMAGE EDIT</p>')) errors.push('product hero eyebrow source mismatch');

  for (const marker of ['actual preview pixels', 'four preview corner regions', 'cancel stops the sequential queue', 'failure is isolated and retry-failed', 'ZIP downloads produce non-empty files', 'MIME and extension mismatch']) {
    if (!core.includes(marker)) errors.push(`core behavioral coverage missing: ${marker}`);
  }

  if (!reg.includes('PROTECTED_SLUGS') || !reg.includes("['ko','en','ja']") || !reg.includes('RELATED_SLUGS')) errors.push('regression route/language/related coverage missing');
  for (const marker of ['per-file byte candidate', 'total byte candidate', '24MP source/output candidate', 'text length candidate']) {
    if (!lim.includes(marker)) errors.push(`limit runtime boundary coverage missing: ${marker}`);
  }
  for (const marker of ['L.selectedFiles.candidate', 'L.perFileBytes.candidate', 'L.totalBytes.candidate', 'L.sourcePixels.candidate', 'L.outputPixels.candidate', 'L.textLength.candidate']) {
    if (!lim.includes(marker)) errors.push(`limit candidate config is not referenced: ${marker}`);
  }
  const exact = pngSize('test-fixtures/tool017-24mp.png');
  const above = pngSize('test-fixtures/tool017-over-24mp.png');
  if (!exact || exact.width * exact.height !== 24_000_000) errors.push('24MP candidate fixture is not exactly 24,000,000 pixels');
  if (!above || above.width * above.height <= 24_000_000) errors.push('above-24MP fixture does not exceed 24,000,000 pixels');
}

if (errors.length) {
  console.error('017 HARNESS STATIC PREFLIGHT: HARNESS_ERROR');
  errors.forEach((error) => console.error('-', error));
  process.exit(2);
}
console.log('017 HARNESS STATIC PREFLIGHT: PASS');
console.log('- helper testids cross-checked against actual product DOM source');
console.log('- hero uses exact assertion');
console.log('- core includes pixel/repeat/cancel/partial-failure/download behavior cases');
console.log('- limit includes file-size/total-size/pixel/text runtime boundaries');
