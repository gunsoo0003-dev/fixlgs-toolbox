import fs from 'node:fs';
const checks=[];let fail=0;const need=(file,needles)=>{const s=fs.readFileSync(file,'utf8');for(const n of needles){if(s.includes(n)){console.log('PASS',file,n);checks.push(1)}else{console.error('FAIL',file,n);fail++}}};
for(const f of ['scripts/tool-044/check-harness.mjs','scripts/tool-044/run-validation-full.mjs','lib/tool-044-keyword-analyzer.ts','components/keyword-frequency-duplicate-tool.tsx','components/keyword-frequency-duplicate-tool.module.css','components/text-tool-input-common.module.css','components/keyword-frequency-duplicate-page.tsx','app/[locale]/keyword-frequency-duplicate-analyzer/page.tsx','playwright.tool044.config.ts']){if(fs.existsSync(f)){console.log('PASS exists',f);checks.push(1)}else{console.error('FAIL missing',f);fail++}}
need('components/keyword-frequency-duplicate-tool.tsx',['tool044-input','tool044-run','tool044-result','tool044-keyword-table','tool044-duplicates','tool044-start-dropzone','tool044-file-input','tool044-file-info','onDragEnter={onDragEnter}','onDragOver={onDragOver}','onDrop={onDrop}','inputCommon.workspaceDragging','inputCommon.fileBar','inputCommon.editorCard','inputCommon.textarea','inputCommon.primaryButton','inputCommon.secondaryCard']);
need('components/text-tool-input-common.module.css',['.workspaceSurface{','.workspaceDragging{','.startDropzone{','.hiddenInput{','.fileBar{','.editorCard{','.textarea{','.button,.primaryButton{','.secondaryCard{','.actionRow{','.dialogBackdrop{']);
need('components/text-find-replace-tool.tsx',['inputCommon.workspaceSurface','inputCommon.workspaceDragging','inputCommon.startDropzone','inputCommon.fileBar','inputCommon.editorCard','inputCommon.textarea','inputCommon.button','inputCommon.primaryButton']);
need('lib/tool-044-keyword-analyzer.ts',['Intl.Segmenter','density','firstIndex','normalizeSentenceForDuplicate','maxCharacters','maxSentences','maxUniqueKeywords']);
need('app/[locale]/keyword-frequency-duplicate-analyzer/page.tsx',['generateMetadata','canonical','x-default','tool044Titles','tool044Descriptions']);
need('lib/site.ts',['tool044Slug','tool044Titles','tool044Descriptions']);
need('app/sitemap.ts',['tool044Slug']);
need('components/keyword-frequency-duplicate-page.tsx',['FAQPage','WebApplication','text-diff-compare','text-find-replace','character-document-counter']);
console.log(`TOOL044 STATIC PASS=${checks.length} FAIL=${fail}`);process.exitCode=fail?1:0;

need('tests/tool-044-preflight.spec.ts',['initial state inventory','tool044-start-dropzone','toBeDisabled()']);
need('tests/tool-044-core.spec.ts',['toBeEnabled()','replacement cancel','replacement confirm','drag and drop TXT loads selected file']);
need('tests/helpers/tool-044.ts',['await expect(input).toBeVisible()','TEXTAREA_NATIVE_SETTER_MISSING']);
need('scripts/tool-044/run-validation-full.mjs',['static-self-check','preflight','core','boundary','regression','limit','typescript','production-build','SKIP=0']);
