# TOOL 020 REQ MASTER — 최신판 2026-08-09

원칙: 최신 020 제작전달서를 1차 원자화한 뒤 원본을 다시 처음부터 대조해 2차 누락 탐색을 반영했다. 현재 판정은 실제 코드·정적검사·Chromium 격리 renderer 실행근거와, 제공 기준본에서 구조적으로 불가능한 통합검증을 분리한다.

| REQ-ID | 근거 | 요구 | 구현/검증 위치 | 판정 | 근거 |
|---|---|---|---|---|---|
| 020-REQ-001 | §1,14,67 | PC·모바일·TV 안전영역 기능 보존 | component/policy | PASS | preview modes + safe guide |
| 020-REQ-002 | §1,14,67 | 로고 기능 보존 | component/renderer | PASS | logo state/render |
| 020-REQ-003 | §1,14,67 | 제목 기능 보존 | component/renderer | PASS | title state/render |
| 020-REQ-004 | §1,14,67 | 배경 이미지 기능 보존 | component/renderer | PASS | background state/render |
| 020-REQ-005 | §1,14,67 | 규격 미리보기 보존 | component | PASS | 2560×1440 result + device previews |
| 020-REQ-006 | §4,13 | 기본 결과 2560×1440 | policy/export | PASS | Chromium JPG/PNG decode 2560×1440 |
| 020-REQ-007 | §4 | 최소 규격 2048×1152 데이터 | policy | PASS | 단일 guideline data |
| 020-REQ-008 | §4 | 공식 safe 1235×338 데이터 | policy | PASS | 단일 guideline data |
| 020-REQ-009 | §4 | 파일 제한 6MB 데이터 | policy | PASS | maxBytes |
| 020-REQ-010 | §5 | 2560 canvas safe 비례환산 | scaledSafeArea | PASS | Chromium 1544×423 |
| 020-REQ-011 | §5 | 환산값을 YouTube 공식 직접값으로 표현 금지 | page copy/HANDOFF | PASS | TOOLBOX 환산 가이드로 분리 |
| 020-REQ-012 | §8,15 | No Stretch Cover crop | renderer | PASS | cover scale 계산 + browser 실행 |
| 020-REQ-013 | §15 | normalized crop X/Y/scale | component/renderer | PASS | 0~1 X/Y + zoom state |
| 020-REQ-014 | §15 | EXIF Orientation 반영 | loadImage | PASS | createImageBitmap(from-image), fixture browser PASS |
| 020-REQ-015 | §15 | preview/export 동일 crop 모델 | drawTool020Banner | PASS | 동일 renderer 함수 사용 |
| 020-REQ-016 | §12 | JPG/JPEG 배경 입력 | validation/input | PASS | MIME allowlist |
| 020-REQ-017 | §12 | PNG 배경 입력 | validation/input | PASS | MIME allowlist |
| 020-REQ-018 | §12 | WebP 배경 입력 | validation/input | PASS | MIME allowlist |
| 020-REQ-019 | §12 | PNG/JPG/WebP 로고 | validation/input | PASS | MIME allowlist |
| 020-REQ-020 | §12 | SVG 로고 제외 | validation | PASS | SVG MIME 비허용 |
| 020-REQ-021 | §12 | GIF/APNG/Animated WebP 기본 미지원 | validation/isAnimated | PASS | GIF type 거부 + APNG/WebP signature browser PASS |
| 020-REQ-022 | §12 | 애니메이션 첫 프레임 조용히 사용 금지 | pick flow | PASS | animated detect 후 오류 |
| 020-REQ-023 | §16 | TV 전체 배너 preview | component | PASS | tv mode |
| 020-REQ-024 | §16 | PC 중앙 crop preview | component/data | PASS | desktop viewport mask |
| 020-REQ-025 | §16 | 모바일 중앙 crop preview | component/data | PASS | mobile viewport mask |
| 020-REQ-026 | §16 | PC/mobile crop을 공식 고정값으로 오인시키지 않음 | UI/HANDOFF | PASS | preview guide data로 분리 |
| 020-REQ-027 | §16,67 | guide/mask/device label export 미포함 | renderer | PASS | renderer 미렌더 + guide true/false pixel same |
| 020-REQ-028 | §17 | 로고 1개 | limits/component | PASS | logoCount=1, 단일 state |
| 020-REQ-029 | §17 | 로고 drag | pointer events | PASS(코드) | pointer drag branch |
| 020-REQ-030 | §17 | 로고 크기 | component/renderer | PASS | logoScale |
| 020-REQ-031 | §17 | 로고 투명도 | component/renderer | PASS | globalAlpha |
| 020-REQ-032 | §17 | 로고 비율 유지 | renderer | PASS | width 기반 height ratio |
| 020-REQ-033 | §17 | 투명 PNG alpha 유지 | browser renderer | PASS | minA 0 / partial alpha 존재 |
| 020-REQ-034 | §17 | safe 밖 이동 허용 + 경고 | bounds/status | PASS | 전체 rect 판정, 강제차단 없음 |
| 020-REQ-035 | §17 | drag 외 대체 조작 | sliders/keyboard | PASS | X/Y slider + arrows |
| 020-REQ-036 | §18 | 제목 1개 | component | PASS | 단일 title state |
| 020-REQ-037 | §18 | 부제·본문·다중레이어 제외 | component | PASS | 보조문구 제거 |
| 020-REQ-038 | §18 | 글꼴 | component | PASS | select |
| 020-REQ-039 | §18 | 글자 크기 | component | PASS | slider |
| 020-REQ-040 | §18 | 글자 색상 | component | PASS | color input |
| 020-REQ-041 | §18 | 정렬 | component/renderer | PASS | left/center/right |
| 020-REQ-042 | §18 | 위치 이동 | pointer/slider/keyboard | PASS | 3방식 |
| 020-REQ-043 | §18 | 줄바꿈 | wrap renderer | PASS | newline + EN word + CJK char fallback |
| 020-REQ-044 | §18 | 외곽선 | renderer/UI | PASS | strokeText |
| 020-REQ-045 | §18 | 그림자 | renderer/UI | PASS | canvas shadow |
| 020-REQ-046 | §18 | 긴 제목 safe 초과 경고 | bounds/status | PASS | full text bounds 판정 |
| 020-REQ-047 | §18 | KO/EN/JA Canvas 렌더 경로 | browser renderer | PASS | KO+JA 혼합 실제 canvas 실행, UI locale는 통합검증 별도 |
| 020-REQ-048 | §19 | 실제 Blob.size 표시 | export flow | PASS | Blob.size 직접 사용 |
| 020-REQ-049 | §19 | 6MB 이하/초과 구분 | output UI | PASS | maxBytes 비교 |
| 020-REQ-050 | §19 | JPG 품질 slider | UI/export | PASS | quality 45~100 |
| 020-REQ-051 | §19 | PNG에 JPG quality 강제 금지 | UI/export | PASS | PNG 시 disabled/quality argument 없음 |
| 020-REQ-052 | §19 | 선택적 6MB 이하 맞추기 반복상한/품질하한 | fitUnderLimit | PASS | 최대 7회 / 45 하한 |
| 020-REQ-053 | §20 | AI/stock/API/login/cloud/collaboration 제외 | code review | PASS | 외부 API/계정 코드 없음 |
| 020-REQ-054 | §21 | 큰 preview + 설정 panel 구조 | component/CSS | PASS(코드) | workspace split |
| 020-REQ-055 | §21 | 설정 순서 배경→제목→로고→가이드→출력 | DOM | PASS | 실제 JSX 순서 |
| 020-REQ-056 | §22 | 모바일 preview 우선/세로설정 | CSS/DOM | PASS(코드) | responsive layout |
| 020-REQ-057 | §22 | touch/scroll 충돌 방지 | pointer CSS | PASS(코드) | canvas interaction scope; 실제 체감은 통합검증 |
| 020-REQ-058 | §22 | drag만 강제하지 않음 | sliders/keyboard | PASS | 대체 조작 있음 |
| 020-REQ-059 | §23 | theme이 결과 배너 색 변경 금지 | renderer | PASS | renderer는 theme 참조 없음 |
| 020-REQ-060 | §24-27 | KO/EN/JA 핵심 UI 데이터 | component/page | PASS(코드) | 3 locale copy 존재 |
| 020-REQ-061 | §27 | 일본어 모바일 overflow/IME 실검수 | 통합 Next UI | 주작업장 통합검증 | 제공 사본 dependency 설치 불가 |
| 020-REQ-062 | §30 | crop/안전영역/저작권/PNG 용량 주의 | page content | PASS(코드) | 페이지 콘텐츠 존재 |
| 020-REQ-063 | §31 | FAQ 실제 기능과 일치 | page content | PASS(코드) | FAQ 데이터 존재 |
| 020-REQ-064 | §32 | slug youtube-channel-banner-maker | page/HANDOFF/tests | PASS | 일치 |
| 020-REQ-065 | §33-35 | SEO title/description/structured data/canonical/hreflang 준비 | page data | PASS(코드) | page component metadata 구조 |
| 020-REQ-066 | §36 | sitemap/robots 최신 통합 반영 | 공통 영역 | 주작업장 통합검증 | 보조작업장 수정 금지 |
| 020-REQ-067 | §37 | 편집 흐름 내부 광고 금지 | tool component | PASS | 광고 코드 없음 |
| 020-REQ-068 | §38 | 사용자 파일/텍스트/EXIF 등 analytics 전송 금지 | code review | PASS | network 전송 코드 없음 |
| 020-REQ-069 | §39 | label/aria-live/preview 상태/keyboard 접근성 | component | PASS(코드) | labels, status, keyboard, roles |
| 020-REQ-070 | §41 | browser-only API server render 직접호출 금지 | client component | PASS | use client + browser 함수 실행 시점 제한 |
| 020-REQ-071 | §42 | slider마다 2560 최종 encode 반복 금지 | component | PASS | encode 명시적 size/download 시만 |
| 020-REQ-072 | §42 | preview는 축소 canvas, final은 2560 | component | PASS | 1280×720 preview / 2560×1440 export |
| 020-REQ-073 | §43 | Object URL/bitmap 정리 | releaseImage/reset/download | PASS | revoke/close 경로 |
| 020-REQ-074 | §43 | history 제한 | service limits | PASS | 24 state |
| 020-REQ-075 | §44 | 빈 파일 오류 | validation/browser | PASS | EMPTY_FILE |
| 020-REQ-076 | §44 | MIME/확장자 불일치 오류 | validation/browser | PASS | MIME_EXTENSION_MISMATCH |
| 020-REQ-077 | §44 | 손상 이미지 오류 | loadImage/pick | PASS(코드) | decode catch, fixture 존재 |
| 020-REQ-078 | §44 | 초대형 해상도/파일 오류 | limits/pick | PASS | 40MP + bytes limit |
| 020-REQ-079 | §44 | 반복 다운로드/교체/초기화 흐름 | component | PASS(코드) | state 유지/정리 경로 |
| 020-REQ-080 | §45 | 원본명-banner / 빈배너 기본명 | sanitizeDownloadName | PASS | browser/static 확인 |
| 020-REQ-081 | §45 | Windows 금지문자/공백/끝점/제어문자/긴이름/중복확장자 | sanitizeDownloadName | PASS | 함수 구현 |
| 020-REQ-082 | §46 | 실제 결과 2560×1440 | Chromium renderer | PASS | JPG/PNG decode |
| 020-REQ-083 | §46 | title/logo pixel 실제 반영 | Chromium renderer | PASS | renderer 실제 합성 실행 |
| 020-REQ-084 | §46 | alpha 실제 반영 | Chromium renderer | PASS | partial alpha 확인 |
| 020-REQ-085 | §47 | 주요 fixture 세트 | test-fixtures/tool020 | PASS | landscape/portrait/webp/logo/corrupt/mismatch/exif/animated |
| 020-REQ-086 | §48 | 배경 20MB 우선/30MB 비교 | service limits/HANDOFF | PASS | 20MB 적용, 30MB 비교 기록 |
| 020-REQ-087 | §48 | 로고 5MB 우선/10MB 비교 | service limits/HANDOFF | PASS | 5MB 적용, 10MB 비교 기록 |
| 020-REQ-088 | §48 | 40MP 우선/48MP 비교 | service limits/HANDOFF | PASS | 40MP 적용, 48MP 비교 기록 |
| 020-REQ-089 | §48 | 제목 120자 | service limits/UI | PASS | maxLength=120 |
| 020-REQ-090 | §48 | History 20~30 state | service limits | PASS | 24 |
| 020-REQ-091 | §51 | 020 script/spec/helper/fixture 존재 | files/check harness | PASS | harness check PASS |
| 020-REQ-092 | §51 | 0 tests + exit 0 금지 | test runner 설계 | PASS(준비) | specs 존재, 실제 Next runner는 통합검증 |
| 020-REQ-093 | §52 | preflight→core→boundary→regression→limit→FINAL 순서 | HANDOFF | PASS(준비) | 순서 기록 |
| 020-REQ-094 | §53 | 고정 결과 ZIP 이름 | tests/HANDOFF | PASS(준비) | 020 prefix 규칙 |
| 020-REQ-095 | §55 | 기존 FINAL PASS 영역 보호 | hash compare | PASS | 기준 017 457 SAME / 0 diff |
| 020-REQ-096 | §57 | REQ 1차 원자화 | 본 문서 | PASS | 완료 |
| 020-REQ-097 | §57 | 원본 재독립 2차 누락탐색 | 본 문서 | PASS | §1~67 재대조 반영 |
| 020-REQ-098 | §57 | 모든 REQ 근거판정 | 본 문서 | PASS | PASS/통합검증 구분 |
| 020-REQ-099 | §58 | 출고 YES/NO 중 보조작업장 가능한 항목 확인 | checklist/HANDOFF | PASS | 수정가능 FAIL 0 |
| 020-REQ-100 | §60 | 관련도구 실제 활성경로만 연결 | 공통 site 연결 | 주작업장 통합검증 | 제공 기준본 017, 019/021/022 상태 불완전 |
| 020-REQ-101 | §61 | 019/021 복사 잔여 번호 검사 | source checks | PASS | 020 source/harness PASS |
| 020-REQ-102 | §62 | 전달 ZIP 최소패치/최상위 fixlgs-toolbox | 출고 단계 | N/A | 사용자 ZIP 생성 지시 전 |
| 020-REQ-103 | §63-64 | 보조작업장 격리 실행검수 | Chromium native renderer | PASS(가능범위) | 실제 browser Canvas/File/Blob/ImageBitmap 실행 |
| 020-REQ-104 | §64 | 실제 React UI PC/mobile/KO/EN/JA/Playwright | Next app runtime | 주작업장 통합검증 | node_modules 없음 + registry @playwright/test 404 |
| 020-REQ-105 | §64 | console/runtime 치명오류 0 | Chromium renderer | PASS(격리범위) | console/page error 0 |
| 020-REQ-106 | §64 | 최신 전체 regression/build/FINAL/배포 | 전체 프로젝트 | 주작업장 통합검증 | 역할 경계 |
| 020-REQ-107 | §65 | 제작/배포 시 YouTube 정책 재확인 | 정책 운영 절차 | 주작업장 통합검증 | 배포 시점 재확인 필요 |
| 020-REQ-108 | §67 | 공통구조 무단 수정 금지 | hash compare | PASS | changed 0 |

## 최종 REQ 판정
- 보조작업장 코드/파일/격리 Chromium으로 판정 가능한 FAIL: **0**
- 주작업장 통합검증으로 남은 REQ: 061, 066, 100, 104, 106, 107
- ZIP 생성 전 N/A: 102
- REQ 자체 누락 재대조: §1~67 2차 확인 완료
