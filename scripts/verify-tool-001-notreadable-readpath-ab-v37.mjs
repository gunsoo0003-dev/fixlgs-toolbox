#!/usr/bin/env node
import fs from 'fs';
const p=new URL('./run-tool-001-notreadable-readpath-ab-v37.mjs',import.meta.url);const s=fs.readFileSync(p,'utf8');
const checks={three_modes:/FILEREADER.*ARRAYBUFFER.*STREAM/s.test(s),ten_default:/args\.repeats\|\|10/.test(s),same_photo:/photo:'PHOTO_01'/.test(s),product_handler_block:/stopImmediatePropagation\(\)/.test(s),native_fr:/nativeFRRead\.call/.test(s),native_ab:/nativeAB\.call/.test(s),native_stream:/nativeStream\.call/.test(s),comparison:/read-path-ab-comparison\.txt/.test(s)};
let ok=true;for(const [k,v] of Object.entries(checks)){console.log(`${k}=${v?'PASS':'FAIL'}`);if(!v)ok=false;}console.log(`STATIC_SELFTEST=${ok?'PASS':'FAIL'}`);process.exit(ok?0:1);
