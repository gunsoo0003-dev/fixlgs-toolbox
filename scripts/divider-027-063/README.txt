TOOL027~063 IMPORTANT NOTES full-width divider batch checker

Run:
  npm run divider:027-063

Coverage:
  37 tools x KO/EN/JA x desktop/mobile = 222 page checks

Checks:
  - route HTTP < 400
  - IMPORTANT NOTES section has --full-divider modifier
  - ::before computed width ~= viewport width (100vw)
  - divider border exists
  - no horizontal overflow caused by divider
  - no pageerror / console.error
  - Desktop result TXT is created automatically

V2 안정형 변경:
- 실행 전 .next 캐시 자동 삭제
- Playwright workers=1 직렬 실행
- fullyParallel=false
- 기존 dev server 재사용 금지(reuseExistingServer=false)


[V3]
Global document horizontal overflow is recorded but does not fail this divider-only regression check.
FAIL conditions: HTTP>=400, missing/hidden full-divider node, pseudo width != viewport, missing border, missing pseudo content, runtime errors.
