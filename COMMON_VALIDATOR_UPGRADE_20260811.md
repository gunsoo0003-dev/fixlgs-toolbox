# FIXLGS TOOLBOX 공통 검수기 선제 보강 - 1차 적용

## 이번 추가 범위
제품 CSS/기능 코드는 수정하지 않고 검수기만 보강했다.

- 001~024 capability profile 추가
- PASS / FAIL / N/A / SKIP / COVERAGE_MISSING 구조 중 이번 자동검수에서 N/A와 COVERAGE_MISSING을 명시적으로 분리
- PC 실제 업로드 UI 클릭 -> filechooser -> change 검사
- 모바일 브라우저 프로파일 실제 업로드 UI 탭 -> filechooser -> change 검사
- 모바일 업로드 버튼 center-point overlay / z-index / pointer-events 차단 검사
- PC drag & drop 진입 검사
- 모바일 drag & drop은 정책상 N/A (SKIP 아님)
- KO/EN/JA 직접 URL 진입
- 새로고침 회귀
- console error / pageerror 검사
- capability profile과 사용자경로 suite 누락을 COVERAGE_MISSING으로 잡는 정적 coverage checker 추가

## 주의
Playwright mobile browser profile PASS는 실제 Android/iOS 실기기 PASS와 동일하지 않다.
실기기 상태는 별도 REAL_DEVICE_CHECK로 관리해야 한다.

## 새 명령

빠른 사용자경로 재검수:
`npm run test:toolbox:common-user-path-fast`

전체 1차 공통 사용자경로 검수:
`npm run test:toolbox:common-user-path`

정적 커버리지 구조만 확인:
`npm run check:toolbox:common-user-path-coverage`

## 아직 2차 확장 대상으로 남긴 기능군
다운로드 실제 버튼 이벤트, ZIP/다중 다운로드, reset/re-upload, slider/select/checkbox/toggle의 기능별 값 변화 검증, canvas/cropper별 정밀 결과, 각 도구별 boundary/limit은 기존 전용 검수와 중복을 피하기 위해 이번 1차 공통 user-path suite에서 억지로 통합하지 않았다.
이들은 공통 capability가 안정적으로 정의되는 순서대로 후속 확장한다.
