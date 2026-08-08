import fs from 'node:fs';

const required = [
  'components/add-text-to-image-page.tsx',
  'components/add-text-to-image-tool.tsx',
  'components/add-text-to-image-tool.module.css',
  'lib/tool-016-service-limits.ts',
  'tests/helpers/tool-016.ts',
  'tests/tool-016-preflight.spec.ts',
  'tests/tool-016-core.spec.ts',
  'tests/tool-016-boundary.spec.ts',
  'tests/tool-016-regression.spec.ts',
  'tests/tool-016-limit.spec.ts',
  'scripts/tool-016-limit-fixtures.mjs',
  'scripts/check-tool-016-source.mjs',
  'scripts/check-tool-016-harness.mjs',
  'scripts/check-tool-016-design-structure.mjs',
  'scripts/check-tool-016-delivery-readiness.mjs',
  'scripts/run-tool-016-preflight.mjs',
  'scripts/run-tool-016-partial-validation.mjs',
  'scripts/run-tool-016-final-validation.mjs',
  'scripts/start-tool-016-runtime-server.mjs',
  'playwright.tool016-runtime.config.ts',
];

const errors = [];
for (const file of required) if (!fs.existsSync(file)) errors.push(`missing ${file}`);

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
for (const script of [
  'check:tool016-validator','check:tool016-source','check:tool016-harness','check:tool016-design','check:tool016-delivery',
  'test:toolbox:016-preflight','test:toolbox:016-core-only','test:toolbox:016-boundary-only',
  'test:toolbox:016-regression-only','test:toolbox:016-limit-only','test:toolbox:016-final',
]) if (typeof pkg.scripts?.[script] !== 'string') errors.push(`package script missing ${script}`);

if (!errors.length) {
  const route = fs.readFileSync('app/[locale]/[toolSlug]/page.tsx', 'utf8');
  const site = fs.readFileSync('lib/site.ts', 'utf8');
  const sitemap = fs.readFileSync('app/sitemap.ts', 'utf8');
  const tool = fs.readFileSync('components/add-text-to-image-tool.tsx', 'utf8');
  const page = fs.readFileSync('components/add-text-to-image-page.tsx', 'utf8');
  const limit = fs.readFileSync('tests/tool-016-limit.spec.ts', 'utf8');
  const regression = fs.readFileSync('tests/tool-016-regression.spec.ts', 'utf8');
  const finalRunner = fs.readFileSync('scripts/run-tool-016-final-validation.mjs', 'utf8');
  const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
  const runtimeConfig = fs.readFileSync('playwright.tool016-runtime.config.ts', 'utf8');

  const checks = [
    ['route wiring', route.includes('AddTextToImagePage') && route.includes('tool016Slug')],
    ['site slug/card', site.includes('tool016Slug = "add-text-to-image"') && site.includes('tool016Titles')],
    ['sitemap', sitemap.includes('tool016Slug')],
    ['service limits in product', tool.includes('TOOL016_SERVICE_LIMITS.maxFileBytes') && tool.includes('TOOL016_SERVICE_LIMITS.maxPixels') && tool.includes('TOOL016_SERVICE_LIMITS.maxSide') && tool.includes('TOOL016_SERVICE_LIMITS.maxLayers') && tool.includes('TOOL016_SERVICE_LIMITS.maxTextChars') && tool.includes('TOOL016_SERVICE_LIMITS.maxHistory')],
    ['multiple independent layers', tool.includes('duplicate') && tool.includes('tool016-layer') && tool.includes('selected')],
    ['drag positioning', tool.includes('pointerDown') && tool.includes('pointerMove') && tool.includes('setPointerCapture')],
    ['wrap/outline/shadow/background', tool.includes('function wrap(') && tool.includes('strokeText') && tool.includes('shadowBlur') && tool.includes('backgroundOpacity')],
    ['source-resolution export', tool.includes('cv.width=image.w') && tool.includes('cv.height=image.h')],
    ['png/jpg/webp export', tool.includes("type Out=\"jpg\"|\"png\"|\"webp\"") && tool.includes("format==='webp'")],
    ['jpg white background', tool.includes("format==='jpg'?'#ffffff':undefined")],
    ['mobile settings tabs', tool.includes('mobilePanel') && fs.readFileSync('components/add-text-to-image-tool.module.css','utf8').includes('.mobileTabs')],
    ['structured data', page.includes('WebApplication') && page.includes('FAQPage') && page.includes('BreadcrumbList')],
    ['limit boundaries', ['max-file-bytes','max-pixels','max-side','max-layers','max-text-chars','max-history'].every(x => limit.includes(x))],
    ['protected 015 regression reuse', pkg.scripts['test:toolbox:016-regression']?.includes('tool-015-regression.spec.ts')],
    ['016 ko/en/ja regression', regression.includes("['ko','en','ja']") || regression.includes("['ko', 'en', 'ja']")],
    ['final reuses standalone runners', ['016-core-only','016-boundary-only','016-regression-only','016-limit-only'].every(x => finalRunner.includes(x))],
    ['fixed final zip', finalRunner.includes('016_final_검수결과.zip')],
    ['016 isolated runtime config', runtimeConfig.includes('3017') && runtimeConfig.includes('reuseExistingServer: false') && runtimeConfig.includes('start-tool-016-runtime-server.mjs')],
    ['016 isolated runtime distDir', nextConfig.includes('TOOL016_RUNTIME') && nextConfig.includes('.next-tool016-runtime')],
    ['016 core/boundary/limit isolated', ['test:toolbox:016-core','test:toolbox:016-boundary','test:toolbox:016-limit'].every(k => pkg.scripts[k]?.includes('playwright.tool016-runtime.config.ts'))],
    ['016 final isolated common', finalRunner.includes('test:toolbox:016-common') && pkg.scripts['test:toolbox:016-common']?.includes('playwright.tool016-runtime.config.ts')],
  ];
  for (const [name, ok] of checks) if (!ok) errors.push(name);
}

if (errors.length) {
  console.error('016 VALIDATOR SELF-CHECK: FAIL');
  for (const error of errors) console.error('-', error);
  process.exit(1);
}
console.log('016 VALIDATOR SELF-CHECK: PASS');
console.log(`validator files: ${required.length}`);
