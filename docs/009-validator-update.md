# 웹도구 009 자동검수기 업데이트

## 추가·확장된 검수

- 밝기·대비·채도·색온도·선명도의 실제 Canvas 픽셀 결과
- 흑백·세피아 채널 관계와 상호 배타 상태
- 자동보정의 이미지별 분석값, 반복 실행 비누적, Undo 복원
- 다단계 Undo·Redo, 새 변경 후 Redo 폐기, 전체 보정값 초기화 Undo
- JPG·PNG·WebP 실제 다운로드·디코딩·원본 픽셀 크기 유지
- 미리보기와 최종 출력 평균 RGB 허용 오차
- PNG·WebP 투명도 유지와 JPG 불투명 배경 처리
- EXIF 방향 1회 반영 및 최종 출력 방향
- 전체 초기화와 처리 중 초기화의 stale callback 차단
- 다운로드 Object URL 생성·해제 일치
- PC·모바일·태블릿, 일본어 모바일, 다크 모드 가로 넘침
- sitemap·robots·언어 전환·헤더·푸터·FAQ 회귀
- 9MP → 16MP → 24MP → 24MP 초과 단계식 한계탐색
- 한계 결과 TXT·JSON 자동 생성

## 통합 실행

```powershell
npm run test:toolbox:009-final
```

실행 순서:

1. Next.js 빌드
2. 009 핵심 기능·픽셀·출력·화면 검수
3. 공통 구조·SEO·사이트맵 회귀검수
4. 경계값·자동 한계탐색
5. 통합 TXT·JSON 보고서 생성

## 생성 결과

- `test-results/tool-009-validation-master.txt`
- `test-results/tool-009-validation-master.json`
- `test-results/tool-009-auto-limit-report.txt`
- `test-results/tool-009-auto-limit-report.json`
- 단계별 로그와 요약 파일

검수 실행 전 `npm ci`와 Playwright Chromium 설치가 완료되어 있어야 한다.
