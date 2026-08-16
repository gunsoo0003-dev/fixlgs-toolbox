import fs from 'node:fs';
const checks = [];
const read = (file) => fs.readFileSync(file, 'utf8');
function must(file, token, label = token) {
  const ok = fs.existsSync(file) && read(file).includes(token);
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${label}`);
  checks.push(ok);
}
must('lib/site.ts', 'export const tool036Slug = "character-document-counter" as const;', 'site slug');
must('lib/site.ts', 'export const tool036Titles', 'site titles');
must('lib/site.ts', '"text": [', 'text category preset');
must('lib/site.ts', 'categorySlug === "text"', 'localized text category route mapping');
must('app/sitemap.ts', 'tool036Slug', 'sitemap import/entry');
must('package.json', 'test:toolbox:036-final', 'package FINAL script');
must('app/[locale]/character-document-counter/page.tsx', 'CharacterDocumentCounterPage', 'route page');
const site = read('lib/site.ts');
const textCategory = /slug: "text"[\s\S]*?toolCountLabel: \{ ko: "1개 사용 가능", en: "1 available", ja: "1件利用可能" \}/.test(site);
console.log(`[${textCategory ? 'PASS' : 'FAIL'}] text category availability label`); checks.push(textCategory);
if (checks.some(x => !x)) process.exit(1);
