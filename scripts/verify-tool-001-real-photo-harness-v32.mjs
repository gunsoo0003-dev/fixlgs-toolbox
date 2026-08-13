#!/usr/bin/env node
import fs from 'fs';
const s=fs.readFileSync(new URL('./run-tool-001-real-photo-harness-v32.mjs',import.meta.url),'utf8');
const checks={
  version:/V32/.test(s),
  neutral_photo_slots:/PHOTO_01,PHOTO_02,PHOTO_03,PHOTO_04,PHOTO_05,PHOTO_06,PHOTO_07/.test(s),
  no_known_good_bad:!/KNOWN_GOOD|KNOWN_BAD/.test(s),
  facts_only:/HARNESS_FACTS_ONLY/.test(s),
  strict_media_grid:/b\.top>=900/.test(s)&&/b\.w>=300/.test(s)&&/b\.w<=420/.test(s)&&/b\.h>=300/.test(s)&&/b\.h<=420/.test(s),
  excludes_drag_handle:/드래그 핸들\|drag handle/.test(s),
  positional_selection:/photoSlotIndex/.test(s),
  user_zero_action:/사용자 입력 없음/.test(s),
  ignore_top_tab:/if\(\/\^\(사진\|photos\?/.test(s),
  harness_error_prefix:/HARNESS_/.test(s),
  auto_close:/PHOTO_FLOW_PICKER_CLOSED_CHANGE/.test(s),
  explicit_commit:/COMMIT TAP/.test(s),
  raw_facts:/CHANGE_SEEN/.test(s)&&/INPUT_FILES/.test(s)&&/CAPTURE_PASS/.test(s)&&/PREVIEW_COUNT/.test(s),
  zip_output:/Compress-Archive/.test(s),
  progress:/PROGRESS/.test(s)&&/RUNNING/.test(s),
  fast_product_timeout:/waitProduct\(page,startCapture,before,timeoutMs=8000\)/.test(s)&&/product capture \+ preview`.*,8000\),9000\)/.test(s),
  no_legacy_product_wait:!/waitProduct\(page,startCapture,before,timeoutMs=90000\)/.test(s)&&!/waitProduct\(page,st0\.capture\.length,before\),70000/.test(s),
  heads_up_suppression:/heads_up_notifications_enabled/.test(s)&&/restoreNotificationOverlays/.test(s)&&/cmd','statusbar','collapse/.test(s),
  focused_checkpoints:/CHANGE_HANDLER_ENTER/.test(s)&&/FILE_ACQUIRED/.test(s)&&/READ_START/.test(s)&&/SNAPSHOT_SUCCESS/.test(s)&&/PRODUCT_STATE_CARD_PREVIEW/.test(s),
};
const missing=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
console.log(JSON.stringify({STATIC_SELFTEST:missing.length?'FAIL':'PASS',...checks,missing},null,2));
process.exit(missing.length?1:0);
