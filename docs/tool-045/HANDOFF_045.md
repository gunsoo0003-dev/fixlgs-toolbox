# TOOL045 Handoff Update

## Latest feedback carried forward

모바일 실제 화면에서 가이드 카드 제목의 줄바꿈을 디자인 검수 대상으로 추가한다. 의미 단위가 깨지거나 한 단어만 다음 줄에 고립되는 경우 디자인 이슈로 분류하고, 공통 CSS 전체 수정 대신 TOOL별 scope modifier로 최소 수정한다.

현재 반영: `toolbox-tool-expert-post--045` + mobile `text-wrap: balance`.

## CHECKER 재대입 — 2026-08-17

디자인 완료 후 최신 실제 제품 코드 기준으로 checker를 다시 정합했다. 초기 상태, 결과 mount/unmount, 역순 오류, reset, KO/EN/JA, 장기 경계, PC/mobile 프로젝트를 반영했다. FINAL runner에는 feature 단계가 누락되어 있어 `feature-only` 모드와 FINAL feature 실행을 추가했다. 다음 검수는 STATIC PASS 후 dependency preflight를 거쳐 PRE-FLIGHT → CORE → BOUNDARY → FEATURE → REGRESSION → LIMIT → TypeScript → production build 순으로 수행한다.


## 현재 checker 실행 순서

STATIC self-check → dependency preflight → PRE-FLIGHT → CORE → BOUNDARY → FEATURE → REGRESSION → LIMIT → TypeScript → production build → FINAL 종합판정. 환경 의존성이 없으면 browser/type/build를 제품 FAIL로 중복 기록하지 않고 ENVIRONMENT BLOCK으로 분리한다.


### Latest feedback — category numbering
The previous FULL FINAL passed the detail page but missed the category list numbering contract. The live TOOL045 card first appeared as `01` during local verification; after the global-number correction it rendered `45` because Date & Time was still excluded from the 3-digit formatter. The final fix includes Date & Time in the 3-digit formatter so the card renders `045`. The next verification must include category-page regression for KO/EN/JA and confirm the card number is `045`. Prior FINAL is invalidated by this product change.

### 2026-08-17 category-link regression fix
- Fixed TOOL045 Date & Time category mapping to localize the live card href as `/${locale}/${tool045Slug}` for KO/EN/JA instead of leaving a hard-coded KO href.
- Targeted regression is required before the next FINAL.
