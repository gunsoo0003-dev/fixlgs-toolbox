import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
  ok ? pass++ : fail++;
};

const site = read('lib/site.ts');
const home = read('app/[locale]/page.tsx');
const hero = read('components/toolbox-home-hero.tsx');
const nav = read('components/tool-navigation.tsx');
const sitemap = read('app/sitemap.ts');
const categoryPage = read('app/[locale]/category/[categorySlug]/page.tsx');

console.log('=== FIXLGS TOOLBOX ADSENSE FINAL STATIC CHECK ===');

// 1) Public inventory / route registry
const publicBlock = site.match(/export const publicTools = \[([\s\S]*?)\] as const;/)?.[1] ?? '';
const toolNumbers = [...publicBlock.matchAll(/number:\s*(\d+)/g)].map((m) => Number(m[1]));
const expectedNumbers = Array.from({ length: 71 }, (_, i) => i + 1);
check('publicTools contains exactly TOOL001~071', JSON.stringify(toolNumbers) === JSON.stringify(expectedNumbers), `${toolNumbers.length} tools`);
check('public category slugs are 01~08 only', site.includes('export const publicCategorySlugs = categories.slice(0, 8).map'));

const slugDefs = new Map([...site.matchAll(/export const tool(\d{3})Slug\s*=\s*["']([^"']+)["']/g)].map((m) => [Number(m[1]), m[2]]));
let routeMissing = 0;
const dynamicToolRoute = read('app/[locale]/[toolSlug]/page.tsx');
for (const n of expectedNumbers) {
  const slug = slugDefs.get(n);
  const explicitRoute = slug && exists(`app/[locale]/${slug}/page.tsx`);
  const dynamicRoute = n <= 21 && dynamicToolRoute.includes(`tool${String(n).padStart(3, '0')}Slug`);
  if (!slug || (!explicitRoute && !dynamicRoute)) routeMissing++;
}
check('TOOL001~071 route coverage exists', routeMissing === 0, routeMissing ? `${routeMissing} missing` : '71/71');

// 2) Hidden future categories / sitemap
check('home exposes only first 8 categories', home.includes('siteCategories.slice(0, 8)') || home.includes('categoryBase.slice(0, 8)') || /const categories\s*=\s*categoryBase\.slice\(0,\s*8\)/.test(home));
check('sitemap exposes only first 8 categories', sitemap.includes('categories.slice(0, 8)'));
for (const slug of ['real-estate-build', 'qr-design-dev-seo', 'document-life-health-random']) {
  check(`future category not hardcoded in sitemap: ${slug}`, !sitemap.includes(`/category/${slug}`));
}

// 3) Home search and popular tools
check('home search is interactive client component', hero.includes('"use client"') && hero.includes('useState') && hero.includes('useMemo'));
check('search results use publicTools registry', hero.includes('publicTools.filter'));
check('search result cards link to localized tool slug', hero.includes('href={`/${locale}/${tool.slug}`}'));
check('search result cap is 8', hero.includes('.slice(0, 8)'));
check('home tool count shows 71+', hero.includes('<span>71+</span>'));
check('home no legacy 136+ badge', !hero.includes('136+'));

for (const token of ['tool028Slug', 'tool036Slug', 'tool045Slug', 'tool055Slug', 'tool066Slug']) {
  check(`popular tool route wired: ${token}`, home.includes(token));
}

// 4) Common NEXT / RELATED navigation
check('common ToolNavigation uses publicTools registry', nav.includes('publicTools.find') && nav.includes('publicTools.filter'));
check('next tool is conditional', nav.includes('{nextTool ? (') && nav.includes(') : null}'));
check('TOOL071 has no synthetic TOOL072 fallback', !nav.includes('72') && !nav.includes('tool072'));
for (const [locale, label] of [['ko', '도구 열기'], ['en', 'Open tool'], ['ja', 'ツールを開く']]) {
  check(`navigation CTA ${locale}`, nav.includes(`open: "${label}"`));
}
check('navigation links preserve locale', nav.includes('href={`/${locale}/${nextTool.slug}`}') && nav.includes('href={`/${locale}/${tool.slug}`}'));

const sourceFiles = [];
for (const dir of ['components', 'app/[locale]']) {
  const base = path.join(root, dir);
  const walk = (p) => {
    for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx|ts)$/.test(entry.name)) sourceFiles.push(full);
    }
  };
  walk(base);
}
const sourceText = sourceFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const toolNavRefs = [...sourceText.matchAll(/<ToolNavigation\s+locale=\{[^}]+\}\s+currentTool=\{(\d+)\}/g)].map((m) => Number(m[1]));
const uniqueToolNav = [...new Set(toolNavRefs)].sort((a, b) => a - b);
check('ToolNavigation applied to TOOL001~071', JSON.stringify(uniqueToolNav) === JSON.stringify(expectedNumbers), `${uniqueToolNav.length}/71`);

// 5) Fake-link / placeholder regressions
check('no href="#"', !/href\s*=\s*["']#["']/.test(sourceText));
check('no javascript:void(0)', !/javascript\s*:\s*void\s*\(\s*0\s*\)/i.test(sourceText));
check('no empty href', !/href\s*=\s*["']\s*["']/.test(sourceText));
const emptyOnClickPatterns = [/onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/, /onClick\s*=\s*\{\s*\(\s*[^)]*\s*\)\s*=>\s*\{\s*\}\s*\}/, /onClick\s*=\s*\{\s*[A-Za-z_$][\w$]*\s*=>\s*\{\s*\}\s*\}/];
const emptyOnClickFiles = sourceFiles.filter((file) => { const text = fs.readFileSync(file, 'utf8'); return emptyOnClickPatterns.some((pattern) => pattern.test(text)); });
check('no empty onClick handler', emptyOnClickFiles.length === 0, emptyOnClickFiles.length ? `${emptyOnClickFiles.length} files` : '0');
for (const legacy of ['tools.fixlgs.com', 'calc.fixlgs.com', 'data.fixlgs.com', 'random.fixlgs.com', 'studio.fixlgs.com']) {
  check(`no legacy tool domain: ${legacy}`, !sourceText.includes(legacy));
}

// 6) Category content strengthening 03~08
const dedicatedSlugs = ['content-image', 'pdf', 'text', 'date-time', 'unit-calc', 'business-finance'];
for (const slug of dedicatedSlugs) {
  check(`category guide dedicated branch: ${slug}`, categoryPage.includes(`categorySlug === "${slug}"`) || categoryPage.includes(`categorySlug === '${slug}'`));
}
check('category page has guide + expert + FAQ sections', ['toolbox-category-guide', 'toolbox-category-expert-post', 'toolbox-category-faq'].every((x) => categoryPage.includes(x)));

// 7) Public category count labels match current published tools
const expectedCounts = new Map([
  ['image-convert', 7], ['image-edit', 11], ['content-image', 7], ['pdf', 10],
  ['text', 9], ['date-time', 10], ['unit-calc', 11], ['business-finance', 6],
]);
for (const [slug, count] of expectedCounts) {
  const categoryIndex = site.indexOf(`slug: "${slug}"`);
  const nextIndex = site.indexOf('\n  {', categoryIndex + 1);
  const block = site.slice(categoryIndex, nextIndex === -1 ? site.length : nextIndex);
  check(`category count ${slug} = ${count}`, block.includes(`ko: "${count}개 사용 가능"`) && block.includes(`en: "${count} available"`) && block.includes(`ja: "${count}件利用可能"`));
}

console.log(`\nADSENSE FINAL STATIC CHECK: ${fail === 0 ? 'PASS' : 'FAIL'} (${pass}/${pass + fail})`);
process.exitCode = fail ? 1 : 0;
