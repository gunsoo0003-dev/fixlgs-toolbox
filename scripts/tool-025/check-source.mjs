import fs from 'node:fs';
const files=['components/id-passport-photo-maker-page.tsx','components/id-passport-photo-maker-tool.tsx','components/id-passport-photo-maker-tool.module.css','lib/tool-025-id-photo-policy.ts','app/[locale]/id-passport-photo-maker/page.tsx'];
let fail=0;
for(const f of files){if(!fs.existsSync(f)){console.error('MISSING',f);fail++;}}
if(fail) process.exit(1);
const src=fs.readFileSync(files[1],'utf8');
const policy=fs.readFileSync(files[3],'utf8');
const page=fs.readFileSync(files[0],'utf8');
for(const token of ['tool025-root','tool025-dropzone','tool025-preview','tool025-output-size','tool025-download','tool025-a4-download','scale=base*zoom','StableMobileImageFileInput','mobileCaptureMode="pixels"','createImageBitmap','ANIM','acTL','drawPhoto(ctx,canvas.width,canvas.height,false)','A4-210x297mm','jpegAtMost','tool025-online-rule','tool025-format','tool025-reset-settings','tool025-reset-all']) if(!src.includes(token)){console.error('MISSING TOKEN',token);fail++;}
for(const token of ['kr-passport-print','kr-passport-online','us-passport-print','jp-passport-print','uk-passport-print','ca-passport-print','general-30x40','general-35x45','maxFileBytes: 15 * 1024 * 1024','maxSourcePixels: 40_000_000','a4WidthMm: 210','a4HeightMm: 297','headMinMm:32, headMaxMm:36','headMinMm:29, headMaxMm:34','verifiedAt:"2026-08-14"']) if(!policy.includes(token)){console.error('MISSING POLICY',token);fail++;}
for(const token of ['025 · CONTENT IMAGE','FAQPage','WebApplication','026','id-passport-photo-maker']) if(!page.includes(token)){console.error('MISSING PAGE TOKEN',token);fail++;}
if(/tool024-(root|dropzone|preview)/.test(src)){console.error('COPY RESIDUE');fail++;}
console.log(fail?'SOURCE FAIL':'SOURCE PASS');process.exit(fail?1:0);
