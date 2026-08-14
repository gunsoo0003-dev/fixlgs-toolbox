import fs from "node:fs";
const files=[
  "components/pdf-to-image-converter-tool.tsx",
  "components/pdf-to-image-converter-page.tsx",
  "components/pdf-to-image-converter-tool.module.css",
  "lib/tool-027-pdf-image.ts",
  "app/[locale]/pdf-to-image-converter/page.tsx",
];
let fail=0; const need=(ok,msg)=>{console.log(ok?"PASS":"FAIL",msg); if(!ok) fail++;};
for(const f of files) need(fs.existsSync(f),`exists ${f}`);
const src=files.filter(fs.existsSync).map(f=>fs.readFileSync(f,"utf8")).join("\n");
for(const token of [
  "TOOL027_LIMITS","maxFileBytes: 50 * 1024 * 1024","maxPages: 100","maxScale: 3","maxCanvasPixels: 55_000_000",
  "pdf-to-image-converter","tool027-root","tool027-dropzone","tool027-file-input","tool027-convert","tool027-results","tool027-export-zip",
  "createStoredZip","pdfjs-dist/webpack.mjs","parseTool027PageRange","tool027OutputName","FAQPage","BreadcrumbList","EXPERT POST"
]) need(src.includes(token),`source token ${token}`);
for(const f of ["app/globals.css","styles/global-base.css","styles/toolbox-common.css","styles/toolbox-detail-common.css","styles/legacy-site-sealed.css","styles/legacy-tools-sealed.css"]){
  if(!fs.existsSync(f)) continue; const s=fs.readFileSync(f,"utf8"); need(!/tool0?27|pdf-to-image-converter/i.test(s),`no common CSS contamination ${f}`);
}
process.exitCode=fail?1:0;
