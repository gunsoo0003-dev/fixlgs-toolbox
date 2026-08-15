import fs from 'node:fs';
const main=fs.readFileSync('components/merge-pdf-page.tsx','utf8');
const mainTool=fs.readFileSync('components/merge-pdf-tool.tsx','utf8');
const tool=fs.readFileSync('components/split-extract-pdf-tool.tsx','utf8');
const page=fs.readFileSync('components/split-extract-pdf-page.tsx','utf8');
const css=fs.readFileSync('components/split-extract-pdf-tool.module.css','utf8');
const fail=[];const need=(ok,msg)=>{if(!ok)fail.push(msg)};
for(const cls of ['toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description','toolbox-tool-guide toolbox-tool-guide--five','toolbox-tool-format-guide toolbox-tool-expert-post','toolbox-tool-info-band toolbox-tool-info-band--section-start','toolbox-tool-faq']){need(main.includes(cls),`MAIN 028 changed: ${cls}`);need(page.includes(cls),`029 common structure missing: ${cls}`)}
need(css.includes('.wrapper{display:grid;gap:20px}'),'work-area module shell missing');need(mainTool.includes('dragging || workspaceDragging'),'MAIN 028 shared drag state missing');need(tool.includes('dragging || workspaceDragging'),'029 shared drag state missing');need(tool.includes('data-testid="tool029-workspace"'),'029 workspace drop target missing');need(css.includes('@media(max-width:560px)'),'mobile breakpoint missing');need(css.includes('.modeGrid'),'mode layout missing');need(css.includes('.thumbGrid'),'thumbnail grid missing');
for(const f of ['app/globals.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'])need(!/tool029|split-extract-pdf/i.test(fs.readFileSync(f,'utf8')),`protected CSS polluted: ${f}`);
if(fail.length){console.error('TOOL029 DESIGN CODE FAIL');fail.forEach(x=>console.error('-',x));process.exit(1)}console.log('TOOL029 DESIGN CODE PASS | MAIN=028 PDF lineage | shared drag state verified');
