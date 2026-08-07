import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
const tool = read('components/image-merger-tool.tsx');
const page = read('components/image-merger-page.tsx');
const spec = read('tests/tool-013-limit.spec.ts');
const runner = read('scripts/run-tool-013-limit-only.mjs');
const profile = read('tests/helpers/tool-013-limit-profile.ts');
const commandSource = read('package.json');
const checks = [
  ['service image count 20 applied', tool.includes('const SERVICE_MAX_IMAGES = 20;') && tool.includes('SERVICE_MAX_IMAGES - currentCount')],
  ['service side 10000 applied', tool.includes('const SERVICE_MAX_SIDE = 10_000;') && tool.includes('layout.width > SERVICE_MAX_SIDE')],
  ['service pixels 25M applied', tool.includes('const SERVICE_MAX_PIXELS = 25_000_000;') && tool.includes('layout.pixels > SERVICE_MAX_PIXELS')],
  ['technical safety guard retained', tool.includes('const MAX_SIDE_WARN = 12000;') && tool.includes('const MAX_PIXELS_WARN = 64_000_000;') && tool.includes('const MAX_SIDE_BLOCK = 16384;') && tool.includes('const MAX_PIXELS_BLOCK = 100_000_000;')],
  ['three-language service messages', tool.includes('최대 20장') && tool.includes('up to 20 images') && tool.includes('最大20枚') && tool.includes('25 million total pixels')],
  ['three-language FAQ limit notice', page.includes('한 번에 최대 20장') && page.includes('up to 20 images at a time') && page.includes('一度に最大20枚')],
  ['profile marks final service limit', profile.includes('주작업장 확정 서비스 상한') && profile.includes('imageCount: 20') && profile.includes('outputMaxSide: 10_000') && profile.includes('outputMaxPixels: 25_000_000')],
  ['exact 20 and 21 count test', spec.includes('accepts 20 and rejects the 21st')],
  ['exact 10000 and 10001 side test', spec.includes('allows exactly 10000px and blocks 10001px')],
  ['exact 25M and over test', spec.includes('allows exactly 25M') && spec.includes('tool013-limit-ratio-2x1.png')],
  ['candidate downloads are real', (spec.match(/waitForEvent\('download'\)/g) || []).length >= 2],
  ['recovery after block', spec.includes('service block recovers immediately') && spec.includes("fill('1200')")],
  ['result zip utility reused', runner.includes('createValidationResultPackage') && runner.includes("validationType: 'limit-only'")],
  ['package commands connected', commandSource.includes('test:toolbox:013-limit-only') && commandSource.includes('check:tool013-limit')],
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}`); if (!ok) failed++; }
console.log(`TOTAL ${checks.length} | PASS ${checks.length-failed} | FAIL ${failed}`);
process.exit(failed ? 1 : 0);
