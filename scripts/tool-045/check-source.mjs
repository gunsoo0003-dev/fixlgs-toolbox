import fs from 'node:fs';

const must=[
  'app/[locale]/date-difference-calculator/page.tsx',
  'components/date-difference-calculator-page.tsx',
  'components/date-difference-calculator-tool.tsx',
  'components/date-difference-calculator-tool.module.css',
  'lib/tool-045-date-difference.ts',
  'tests/fixtures/tool-045/cases.json',
  'tests/tool-045-preflight.spec.ts',
  'tests/tool-045-core.spec.ts',
  'tests/tool-045-boundary.spec.ts',
  'tests/tool-045-feature.spec.ts',
  'tests/tool-045-regression.spec.ts',
  'tests/tool-045-limit.spec.ts'
];
let fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++};
for(const f of must)check(`exists ${f}`,fs.existsSync(f));

const tool=fs.readFileSync('components/date-difference-calculator-tool.tsx','utf8');
for(const id of [
  'tool045-root','tool045-workspace','tool045-start','tool045-end','tool045-include-start',
  'tool045-empty-result','tool045-error','tool045-reset','tool045-result','tool045-total-days',
  'tool045-weeks','tool045-calendar','tool045-weekdays','tool045-weekends'
])check(`selector ${id}`,tool.includes(id));
check('product performs no fetch/API call',!/(fetch\(|XMLHttpRequest|navigator\.sendBeacon)/.test(tool));

const page=fs.readFileSync('components/date-difference-calculator-page.tsx','utf8');
for(const token of [
  '045 · DATE & TIME','category/date-time','FAQPage','046','047','050',
  'toolbox-tool-expert-post--045','date-difference-calculator-tool.module.css'
])check(`page ${token}`,page.includes(token));
check('page uses JSON-LD',page.includes('application/ld+json')&&page.includes('JSON.stringify(jsonLd)'));
check('page exposes KO/EN/JA copy',/ko:\{/.test(page)&&/en:\{/.test(page)&&/ja:\{/.test(page));

const route=fs.readFileSync('app/[locale]/date-difference-calculator/page.tsx','utf8');
check('route has canonical/hreflang metadata',route.includes('alternates')&&route.includes('languages')&&route.includes('x-default'));
check('route points to date-difference slug',route.includes('/date-difference-calculator'));

const site=fs.readFileSync('lib/site.ts','utf8');
const sitemap=fs.readFileSync('app/sitemap.ts','utf8');
check('site registers TOOL045 slug',site.includes('date-difference-calculator'));
check('sitemap imports tool045Slug',sitemap.includes('tool045Slug'));
check('sitemap emits localized tool045 route',sitemap.includes('${baseUrl}/${locale}/${tool045Slug}'));



process.exitCode=fail?1:0;
