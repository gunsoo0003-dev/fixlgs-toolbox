import fs from 'node:fs';
const css=fs.readFileSync('components/text-whitespace-linebreak-cleaner-tool.module.css','utf8');
const tool=fs.readFileSync('components/text-whitespace-linebreak-cleaner-tool.tsx','utf8');
const page=fs.readFileSync('components/text-whitespace-linebreak-cleaner-page.tsx','utf8');
const baseCss=fs.readFileSync('components/character-document-counter-tool.module.css','utf8');
let fail=0;const check=(label,ok)=>{console.log(`[${ok?'PASS':'FAIL'}] ${label}`);if(!ok)fail++};
const checks=[
 ['036 shared detail hero',/toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description/.test(page)],
 ['036 shared detail body',/toolbox-tool-detail-body/.test(page)],
 ['036 next-work structure',/NEXT WORK[\s\S]*RELATED TOOLS/.test(page)],
 ['036 lower wrapper boundary',/<section className="toolbox-tool-detail-body"><div>[\s\S]*?NEXT WORK[\s\S]*?RELATED TOOLS[\s\S]*?\n\s*<\/div><\/section>\s*\n\s*<section className="toolbox-tool-guide toolbox-tool-guide--five">/.test(page)],
 ['036 how-to class',/toolbox-tool-guide toolbox-tool-guide--five/.test(page)],
 ['036 expert format grid',/CLEANUP GUIDE[\s\S]*className="toolbox-tool-format-grid"/.test(page)&&!/CLEANUP GUIDE[\s\S]*toolbox-tool-direction-grid/.test(page)],
 ['036 info band',/toolbox-tool-info-band/.test(page)],
 ['036 FAQ',/toolbox-tool-faq/.test(page)],
 ['single workspace owns drag',/data-testid="tool037-workspace"[\s\S]*onDragEnter=\{onDragEnter\}[\s\S]*onDrop=\{onDrop\}/.test(tool)],
 ['one workspace selector only',(tool.match(/data-testid="tool037-workspace"/g)||[]).length===1],
 ['start dropzone gated',/!hasStarted && !loadedFile && <div className=\{styles\.startDropzone\} data-testid="tool037-start-dropzone"/.test(tool)],
 ['file + textarea same editor card',/data-testid="tool037-input-zone"[\s\S]*data-testid="tool037-start-dropzone"[\s\S]*data-testid="tool037-file-button"[\s\S]*data-testid="tool037-input"/.test(tool)],
 ['replacement dialog localized',/tool037-replace-dialog[\s\S]*tool037-replace-cancel[\s\S]*tool037-replace-confirm/.test(tool)&&/replaceWarning:/.test(tool)],
 ['036 local notice geometry',/\.localNotice\{display:flex;align-items:flex-start;gap:12px;padding:12px 15px/.test(css)&&baseCss.includes('.localNotice{display:flex;align-items:flex-start;gap:12px;padding:12px 15px')],
 ['036 active workspace geometry',/\.activeWorkspace\{position:relative;display:grid;gap:9px;padding:14px/.test(css)&&baseCss.includes('.activeWorkspace{position:relative;display:grid;gap:9px;padding:14px')],
 ['036 start dropzone geometry',/\.startDropzone\{min-height:280px/.test(css)&&baseCss.includes('.startDropzone{min-height:280px')],
 ['036 pill button hierarchy',/border-radius:999px/.test(css)&&/\.fileButton,.primaryButton\{border:1px solid var\(--blue\);background:var\(--blue\);color:#fff\}/.test(css)],
 ['036 initial textarea bar',/\.textareaInitial\{height:54px;min-height:54px;max-height:54px;resize:none;overflow:hidden\}/.test(css)],
 ['036 mobile breakpoint',/@media\(max-width:720px\)/.test(css)&&/@media\(max-width:380px\)/.test(css)],
 ['theme variables',/var\(--tb-panel\)/.test(css)&&/var\(--tb-text\)/.test(css)&&/var\(--blue\)/.test(css)],
 ['no tool037 global selector',!/(^|\})\s*:global\(/m.test(css)],
 ['no important',!css.includes('!important')],
];
for(const [label,ok] of checks)check(label,ok);
process.exitCode=fail?1:0;
