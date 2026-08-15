import fs from 'node:fs';
const files=['app/[locale]/split-extract-pdf/page.tsx','components/split-extract-pdf-page.tsx','components/split-extract-pdf-tool.tsx','components/split-extract-pdf-tool.module.css','lib/tool-029-pdf-policy.ts'];
const fail=[];for(const f of files)if(!fs.existsSync(f))fail.push(`MISSING ${f}`);
if(!fail.length){
 const tool=fs.readFileSync(files[2],'utf8'), page=fs.readFileSync(files[1],'utf8'), policy=fs.readFileSync(files[4],'utf8');
 for(const token of ['tool029-root','tool029-file-input','tool029-mode-${key}','copyPages','createStoredZip','pdfjs-dist'])if(!tool.includes(token))fail.push(`MISSING TOOL TOKEN ${token}`);
 for(const token of ['029 · PDF','HOW TO USE','PRACTICAL GUIDE','IMPORTANT NOTES','FAQPage','split-extract-pdf'])if(!page.includes(token))fail.push(`MISSING PAGE TOKEN ${token}`);
 for(const token of ['maxFileBytes: 50 * MIB','maxPages: 300','maxOutputFiles: 300','maxRangeItems: 100','TOOL029_ACTIVE_LIMITS'])if(!policy.includes(token))fail.push(`MISSING POLICY TOKEN ${token}`);
 for(const f of ['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css']){const s=fs.readFileSync(f,'utf8');if(/tool029|split-extract-pdf/i.test(s))fail.push(`GLOBAL CSS POLLUTION ${f}`);}
}
if(fail.length){console.error('TOOL029 SOURCE FAIL');fail.forEach(x=>console.error('-',x));process.exit(1)}console.log('TOOL029 SOURCE PASS');
