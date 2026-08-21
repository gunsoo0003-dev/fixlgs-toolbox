import fs from 'node:fs';
let pass=0,fail=0;const c=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);o?pass++:fail++};
const protectedFiles=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'];
for(const f of protectedFiles)c(`protected exists ${f}`,fs.existsSync(f));
const page=fs.readFileSync('components/tool-082-building-ratio-page.tsx','utf8');const css=fs.readFileSync('components/tool-082-building-ratio.module.css','utf8');
c('no legacy sealed references',!page.includes('legacy-site-sealed')&&!page.includes('legacy-tools-sealed')&&!css.includes('legacy-site-sealed')&&!css.includes('legacy-tools-sealed'));
c('tool style isolated to css module',!protectedFiles.some(f=>fs.existsSync(f)&&/tool082|building-ratio/i.test(fs.readFileSync(f,'utf8'))));
console.log(`RESULT TOOL082 COMMON FILE PROTECTION PASS=${pass} FAIL=${fail}`);process.exitCode=fail?1:0;
