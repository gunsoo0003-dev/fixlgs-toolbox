import fs from 'node:fs';

let fail = 0;
const pass = (name, ok) => {
  console.log(`${ok ? '[PASS]' : '[FAIL]'} ${name}`);
  if (!ok) fail++;
};
const read = p => fs.readFileSync(p, 'utf8');

const lib = read('lib/tool-033-pdf-compressor.ts');
const tool = read('components/pdf-compressor-tool.tsx');
const preflight = read('tests/tool-033-preflight.spec.ts');
const core = read('tests/tool-033-core.spec.ts');
const feature = read('tests/tool-033-feature.spec.ts');
const limit = read('tests/tool-033-limit.spec.ts');
const config = read('playwright.tool033.config.ts');
const runner = read('scripts/tool-033/run-validation.mjs');
const pkg = JSON.parse(read('package.json'));

// Product state contract: checker must follow the current 4-state preset model, not legacy basic/strong.
pass('product default preset balanced', /TOOL033_DEFAULT_PRESET\s*=\s*"balanced"/.test(lib));
pass('product preset qualities 97/92/82', /high:\s*97/.test(lib) && /balanced:\s*92/.test(lib) && /size:\s*82/.test(lib));
pass('product custom range 55-98', /min:\s*55,\s*max:\s*98/.test(lib));
pass('product preset render scales 1.6/1.5/1.4', /"high"\) return 1\.6/.test(lib) && /"balanced"\) return 1\.5/.test(lib) && /"size"\) return 1\.4/.test(lib));
pass('legacy basic/strong state removed', !/mode===['"]basic|mode===['"]strong|setMode\(|basicHelp|strongHelp/.test(tool));

// Runtime checker inventory: preflight must catch the UI/state transition regressions that repeatedly escaped earlier tools.
for (const id of ['tool033-root','tool033-dropzone','tool033-file-input','tool033-file-info','tool033-workspace','tool033-preview-canvas','tool033-presets','tool033-preset-high','tool033-preset-balanced','tool033-preset-size','tool033-preset-custom','tool033-quality']) {
  pass(`preflight selector ${id}`, preflight.includes(id));
}
pass('preflight verifies upload state transition', /tool033-dropzone[\s\S]*not\.toBeVisible|tool033-dropzone[\s\S]*toHaveCount\(0\)/.test(preflight));
pass('preflight verifies immediate preview dimensions', /tool033-preview-canvas/.test(preflight) && /width[\s\S]*height/.test(preflight));
pass('preflight verifies balanced 92 default', /tool033-preset-balanced/.test(preflight) && /toHaveValue\(['"]92['"]\)/.test(preflight));
pass('feature verifies 97/92/82/custom 98', /toHaveValue\(['"]97['"]\)/.test(feature) && /toHaveValue\(['"]92['"]\)/.test(feature) && /toHaveValue\(['"]82['"]\)/.test(feature) && /fill\(['"]98['"]\)/.test(feature));
pass('core verifies result and download', /tool033-result/.test(core) && /tool033-download/.test(core));
pass('limit checker matches 50 MiB / 200 pages', /50\*1024\*1024/.test(limit) && /data-max-pages['"],['"]200/.test(limit));

// Harness chain and evidence contract.
const exactScripts = {
  'test:toolbox:033-preflight': 'node scripts/tool-033/run-validation.mjs preflight',
  'test:toolbox:033-core-only': 'node scripts/tool-033/run-validation.mjs core-only',
  'test:toolbox:033-boundary-only': 'node scripts/tool-033/run-validation.mjs boundary-only',
  'test:toolbox:033-feature-only': 'node scripts/tool-033/run-validation.mjs feature-only',
  'test:toolbox:033-regression-only': 'node scripts/tool-033/run-validation.mjs regression-only',
  'test:toolbox:033-limit-only': 'node scripts/tool-033/run-validation.mjs limit-only',
  'test:toolbox:033-final': 'node scripts/tool-033/run-validation.mjs final',
};
for (const [key, value] of Object.entries(exactScripts)) pass(`exact package script ${key}`, pkg.scripts?.[key] === value);
pass('playwright retains trace/video/screenshot', /trace:\s*["']retain-on-failure["']/.test(config) && /video:\s*["']retain-on-failure["']/.test(config) && /screenshot:\s*["']only-on-failure["']/.test(config));
pass('playwright has desktop and mobile projects', /desktop-033/.test(config) && /mobile-033/.test(config));
pass('runner final contains TypeScript + production build', /\['typescript'/.test(runner) && /\['production-build'/.test(runner));
pass('runner final contains every 033 runtime spec', ['preflight','core','boundary','feature','regression','limit'].every(n => runner.includes(`tool-033-${n}.spec.ts`)));
pass('runner copies Playwright evidence into result ZIP source', /captureRuntimeEvidence/.test(runner) && /evidence/.test(runner) && /test-results/.test(runner));
pass('checker contract is itself in static gate', /check-checker-contract\.mjs/.test(runner));

process.exitCode = fail ? 1 : 0;
