import fs from 'node:fs';
const tool=fs.readFileSync('components/pdf-compressor-tool.tsx','utf8'); const page=fs.readFileSync('components/pdf-compressor-page.tsx','utf8');let fail=0;
for(const id of ['tool033-root','tool033-dropzone','tool033-file-input','tool033-file-info','tool033-workspace','tool033-preview-panel','tool033-settings-panel','tool033-presets','tool033-preset-high','tool033-preset-balanced','tool033-preset-size','tool033-preset-custom','tool033-quality','tool033-compress-button','tool033-preview-canvas','tool033-result','tool033-download']){if(tool.includes(id))console.log('[PASS] selector',id);else{console.error('[FAIL] selector',id);fail++;}}
for(const s of ['033 · PDF','HOW TO USE','WORKFLOW GUIDE','IMPORTANT NOTES','FAQ']){if(page.includes(s))console.log('[PASS] page contract',s);else{console.error('[FAIL] page contract',s);fail++;}}
process.exitCode=fail?1:0;
