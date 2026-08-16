# TOOL 035 실패대응지도

## PRODUCT
제품 코드가 실제 요구사항을 위반할 때만 제품 결함으로 분류한다. 예: 50MB validation 미적용, page range 오작동, full-page render 결과를 embedded image로 오인, ZIP path traversal 허용. 신규 035 전용 파일만 수정한다.

## CHECKER / HARNESS
selector, fixture, expected, route, timeout, runner 연결이 현재 제품 코드와 맞지 않을 때 제품을 검수기에 맞춰 왜곡하지 않는다. 검수기 전용 최소 범위를 수정하고 HARNESS STRUCTURE를 다시 확인한다.

## ENVIRONMENT
node_modules/Playwright/browser/OS/file-picker/download permission 등 실행환경 문제는 제품 변경 근거로 사용하지 않는다. 주작업장 터미널에서 환경을 먼저 정상화한 뒤 재검수한다.

## 공통 변경 필요
공통 CSS/component/helper/parser/runner aggregate/package script 수정이 필요해 보이면 보조작업장에서 수정하지 않는다. 재현 조건과 필요한 후보만 HANDOFF한다. 현재 035 출고 상태에서는 필수 공통 변경 후보 없음.
