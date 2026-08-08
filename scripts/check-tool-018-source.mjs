import { existsSync, readFileSync } from 'node:fs';

const required = [
  'components/image-metadata-checker-page.tsx',
  'components/image-metadata-checker-tool.tsx',
  'components/image-metadata-checker-tool.module.css',
  'lib/image-metadata.ts',
  'tests/helpers/tool-018.ts',
  'tests/config/tool-018-limit-candidates.ts',
  'tests/tool-018-preflight.spec.ts',
  'tests/tool-018-core.spec.ts',
  'tests/tool-018-boundary.spec.ts',
  'tests/tool-018-regression.spec.ts',
  'tests/tool-018-limit.spec.ts',
  'test-fixtures/tool-018/header-only-corrupt.jpg',
  'test-fixtures/tool-018/extended-exif.jpg',
  'test-fixtures/tool-018/ppi-cm.jpg',
  'test-fixtures/tool-018/metadata-icc.png',
  'test-fixtures/tool-018/metadata-icc.webp',
];
let failed = false;
for (const file of required) {
  if (!existsSync(file)) { console.error(`[PRODUCT_FAIL] missing 018 file: ${file}`); failed = true; }
}
if (!failed) {
  const tool = readFileSync('components/image-metadata-checker-tool.tsx','utf8');
  const parser = readFileSync('lib/image-metadata.ts','utf8');
  const page = readFileSync('components/image-metadata-checker-page.tsx','utf8');
  const route = readFileSync('app/[locale]/[toolSlug]/page.tsx','utf8');
  const site = readFileSync('lib/site.ts','utf8');
  const sitemap = readFileSync('app/sitemap.ts','utf8');
  const mustTool = ['softwareInfo','metadataOpen','copyValue','ppiInvalid','data-original-icc','data-clean-icc','tool018-root','tool018-input','tool018-basic-info','tool018-print-info','tool018-camera-info','tool018-gps-info','tool018-metadata-details','tool018-remove-metadata','tool018-removal-result','tool018-remove-all','selected.analysis?.hasGps'];
  for (const token of mustTool) if (!tool.includes(token)) { console.error(`[PRODUCT_FAIL] missing source token: ${token}`); failed = true; }
  const mustParser = ['analyzeImageFile','stripPrivacyMetadata','estimatedPrintSize','GPSLatitude','DateTimeOriginal','XResolution','LensSpecification','MeteringMode','validStructure','displayOrientation','stripJpeg','stripPng','stripWebp'];
  for (const token of mustParser) if (!parser.includes(token)) { console.error(`[PRODUCT_FAIL] missing metadata implementation token: ${token}`); failed = true; }
  for (const token of ['WebApplication','FAQPage','BreadcrumbList','image-metadata-checker','USE CASES','examplesTitle']) if (!page.includes(token)) { console.error(`[PRODUCT_FAIL] missing page/SEO token: ${token}`); failed = true; }
  for (const [name, text, tokens] of [
    ['route', route, ['ImageMetadataCheckerPage','tool018Slug']],
    ['site', site, ['tool018Slug','tool018Titles','tool018Descriptions']],
    ['sitemap', sitemap, ['tool018Slug']],
  ]) for (const token of tokens) if (!text.includes(token)) { console.error(`[PRODUCT_FAIL] missing 018 internal integration token in ${name}: ${token}`); failed = true; }
  if (/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(tool + parser)) { console.error('[PRODUCT_FAIL] 018 contains unexpected network-transfer code'); failed = true; }
}
console.log(`018 SOURCE CHECK: ${failed ? 'FAIL' : 'PASS'}`);
process.exit(failed ? 1 : 0);
