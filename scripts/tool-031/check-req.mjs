#!/usr/bin/env node
import fs from 'fs';
const files=['components/pdf-page-number-watermark-tool.tsx','components/pdf-page-number-watermark-page.tsx','lib/tool-031-pdf.ts'];
const s=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const req=[
 ['REQ-031-001','page number','numberEnabled'],['REQ-031-002','starting number','numberStart'],['REQ-031-003','header','headerEnabled'],['REQ-031-004','footer','footerEnabled'],['REQ-031-005','text watermark','watermarkText'],['REQ-031-006','logo watermark','watermarkMode'],['REQ-031-007','position','watermarkAnchor'],['REQ-031-008','opacity','watermarkOpacity'],['REQ-031-009','page range','resolvePages'],['REQ-031-010','all range','except-first'],['REQ-031-011','odd/even','odd'],['REQ-031-012','custom range','customRange'],['REQ-031-013','preview','buildPreview'],['REQ-031-014','regenerate','createPdf'],['REQ-031-015','local processing','서버'],['REQ-031-016','KO','PDF 페이지 번호·워터마크 도구'],['REQ-031-017','EN','PDF Page Number & Watermark Tool'],['REQ-031-018','JA','PDF ページ番号・透かしツール'],['REQ-031-019','limits','maxPdfBytes'],['REQ-031-020','page count preserved','getPageCount()!==pageCount']
];
let fail=0;for(const [id,name,token] of req){const ok=s.includes(token);console.log(ok?'[PASS]':'[FAIL]',id,name);if(!ok)fail++}console.log(`REQ checked=${req.length} fail=${fail}`);process.exit(fail?1:0);
