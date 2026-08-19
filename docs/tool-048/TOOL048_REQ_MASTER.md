# TOOL048 REQ MASTER

원본 전달서 1차 원자화 + 2차 누락대조 기준. 보조작업장 권한 범위와 주작업장 통합검증을 분리한다.

| REQ-ID | 근거 | 최소 요구사항 | 구현/검증 | 판정 |
|---|---|---|---|---|
| 048-R001 | 1,13 | 만나이 정확 계산 | helper/result | PASS |
| 048-R002 | 1,13 | 연나이 계산 | helper/result | PASS |
| 048-R003 | 1,13 | 생후 일수 | helper/result | PASS |
| 048-R004 | 1,13 | 다음 생일까지 | helper/result | PASS |
| 048-R005 | 11,13 | 기준일 오늘 기본 + 변경 | client state/date input | PASS |
| 048-R006 | 10 | 브라우저 로컬/date-only | serial math/source check | PASS |
| 048-R007 | 14 | 365 나눗셈 금지/calendar arithmetic | helper | PASS |
| 048-R008 | 14,25 | 2/29 정책 명시 | FEB_28 + UI/FAQ | PASS |
| 048-R009 | 12,14 | 복사 success-only + fallback | component | PASS |
| 048-R010 | 38,40 | 동일일/윤년/월말/연말연초 | fixture/runtime | PASS |
| 048-R011 | 38 | 미래 DOB 오류 | helper/UI | PASS |
| 048-R012 | 41 | 서비스 유효상한 일치 | helper/input/fixture/FAQ | PASS |
| 048-R013 | 16,17 | PC/mobile 코드 구조 | module responsive | PASS |
| 048-R014 | 19-22 | KO/EN/JA | locale copy | PASS |
| 048-R015 | 23-26 | 사용법/예시 기준/주의/FAQ | page content | PASS |
| 048-R016 | 27 | slug | age-life-calculator | PASS |
| 048-R017 | 28 | SEO title/meta | route metadata | PASS |
| 048-R018 | 29 | WebApplication/FAQ/Breadcrumb | JSON-LD | PASS |
| 048-R019 | 30 | canonical/hreflang | metadata alternates | PASS |
| 048-R020 | 31 | sitemap/robots | 공통파일 보호상 미수정 | 주작업장 통합검증 전용 |
| 048-R021 | 33 | 입력 원문 analytics 금지 | no network/storage | PASS |
| 048-R022 | 34 | label/focus/aria-live/touch | component/CSS | PASS |
| 048-R023 | 36,37 | 불필요 library/timer/blob 없음 | source | PASS |
| 048-R024 | 39-44 | checker 구조/fixture/spec | scripts/tests | PASS |
| 048-R025 | 42 | 실제 PC/mobile/browser/build/final | 상위 개정 이관 | 주작업장 통합검증 전용 |
| 048-R026 | 46 | 기존 정상 기준 보호 | MAIN TOOL045 read-only | PASS |
| 048-R027 | 47 | 전달 ZIP 최상위 fixlgs-toolbox | 패키징 검증 | PASS |
| 048-R028 | 51 | REQ master/누락 재대조 | 본 문서 | PASS |
| 048-R029 | 53 | FAIL 0/SKIP 0 최종 실행 | 통합 런타임 필요 | 주작업장 통합검증 전용 |
