import fs from 'node:fs';
const page=fs.readFileSync('components/add-text-to-image-page.tsx','utf8');
const tool=fs.readFileSync('components/add-text-to-image-tool.tsx','utf8');
const css=fs.readFileSync('components/add-text-to-image-tool.module.css','utf8');
const requiredPage=['toolbox-tool-detail-hero','toolbox-subpage-back','016 · IMAGE EDIT','toolbox-tool-detail-badge','toolbox-tool-detail-body','toolbox-next-work','NEXT WORK','toolbox-tool-guide','HOW TO USE','EXPERT POST','IMPORTANT NOTES','toolbox-tool-faq'];
const requiredTool=['toolbox-workbench','toolbox-workbench-upload','toolbox-workbench-topline','toolbox-upload-focus','toolbox-workbench-editor-grid','toolbox-workbench-preview-card','toolbox-workbench-settings-card','toolbox-workbench-result-card','toolbox-workbench-actions','toolbox-primary-action'];
for(const token of requiredPage)if(!page.includes(token)){console.error('DESIGN PAGE TOKEN MISSING',token);process.exit(1)}
for(const token of requiredTool)if(!tool.includes(token)){console.error('DESIGN TOOL TOKEN MISSING',token);process.exit(1)}
if(!css.includes('@media(max-width:900px)')){console.error('MOBILE MEDIA QUERY MISSING');process.exit(1)}
if(!css.includes('html[data-theme="dark"]')){console.error('DARK THEME OVERRIDE MISSING');process.exit(1)}
console.log('016 DESIGN STRUCTURE CHECK: PASSED');
