# TOOL045 보조작업장 최종 체크리스트

- CODE PASS — 전용 route/page/tool/CSS/helper 생성 완료
- FUNCTION-STATIC PASS — 핵심 4기능 및 오류/경계 contract 구현
- DESIGN-CODE PASS — MAIN 036 / SUB 039 기준, 전역 CSS 오염 0
- MOBILE-TYPO GATE — 가이드 카드 제목의 의미 단위 줄바꿈/고립 단어(orphan) 여부를 실제 모바일 렌더에서 확인
- HARNESS-STRUCTURE PASS — 6개 spec + fixture + selector 정적 정합
- PACKAGE PASS — 전용 이식 파일/검수자료/HANDOFF/원본 전달서 포장
- COMMON FILE PROTECTION PASS — 공통 CSS/robots/기존 완료 TOOL 보호, site/sitemap은 TOOL045 중앙 등록만 최소 변경
- STATIC VALIDATION PASS — source/design/harness/logic 4단계 FAIL 0
- 실제 Playwright/browser/build/통합 regression/FINAL — 주작업장 통합검증

- [x] PC/MOBILE-TYPO: 가이드 카드 긴 제목의 orphan wrap 여부 확인 — PC/mobile 실제 피드백 반영 완료


### CATEGORY-NUMBER-045
- Date & Time category must render the live TOOL045 card as **045**, not category-local index `01`.
- Verify KO/EN/JA `/category/date-time` and the exact TOOL045 card href.
- A detail-page FINAL PASS does not satisfy this category-list regression gate.
- Date & Time category card formatter must use 3-digit padding for the global TOOL number (`045`).
- Category card href must be locale-relative and resolve to `/ko|en|ja/date-difference-calculator`; hard-coded KO href is forbidden.
