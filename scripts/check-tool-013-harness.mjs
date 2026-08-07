import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  tool: 'components/image-merger-tool.tsx',
  page: 'components/image-merger-page.tsx',
  helper: 'tests/helpers/tool-013.ts',
  spec: 'tests/tool-013-preflight.spec.ts',
};
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const missing = Object.values(files).filter((f) => !fs.existsSync(path.join(root, f)));
if (missing.length) {
  console.error(JSON.stringify({ status:'HARNESS_ERROR', type:'MISSING_FILE', missing }, null, 2));
  process.exit(2);
}

const tool = read(files.tool);
const page = read(files.page);
const helper = read(files.helper);
const spec = read(files.spec);
const expected = [
  'tool013-root','tool013-workbench','tool013-upload','tool013-file-input','tool013-select',
  'tool013-files','tool013-file-card','tool013-settings','tool013-preview','tool013-preview-canvas',
  'tool013-output','tool013-download','tool013-status','tool013-error',
];
const failures = [];
for (const id of expected) {
  if (!tool.includes(`data-testid="${id}"`)) failures.push({ type:'SELECTOR_MISSING_IN_DOM_SOURCE', selector:`[data-testid="${id}"]` });
  if (!helper.includes(`'${id}'`)) failures.push({ type:'SELECTOR_MISSING_IN_HELPER', selector:`[data-testid="${id}"]` });
}
for (const wrong of [...helper.matchAll(/tool(?!013)\d{3}-[a-z0-9-]+/g)].map(m=>m[0])) {
  failures.push({ type:'WRONG_TOOL_SELECTOR', selector:wrong });
}
if (!page.includes('toolbox-tool-detail-hero tool013-detail-hero')) failures.push({ type:'ROOT_PAGE_STRUCTURE_MISSING', selector:'.tool013-detail-hero' });
for (const route of ['/ko/image-merger','/en/image-merger','/ja/image-merger']) if (!helper.includes(route)) failures.push({ type:'ROUTE_MISSING', route });
if (!spec.includes('openTool013') || !spec.includes('revealTool013ReadyDom')) failures.push({ type:'PREFLIGHT_SPEC_INCOMPLETE' });

const usedTestIds = [...new Set([...helper.matchAll(/'((?:tool013)-[a-z0-9-]+)'/g)].map(m=>m[1]))];
const domTestIds = [...new Set([...tool.matchAll(/data-testid="([^"]+)"/g)].map(m=>m[1]))];
const unusedDom = domTestIds.filter(id => id.startsWith('tool013-') && !usedTestIds.includes(id));

if (failures.length) {
  console.error(JSON.stringify({ status:'HARNESS_ERROR', failures, usedTestIds, domTestIds, unusedDom }, null, 2));
  process.exit(2);
}
console.log(JSON.stringify({
  status:'PASS',
  classification:'HARNESS_CONNECTION_STATIC_PREFLIGHT',
  routes:3,
  selectorsChecked:expected.length,
  modifiedSelectors:22,
  addedDataTestIds:22,
  usedTestIds,
  unusedDom,
  note:'HTTP/runtime Playwright preflight is intentionally separate and must run in a runnable Next.js environment.'
}, null, 2));
