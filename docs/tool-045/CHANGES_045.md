# TOOL045 변경 기록

## 2026-08-17 PC/모바일 가이드 제목 줄바꿈 피드백 2차 반영

- PC 화면에서도 `word-break: keep-all` 때문에 긴 한국어 가이드 제목의 마지막 단어가 다음 줄로 고립될 수 있음을 실제 화면에서 재확인했다.
- 전역 공통 CSS를 수정하지 않고 TOOL045 전용 module scope에서 보조하고,, 의미를 유지하면서 제목 자체를 짧게 정리했다.
- `시작일 포함은 정확히 하루 추가` → `시작일 포함은 1일 추가`
- `달력 기간은 단순 환산하지 않음` → `달력 기간은 달력 단위로 계산`
- `시간대가 계산에 섞이지 않음` → `시간대는 계산에서 제외`
- 이 수정은 PC와 모바일 모두 동일한 한국어 문구 계약에 반영한다.

## 2026-08-17 모바일 가이드 제목 줄바꿈 피드백 반영

- 실제 모바일 화면에서 날짜 차이 가이드 카드 제목의 줄바꿈이 문장 의미 단위와 어긋나는 사례를 확인했다.
- 특히 `시작일 포함은 정확히 하루 / 추가`처럼 마지막 단어만 다음 줄에 고립되는 orphan wrap과 `달력 기간은 단순 환산하지 / 않음` 형태의 부자연스러운 분리를 문제로 기록한다.
- 제품 문구 자체를 무리하게 줄이거나 개별 `<br>`을 삽입하지 않고, TOOL045 전용 modifier를 통해 모바일 heading에 `text-wrap: balance`를 적용했다.
- 공통 전역 스타일의 일반 규칙은 변경하지 않고 TOOL045 scope로만 수정했다.
- 향후 신규 TOOL의 모바일 긴 제목/가이드 카드에도 같은 유형이 발생하는 경우, 첫 화면/하단 정보 섹션의 의미 단위 줄바꿈과 orphan wrap 여부를 모바일 디자인 검수 항목으로 확인한다.

## 검수 영향

- DESIGN-CODE gate에 모바일 의미 단위 줄바꿈 항목 추가
- CHECKLIST에 MOBILE-TYPO gate 추가
- 수정 범위: `components/date-difference-calculator-page.tsx`, `components/date-difference-calculator-tool.module.css` + TOOL045 문서 2종
- 공통 CSS 파일의 기존 규칙을 덮어쓰지 않고 TOOL045 modifier로 범위를 한정한다.
## 2026-08-17 디자인 완료 후 CHECKER 재대입

- 디자인 완료 상태를 기준으로 실제 제품 DOM/testid/state/결과영역을 다시 대조했다.
- preflight에 초기 reset disabled, include-start unchecked, empty-result/result 부재 계약을 명시했다.
- boundary에 runtime error 표시와 result 미생성 scope를 명시했다.
- regression은 KO/EN/JA 동일 날짜 결과를 계속 검증하고, limit은 기술 지원 범위의 장기 날짜 경계를 유지한다.
- FINAL runner가 feature 단계를 누락하고 있던 harness 계약을 발견해 `feature-only` 모드와 FINAL feature 실행을 추가했다.
- checker는 제품에 없는 selector를 가정하지 않고 실제 `tool045-*` testid 계약만 참조하도록 재정합했다.
- package-lock 의존성은 변경하지 않았다.

## CHECKER 업데이트 파일

- `scripts/tool-045/check-source.mjs` — 실제 route/site/sitemap/testid 계약 재대입
- `scripts/tool-045/check-design.mjs` — expert modifier 및 PC/mobile 구조 게이트 재대입
- `scripts/tool-045/check-harness.mjs` — 실제 testid/state/feature/FULL runner/package script 정합 강화
- `tests/tool-045-preflight.spec.ts` — 초기 reset/include/result/error 상태 inventory 강화
- `scripts/tool-045/run-validation-full.mjs` — FEATURE 단계 누락 수정, feature-only 추가, dependency ENVIRONMENT BLOCK 분리
- `package.json` — `test:toolbox:045-feature-only` 추가
- STATIC 결과: source/design/harness/logic 전체 `PASS`, `fail=0`


### 2026-08-17 — Category number regression
- Local verification found the Date & Time category card showing `01` instead of global TOOL number `045`.
- Root cause: Date & Time already calculated global tool number 45, but the category-card formatter applied 3-digit padding only to content-image/PDF/text and fell back to 2-digit padding, rendering `45` instead of `045`.
- Fix: include `date-time` in the category renderer's 3-digit global TOOL-number formatter (`padStart(3, "0")`), so 45 renders as `045`.
- Checker reinforcement: regression spec now verifies the KO/EN/JA Date & Time category card for exact `045` numbering.
- This invalidates the prior FINAL PASS until the modified regression and final gates are rerun.

### 2026-08-17 category-link regression fix
- Fixed TOOL045 Date & Time category mapping to localize the live card href as `/${locale}/${tool045Slug}` for KO/EN/JA instead of leaving a hard-coded KO href.
- Targeted regression is required before the next FINAL.
