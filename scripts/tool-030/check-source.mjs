import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'app/[locale]/pdf-page-organizer/page.tsx',
  'components/pdf-page-organizer-page.tsx',
  'components/pdf-page-organizer-tool.tsx',
  'components/pdf-page-organizer-tool.module.css',
  'lib/tool-030-pdf.ts',
];
let fail = 0;
for (const file of requiredFiles) {
  const ok = fs.existsSync(file);
  console.log(ok ? 'PASS' : 'FAIL', file);
  if (!ok) fail++;
}
const src = requiredFiles.filter(fs.existsSync).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const tokens = [
  'tool030-root','tool030-file-input','tool030-page-grid','tool030-page-card','tool030-result-panel',
  'deleteSelected','duplicateSelected','rotateSelected','reverseOrder','insertBlankPage','moveSelected',
  'TOOL030_LIMITS','maxEditedPages','historySteps','thumbnailConcurrency','scheduleThumbnailRender','PDFDocument','copyPages','pdfjs-dist/webpack.mjs',
  'PDF Page Organizer','PDF ページ整理ツール','PDF 페이지 정리 도구','EXPERT POST','USE CASES','FAQPage','BreadcrumbList'
];
for (const token of tokens) {
  const ok = src.includes(token);
  console.log(ok ? 'PASS token' : 'FAIL token', token);
  if (!ok) fail++;
}
const protectedGlobals = [
  'app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css',
  'styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'
];
const projectRoot = process.env.TOOLBOX_PROJECT_ROOT ? path.resolve(process.env.TOOLBOX_PROJECT_ROOT) : process.cwd();
for (const rel of protectedGlobals) {
  const file = path.join(projectRoot, rel);
  if (!fs.existsSync(file)) { console.log('PASS protected-not-packaged', rel); continue; }
  const text = fs.readFileSync(file, 'utf8');
  const bad = /tool0?30|pdf-page-organizer/i.test(text);
  console.log(bad ? 'FAIL global contamination' : 'PASS protected', rel);
  if (bad) fail++;
}
process.exitCode = fail ? 1 : 0;
