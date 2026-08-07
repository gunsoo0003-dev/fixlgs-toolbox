# 웹도구 015 출고 준비 상태

## 판정
- 015 실제 도구 본체: 존재 확인 완료
- 전용 검수기: preflight / core-only / regression-only / limit-only 준비 완료
- 검수 기대값: 내부 식별자 015와 실제 UI 표시값 15 분리 완료
- 이식 변경지도 / 실패 대응지도 / 서비스 유효상한 후보 / 디자인 정합성 문서: 준비 완료
- 원본 최종 제작기획서: 최종 ZIP에 수정 없는 원본 그대로 포함
- 기존 완료 도구 / 공통 CSS / 기존 검수기: 전달본에 포함하지 않으며 임의 수정 없음

## 정적 출고 감사 결과
- `check-tool-015-source.mjs`: PASS
- `check-tool-015-harness.mjs`: PASS
- `check-tool-015-validator.mjs`: PASS
- 015 전용 `.mjs` 구문 검사: PASS
- 015 TS/TSX 전용 구현·검수 파일 TypeScript parse: PASS
- 이전 도구 복사 잔여물: 명백한 오염 없음. 013/014 문자열은 관련도구/회귀 보호 대상으로 의도된 참조

## 실제 런타임 항목
현재 보조작업장 컨테이너의 npm registry에 `next`, `@playwright/test` 등이 존재하지 않아 Next.js 의존성 설치가 불가능하다.
따라서 아래 항목을 허위 PASS 처리하지 않는다.
- 실제 Next.js 페이지 오픈
- 실제 PC / 모바일 / 다크 렌더
- 실제 KO / EN / JA 렌더 및 일본어 모바일 줄바꿈
- 실제 Drag & Drop / Pointer pan
- Playwright preflight / core-only 실행
- 실제 JPG / PNG / WebP 다운로드 픽셀 결과
- build

위 항목은 주작업장 최신 통합본의 정상 의존성 환경에서 가장 먼저 실행한다.

## 주작업장 최초 실행 순서
1. 015 전용 파일 이식
2. `docs/015-integration-map.md`에 따라 최신 `lib/site.ts`, route, sitemap, package scripts를 최소 병합
3. `npm run check:tool015-source`
4. `npm run check:tool015-harness`
5. `npm run check:tool015-validator`
6. `npm run test:toolbox:015-preflight`
7. preflight PASS 후 `npm run test:toolbox:015-core-only`
8. core-only PASS / FAIL 0 / SKIP 0 확인 후 단계별 regression / limit 진행

## 절대 주의
- UI 번호 기대값은 `15`; 내부 파일·selector 식별자는 `015` / `tool015-*` 유지
- 공통파일은 전달본으로 덮어쓰지 않는다.
- 실제 런타임에서 FAIL이 발생하면 PRODUCT_FAIL / HARNESS_ERROR를 먼저 구분한다.


[출고 보완 4항목 반영]
- 제품 코드의 임시 16384px / 100MP 하드 차단값 제거: 최종 서비스 한계 확정 전 후보값을 제품 제한으로 오인하지 않도록 함.
- limit-only 준비 확장: 개별 파일 15MiB, 총 30MiB, 원본 24MP 후보를 실제 유효 PNG fixture로 생성해 후보 단계에서 바로 검수 가능.
- preflight 실행기도 기존 결과 규칙에 맞춰 결과 ZIP 생성 연결.
- regression-only는 기존 001~014 KO/EN/JA route 보호 및 015 관련 도구 링크(013/014/004/006) 연결까지 검사.
