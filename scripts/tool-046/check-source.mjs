import fs from 'node:fs';
const must=[
  'app/[locale]/date-add-subtract-calculator/page.tsx',
  'components/date-add-subtract-calculator-page.tsx',
  'components/date-add-subtract-calculator-tool.tsx',
  'components/date-add-subtract-calculator-tool.module.css',
  'lib/tool-046-date-arithmetic.ts','tests/fixtures/tool-046/cases.json',
  'playwright.tool046.config.ts',
  ...['preflight','core','boundary','feature','regression','limit'].map(x=>`tests/tool-046-${x}.spec.ts`)
];
let fail=0;const check=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);if(!o)fail++};
for(const f of must)check(`exists ${f}`,fs.existsSync(f));
const tool=fs.readFileSync('components/date-add-subtract-calculator-tool.tsx','utf8');
for(const id of ['tool046-root','tool046-workspace','tool046-start-date','tool046-direction','tool046-unit','tool046-quantity','tool046-reset','tool046-calculate','tool046-result','tool046-result-date','tool046-weekday','tool046-copy','tool046-error'])check(`selector ${id}`,tool.includes(`data-testid="${id}"`));
for(const token of ['type="date"','type="number"','min="0"','step="1"','aria-live="polite"','role="alert"','role="status"'])check(`runtime contract ${token}`,tool.includes(token));
for(const stateToken of ['setDirection("add")','setUnit("day")','setQuantity("7")','setResult("")','setError("")','setStatus("")'])check(`reset/state contract ${stateToken}`,tool.includes(stateToken));
check('quick presets are add-only and execute immediately',tool.includes('setDirection("add")')&&tool.includes('run("add",u as DateUnit,String(q))'));
check('result is state-mounted only',/result\?<><p className=\{styles\.resultDate\}/.test(tool));
check('copy requires mounted result',tool.includes('if(!result)return'));
check('no network/storage logging',!/(fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|console\.(log|info|debug))/i.test(tool));
const page=fs.readFileSync('components/date-add-subtract-calculator-page.tsx','utf8');
for(const token of ['046 · DATE & TIME','category/date-time','FAQPage','045','047','050','051','toolbox-tool-expert-post','toolbox-tool-detail-hero--single-line-description','toolbox-tool-detail-body','toolbox-next-work','toolbox-tool-guide','toolbox-tool-format-guide','toolbox-tool-info-band','toolbox-tool-faq'])check(`page ${token}`,page.includes(token));
for(const localeToken of ['날짜 더하기·빼기 계산기','Date Add & Subtract Calculator','日付加算・減算計算ツール'])check(`localized page copy ${localeToken}`,page.includes(localeToken));
const route=fs.readFileSync('app/[locale]/date-add-subtract-calculator/page.tsx','utf8');
check('canonical hreflang x-default',route.includes('alternates')&&route.includes('languages')&&route.includes('x-default'));
for(const locale of ['ko','en','ja'])check(`route metadata ${locale}`,route.includes(`${locale}:{title:`));
const site=fs.readFileSync('lib/site.ts','utf8'),map=fs.readFileSync('app/sitemap.ts','utf8');
check('site registers tool046',site.includes('tool046Slug')&&site.includes('date-add-subtract-calculator'));
check('sitemap emits tool046',map.includes('tool046Slug')&&map.includes('${baseUrl}/${locale}/${tool046Slug}'));
process.exitCode=fail?1:0;
