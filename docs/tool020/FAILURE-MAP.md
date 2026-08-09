# TOOL 020 실패 대응지도

- 페이지/route 진입 실패 → 주작업장 최신 route 연결과 `youtube-channel-banner-page.tsx` import 위치 확인
- 배경 업로드 실패 → `validateImageFile`, `loadImage`, MIME/확장자/animated 판정 확인
- 스마트폰 회전 오류 → `loadImage`의 `createImageBitmap(... imageOrientation: from-image)` 경로 확인
- crop/zoom 불일치 → normalized background X/Y/zoom 및 `tool-020-renderer.ts` cover 계산 확인
- 안전영역 오판정 → `scaledSafeArea`, 제목/로고 bounds, 1px 내부 clamp 확인
- 제목 렌더 실패 → text wrap/font fallback/outline/shadow renderer 확인
- 로고 alpha/비율 실패 → logo bitmap decode, aspect 계산, globalAlpha 확인
- TV/PC/mobile preview 불일치 → device preview mask data와 underlying design state 비변경 여부 확인
- JPG/PNG 크기 오류 → export canvas 2560×1440 생성 위치 확인
- 6MB 판정 오류 → 실제 `Blob.size`, policy `maxBytes`, JPG quality 반복 encode 확인
- guide가 결과에 보임 → 최종 renderer에 guide/mask/handle draw 코드가 들어갔는지 즉시 확인
- 초기화/재실행 오류 → object URL revoke, bitmap close, history reset 확인
- HARNESS_ERROR → selector/root/route/fixture discovery와 test count 0 여부를 먼저 확인
- locale/SEO/관련도구 실패 → 제품 코드보다 최신 통합 route/site/category 연결을 우선 확인
