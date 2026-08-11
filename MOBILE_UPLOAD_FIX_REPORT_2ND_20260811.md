# FIXLGS TOOLBOX 모바일 이미지 첨부 2차 보강 보고서

## 실기기 피드백 반영
- 실제 모바일 정상 확인군: 009, 012, 016, 017
- 추가 증상: 일부 도구는 파일 선택/change까지 성공하지만 미리보기 이미지가 깨짐
- 따라서 1차 `filechooser/change` 중심 보강만으로 완료 판정하지 않고, 디코딩/미리보기 경로를 2차 보강함.

## 2차 핵심 원인 보강
1. 일부 모바일 브라우저에서 `HTMLImageElement.decode()`가 먼저 reject되어도 뒤늦게 `load`가 성공할 수 있는 경로를 고려.
   - 공통 loader는 `load/error` 이벤트를 최종 판정으로 사용.
   - `decode()`는 best-effort warm-up으로만 사용.
2. 원본 File의 raw object URL을 그대로 `<img>` preview에 사용하는 구형 도구에서 모바일 표시가 깨질 가능성을 제거.
   - 디코딩 성공 후 브라우저가 canvas에서 다시 생성한 PNG preview object URL을 사용.
   - 실제 처리용 원본 File/decoded source는 유지하여 출력 품질/해상도를 축소하지 않음.
3. `createImageBitmap()`은 우선 사용하되 실패 시 HTMLImageElement load-event fallback 유지.

## 적용 범위
- 공통 보조: `lib/mobile-image-loader.ts`
- 보강 대상: 001, 002, 003, 004, 005, 006, 007, 008, 010(공통 loader 영향), 011, 013, 014, 015, 018
- 정상 실기기 기준군 012/016/017은 엔진 구조를 이식 대상으로만 참고하고 직접 대공사하지 않음.
- 카테고리 3 실행 코드 019~024 직접 수정 없음.
- 공통 CSS 수정 없음.

## 검수 상태
- 수정 TS/TSX 14개 TypeScript `transpileModule` 구문 검사: PASS / syntax diagnostic 0
- 이 전달본에서는 실제 iOS/Android 실기기 실행을 할 수 없으므로 실기기 최종 PASS는 사용자 환경에서 확인 필요.
- 기존 명령 유지: `npm run test:toolbox:mobile-upload`
- 이후 `npm run build`

## 실기기 최종 확인 권장
009/012/016/017 정상 기준군은 그대로 유지되는지 확인하고,
기존 실패군 중 001, 004, 008, 010, 011, 013, 014, 015, 018을 우선 확인.
각 도구에서 `선택 → 미리보기 정상 → 핵심 기능 실행`까지 확인.
