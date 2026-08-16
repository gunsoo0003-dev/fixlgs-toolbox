import fs from 'node:fs';
let fail=0;
const src=fs.readFileSync('components/pdf-text-image-extractor-page.tsx','utf8')+'\n'+fs.readFileSync('components/pdf-text-image-extractor-tool.tsx','utf8');
const required=['PDF 텍스트·이미지 추출기','PDF Text & Image Extractor','PDFテキスト・画像抽出ツール','HOW TO USE','USE CASES','EXPERT POST','IMPORTANT NOTES','FAQPage','BreadcrumbList','OCR','텍스트 레이어','embedded','PNG fallback','원본 JPG','jpg-png-webp-image-converter','서버','server','サーバー'];
for(const token of required){const ok=src.includes(token);console.log(ok?'PASS':'FAIL',token);if(!ok)fail++;}
const overclaim=['원본 이미지 100% 무손실','guarantees perfect layout recovery','すべてのPDFを完全'];
for(const token of overclaim){const bad=src.includes(token);console.log(bad?'FAIL overclaim':'PASS overclaim-absent',token);if(bad)fail++;}
process.exitCode=fail?1:0;
