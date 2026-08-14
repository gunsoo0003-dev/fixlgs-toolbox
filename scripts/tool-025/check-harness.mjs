import fs from 'node:fs';
const src=fs.readFileSync('components/id-passport-photo-maker-tool.tsx','utf8');
const selectors=['tool025-root','tool025-dropzone','tool025-preview','tool025-output-size','tool025-download','tool025-a4-count','tool025-a4-download','tool025-zoom','tool025-reset-settings','tool025-reset-all'];
const missing=selectors.filter((x)=>!src.includes(`data-testid="${x}"`));
console.log(missing.length?`HARNESS STRUCTURE FAIL ${missing.join(',')}`:'HARNESS STRUCTURE PASS');process.exit(missing.length?1:0);
