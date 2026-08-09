# TOOL 020 최신 지시서 대입 체크리스트 — 재대입 결과

판정: PASS / FAIL / 주작업장 통합검증 / N/A

## 기능·연결·안전성
- [PASS] 도구 020 / C 콘텐츠 이미지 제작 / slug 일치
- [PASS] 기본 기능: PC·모바일·TV 안전영역, 로고·제목, 배경 이미지, 규격 미리보기
- [PASS] 보조문구 제거 / 제목 1개 기본
- [PASS] Contain 제거 / No-Stretch Cover 중심
- [PASS] 빈 배너 시작
- [PASS] 2560×1440 / 2048×1152 / 1235×338 / 6MB 단일 정책 데이터
- [PASS] 안전영역 1544×423 비례환산 및 중앙 정렬
- [PASS] normalized background X/Y/zoom
- [PASS] EXIF Orientation 브라우저 decode 경로
- [PASS] APNG/Animated WebP 거부
- [PASS] GIF/SVG 기본 미지원
- [PASS] MIME/확장자 mismatch 거부
- [PASS] 빈 파일 거부
- [PASS] 20MB 배경 / 5MB 로고 / 40MP / 제목 120 / history 24 적용
- [PASS] 제목 font/size/color/align/wrap/outline/shadow
- [PASS] 로고 size/position/opacity/aspect/alpha
- [PASS] 제목·로고 전체 bounds 안전영역 판정
- [PASS] 안전영역 자동 이동 Chromium 실검수
- [PASS] TV/PC/mobile/safe preview data 분리
- [PASS] preview 전환은 디자인 좌표 비변경 구조
- [PASS] guide ON/OFF
- [PASS] renderer에서 guide/mask/handle 미렌더
- [PASS] JPG/PNG export
- [PASS] JPG quality / PNG quality 비적용
- [PASS] Blob.size 실제 사용
- [PASS] 6MB 경고 및 JPG fit-under-limit 경로
- [PASS] 새 이미지 / reset / 재다운로드 / 계속 편집
- [PASS] Undo/Redo state 제한
- [PASS] 로컬 브라우저 처리, 사용자 이미지/텍스트 서버 전송 코드 없음
- [PASS] 결과 파일명 sanitize / 중복확장자 방지 / 다국어 유지

## 실제 Chromium renderer 검수
- [PASS] 1440×1000 브라우저 context
- [PASS] 360×800 브라우저 context
- [PASS] 320×720 브라우저 context
- [PASS] JPG 실제 encode/decode 2560×1440
- [PASS] PNG 실제 encode/decode 2560×1440
- [PASS] transparent logo partial alpha
- [PASS] guide true/false export pixel 동일
- [PASS] EXIF orientation fixture 반영
- [PASS] APNG 감지
- [PASS] animated WebP 감지
- [PASS] MIME mismatch/empty/GIF 오류 분기
- [PASS] console error 0 / page error 0 (격리 renderer 검수)

## 디자인 정합성
- [PASS] 020 전용 CSS/module 범위 사용
- [PASS] Primary Action 검정/흰색 계열
- [PASS] 넓은 배너 preview + 설정 panel이라는 020 정상 특화 구조
- [PASS] 모바일 breakpoint/overflow 대응 CSS 존재
- [PASS] KO/EN/JA 문구 데이터 존재
- [PASS] 일본어 긴 문구에 강제 nowrap 구조 없음
- [PASS] 공통 globals/layout/workbench 미수정
- [주작업장 통합검증] 실제 Next/React 전체 페이지 PC 픽셀 렌더
- [주작업장 통합검증] 실제 Next/React 모바일 UI·touch·scroll·IME·hover
- [주작업장 통합검증] 019와의 실제 디자인 비교 — 제공 기준본이 017이라 019 코드 없음

## 검수기·REQ
- [PASS] SOURCE CHECK
- [PASS] HARNESS CHECK
- [PASS] preflight spec 존재
- [PASS] core spec 존재
- [PASS] boundary spec 존재
- [PASS] regression spec 존재
- [PASS] limit spec 존재
- [PASS] fixture 존재
- [PASS] REQ master 작성
- [PASS] 제품/정책/검수 기대값 정적 교차대조
- [주작업장 통합검증] Next 앱 기반 실제 @playwright/test 실행 — node_modules 부재 + registry 404
- [주작업장 통합검증] 최신 전체 프로젝트 regression / production build / FINAL

## 공통파일 절대보호
- [PASS] 기준 017 비-.git 457개 파일 hash SAME
- [PASS] CHANGED 0
- [PASS] MISSING 0
- [PASS] app/globals.css 미수정
- [PASS] lib/site.ts 미수정
- [PASS] sitemap/robots 미수정
- [PASS] 기존 001~017 미수정
- [PASS] 기존 검수기/공통 selector contract 미수정

## 출고 상태
- 기능·코드로 수정 가능한 FAIL: 0
- 정적 검수 FAIL: 0
- Chromium renderer 실행검수 FAIL: 0
- 공통 보호영역 diff: 0
- 남은 항목: 제공 기준본과 의존성 제약 때문에 실제 Next/React 통합환경에서만 확정 가능한 항목
- ZIP: 아직 생성하지 않음
- 상태: PRE-ZIP READY 후보 — 사용자 ZIP 지시 전 READY 금지
