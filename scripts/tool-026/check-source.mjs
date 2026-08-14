import fs from "node:fs";
import path from "node:path";

const files=[
  "components/image-to-pdf-tool.tsx",
  "components/image-to-pdf-page.tsx",
  "components/image-to-pdf-tool.module.css",
  "lib/tool-026-pdf.ts",
  "app/[locale]/image-to-pdf/page.tsx",
];

let fail=0;
for(const f of files){
  if(!fs.existsSync(f)){console.error("FAIL missing",f);fail++;}
  else console.log("PASS",f);
}

const src=files.filter(f=>fs.existsSync(f)).map(f=>fs.readFileSync(f,"utf8")).join("\n");
const required=[
  "PDF_LIMITS",
  "maxFiles: 20",
  "maxFileBytes: 15 * 1024 * 1024",
  "maxTotalBytes: 80 * 1024 * 1024",
  "maxPixelsPerFile: 24_000_000",
  "maxMarginMm: 50",
  "image-to-pdf",
  "tool026-root",
  "tool026-create",
  "tool026-download",
  "A4",
  "Letter",
  "auto",
  "landscape",
  "portrait",
  "buildPdfFromJpegs",
  "DCTDecode",
  "FAQPage",
  "BreadcrumbList",
  "USE CASES",
  "EXPERT POST",
  "영수증 JPG 6장",
  "PNG 안내 이미지 3장",
  "세로·가로 사진 10장",
  "이미지 PDF와 OCR PDF는 목적이 다름",
];
for(const token of required){
  if(!src.includes(token)){console.error("FAIL token",token);fail++;}
  else console.log("PASS token",token);
}

const globalFiles=[
  "app/globals.css",
  "styles/global-base.css",
  "styles/toolbox-common.css",
  "styles/toolbox-detail-common.css",
  "styles/theme.css",
  "styles/toolbox-compat.css",
  "styles/legacy-site-sealed.css",
  "styles/legacy-tools-sealed.css",
];

// The sub-workshop delivery ZIP intentionally excludes protected common CSS.
// If an integrated project root is supplied (or the script is run in the full
// project), scan those files. Otherwise verify that protected globals were not
// accidentally packaged and do not fail merely because they are absent.
const explicitProjectRoot=process.env.TOOLBOX_PROJECT_ROOT?.trim();
const scanRoot=explicitProjectRoot ? path.resolve(explicitProjectRoot) : process.cwd();
let scannedAnyGlobal=false;
for(const f of globalFiles){
  const candidate=path.join(scanRoot,f);
  if(fs.existsSync(candidate)){
    scannedAnyGlobal=true;
    const s=fs.readFileSync(candidate,"utf8");
    if(/tool0?26|image-to-pdf/i.test(s)){console.error("FAIL global contamination",f);fail++;}
    else console.log("PASS protected",f);
  } else if(fs.existsSync(f)){
    // Defensive fallback for unusual cwd handling.
    scannedAnyGlobal=true;
    const s=fs.readFileSync(f,"utf8");
    if(/tool0?26|image-to-pdf/i.test(s)){console.error("FAIL global contamination",f);fail++;}
    else console.log("PASS protected",f);
  } else {
    console.log("PASS protected-not-packaged",f);
  }
}

if(!scannedAnyGlobal){
  console.log("INFO common CSS content scan skipped: protected globals are intentionally absent from this delivery package.");
  console.log("INFO integrated scan: set TOOLBOX_PROJECT_ROOT=<project-root> or run this script from the full project root.");
}

process.exitCode=fail?1:0;
