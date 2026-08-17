# TOOL 040 주작업 체크리스트

| 체크항목 | 현재 상태 | 근거 |
|---|---|---|
| 039 실제 디자인 계승 | PASS | activeWorkspace/file/replace/reset/action-result 이식 |
| 줄바꿈↔쉼표 | PASS(static) | exact fixture |
| TAB 변환 | PASS(static) | exact fixture |
| custom literal | PASS(static) | regex meta / multi-char fixture |
| quote escape | PASS(static) | single/double doubling fixture |
| 번호·글머리표 | PASS(static) | KO/JA/Unicode fixture |
| TXT/MD/CSV 입력 | CODE PASS | 039 계약 이식, browser 실행 대기 |
| 단일 drag workspace | CODE PASS | selector 1개 + drag state |
| 파일 교체 확인/취소 | CODE PASS | dialog contract |
| 결과 복사 | CODE PASS | result-only clipboard |
| TXT 다운로드 | CODE PASS | `converted-list.txt` |
| 완전 reset | CODE PASS | input/result/options/error/status/file state |
| KO/EN/JA | CODE PASS | route/page/tool copy |
| site category 040 연결 | PASS | `lib/site.ts` |
| sitemap 040 연결 | PASS | `app/sitemap.ts` |
| 공통 CSS/legacy 보호 | PASS | protection checker |
| checker source self-check | PASS | `TOOL040_SOURCE_SELF_CHECK_PASS` |
| main integration self-check | PASS | 040 route/site/sitemap/design contracts |
| functional static | PASS | `run-static-validation.mjs` |
| 서비스 상한 | WAIT USER APPROVAL | 300k / 50 / 50k 후보 |
| TypeScript/build | ENVIRONMENT BLOCKED HERE | 현재 컨테이너 node_modules 없음 |
| Playwright PC/mobile/KO/EN/JA | ENVIRONMENT BLOCKED HERE | Windows `npm ci` 후 실행 |
| FINAL | NOT RUN | 상한 승인 + 실행환경 게이트 전 |
