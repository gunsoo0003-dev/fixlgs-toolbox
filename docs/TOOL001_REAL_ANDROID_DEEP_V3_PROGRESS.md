# TOOL001 실갤럭시 심층진단 V3

V2 대비 변경점
- 전체 진행률 `[PROGRESS 01/10]` 형태 출력
- Playwright 기기 탐색, 실제 Chrome 실행, 새 페이지 생성, 페이지 접속, selector 탐색, 결과수집, ZIP 생성에 heartbeat 추가
- 긴 단계는 5초마다 경과시간 출력
- Chrome 실행 등 주요 단계에 명시적 timeout 적용
- timeout/실패 시 `[FAIL] 단계명`으로 즉시 표시

실행:
```powershell
node scripts/run-tool-001-real-android-deep-v3.mjs --url "https://toolbox.fixlgs.com/ko/jpg-png-webp-image-converter"
```
