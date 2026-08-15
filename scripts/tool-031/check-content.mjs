#!/usr/bin/env node
import fs from 'node:fs';
const s=fs.readFileSync('components/pdf-page-number-watermark-page.tsx','utf8'); const errors=[];
for(const x of ['HOW TO USE','USE CASES','EXPERT POST','IMPORTANT NOTES','FAQ','FAQPage','BreadcrumbList','WebApplication','PDF 페이지 번호·워터마크 도구','PDF Page Number & Watermark Tool','PDF ページ番号・透かしツール']) if(!s.includes(x))errors.push(`content missing ${x}`);
const expert=(s.match(/\[\["/g)||[]).length;if(expert<3)errors.push('content arrays unexpectedly thin');
if(errors.length){for(const e of errors)console.error('[FAIL]',e);process.exit(1)} console.log('[PASS] TOOL031 content/SEO contract');
