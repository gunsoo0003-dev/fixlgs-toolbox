#!/usr/bin/env node
import fs from 'fs';
const p=new URL('./run-tool-001-notreadable-pyramid-v35.mjs',import.meta.url);
const s=fs.readFileSync(p,'utf8');
const checks={
  version:/NOTREADABLE_PYRAMID_V35|PYRAMID V35/.test(s),
  eight_categories:(s.match(/id:'C0[1-8]_/g)||[]).length===8,
  repeats_3:/args\.repeats\|\|3/.test(s),
  sets_2:/args\.sets\|\|2/.test(s),
  total_48:/for\(let set=1;set<=SETS;set\+\+\)for\(const cat of CATEGORIES\)for\(let repeat=1;repeat<=REPEATS;repeat\+\+\)/.test(s),
  fast_timeout:/timeoutMs=6500/.test(s)&&/waitProduct\([^\n]+6500\)/.test(s),
  arraybuffer_observer:/arraybuffer-call/.test(s),
  input_dom_observer:/file-input-removed/.test(s)&&/value-set/.test(s),
  concurrency_observer:/readConcurrency/.test(s)&&/activeReads/.test(s),
  abort_observer:/AbortController\.abort/.test(s),
  lifecycle_observer:/visibilitychange/.test(s)&&/pageshow/.test(s),
  decode_observer:/createImageBitmap/.test(s)&&/createObjectURL/.test(s),
  matrix:/pyramid-matrix\.txt/.test(s)&&/STRONG_BRANCH/.test(s),
  no_manual_user:/사용자 입력 없음/.test(s)
};
for(const [k,v] of Object.entries(checks))console.log(`${k}=${v?'PASS':'FAIL'}`);
const bad=Object.entries(checks).filter(([,v])=>!v);console.log(`STATIC_SELFTEST=${bad.length?'FAIL':'PASS'}`);if(bad.length){console.error('missing='+bad.map(([k])=>k).join(','));process.exit(1)}
