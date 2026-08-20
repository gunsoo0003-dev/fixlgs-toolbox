# TOOL069 FAILURE MAP
- 빈/NaN/음수/1e15 초과 금액 → 오류 안내
- 판매가<=변동비 → BE impossible, 0으로 오표시하지 않음
- 판매량>1e12 → volume 계산 제한
- decimal BE → 계산값 유지 + practical `ceil`
- HARNESS_ERROR: 동적 testid를 literal 탐색하는 checker 오탐 1건 수정 완료
- 공통 연결 누락 가능성 → 주작업장 `lib/site.ts`/sitemap 연결 단계에서 처리
