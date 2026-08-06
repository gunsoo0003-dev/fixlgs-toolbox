# 009 검수기 추가 반영

## 보호 원칙
- 기존 001~008 검수 파일과 실행기는 삭제하거나 통합하지 않았다.
- 기존 `lib/validation/tool-registry.ts`도 변경하지 않았다.

## 신규 공통검수
- `lib/validation/common-tool-catalog.ts`
- `tests/common-tool-additive.spec.ts`

기존 레지스트리를 그대로 가져오고 008·009만 확장 카탈로그에 추가한다. 공개 경로, H1, canonical, hreflang, 구조화 데이터, 헤더·푸터, 오류, 가로 넘침, 모바일·다크 모드, sitemap·robots를 함께 검사한다.

## 009 추가 고유검수
- `tests/tool-009-additional.spec.ts`

24MP 허용·초과 차단, MIME 불일치·빈 파일·손상 파일, 전체 초기화·이미지 교체, 카테고리 번호와 준비 카드 상태를 추가로 검사한다.

## 최종 실행기
- `scripts/run-tool-009-final-validation.mjs`
- 실행 명령: `npm run test:toolbox:009-final`

실행 순서:
1. build
2. 추가 공통검수
3. 009 핵심검수
4. 009 추가검수
5. 009 회귀검수
6. 009 경계검수
7. 앞 단계가 모두 통과한 경우에만 자동 한계검수

자동 한계검수 내부 순서:
- 9MP
- 16MP
- 24MP
- 24MP 초과 차단

Windows에서는 실제 바탕화면 경로를 조회해 `009_검수결과` 폴더와 ZIP을 자동 생성한다.
