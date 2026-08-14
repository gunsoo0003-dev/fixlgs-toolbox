import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const t24=read('components/app-store-screenshot-maker-tool.tsx');
const c24=read('components/app-store-screenshot-maker-tool.module.css');
const t25=read('components/id-passport-photo-maker-tool.tsx');
const c25=read('components/id-passport-photo-maker-tool.module.css');
const p24=read('components/app-store-screenshot-maker-page.tsx');
const p25=read('components/id-passport-photo-maker-page.tsx');
const failures=[];
const need=(ok,msg)=>{if(!ok)failures.push(msg)};
const ordered=(text,items)=>{let i=-1;for(const x of items){const n=text.indexOf(x,i+1);if(n<0)return false;i=n;}return true};

// TOOL024 exact drag/drop state transplant contract for TOOL025.
// 1) visible dropzone is always mounted; after upload it becomes dropzoneReady (neutral, compact), never disappears.
// 2) dragging over either visible dropzone or workspace activates the same dragging state on the visible dropzone.
// 3) workspace uses TOOL024-style ::after overlay and panel-border tint while dragging; no second custom overlay element.
need(t24.includes('className={`${styles.dropzone} ${hasSlides ? styles.dropzoneReady : ""} ${(dragging || workspaceDragging) ? styles.dragging : ""}`}'),'024 dropzone state reference changed/missing');
need(t24.includes('className={`${styles.workspace} ${(dragging || workspaceDragging) ? styles.workspaceDragging : ""}`}'),'024 workspace drag reference changed/missing');
need(t25.includes('className={`${styles.dropzone} ${image?styles.dropzoneReady:""} ${(dropDragging||workspaceDragging)?styles.dragging:""}`}'),'025 always-visible dropzone / ready / shared drag state mismatch');
need((t25.match(/data-testid="tool025-dropzone"/g)||[]).length===1,'visible dropzone must exist exactly once');
need(!t25.includes('{!image&&<section')&&!t25.includes('{image&&<div'),'dropzone/workspace must not be conditionally removed after upload');
need(t25.includes('StableMobileImageFileInput ref={inputRef}') && t25.indexOf('StableMobileImageFileInput ref={inputRef}') < t25.indexOf('data-testid="tool025-dropzone"'),'stable file input must remain mounted before visual dropzone');
need(t25.includes('data-testid="tool025-workspace-dropzone"'),'workspace drop target missing');
need(t25.includes('onDragEnter={e=>{if(Array.from(e.dataTransfer.types).includes("Files"))') && t25.includes('onDragLeave={e=>{const next=e.relatedTarget as Node|null;if(!next||!e.currentTarget.contains(next))setWorkspaceDragging(false)}'),'TOOL024 workspace drag enter/leave behavior missing');
need(t25.includes('void acceptFile(e.dataTransfer.files[0])'),'replacement drop must route to 025 file acceptance');
need(!t25.includes('workspaceDropOverlay'),'custom second drop overlay element must not exist');

// 025 functional layout inside TOOL024 state shell.
need(ordered(t25,['01 · PREVIEW','02 · PRESET','04 · EXPORT','05 · A4 PRINT','03 · ALIGN']),'agreed panel order mismatch');
need(!t25.includes('06 · RESET'),'standalone RESET card must not remain');
need(c25.includes('.dropzoneReady{padding:18px 24px;border-style:solid;border-color:var(--tb-line)'),'TOOL024 neutral ready dropzone CSS missing');
need(c25.includes('.dropzoneReady::before{content:none;display:none}'),'ready state must remove blue plus icon');
need(c25.includes('.dropzone.dragging{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 7%,var(--tb-panel))'),'shared drag highlight CSS missing');
need(c25.includes('.workspace{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(280px,1fr)'),'desktop 3-column workspace missing');
need(c25.includes('.workspace::after{content:"";position:absolute;inset:-6px;border:2px dashed transparent'),'TOOL024 workspace overlay base missing');
need(c25.includes('.workspaceDragging::after{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 5%,transparent)'),'TOOL024 workspace drag overlay state missing');
need(c25.includes('.workspaceDragging .panel{border-color:color-mix(in srgb,var(--blue) 45%,var(--tb-line))}'),'TOOL024 panel-border drag tint missing');
need(c25.includes('.previewPanel{grid-column:1/3}') && c25.includes('.presetPanel{grid-column:3}'),'preview 2-column / preset 1-column assignment missing');
need(c25.includes('.lowerGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'),'lower three equal columns missing');
need(c25.includes('.lowerGrid>.panel{height:100%;display:flex;flex-direction:column}'),'lower card equal-height stretch missing');
need(c25.includes('.canvasWrap{position:relative;min-height:620px'),'large preview work area missing');

// TOOL024 action convention: downloads and reset-all stay in one export action group.
need(t24.includes('className={styles.actions}') && t24.includes('data-testid="tool024-export-zip"') && t24.includes('onClick={resetAll}'),'024 export action reference changed/missing');
need(t25.includes('className={styles.actions}') && t25.includes('data-testid="tool025-download"') && t25.includes('data-testid="tool025-a4-download"') && t25.includes('data-testid="tool025-reset-all"'),'025 download/A4/reset-all not grouped in export actions');
need(ordered(t25,['data-testid="tool025-download"','data-testid="tool025-a4-download"','data-testid="tool025-reset-settings"','data-testid="tool025-reset-all"']),'025 export action order mismatch');
need(c25.includes('.actions{display:grid;gap:10px;margin-top:auto;padding-top:14px}'),'stacked export action group CSS missing');

// A4 card is preview/guide only and must show actual uploaded-photo layout through canvas.
need(t25.includes('<canvas ref={a4PreviewRef}'),'A4 real-photo preview canvas missing');
need(!/a4Panel[\s\S]{0,1600}tool025-a4-download/.test(t25),'A4 download button must not live inside A4 guide card');
need(c25.includes('.a4Preview canvas{display:block;height:100%;width:auto;max-width:100%'),'A4 preview canvas presentation missing');

for(const token of ['.wrapper{display:grid;gap:20px}', 'border-radius:18px', '.localNote{display:flex;align-items:center;gap:12px;padding:12px 16px}', '.panel{padding:18px;min-width:0}', '.panelHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px']) need(c25.includes(token),`missing inherited TOOL024 visual token: ${token}`);
need(!c25.includes('order:-1'),'preview must not use order:-1');
for(const cls of ['toolbox-tool-guide toolbox-tool-guide--five','toolbox-tool-format-guide toolbox-tool-expert-post','toolbox-tool-info-band toolbox-tool-info-band--section-start','toolbox-tool-faq']) need(p25.includes(cls),`missing 024 common section transplant: ${cls}`);
for(const old of ['toolbox-guide-section','toolbox-caution-section','toolbox-faq-section']) need(!p25.includes(old),`legacy page section remains: ${old}`);
need(c24.includes('.dropzoneReady{padding:18px 24px') && c24.includes('.workspaceDragging::after{border-color:var(--blue)'),'024 CSS state reference changed/missing');
need(c24.includes('.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}'),'024 action reference CSS changed/missing');
need(p24.includes('WORKFLOW GUIDE')&&p24.includes('IMPORTANT NOTES'),'024 reference common page structure changed/missing');
if(failures.length){console.error('DESIGN TRANSPLANT FAIL');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('DESIGN TRANSPLANT PASS');
