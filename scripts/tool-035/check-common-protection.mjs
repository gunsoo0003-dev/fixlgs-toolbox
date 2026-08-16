import fs from 'node:fs';
let fail=0;const protectedFiles=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'];
for(const file of protectedFiles){const src=fs.readFileSync(file,'utf8');const bad=/tool0?35|pdf-text-image-extractor/i.test(src);console.log(bad?'FAIL':'PASS',`protected ${file}`);if(bad)fail++;}
process.exitCode=fail?1:0;
