FIXLGS TOOLBOX MOBILE REAL-PHOTO VALIDATOR V18
Date: 2026-08-13

Scope: validator/harness only. Product source is NOT modified.

V18 changes from V17:
1) TOOL005 real-user unreached flow
   - tap "현재 결과 사용 / Use current result"
   - wait until product card data-accepted=true
   - wait until the real individual Download action becomes visible
   - then perform the existing real download verification

2) TOOL013 delayed duplicate-download confirmation
   - keep Android Download storage polling active for up to 20s
   - during polling, also inspect native Chrome UI for delayed duplicate-download confirmation
   - tap ONLY "다시 다운로드 / Download again"
   - Open/열기 remains a hard deny action and is never tapped

3) TOOL015/016 evidence-only diagnostics
   - no product bypass, no limit exception, no fake upload
   - after picker return, record the file-input metadata currently exposed by the live page
   - record data-mobile-stable-input, visible canvas dimensions, loaded image natural dimensions,
     and relevant pixel/limit text
   - TOOL015/016 remain normal product verdict targets; failures are not converted to PASS

Preserved from V17:
- Android Chrome real picker flow
- camera first-photo selection
- product vs harness failure separation
- actual Android Download file existence/size verification
- no Open/열기 click
- normal browser/device cleanup and result ZIP creation

Recommended focused run first:
  node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 5,13,15,16

If --only comma-list is not supported by the current runner CLI, run each separately:
  node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 5
  node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 13
  node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 15
  node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 16

Static self-check in package environment:
  tools=24
  errors=0
  PASS

Real Android device execution is still required for final validation.
