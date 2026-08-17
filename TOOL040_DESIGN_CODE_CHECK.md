# TOOL 040 DESIGN-CODE CHECK

- 도구: 040 구분자·목록 변환기
- 최신 MAIN 기준: TOOL039 목록 정렬·중복 제거기 실제 code/DOM/state/mobile
- 교차 기준: TOOL037/038 Text 카테고리 direct/file input, 단일 activeWorkspace drag, 완전 reset, action/result
- 판정: DESIGN-CODE PRE-FINAL PASS

## 실제 반영
- TOOL039의 단일 `activeWorkspace` drag 범위와 업로드 전/후 상태전이를 040에 이식.
- TXT/MD/CSV 파일 선택 및 drag 입력, 파일 교체 확인/취소, 파일 상태카드 추가.
- 결과 action row에 `결과 복사` + `TXT 다운로드`를 모두 유지.
- input/result/options/error/copy status/file state까지 완전 reset.
- TOOL040 고유 기능은 source/target delimiter, custom literal, trim/empty, quote, number/bullet/hyphen으로만 교체.
- 공통 CSS/legacy sealed 파일은 수정하지 않고 040 전용 CSS module만 사용.
- 모바일 1열 축소, preset 2열, 긴 JA 라벨 wrap 구조 유지.

## 중앙 연결
- `lib/site.ts`: tool040 slug/title/description + text category LIVE card 연결.
- `app/sitemap.ts`: KO/EN/JA 040 route 연결.
- 039 관련 도구는 실제 LIVE route 링크로 연결, 041/042는 준비 중 상태 유지.

## 아직 남은 게이트
- 서비스 상한 사용자 승인.
- 승인값 제품/UI/fixture/spec expected 단일화.
- Windows `npm ci` 후 TypeScript/build/Playwright PC-mobile/KO-EN-JA/light-dark/overflow 실제 실행.
- 마지막 FINAL FAIL 0 / SKIP 0.
