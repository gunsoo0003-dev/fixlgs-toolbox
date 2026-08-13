#!/usr/bin/env node
import fs from 'fs';
const p='scripts/run-tool-001-notreadable-read-prestate-v36.mjs';
const s=fs.readFileSync(p,'utf8');
const checks={
  same_photo_only:/photo:'PHOTO_01'/.test(s)&&!/PHOTO_02/.test(s),
  default_20_repeats:/args\.repeats\|\|20/.test(s),
  passive_read_observer:/does not read\/slice\/clone the provider File/.test(s),
  read_prestate_present:/readPrestate/.test(s)&&/preState\('FileReader'/.test(s)&&/preState\('Blob\.arrayBuffer'/.test(s),
  compare_pass_fail:/read-prestate-comparison\.txt/.test(s)&&/notReadableFail/.test(s),
  captures_input_state:/inputConnected/.test(s)&&/inputFileCount/.test(s),
  captures_timing:/msSinceChange/.test(s)&&/msSinceLastLifecycle/.test(s),
  captures_concurrency:/activeReadsBefore/.test(s),
  captures_prior_ops:/priorAbortCount/.test(s)&&/priorDecodeCount/.test(s)&&/priorObjectUrlCount/.test(s),
  no_pyramid_mode:!/CATEGORIES|STRONG_BRANCH|SUSPECT_BRANCH/.test(s)
};
let ok=true;for(const [k,v] of Object.entries(checks)){console.log(`${k}=${v?'PASS':'FAIL'}`);if(!v)ok=false;}console.log(`STATIC_SELFTEST=${ok?'PASS':'FAIL'}`);process.exit(ok?0:1);
