import fs from 'node:fs';
const files=['components/pdf-compressor-tool.tsx','components/pdf-compressor-tool.module.css','components/pdf-compressor-page.tsx','app/[locale]/pdf-compressor/page.tsx','lib/tool-033-pdf-compressor.ts'];
let fail=0; for(const f of files){if(!fs.existsSync(f)){console.error('[FAIL] missing',f);fail++;}else console.log('[PASS]',f)}
const tool=fs.readFileSync('components/pdf-compressor-tool.tsx','utf8');
const limits=fs.readFileSync('lib/tool-033-pdf-compressor.ts','utf8');
const page=fs.readFileSync('components/pdf-compressor-page.tsx','utf8');
for(const [label,re] of [
 ['four presets',/tool033-preset-high[\s\S]*tool033-preset-balanced[\s\S]*tool033-preset-size[\s\S]*tool033-preset-custom/],
 ['no legacy basic mode',!/mode==="basic"|setMode\(|basicHelp|strongHelp/.test(tool)],
 ['quality range',/TOOL033_CUSTOM_QUALITY\.min[\s\S]*TOOL033_CUSTOM_QUALITY\.max/],
 ['actual blob size',/blob\.size/],['final preview',/previewKind==="result"/],['result reparse',/pageCount\(blob\)/],['local pdfjs',/pdfjs-dist\/webpack\.mjs/],['pdf-lib',/PDFDocument/],
 ['preset render scale',/tool033RenderScale\(preset,quality\)/],['jpeg 98 cap',/Math\.min\(\.98,quality\/100\)/],
 ['quality state accepts preset/custom numbers',/useState<number>\(TOOL033_PRESET_QUALITY\.balanced\)/],
 ['pdf bytes typed for pdf-lib output',/let bytes:\s*Uint8Array<ArrayBufferLike>/],
 ['blob uses copied ArrayBuffer boundary',/new Uint8Array\(bytes\.byteLength\);\s*blobBytes\.set\(bytes\);\s*const blob=new Blob\(\[blobBytes\.buffer\]/]
]){ const ok = re instanceof RegExp ? re.test(tool) : re; if(ok)console.log('[PASS]',label);else{console.error('[FAIL]',label);fail++;}}

const layoutOk=/toolbox-tool-detail-body[\s\S]*toolbox-next-work[\s\S]*<\/div><\/section><section className=\"toolbox-tool-guide/.test(page);
if(layoutOk)console.log('[PASS] TOOL032 full-width guide wrapper contract');else{console.error('[FAIL] TOOL032 full-width guide wrapper contract');fail++;}
for(const [label,re] of [['default balanced',/TOOL033_DEFAULT_PRESET\s*=\s*"balanced"/],['high 97',/high:\s*97/],['balanced 92',/balanced:\s*92/],['size 82',/size:\s*82/],['custom 55-98',/min:\s*55,\s*max:\s*98/],['high scale 1.6',/preset === "high"\) return 1\.6/],['balanced scale 1.5',/preset === "balanced"\) return 1\.5/],['size scale 1.4',/preset === "size"\) return 1\.4/]]){if(re.test(limits))console.log('[PASS]',label);else{console.error('[FAIL]',label);fail++;}}
process.exitCode=fail?1:0;
