#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const root=process.cwd();
const reqFiles=[
  'components/pdf-page-number-watermark-tool.tsx',
  'components/pdf-page-number-watermark-tool.module.css',
  'components/pdf-page-number-watermark-page.tsx',
  'lib/tool-031-pdf.ts',
  'app/[locale]/pdf-page-number-watermark/page.tsx'
];
const errors=[];
for(const f of reqFiles) if(!fs.existsSync(path.join(root,f))) errors.push(`missing ${f}`);
const tool=fs.readFileSync(path.join(root,reqFiles[0]),'utf8');
const page=fs.readFileSync(path.join(root,reqFiles[2]),'utf8');
const helper=fs.readFileSync(path.join(root,reqFiles[3]),'utf8');
const route=fs.readFileSync(path.join(root,reqFiles[4]),'utf8');
for(const token of ['data-tool="031"','tool031-file-input','tool031-create','tool031-result','tool031-download','numberEnabled','numberStartPage','headerEnabled','footerEnabled','watermarkMode','watermarkOpacity','watermarkAnchor','resolvePages','PDFDocument.load','copyPages','drawImage']) if(!tool.includes(token)) errors.push(`tool token missing: ${token}`);
for(const token of ['all','except-first','except-last','odd','even','custom','RANGE_REVERSED','RANGE_OUT_OF_BOUNDS','maxPdfBytes','maxPages','maxLogoBytes']) if(!helper.includes(token)) errors.push(`helper token missing: ${token}`);
for(const token of ['PDF 페이지 번호·워터마크 도구','PDF Page Number & Watermark Tool','PDF ページ番号・透かしツール','EXPERT POST','FAQPage','031 · PDF']) if(!page.includes(token)) errors.push(`page token missing: ${token}`);
for(const token of ['canonical','x-default','pdf-page-number-watermark']) if(!route.includes(token)) errors.push(`route token missing: ${token}`);
if(/tool031-(guide|expert|caution|notice|result-info)/.test(fs.readFileSync(path.join(root,'app/globals.css'),'utf8'))) errors.push('global tool031 selector pollution');
for(const f of ['styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css']) if(fs.readFileSync(path.join(root,f),'utf8').includes('tool031')) errors.push(`legacy pollution ${f}`);
if(errors.length){for(const e of errors) console.error('[FAIL]',e);process.exit(1)}
console.log('[PASS] TOOL031 source/static contract');
