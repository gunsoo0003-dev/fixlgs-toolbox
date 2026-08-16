import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  component: 'components/list-sorter-duplicate-remover-tool.tsx',
  page: 'app/[locale]/list-sorter-duplicate-remover/page.tsx',
  wrapper: 'components/list-sorter-duplicate-remover-page.tsx',
  ops: 'lib/tool-039-list-operations.ts',
  site: 'lib/site.ts',
  sitemap: 'app/sitemap.ts',
  config: 'playwright.tool039.config.ts',
};
const requiredTestFiles = [
  'tests/tool-039-preflight.spec.ts',
  'tests/tool-039-core.spec.ts',
  'tests/tool-039-boundary.spec.ts',
  'tests/tool-039-feature.spec.ts',
  'tests/tool-039-regression.spec.ts',
  'tests/tool-039-limit.spec.ts',
];

const errors = [];
const warnings = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireText = (label, rel, needles) => {
  if (!exists(rel)) { errors.push(`${label}: MISSING ${rel}`); return; }
  const text = read(rel);
  for (const needle of needles) if (!text.includes(needle)) errors.push(`${label}: missing ${needle}`);
};

for (const [label, rel] of Object.entries(files)) {
  if (!exists(rel)) errors.push(`${label}: MISSING ${rel}`);
}
for (const rel of requiredTestFiles) if (!exists(rel)) errors.push(`test: MISSING ${rel}`);

if (exists(files.component)) {
  const s = read(files.component);
  const selectors = [
    'tool039-root','tool039-local-notice','tool039-file-input','tool039-workspace','tool039-start-dropzone',
    'tool039-file-button','tool039-source','tool039-reset','tool039-options','tool039-mode-dedupe',
    'tool039-mode-text','tool039-mode-numeric','tool039-mode-reverse','tool039-mode-shuffle',
    'tool039-reshuffle','tool039-result-card','tool039-result','tool039-summary','tool039-copy','tool039-download',
    'tool039-status','tool039-error','tool039-replace-dialog','tool039-replace-cancel','tool039-replace-confirm'
  ];
  for (const id of selectors) {
    const dynamicMode = /^tool039-mode-(dedupe|text|numeric|reverse|shuffle)$/.test(id) && s.includes('data-testid={`tool039-mode-${item}`}');
    const present = s.includes(`data-testid="${id}"`) || dynamicMode;
    if (!present) errors.push(`component: missing selector ${id}`);
  }
  for (const needle of [
    'onDragEnter={onDragEnter}','onDragOver={onDragOver}','onDragLeave={onDragLeave}','onDrop={onDrop}',
    'setDragActive(false)','setMode("dedupe")','setLoadedFile(null)','setPendingFile(null)',
    'navigator.clipboard.writeText(result.output)','new Blob([result.output]',
    'anchor.download = "processed-list.txt"','TOOL039_LIMIT_CANDIDATES'
  ]) if (!s.includes(needle)) errors.push(`component: missing contract ${needle}`);
  if ((s.match(/data-testid="tool039-workspace"/g) ?? []).length !== 1) errors.push('component: activeWorkspace selector count must be 1');
  if (!s.includes('data-drag-active={dragActive ? "true" : "false"}')) errors.push('component: drag state contract missing');
  if (!s.includes('accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"')) errors.push('component: accepted file contract missing');
  if (s.includes('maxLength') || s.includes('slice(0, TOOL039_LIMIT_CANDIDATES')) warnings.push('component: source contains hard-limit-looking patterns; inspect manually');
}

if (exists(files.ops)) {
  const s = read(files.ops);
  for (const needle of [
    'export const TOOL039_LIMIT_CANDIDATES', 'export function parseTool039Lines', 'export function dedupeTool039Lines',
    'export function textSortTool039Lines', 'export function numericSortTool039Lines', 'export function shuffleTool039Lines',
    'export function transformTool039', 'Intl.Collator', 'Number.isFinite', 'new Set<string>()'
  ]) if (!s.includes(needle)) errors.push(`ops: missing ${needle}`);
}

if (exists(files.page)) {
  const s = read(files.page);
  for (const needle of ['generateMetadata','alternates','canonical','x-default','/ko/list-sorter-duplicate-remover','/en/list-sorter-duplicate-remover','/ja/list-sorter-duplicate-remover']) {
    if (!s.includes(needle)) errors.push(`page: missing ${needle}`);
  }
}
if (exists(files.site)) {
  const s = read(files.site);
  if (!/tool039Slug\s*=/.test(s) || !s.includes('list-sorter-duplicate-remover')) errors.push('site: TOOL039 slug missing');
}
if (exists(files.sitemap)) {
  const s = read(files.sitemap);
  for (const needle of ['tool039Slug','/${locale}/${tool039Slug}']) if (!s.includes(needle)) errors.push(`sitemap: missing ${needle}`);
}
if (exists(files.config)) {
  const s = read(files.config);
  for (const needle of ['tool-039-(preflight|core|boundary|feature|regression|limit)', '3039', 'desktop-039', 'mobile-039', 'test-results/tool039-runtime.json']) if (!s.includes(needle)) errors.push(`config: missing ${needle}`);
}


const runner = 'scripts/tool-039/run-validation.mjs';
if (exists(runner)) {
  const r = read(runner);
  if (!r.includes("process.execPath")) errors.push('runner: must spawn Playwright through process.execPath for Windows compatibility');
  if (r.includes("'npx.cmd'") || r.includes('\"npx.cmd\"')) errors.push('runner: npx.cmd shell spawn is forbidden');
  if (!r.includes("'--config=playwright.tool039.config.ts'")) errors.push('runner: config binding missing');
  if (!r.includes("'--workers=1'")) errors.push('runner: workers=1 missing');
  if (!r.includes('검수결과.zip')) errors.push('runner: Desktop result ZIP contract missing');
  if (!r.includes('ZIP=${zipPath}')) errors.push('runner: Desktop ZIP path output missing');
  if (r.includes('test-results/tool039') && r.includes('result.txt')) errors.push('runner: stale internal TXT result path remains');
}
const finalRunner = 'scripts/run-tool-039-final-validation.mjs';
if (exists(finalRunner)) {
  const f = read(finalRunner);
  if (f.includes("npm.cmd") || f.includes("npm run")) errors.push('final-runner: npm shell spawn is forbidden');
  if (!f.includes("process.execPath")) errors.push('final-runner: must use direct Node executables');
  if (!f.includes("'run-validation.mjs'") || !f.includes("'tool-039'")) errors.push('final-runner: delegated final runner missing');
}
const pkg = JSON.parse(read('package.json'));
if (!String(pkg.scripts['check:tool039-static']||'').includes('run-step-summary.mjs static')) errors.push('package: static result script not bound to ZIP summary runner');
if (!String(pkg.scripts['check:tool039-main']||'').includes('run-step-summary.mjs main')) errors.push('package: main result script not bound to ZIP summary runner');
if (!String(pkg.scripts['check:tool039-source']||'').includes('run-step-summary.mjs source')) errors.push('package: source result script not bound to ZIP summary runner');
for (const key of ['check:tool039-source','test:toolbox:039','test:toolbox:039-final']) {
  if (!pkg.scripts?.[key]) warnings.push(`package: missing recommended script ${key}`);
}

const inventory = {
  generatedAt: new Date().toISOString(),
  tool: '039',
  sourceFiles: files,
  testFiles: requiredTestFiles,
  gates: ['preflight','core','boundary','feature','regression','limit','final'],
  contracts: {
    singleActiveWorkspace: true,
    completeReset: true,
    fileReplacementConfirmation: true,
    resultCopy: true,
    resultDownload: true,
    koEnJa: true,
    protectedSeoRoutes: true,
    limitIsCandidateUntilApproval: true,
  },
  errors,
  warnings,
  status: errors.length === 0 ? 'PASS' : 'FAIL',
};
fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
fs.writeFileSync(path.join(root, 'test-results/tool039-source-inventory.json'), JSON.stringify(inventory, null, 2));
console.log(`TOOL039 SOURCE SELF-CHECK: ${inventory.status}`);
console.log(`ERRORS=${errors.length} WARNINGS=${warnings.length}`);
if (errors.length) for (const e of errors) console.log(`FAIL | ${e}`);
if (warnings.length) for (const w of warnings) console.log(`WARN | ${w}`);
if (!errors.length) console.log('SENTINEL=TOOL039_SOURCE_SELF_CHECK_PASS');
process.exit(errors.length ? 1 : 0);
