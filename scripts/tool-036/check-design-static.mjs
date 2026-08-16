import fs from "node:fs";
const css=fs.readFileSync("components/character-document-counter-tool.module.css","utf8");const tool=fs.readFileSync("components/character-document-counter-tool.tsx","utf8");const page=fs.readFileSync("components/character-document-counter-page.tsx","utf8");let fail=0;
const checks=[
 ["shared detail hero",/toolbox-tool-detail-hero toolbox-tool-detail-hero--single-line-description/.test(page)],
 ["shared detail body",/toolbox-tool-detail-body/.test(page)],
 ["shared next-work",/toolbox-next-work/.test(page)],
 ["shared how-to",/toolbox-tool-guide toolbox-tool-guide--five/.test(page)],
 ["shared lower-section wrapper boundary",/<section className="toolbox-tool-detail-body"><div>[\s\S]*?NEXT WORK[\s\S]*?RELATED TOOLS[\s\S]*?\n\s*<\/div><\/section>\s*\n\s*<section className="toolbox-tool-guide toolbox-tool-guide--five">/.test(page)],
 ["counting guide reuses shared keyword-title-description format grid",/COUNTING GUIDE[\s\S]*?className="toolbox-tool-format-grid"[\s\S]*?<strong>\{n\}<\/strong><h3>\{h\}<\/h3><p>\{p\}<\/p>/.test(page)&&!/COUNTING GUIDE[\s\S]*?toolbox-tool-direction-grid/.test(page)&&!/COUNTING GUIDE[\s\S]*?toolbox-tool-practical-grid/.test(page)],
 ["shared information band",/toolbox-tool-info-band/.test(page)],
 ["shared FAQ",/toolbox-tool-faq/.test(page)],
 ["single workspace owns drag contract",/data-testid="tool036-workspace"[\s\S]*onDragEnter=\{onDragEnter\}[\s\S]*onDrop=\{onDrop\}/.test(tool)],
 ["start dropzone state-gated",/!hasStarted && !loadedFile && <div className=\{styles\.startDropzone\} data-testid="tool036-start-dropzone"/.test(tool)&&/setHasStarted\(false\)/.test(tool)&&/setHasStarted\(true\)/.test(tool)],
 ["dropzone CTA and textarea share the actual input shell",/data-testid="tool036-input-zone"[\s\S]*data-testid="tool036-textarea-shell"[\s\S]*data-testid="tool036-start-dropzone"[\s\S]*className=\{styles\.plusIcon\}[\s\S]*data-testid="tool036-file-button"[\s\S]*data-testid="tool036-textarea"/.test(tool)],
 ["legacy detached prompt removed",!/className=\{styles\.inputPrompt\}/.test(tool)&&!/className=\{styles\.dropPrompt\}/.test(tool)&&!/TEXT WORKSPACE<\//.test(tool)],
 ["no detached workspace header",!/className=\{styles\.workspaceHead\}/.test(tool)],
 ["one workspace selector only",(tool.match(/data-testid="tool036-workspace"/g)||[]).length===1],
 ["replacement confirmation is in-product and localized",/data-testid="tool036-replace-dialog"[\s\S]*data-testid="tool036-replace-cancel"[\s\S]*data-testid="tool036-replace-confirm"/.test(tool)&&/replaceWarning:/.test(tool)],
 ["two primary character cards desktop",/\.coreGrid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/.test(css)],
 ["six compact stats in three columns",/\.secondaryGrid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/.test(css)],
 ["previous-tool dropzone treatment",/\.startDropzone\{[\s\S]*dashed[\s\S]*var\(--blue\)/.test(css)&&/\.plusIcon\{[\s\S]*background:var\(--blue\)/.test(css)],
 ["blue workspace treatment",/\.activeWorkspace\{[\s\S]*var\(--blue\)/.test(css)&&/\.workspaceDragging/.test(css)],
 ["larger initial start dropzone",/\.startDropzone\{min-height:280px/.test(css)],
 ["initial textarea is one-line bar",/\.textareaInitial\{height:54px;min-height:54px;max-height:54px;resize:none;overflow:hidden\}/.test(css)&&/styles\.textareaInitial/.test(tool)],
 ["loaded or typed text expands textarea",/\.textareaLoaded\{min-height:440px/.test(css)&&/hasStarted \|\| loadedFile \? styles\.textareaLoaded : styles\.textareaInitial/.test(tool)],
 ["mobile core single column",/@media\(max-width:720px\)[\s\S]*\.coreGrid\{grid-template-columns:1fr\}/.test(css)],
 ["mobile file bar stacks",/@media\(max-width:720px\)[\s\S]*\.fileBar\{align-items:stretch;flex-direction:column\}/.test(css)],
 ["no global selector declarations",!/(^|\})\s*:global\(/m.test(css)],
 ["theme via variables",/var\(--tb-panel\)/.test(css)&&/var\(--tb-text\)/.test(css)&&/var\(--blue\)/.test(css)],
];
for(const [label,ok] of checks){if(ok)console.log("[PASS]",label);else{console.error("[FAIL]",label);fail++;}}
process.exitCode=fail?1:0;
