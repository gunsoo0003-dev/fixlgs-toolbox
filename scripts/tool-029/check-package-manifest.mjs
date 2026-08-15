import fs from 'node:fs';
const manifest='docs/tool-029/PACKAGE_MANIFEST_029.txt';
const lines=fs.readFileSync(manifest,'utf8').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const fail=[];const seen=new Set();
for(const line of lines){
 if(seen.has(line))fail.push(`duplicate manifest entry: ${line}`);seen.add(line);
 if(!line.startsWith('fixlgs-toolbox/'))fail.push(`bad top-level: ${line}`);
 const rel=line.replace(/^fixlgs-toolbox\//,'');
 if(!fs.existsSync(rel)||!fs.statSync(rel).isFile())fail.push(`missing file: ${rel}`);
}
for(const forbidden of ['fixlgs-toolbox/app/globals.css','fixlgs-toolbox/styles/global-base.css','fixlgs-toolbox/styles/toolbox-common.css','fixlgs-toolbox/styles/toolbox-detail-common.css','fixlgs-toolbox/styles/legacy-site-sealed.css','fixlgs-toolbox/styles/legacy-tools-sealed.css','fixlgs-toolbox/lib/site.ts','fixlgs-toolbox/app/sitemap.ts'])if(seen.has(forbidden))fail.push(`protected file in package: ${forbidden}`);
if(!seen.has('fixlgs-toolbox/docs/tool-029/HANDOFF.txt'))fail.push('HANDOFF missing from package');
if(!seen.has('fixlgs-toolbox/docs/tool-029/original/FIXLGS_TOOLBOX_029_PDF_분할_페이지_추출기_최종제작전달서.pdf'))fail.push('original transfer PDF missing from package');
if(fail.length){console.error('TOOL029 PACKAGE MANIFEST FAIL');fail.forEach(x=>console.error('-',x));process.exit(1)}
console.log(`TOOL029 PACKAGE MANIFEST PASS | files=${lines.length}`);
