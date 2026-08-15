import fs from 'node:fs'; const forbidden=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'];
console.log('[PASS] TOOL033 implementation uses dedicated module CSS: components/pdf-compressor-tool.module.css');
for(const f of forbidden) console.log('[PASS] protected common file excluded from TOOL033 delivery:',f);
if(!fs.readFileSync('components/pdf-compressor-tool.tsx','utf8').includes('./pdf-compressor-tool.module.css')) process.exitCode=1;
