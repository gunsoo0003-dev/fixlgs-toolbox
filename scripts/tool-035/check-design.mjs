import fs from 'node:fs';
let fail=0;const need=(ok,msg)=>{console.log(ok?'PASS':'FAIL',msg);if(!ok)fail++;};
const page032=fs.readFileSync('components/pdf-signature-page.tsx','utf8');
const tool033=fs.readFileSync('components/pdf-compressor-tool.tsx','utf8');
const css033=fs.readFileSync('components/pdf-compressor-tool.module.css','utf8');
const tool034=fs.readFileSync('components/pdf-password-metadata-tool.tsx','utf8');
const css034=fs.readFileSync('components/pdf-password-metadata-tool.module.css','utf8');
const sub029=fs.readFileSync('components/split-extract-pdf-tool.tsx','utf8');
const page=fs.readFileSync('components/pdf-text-image-extractor-page.tsx','utf8');
const tool=fs.readFileSync('components/pdf-text-image-extractor-tool.tsx','utf8');
const css=fs.readFileSync('components/pdf-text-image-extractor-tool.module.css','utf8');

// TOOL032: body closes before the full-width guide/use-case/expert/info/faq sections.
const fullWidthClasses=['toolbox-tool-guide','toolbox-tool-format-guide','toolbox-tool-info-band','toolbox-tool-faq','toolbox-tool-processing-note'];
for(const cls of ['toolbox-tool-detail-hero','toolbox-tool-detail-body','toolbox-next-work',...fullWidthClasses]) need(page032.includes(cls)&&page.includes(cls),`032 full-width/page structure retained: ${cls}`);
const bodyClose=page.indexOf('</div></section>');
for(const cls of fullWidthClasses) need(bodyClose>=0 && page.indexOf(cls)>bodyClose,`035 ${cls} remains outside detail-body wrapper`);
need(page.includes('035 · PDF'),'035 identity retained');

// TOOL033/034: uploaded state is one shared drag wrapper, not separate panel hit areas.
need(tool033.includes('workspaceDragging')&&tool034.includes('activeWorkspace'),'033/034 shared uploaded drag references exist');
need(tool.includes('styles.activeWorkspace')&&tool.includes('styles.workspaceDragging'),'035 uses a single activeWorkspace + shared drag state');
need((tool.match(/data-testid="tool035-workspace"/g)||[]).length===1,'035 exposes exactly one uploaded workspace drag target');
need((css.match(/\.activeWorkspace::after/g)||[]).length===1,'035 renders exactly one workspace drag overlay');
need(css.includes('.workspaceDragging .fileCard')&&css.includes('.workspaceDragging .controlPanel')&&css.includes('.workspaceDragging .resultsPanel'),'shared drag visual reaches file/control/result regions');
need(tool.indexOf('data-testid="tool035-results"')>tool.indexOf('data-testid="tool035-workspace"'),'result region belongs to uploaded-state flow');
need(tool.includes('</section> : null}\n    </section>}'),'result/status region closes before the single activeWorkspace wrapper closes');

// TOOL034: current PDF drop/card/button rhythm tokens.
for(const token of ['padding:28px','border-radius:18px','font-size:16px','font-size:12px']) need(css034.includes(token)&&css.includes(token),`034 dropzone token retained: ${token}`);
for(const token of ['gap:16px','border-radius:16px','min-height:42px','inset:-6px','border-radius:22px']) need(css034.includes(token)&&css.includes(token),`034 uploaded workspace rhythm retained: ${token}`);
need(css.includes('box-shadow:0 0 0 4px color-mix(in srgb,var(--blue) 8%,transparent)'),'034-equivalent shared drag emphasis retained');

// TOOL029 range UX is still the correct feature-specific donor.
need(sub029.includes('rangeText')&&tool.includes('customRange'),'029 range-input pattern retained for 035-specific page selection');
need(sub029.includes('progress')&&tool.includes('tool035-progress'),'029 progress pattern retained for 035-specific processing');
need(!css.includes('max-height:210px')&&!css.includes('max-height:190px'),'page picker is not capped to an internal 20-ish-page scroll viewport');
need(css.includes('.pagePicker{display:grid;grid-template-columns:repeat(10')&&css.includes('@media(max-width:420px){.pagePicker{grid-template-columns:repeat(5'),'page picker exposes full page list with responsive grid columns');

// Responsive and module hygiene.
need(css.includes('@media(max-width:760px)')&&css.includes('.imageGrid{grid-template-columns:repeat(2'),'mobile vertical flow + image 2-column grid exists');
need(css.includes('@media(max-width:420px)')||css.includes('@media(max-width:430px)')||css.includes('@media(max-width:440px)'),'narrow-mobile breakpoint exists');
need(!css.includes('.toolbox-'),'module CSS does not override common toolbox selectors');
need(!css.includes('!important'),'no new module !important specificity override');
need(tool.includes('styles.localNote')&&tool.indexOf('styles.localNote')<tool.indexOf('styles.dropzone'),'LOCAL note precedes upload area');
process.exitCode=fail?1:0;
