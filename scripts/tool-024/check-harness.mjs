import fs from 'node:fs';
const src=fs.readFileSync('components/app-store-screenshot-maker-tool.tsx','utf8');
const selectors=['tool024-root','tool024-dropzone','tool024-workspace-dropzone','tool024-preview','tool024-result-count','tool024-export-zip','tool024-background-mode','tool024-title-y','tool024-description-y','tool024-frame-toggle','tool024-output-format'];
const missing=selectors.filter(x=>!src.includes(`data-testid="${x}"`));
console.log(missing.length?`HARNESS FAIL ${missing.join(',')}`:'HARNESS PASS'); process.exit(missing.length?1:0);
