# FIXLGS TOOLBOX 공통검수기 단건 모드

## 사용법

전체 FULL 검수:

    npm run test:toolbox:common-user-path

특정 도구 1개만 FULL 공통검수:

    npm run test:toolbox:common-user-path -- 025

번호는 25 / 025 모두 허용하며 내부에서 3자리로 정규화한다.

## 동작

- capability-profile에서 지정 도구만 선택한다.
- PC 실제 업로드 사용자경로
- 모바일 브라우저 실제 업로드 사용자경로
- PC drag & drop (해당 기능 존재 시)
- KO/EN/JA 직접 URL + reload + runtime
- capability semantics
- 존재하지 않는 기능은 profile 기준으로 N/A/비실행 처리한다.
- profile에 도구가 등록되지 않았으면 COVERAGE_MISSING으로 종료한다.

## 결과 ZIP

단건 검수 결과는 Windows Desktop에 다음 이름으로 생성한다.

    TOOLBOX_025_공통검수_검수결과.zip

전체 FULL / FAST 기존 결과 ZIP 이름은 변경하지 않는다.

## 검증

- 전체 profile coverage: PASS 24 / FAIL 0 / COVERAGE_MISSING 0
- TOOL 024 단건 coverage: PASS 1 / FAIL 0 / COVERAGE_MISSING 0
- TOOL 025 미등록 상태 확인: COVERAGE_MISSING 정상 차단
