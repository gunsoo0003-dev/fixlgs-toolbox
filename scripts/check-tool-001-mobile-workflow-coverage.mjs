import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'test-results');
fs.mkdirSync(out, { recursive: true });
const source = fs.readFileSync(path.join(root, 'components', 'image-converter-tool.tsx'), 'utf8');
const workflow = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-workflow-gate.spec.ts'), 'utf8');
const cause = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-cause-matrix.spec.ts'), 'utf8');
const lifecycle = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-android-lifecycle.spec.ts'), 'utf8');
const deep = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-deep-diagnostic.spec.ts'), 'utf8');
const loadLimit = fs.readFileSync(path.join(root, 'tests', 'tool-001-load-limit.spec.ts'), 'utf8');
const limit = fs.readFileSync(path.join(root, 'tests', 'tool-001-limit.spec.ts'), 'utf8');
const limitFeedback = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-limit-feedback.spec.ts'), 'utf8');
const edge = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-workflow-edge.spec.ts'), 'utf8');
const race = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-workflow-race-resilience.spec.ts'), 'utf8');
const memory = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-memory-safety.spec.ts'), 'utf8');
const attachment = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-attachment-lightweight.spec.ts'), 'utf8');
const captureWorker = fs.readFileSync(path.join(root, 'tests', 'tool-001-mobile-input-capture-worker.spec.ts'), 'utf8');
const corpus = `${workflow}\n${cause}\n${lifecycle}\n${deep}\n${loadLimit}\n${limit}\n${limitFeedback}\n${edge}\n${race}\n${memory}\n${attachment}\n${captureWorker}`;

const risks = [
  ['PICKER_TRIGGER_VISIBLE', '.toolbox-upload-focus button', '01_INITIAL_UPLOAD_ZONE_VISIBLE'],
  ['PICKER_NOT_BLOCKED', 'fileInputRef.current?.click()', 'assertNoBlockingOverlay'],
  ['CHANGE_EVENT', 'onChange={(event)', '02_FILE_CHANGE_EVENT'],
  ['FILELIST_CAPTURED_BEFORE_ASYNC', 'Array.from(input.files)', '02_FILE_CHANGE_EVENT'],
  ['ASYNC_INPUT_CLEAR_TIMING', 'addFiles(selectedFiles).finally', 'INPUT_CLEAR_DURING_READ'],
  ['FILE_EMPTY', 'file.size === 0', 'FAIL:EMPTY'],
  ['MIME_VARIANTS', 'accept="image/jpeg,image/png,image/webp', 'MIME_EMPTY'],
  ['EXTENSION_VARIANTS', 'expectedKindFromName', 'NAME_NO_EXT'],
  ['SIGNATURE_SNIFF', 'detectImageKind', 'JPEG_TRAILING_BYTES'],
  ['BYTE_READ_FAILURE', 'file.arrayBuffer()', 'ARRAYBUFFER_FAIL_ALWAYS'],
  ['SLOW_PROVIDER_READ', 'addFiles(selectedFiles)', 'ARRAYBUFFER_DELAY_5000'],
  ['BITMAP_DECODE', 'createImageBitmap', 'BITMAP_THROW'],
  ['BITMAP_FALLBACK', 'decodeImageWithObjectUrl', 'BITMAP_API_MISSING'],
  ['OBJECT_URL', 'URL.createObjectURL(file)', 'OBJECTURL_THROW'],
  ['PREVIEW_STATE_CREATED', 'previewUrl:', '03_BLUE_ZONE_REMOVED_AFTER_ACCEPT'],
  ['BLUE_ZONE_REMOVED', 'items.length === 0', '03_BLUE_ZONE_REMOVED_AFTER_ACCEPT'],
  ['ACTIVE_ZONE_VISIBLE', 'toolbox-upload-active', '03_BLUE_ZONE_REMOVED_AFTER_ACCEPT'],
  ['FILE_CARD_RENDERED', 'converter-file-card', '04_CARD_HAS_REAL_FILE_METADATA'],
  ['PREVIEW_NONZERO', '<img src={item.previewUrl}', '05_PREVIEW_DECODED'],
  ['MOBILE_HORIZONTAL_OVERFLOW', 'toolbox-workbench-upload', '06_NO_HORIZONTAL_ESCAPE'],
  ['POST_SELECTION_BUTTON_VISIBLE', 'converter-run', '07_POST_SELECTION_CONTROLS_INTERACTIVE'],
  ['POST_SELECTION_BUTTON_NOT_BLOCKED', 'toolbox-primary-action', 'assertNoBlockingOverlay'],
  ['CONVERSION_EXECUTION', 'convertAll(false)', '08_CONVERSION_COMPLETES'],
  ['CONVERSION_TERMINAL_STATE', 'item.status === "done"', '08_CONVERSION_COMPLETES'],
  ['RESULT_BLOB', 'item.resultBlob', '09_RESULT_DOWNLOAD_TRIGGERED'],
  ['INDIVIDUAL_DOWNLOAD', 'downloadBlob(item.resultBlob', '09_RESULT_DOWNLOAD_TRIGGERED'],
  ['WINDOW_ERROR', 'setMessage', '10_NO_RUNTIME_EXCEPTION'],
  ['UNHANDLED_REJECTION', 'void addFiles', '10_NO_RUNTIME_EXCEPTION'],
  ['RESET', 'onClick={clearAll}', '11_RESET_RESTORES_INITIAL_STATE'],
  ['SAME_FILE_RESELECT', 'input.value = ""', '12_SAME_FILE_RESELECT_WORKS'],
  ['RAPID_RESELECT', 'multiple', 'RAPID_RESELECT'],
  ['TWO_FAST_SELECTIONS', 'multiple', 'TWO_FAST_SELECTIONS'],
  ['INPUT_REMOVE_LIFECYCLE', 'fileInputRef', 'INPUT_REMOVE_DURING_READ'],
  ['FOCUS_VISIBILITY_LIFECYCLE', 'addFiles', 'VISIBILITY_CHANGE_DURING_READ'],
  ['FILE_REFERENCE_LIFETIME', 'selectedFiles', 'RETAIN_FILE_4000MS_PNG'],
  ['UUID_FAILURE', 'crypto.randomUUID()', 'RANDOMUUID_THROW'],
  ['REVOKE_OBJECT_URL', 'URL.revokeObjectURL', 'REVOKE_THROW'],
  ['MULTI_FILE_PICK', 'multiple', 'RAPID_MULTI_8'],
  ['MAX_FILES', 'MAX_FILES', '10개 허용·11개 차단'],
  ['MAX_FILE_BYTES', 'MAX_FILE_BYTES', 'oversized.jpg'],
  ['MAX_TOTAL_BYTES', 'MAX_TOTAL_BYTES', 'aggregate-byte guard'],
  ['MAX_PIXELS', 'MAX_PIXELS', 'desktop-40MP-jpg'],
  ['PICKER_CANCEL_NO_SELECTION', 'converter-file-input', 'cancel-like path'],
  ['MIXED_VALID_INVALID_BATCH', 'addFiles', 'mixed valid + zero-byte'],
  ['SAME_NAME_DIFFERENT_CONTENT', 'duplicateKey', 'same display name with different bytes'],
  ['ORIENTATION_VIEWPORT_CHANGE', 'toolbox-workbench-upload', 'portrait to landscape'],
  ['LOCALE_EN_WORKFLOW', 'converter-run', 'en mobile route'],
  ['LOCALE_JA_WORKFLOW', 'converter-run', 'ja mobile route'],
  ['WORKER_AND_FALLBACK_EXPORT_FAILURE', 'canvasToBlob', 'V27_WORKER_EXPORT_FAILURE_PLUS_FALLBACK_NULL_TERMINATES_AS_VISIBLE_ERROR'],
  ['DOWNLOAD_OBJECTURL_FAILURE', 'downloadBlob', 'download URL creation failure'],
  ['INPUT_CAPTURE_ALL_READ_PATHS_HANG_TIMEOUT', 'capturePickerFile', 'V27_INPUT_CAPTURE_ALL_READ_PATHS_HANG_HAS_TERMINAL_FEEDBACK'],
  ['WORKER_BITMAP_PROMISE_HANG_TIMEOUT', 'runTool001WorkerConversion', 'V27_WORKER_CREATEIMAGEBITMAP_HANG_MUST_TERMINATE_WITH_ERROR'],
  ['IMG_FALLBACK_HANG_TIMEOUT', 'new Image()', 'V27_MAINTHREAD_IMG_FALLBACK_HANG_MUST_TERMINATE_WHEN_WORKER_UNAVAILABLE'],
  ['UNMOUNT_DURING_PENDING_ADD', 'addFiles(selectedFiles)', 'V21_UNMOUNT_DURING_DELAYED_SELECTION_MUST_NOT_CRASH_ON_RETURN'],
  ['RELOAD_DURING_PROCESSING', 'convertAll(false)', 'V21_RELOAD_DURING_PROCESSING_RECOVERS_TO_USABLE_PAGE'],
  ['HISTORY_BACK_FORWARD', 'converter-file-input', 'V21_BACK_FORWARD_AFTER_SELECTION_RETURNS_USABLE'],
  ['RESET_STALE_ASYNC_RACE', 'clearAll', 'V21_RESET_DURING_ASYNC_CONVERT_MUST_NOT_RESURRECT_STALE_CARD'],
  ['DELETE_STALE_ASYNC_RACE', 'removeItem', 'V21_DELETE_DURING_ASYNC_CONVERT_MUST_NOT_RESURRECT_REMOVED_ITEM'],
  ['OUT_OF_ORDER_SELECTION_RACE', 'addFiles', 'V21_FAST_SECOND_SELECTION_MUST_NOT_BE_OVERWRITTEN_BY_SLOW_FIRST'],
  ['ANCHOR_CLICK_FAILURE', 'a.click()', 'V21_DOWNLOAD_ANCHOR_CLICK_FAILURE_IS_HANDLED'],
  ['WORKER_ZERO_BYTE_RESULT_BLOB', 'runTool001WorkerConversion', 'V27_WORKER_ZERO_BYTE_RESULT_IS_REJECTED_AND_SAFE_FALLBACK_USED'],
  ['CONVERT_DOUBLE_TAP', 'processing', 'V21_CONVERT_DOUBLE_TAP_DOES_NOT_DOUBLE_PROCESS'],
  ['DELETE_THEN_READD_AT_MAX', 'MAX_FILES', 'V21_DELETE_FROM_FULL_10_THEN_READD_REOPENS_CAPACITY'],
  ['SPECIAL_LONG_FILENAME', 'baseName', 'V21_SPECIAL_AND_LONG_FILENAME_SURVIVES_END_TO_END'],
  ['NARROW_DARK_MOBILE', 'toolbox-workbench-upload', 'V21_NARROW_320PX_DARKMODE_NO_HORIZONTAL_ESCAPE'],
  ['REPEAT_UPLOAD_RESET_LEAK_SENTINEL', 'safeRevokeObjectUrl', 'V21_REPEAT_UPLOAD_RESET_30X_HAS_NO_RUNTIME_ERROR'],
  ['ATTACHMENT_CAPTURE_BEFORE_ASYNC', 'capturePickerFile', 'V27_SELECTION_CAPTURES_OWNED_FILE_AND_DEFERS_WORKER_UNTIL_CONVERT'],
  ['ATTACHMENT_CONVERSION_WORKER_DEFERRED', 'runTool001WorkerConversion', 'V27_SELECTION_CAPTURES_OWNED_FILE_AND_DEFERS_WORKER_UNTIL_CONVERT'],
  ['MOBILE_DOWNSCALED_WORKER_BITMAP_DECODE', 'resizeWidth', 'V27_WORKER_CREATEIMAGEBITMAP_REQUESTS_DOWNSCALED_DECODE'],
  ['PICKER_APP_OWNED_CAPTURE', 'capturePickerFile', 'V26_SAME_CAPTURED_IMAGE_SURVIVES_INPUT_CLEAR_AND_DELAY'],
  ['PREVIEW_FAILURE_DATAURL_FALLBACK', 'previewFallbackAttempted', 'V26_PREVIEW_BLOBURL_FAILURE_FALLS_BACK_TO_APP_OWNED_DATAURL'],
  ['WORKER_IMAGE_ENGINE', 'runTool001WorkerConversion', 'V26_WORKER_ENGINE_IS_USED_FOR_CONVERSION_WHEN_AVAILABLE'],
];

const rows = risks.map(([id, sourceNeedle, testNeedle]) => ({
  id,
  sourcePresent: source.includes(sourceNeedle),
  coveragePresent: corpus.includes(testNeedle),
  sourceNeedle,
  testNeedle,
}));
const missing = rows.filter((r) => r.sourcePresent && !r.coveragePresent);
const report = { generatedAt: new Date().toISOString(), riskCount: rows.length, missingCount: missing.length, rows };
fs.writeFileSync(path.join(out, 'tool001-mobile-workflow-coverage.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(out, 'tool001-mobile-workflow-coverage.txt'), [
  'TOOL001 MOBILE WORKFLOW COVERAGE V27',
  `RISK_COUNT=${rows.length}`,
  `COVERAGE_MISSING=${missing.length}`,
  ...rows.map((r) => `${r.id}\tsource=${r.sourcePresent ? 'YES' : 'NO'}\tcoverage=${r.coveragePresent ? 'YES' : 'NO'}\ttest=${r.testNeedle}`),
].join('\n') + '\n');
console.log(`TOOL001 workflow coverage: ${rows.length} risks, missing=${missing.length}`);
if (missing.length) {
  for (const row of missing) console.error(`MISSING ${row.id} -> ${row.testNeedle}`);
  process.exit(1);
}
