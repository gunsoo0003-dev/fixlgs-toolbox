import { readFileSync } from 'node:fs';
const source = readFileSync('components/image-metadata-checker-tool.tsx','utf8');
const tests = ['tests/helpers/tool-018.ts','tests/tool-018-core.spec.ts','tests/tool-018-boundary.spec.ts','tests/tool-018-limit.spec.ts'].map((f)=>readFileSync(f,'utf8')).join('\n');
const selectors = [...new Set([...tests.matchAll(/getByTestId\(['"]([^'"]+)['"]\)/g)].map((m)=>m[1]))];
let failed = false;
for (const selector of selectors) {
  if (!source.includes(`data-testid=\"${selector}\"`) && !source.includes(`data-testid={'${selector}'}`)) {
    console.error(`[HARNESS_ERROR] selector not found in product source: ${selector}`);
    failed = true;
  }
}
if (!tests.includes('/ko/image-metadata-checker') || !tests.includes('/en/image-metadata-checker') || !tests.includes('/ja/image-metadata-checker')) {
  console.error('[HARNESS_ERROR] locale route expectations missing'); failed = true;
}

const runtimeConfig = readFileSync('playwright.tool018-runtime.config.ts','utf8');
const finalRunner = readFileSync('scripts/run-tool-018-final-validation.mjs','utf8');
const validationRunner = readFileSync('scripts/run-tool-018-validation.mjs','utf8');
const nextConfig = readFileSync('next.config.ts','utf8');
for (const [name, ok] of [
  ['isolated 3018 port', runtimeConfig.includes('127.0.0.1:3018')],
  ['no stale server reuse', runtimeConfig.includes('reuseExistingServer: false')],
  ['018 dedicated distDir env', runtimeConfig.includes('TOOL018_RUNTIME') && nextConfig.includes('.next-tool018-runtime')],
  ['standalone runner uses 018 config', validationRunner.includes('--config=playwright.tool018-runtime.config.ts')],
  ['FINAL reuses core-only', finalRunner.includes('test:toolbox:018-core-only')],
  ['FINAL reuses boundary-only', finalRunner.includes('test:toolbox:018-boundary-only')],
  ['FINAL reuses regression-only', finalRunner.includes('test:toolbox:018-regression-only')],
  ['FINAL reuses limit-only', finalRunner.includes('test:toolbox:018-limit-only')],
  ['FINAL includes common', finalRunner.includes('common-tool-additive.spec.ts')],
  ['FINAL includes JA terms', finalRunner.includes('check:ja-terms')],
]) {
  if (!ok) { console.error(`[HARNESS_ERROR] ${name} missing`); failed = true; }
}

console.log(`018 HARNESS CHECK: ${failed ? 'FAIL' : 'PASS'} (${selectors.length} selectors checked + runtime/final wiring)`);
process.exit(failed ? 2 : 0);
