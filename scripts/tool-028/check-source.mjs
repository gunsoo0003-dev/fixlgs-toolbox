import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const files = [
  'app/[locale]/merge-pdf/page.tsx','components/merge-pdf-page.tsx','components/merge-pdf-tool.tsx',
  'components/merge-pdf-tool.module.css','lib/tool-028-pdf-policy.ts','lib/site.ts','app/sitemap.ts'
];
let fail = 0;
const need = (condition, message) => { console.log(`${condition ? '[PASS]' : '[FAIL]'} ${message}`); if (!condition) fail++; };
for (const file of files) need(fs.existsSync(path.join(root,file)), `exists ${file}`);
if (!fail) {
  const route = fs.readFileSync(path.join(root,files[0]),'utf8');
  const page = fs.readFileSync(path.join(root,files[1]),'utf8');
  const tool = fs.readFileSync(path.join(root,files[2]),'utf8');
  const css = fs.readFileSync(path.join(root,files[3]),'utf8');
  const policy = fs.readFileSync(path.join(root,files[4]),'utf8');
  const site = fs.readFileSync(path.join(root,files[5]),'utf8');
  const sitemap = fs.readFileSync(path.join(root,files[6]),'utf8');
  for (const token of ['merge-pdf','canonical','x-default','MergePdfPage']) need(route.includes(token), `route token ${token}`);
  for (const token of ['028 · PDF','HOW TO USE','WORKFLOW GUIDE','IMPORTANT NOTES','FAQPage','category/pdf']) need(page.includes(token), `page token ${token}`);
  for (const token of ['PDFDocument.create','copyPages','tool028-file-input','tool028-preview-dialog','normalizePdfFilename','getPdfJs','pdfjs-dist/webpack.mjs','aria-live','draggable','tool028-workspace','dragActive','text/tool028-index']) need(tool.includes(token), `tool token ${token}`);
  for (const token of ['maxFiles: 20','maxFileBytes: 30 * 1024 * 1024','maxTotalBytes: 100 * 1024 * 1024','maxTotalPages: 300','previewConcurrency: 1']) need(policy.includes(token), `approved policy token ${token}`);
  need(site.includes('tool028Slug = "merge-pdf"') && site.includes('tool028Titles') && site.includes('tool028Descriptions'),'site catalog registers TOOL028');
  need(sitemap.includes('tool028Slug'),'sitemap registers TOOL028');
  need(!tool.includes('fetch(') && !tool.includes('XMLHttpRequest') && !tool.includes('axios'), 'no product network upload call');
  need(!css.includes(':global('), 'module CSS has no :global override');
  need(!page.includes('legacy-') && !tool.includes('legacy-') && !css.includes('legacy-'), 'no legacy sealed dependency');
}
process.exit(fail ? 1 : 0);
