import fs from 'node:fs';
let fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++};
const css=fs.readFileSync('components/date-difference-calculator-tool.module.css','utf8');
for(const token of [
  'var(--tb-line)','var(--tb-panel)','var(--blue)','@media(max-width:720px)',
  '.workspace','.dateGrid','.primaryCard','.resultGrid','.expertPost45','text-wrap:balance'
])check(`CSS ${token}`,css.includes(token));

const page=fs.readFileSync('components/date-difference-calculator-page.tsx','utf8');
check('expert modifier is mounted in page',page.includes('styles.expertPost45')&&page.includes('toolbox-tool-expert-post--045'));
check('next-work 046 is present',page.includes('NEXT WORK')&&page.includes('<span>046</span>'));
check('related 047/050 are present',page.includes('n:"047"')&&page.includes('n:"050"'));

for(const f of [
  'app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css',
  'styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'
]){
  const s=fs.readFileSync(f,'utf8');
  check(`protected ${f} has no TOOL045 selector`,!/tool045|date-difference-calculator/i.test(s));
}

check('mobile date grid collapses',css.includes('@media(max-width:720px)')&&css.includes('.dateGrid{grid-template-columns:1fr}'));
check('mobile result grid collapses',css.includes('@media(max-width:720px)')&&css.includes('.resultGrid{grid-template-columns:1fr}'));
process.exitCode=fail?1:0;
