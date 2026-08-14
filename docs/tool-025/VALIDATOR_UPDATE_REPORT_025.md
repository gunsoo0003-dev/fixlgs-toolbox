# TOOL 025 VALIDATOR UPDATE REPORT — 2026-08-14

## Design lock
- Product TSX/CSS/page/policy were not changed from v12.
- Validator hardening only: tests, validator scripts, docs/contract metadata.

## Checklist application result
- FINAL CHECKLIST PASS
- RUNNER CONTRACT PASS
- SOURCE PASS
- HARNESS STRUCTURE PASS
- INTEGRATION PASS
- DESIGN TRANSPLANT PASS
- CONTENT DENSITY PASS
- COMMON DESIGN PASS
- scripts/tool-025/*.mjs NODE_CHECK PASS

## Validator mismatch found and fixed
The v12 product keeps `StableMobileImageFileInput` mounted outside the visual Dropzone. Several older runtime specs still searched `tool025-dropzone > input`, which could generate a validator false failure even when the product was correct.

Fixed specs:
- tool-025-core.spec.ts
- tool-025-boundary.spec.ts
- tool-025-regression.spec.ts
- tool-025-limit.spec.ts

All now use the stable `tool025-file-input` testid directly.

## New final gates
- Added `FINAL_VALIDATION_CHECKLIST_025.md`.
- Added `check-final-checklist.mjs` to map the final checklist back to current product source/policy/tests/runner.
- Added `tool-025-design-state.spec.ts` for runtime verification of the TOOL024-derived Dropzone lifecycle.
- `feature-only` now runs both feature output tests and design-state runtime tests.
- `final` now runs checklist/static gates, TypeScript, production build, core, boundary, feature, design-state, regression and limit in one command.
- Result ZIP remains Desktop output and FAIL=0 / SKIP=0 is required for FINAL PASS.

## Runtime note
Actual Playwright/TypeScript/production-build FINAL was not executed in this container because the supplied package does not include the local dependency environment. The validator package is prepared for the user's dependency-equipped main-workshop environment.

## v14 Windows spawn hotfix
- Node.js v24 / Windows PowerShell에서 `.cmd` 파일을 `spawn(..., shell:false)`로 직접 실행할 때 발생한 `spawn EINVAL`을 제거했다.
- TypeScript는 `node_modules/typescript/lib/tsc.js`를 `process.execPath`로 실행한다.
- 모든 Node 기반 child process는 PATH의 `node` 문자열 대신 현재 실행 중인 `process.execPath`를 사용한다.
- `spawn()`의 동기 예외와 `error` 이벤트를 모두 결과 로그로 수집한다.
- 검수기 자체 예외가 발생해도 `summary.txt`, `summary.json`, Desktop 결과 ZIP 생성을 시도한다.
- FINAL 장기 단계는 15초 간격으로 현재 단계명과 경과시간을 출력한다.

## v15 Android real-device validator synchronization
- TOOL025를 `run-mobile-real-photo-001-025.mjs` 실제 대상 목록에 등록했다.
- 입력 selector는 항상 마운트된 `tool025-file-input`, 사용자 클릭 경로는 실제 보이는 `tool025-dropzone` 버튼을 사용한다.
- Native Picker → Gallery → Camera → 첫 사진 → Chrome 복귀 → 즉시 소스크롤 → preview canvas 생성까지 기존 실기기 골든 경로를 유지한다.
- 업로드 후 `dropzoneReady`, workspace, 출력 크기, A4 배치 수, 개별/A4 다운로드 활성화를 검사하고 Android Download 변경을 실제 확인한다.
- 기존 `run-mobile-real-photo-001-024.mjs`는 새 001~025 runner로 위임하는 호환 shim으로 바꿔 오래된 runner 실행으로 025가 누락되지 않게 했다.
- PRODUCT/HARNESS 실패뿐 아니라 fatal harness 오류에서도 Desktop 결과 ZIP 생성을 시도하도록 archive 경로를 보강했다.
- `check-mobile-real-photo-validator.mjs`와 source audit를 25개 도구 기준으로 갱신했다.
- package scripts에 `test:toolbox:025-mobile-real`과 전체 001~025 runner 명령을 추가했다.


## v16 pre-deploy Android local-server / Page Not Found fix
- v15 실기기 결과에서 운영 URL `https://toolbox.fixlgs.com/ko/id-passport-photo-maker`가 아직 미배포라 404였는데도 W1이 PASS되고 이후 selector timeout이 PRODUCT_FAIL로 오분류되는 문제를 확인했다.
- TOOL025 단독 명령은 이제 별도 `--base-url`이 없으면 자동으로 pre-deploy local mode를 사용한다.
- PC에서 Next.js dev server를 `127.0.0.1:3025`로 자동 실행하고, 해당 025 route의 HTTP 200/404 여부를 먼저 검증한다.
- `adb reverse tcp:3025 tcp:3025`를 설정하여 Galaxy Chrome이 같은 `http://127.0.0.1:3025/ko/id-passport-photo-maker`를 연다.
- HTTP 404/Page not found는 `HARNESS_WEB_ROUTE_NOT_READY`, 로컬 route에서 기대 025 DOM이 없으면 `HARNESS_EXPECTED_TOOL_DOM_MISSING`으로 분리해 제품 실패 오판을 차단한다.
- 3025 포트에 이미 정상 025 서버가 있으면 재사용하고, 다른 페이지/404가 점유 중이면 HARNESS_FAIL로 중단한다.
- 종료 시 adb reverse를 제거하고 검수기가 직접 시작한 Next.js 서버 프로세스 트리를 정리한다.
- local server preflight, adb reverse 상태, server stdout/stderr가 결과 폴더에 포함되며 fatal harness에서도 Desktop ZIP 생성을 유지한다.
