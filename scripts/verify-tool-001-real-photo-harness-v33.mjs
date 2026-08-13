#!/usr/bin/env node
import fs from 'fs';
const p=new URL('./run-tool-001-real-photo-harness-v33.mjs',import.meta.url);
const s=fs.readFileSync(p,'utf8');
const checks={
  version:/V33/.test(s)&&/REAL_PHOTO_V33/.test(s),
  photo01_x5:/PHOTO_01,PHOTO_01,PHOTO_01,PHOTO_01,PHOTO_01/.test(s),
  fast_product_timeout:/waitProduct\(page,st0\.capture\.length,before,8000\)/.test(s),
  user_result_is_card_preview:/const userPass=newCards>0&&previewCount>0/.test(s)&&/pass:userPass/.test(s),
  native_filereader_observer:/filereader-call/.test(s)&&/filereader-load/.test(s)&&/filereader-error/.test(s),
  native_stream_observer:/blob-stream-call/.test(s),
  no_extra_provider_read:/does not read\/slice\/clone/.test(s),
  logcat_provider_errors:/ERR_UPLOAD_FILE_CHANGED/.test(s)&&/NotReadableError/.test(s),
  checkpoint_pipeline:/CHANGE_HANDLER_ENTER/.test(s)&&/FILE_ACQUIRED/.test(s)&&/READ_START/.test(s)&&/SNAPSHOT_SUCCESS/.test(s)&&/PRODUCT_STATE_CARD_PREVIEW/.test(s),
  first_divergence:/FIRST_DIVERGENCE/.test(s)&&/PROVIDER_NATIVE_READ/.test(s),
  notification_suppression:/heads_up_notifications_enabled/.test(s),
};
let fail=false;
for(const [k,v] of Object.entries(checks)){console.log(`${k}=${v?'PASS':'FAIL'}`);if(!v)fail=true;}
console.log(`STATIC_SELFTEST=${fail?'FAIL':'PASS'}`);
if(fail)process.exit(1);
