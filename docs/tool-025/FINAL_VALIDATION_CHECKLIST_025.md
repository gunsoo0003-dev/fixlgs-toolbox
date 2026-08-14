# TOOL 025 FINAL VALIDATION CHECKLIST — 2026-08-14 DESIGN LOCK

이 체크리스트는 TOOL 025 디자인 확정본(v12)의 최종 검수 기준이다. 제품 디자인은 이 문서 이후 임의 변경하지 않는다.

## A. 024 디자인/드롭 상태 이식
- [x] 기준 도구는 TOOL 024 실제 JSX/CSS 상태전이이다.
- [x] 보이는 Dropzone은 가로 전체폭으로 항상 DOM에 유지된다.
- [x] 업로드 전 Dropzone은 파란 점선/플러스/파일선택 상태이다.
- [x] 업로드 후 Dropzone은 `dropzoneReady` 중립/축소 상태가 되며 삭제되지 않는다.
- [x] 업로드 후 `dropzoneReady::before`로 파란 플러스 아이콘이 제거된다.
- [x] Dropzone 또는 workspace에 파일을 다시 드래그하면 동일한 shared drag 상태가 켜진다.
- [x] workspace는 TOOL024 방식 `::after` 오버레이를 사용하며 별도 custom overlay DOM을 만들지 않는다.
- [x] drag leave 시 workspace 강조가 정상 해제된다.
- [x] drop 시 `acceptFile(dataTransfer.files[0])` 경로로 새 사진이 교체된다.

## B. 확정 레이아웃
- [x] 상단 작업영역은 PREVIEW 2칸 + PRESET 1칸이다.
- [x] PREVIEW 최소 작업높이는 PC 620px이다.
- [x] 하단은 EXPORT / A4 PRINT / ALIGN 3개 동일폭 카드이다.
- [x] 하단 3개 카드는 동일 높이 stretch 구조이다.
- [x] 독립 RESET 카드는 없다.
- [x] 모바일에서 강제 `order:-1` 재배치가 없다.

## C. EXPORT/A4/ALIGN
- [x] EXPORT 한 action group 안에 개별 다운로드 / A4 다운로드 / 설정 초기화 / 전체 초기화가 순서대로 존재한다.
- [x] A4 PRINT 카드는 미리보기/가이드 전용이며 A4 다운로드 버튼을 따로 갖지 않는다.
- [x] A4 미리보기는 실제 업로드 사진을 canvas에 반복 배치한다.
- [x] A4는 210×297mm, cut guide, 100% 실제크기 인쇄 안내를 유지한다.
- [x] ALIGN은 zoom / center / D-pad 위치 이동을 유지한다.

## D. 증명사진/여권사진 기능
- [x] 한국 여권 인화 35×45mm preset.
- [x] 한국 여권 온라인 413×531px preset.
- [x] 미국/일본/영국/캐나다 여권 preset.
- [x] 일반 30×40mm / 35×45mm / custom mm preset.
- [x] No Stretch cover crop + zoom + position.
- [x] 얼굴 위치 guide는 preview에서만 표시되고 출력에는 합성되지 않는다.
- [x] 한국 온라인 preset은 JPG 고정, 실제 413×531px, 500KB 이하 저장 경로를 사용한다.
- [x] 일반 인화 preset은 PNG 선택 가능하다.
- [x] JPG/PNG 개별 다운로드와 A4 PNG 다운로드를 제공한다.

## E. 파일 입력/안정성/한도
- [x] `StableMobileImageFileInput` + `mobileCaptureMode="pixels"` 경로를 유지한다.
- [x] JPG/PNG/WebP 정적 이미지 1개만 허용한다.
- [x] 서비스 후보 상한은 15MB / 40MP이다.
- [x] corrupt image를 거부한다.
- [x] animated WebP를 거부한다.
- [x] animated APNG를 거부한다.
- [x] 40MP 경계 fixture는 허용하고 초과 fixture는 거부한다.

## F. 다국어/콘텐츠/통합
- [x] KO/EN/JA route와 UI가 존재한다.
- [x] HOW TO USE / 전문가 포스팅 / 중요 안내 / FAQ는 공통 TOOLBOX DOM을 사용한다.
- [x] TOOL024 잔여 testid/문구가 TOOL025 제품 코드에 남지 않는다.
- [x] site metadata / sitemap / canonical-hreflang 연결을 유지한다.
- [x] 025 전용 CSS는 module.css에만 두고 globals/legacy sealed CSS를 오염시키지 않는다.
- [x] 001~024 보호 파일을 수정/삭제하지 않는다.

## G. 검수기 자체 완료 기준
- [x] 이 체크리스트를 `check-final-checklist.mjs`가 정적으로 대입한다.
- [x] design-transplant checker가 024 dropzoneReady/shared-drag/workspace-overlay 계약을 검사한다.
- [x] runtime design-state spec이 업로드 전/후 Dropzone 상태와 workspace drag highlight를 검사한다.
- [x] core가 KO/EN/JA 업로드/preview/output-size를 검사하며 파일 입력은 항상 마운트된 `tool025-file-input` selector를 사용한다.
- [x] core/boundary/regression/limit에는 삭제된 `dropzone > input` selector 잔재가 없고 모두 `tool025-file-input`을 사용한다.
- [x] boundary가 corrupt/animated WebP/APNG를 검사한다.
- [x] feature가 한국 온라인 JPG 500KB 이하 실제 다운로드와 PNG 선택 가능 preset을 검사한다.
- [x] regression이 route/024 잔여문구/다운로드 버튼 상태를 검사한다.
- [x] limit가 40MP 경계를 검사한다.
- [x] FINAL은 static → TypeScript → production build → core → boundary → feature+design-state → regression → limit 순으로 한 번에 실행한다.
- [x] 각 단계 FAIL이 발생해도 가능한 다음 단계를 계속 실행하고 최종 결과 ZIP을 남긴다.
- [x] 검수 성공/실패와 관계없이 결과 ZIP은 Windows Desktop에 생성한다.
- [x] FINAL PASS 기준은 FAIL=0 / SKIP=0이다.
- [x] TOOL025가 Android 모바일 실기기 real-photo runner의 실제 대상 목록에 등록되어 있다.
- [x] 모바일 실기기 runner는 `tool025-file-input` + 실제 Native Picker 경로 + 업로드 후 preview canvas + 다운로드 준비상태를 검사한다.
- [x] TOOL025 모바일 실기기 workflow는 개별 이미지 다운로드와 A4 다운로드까지 실제 Android Download 저장 변화를 확인한다.
- [x] 모바일 실기기 runner의 PRODUCT/HARNESS 실패 및 fatal harness 오류에서도 Desktop 결과 ZIP 생성을 시도한다.
- [x] 모바일 실기기 실행 중 터미널에는 TOOL/단계 진행상황이 출력된다.
- [x] TOOL025 모바일 실기기 검수는 기존 001~024 runner의 Android Picker/UIAutomator/재검사/다운로드 로직을 그대로 사용하고 025 정의만 추가한다.
- [x] 025가 운영 미배포 상태일 때 새 로컬 서버를 자동 생성하지 않는다. 이미 실행 중인 dev server만 탐색하고 필요 시 adb reverse로 기존 runner에 연결한다.
- [x] 404/Page not found는 PRODUCT_FAIL로 오판하지 않고 HARNESS_FAIL로 분리한다.

## H. 실행 전제
- 실제 FINAL은 node_modules가 준비된 주작업장 로컬 환경에서 실행한다.
- 실제 Android Native Picker 실기기 검수는 PC Playwright FINAL과 별도 실기기 게이트이며 PC 에뮬레이션으로 대체하지 않는다.

### Windows runner safety (v14)
- [x] `.cmd` / `.bat` 직접 spawn 금지
- [x] TypeScript CLI를 `process.execPath + node_modules/typescript/lib/tsc.js`로 실행
- [x] spawn synchronous throw / error 이벤트 모두 FAIL 로그화
- [x] validator 자체 오류 시에도 Desktop 결과 ZIP 생성 시도
- [x] 장기 실행 단계는 15초마다 단계명 기반 진행상황 출력
