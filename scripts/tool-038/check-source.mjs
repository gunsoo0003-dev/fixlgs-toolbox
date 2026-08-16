import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL(`../../${p}`,import.meta.url),'utf8');
const required=[
  'app/[locale]/case-sentence-format-converter/page.tsx',
  'components/case-sentence-format-converter-page.tsx',
  'components/case-sentence-format-converter-tool.tsx',
  'components/case-sentence-format-converter-tool.module.css',
  'lib/tool-038-case.ts',
  'tests/fixtures/tool-038/cases.json',
  'lib/site.ts','app/sitemap.ts','package.json'
];
let pass=0,fail=0;
function check(name,ok){console.log(`${ok?'PASS':'FAIL'} | ${name}`);ok?pass++:fail++;}
for(const f of required) check(`exists ${f}`,fs.existsSync(new URL(`../../${f}`,import.meta.url)));

const tool=read('components/case-sentence-format-converter-tool.tsx');
const css=read('components/case-sentence-format-converter-tool.module.css');
const page=read('components/case-sentence-format-converter-page.tsx');
const site=read('lib/site.ts');
const sitemap=read('app/sitemap.ts');
const pkg=JSON.parse(read('package.json'));

for(const [name,re] of [
  ['037-style local notice',/tool038-local-notice/],
  ['single active workspace',/tool038-workspace/],
  ['workspace drag state',/data-drag-active/],
  ['file input TXT MD CSV',/accept="\.txt,\.md,\.csv/],
  ['start dropzone',/tool038-start-dropzone/],
  ['loaded file card',/tool038-file-info/],
  ['complete reset',/const clearAll = \(\) =>/],
  ['new file confirmation dialog',/tool038-replace-dialog/],
  ['five modes',/\["upper".*"lower".*"title".*"sentence".*"first"\]/s],
  ['convert action',/tool038-convert/],
  ['result card',/tool038-result-card/],
  ['summary cards',/tool038-summary/],
  ['copy action',/tool038-copy/],
  ['download action',/tool038-download/],
]) check(name,re.test(tool));

for(const [name,re] of [
  ['activeWorkspace CSS',/\.activeWorkspace\{/],
  ['workspaceDragging CSS',/\.workspaceDragging\{/],
  ['037-compatible editorCard CSS',/\.editorCard\{/],
  ['037-compatible optionsCard CSS',/\.optionsCard\{/],
  ['037-compatible mobile 720',/@media\(max-width:720px\)/],
  ['JA long-copy overflow guard',/overflow-wrap:anywhere/],
]) check(name,re.test(css));

for(const [name,re] of [
  ['038 hero number',/>038 · TEXT</],
  ['NEXT WORK section',/NEXT WORK/],
  ['RELATED TOOLS section',/RELATED TOOLS/],
  ['HOW TO USE section',/HOW TO USE/],
  ['FORMAT GUIDE section',/FORMAT GUIDE/],
  ['IMPORTANT NOTES section',/IMPORTANT NOTES/],
  ['FAQ section',/>FAQ</],
  ['037 related link',/text-whitespace-linebreak-cleaner/],
]) check(name,re.test(page));

check('site slug registered',/tool038Slug = "case-sentence-format-converter"/.test(site));
check('site text card LIVE',/title: tool038Titles[\s\S]*status: "LIVE"[\s\S]*active: true/.test(site));
check('site locale href mapping includes index 2',/index === 2 \? \{ \.\.\.item, href: `\/\$\{locale\}\/\$\{tool038Slug\}` \}/.test(site));
check('sitemap imports tool038',/tool038Slug/.test(sitemap));
check('sitemap emits tool038 URL',/\$\{tool038Slug\}/.test(sitemap));
check('package source runner',pkg.scripts?.['check:tool038-source']==='node scripts/tool-038/check-source.mjs');
check('package logic runner',pkg.scripts?.['check:tool038-logic']==='node scripts/tool-038/check-logic.mjs');

console.log(`RESULT ${pass} PASS / ${fail} FAIL`);
process.exitCode=fail?1:0;
