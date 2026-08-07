# 웹도구 015 검수 실패 대응지도

이 문서는 수정 확정 지시가 아니라 가장 먼저 확인할 위치 안내다.

## 업로드/디코딩 실패
- 파일: `components/before-after-image-tool.tsx`
- 핵심: `supported`, `decode`, `chooseOne`, `chooseMany`
- selector: `tool015-before-slot`, `tool015-after-slot`

## 3장 이상 입력 정책 실패
- 파일: `components/before-after-image-tool.tsx`
- 함수: `chooseMany`
- 검수: `tests/tool-015-limit.spec.ts`

## 좌우/상하 좌표 실패
- 파일: `components/before-after-image-tool.tsx`
- 함수: `cellRects`, `renderTo`
- state: `tool015-state[data-layout]`

## Cover/Contain 왜곡·크롭 실패
- 함수: `drawSlot`
- 핵심 상태: `fit`, `zoom`, `offsetX`, `offsetY`
- selector: `tool015-fit-cover`, `tool015-fit-contain`

## 이미지 드래그 위치 실패
- 함수: `onPointerDown`, `onPointerMove`, `endDrag`
- 확인: logical output 좌표 ↔ preview canvas scale 변환

## swap 실패
- 함수: `swap`
- state: `data-before-name`, `data-after-name`
- 주의: 이미지와 fit/zoom/offset/label 의미가 함께 이동해야 함

## 라벨 실패
- 함수: `drawLabel`
- 입력: `tool015-before-label`, `tool015-after-label`
- 상태: `data-before-label`, `data-after-label`, `data-labels`

## divider 실패
- 함수: `renderTo`
- selector: `tool015-divider-visible`, `tool015-divider-width`
- 확인: 좌우 세로선 / 상하 가로선 / 홀수 두께 픽셀 정렬

## 결과 크기·비율 실패
- 함수: `setRatio`, `cellRects`
- selector: `tool015-width`, `tool015-height`

## 투명도/JPG 충돌
- 함수: `renderTo`, `download`
- selector: `tool015-transparent`, `tool015-format`
- JPG 선택 시 transparent=false인지 확인

## 다운로드 실패
- 함수: `download`
- selector: `tool015-download`, `tool015-status`, `tool015-error`

## 실행 취소/다시 실행 실패
- 함수: `makeSnapshot`, `remember`, `applySnapshot`, `undo`, `redo`
- 파일 픽셀 복사가 아니라 상태와 source reference 중심인지 확인

## 전체 초기화/메모리 정리 실패
- 함수: `resetAll`, unmount cleanup, `closeSource`
- Object URL revoke, ImageBitmap.close 확인

## KO/EN/JA 실패
- 파일: `components/before-after-image-tool.tsx`, `components/before-after-image-page.tsx`
- copy 객체 확인

## 일본어 모바일 줄바꿈 실패
- 파일: `components/before-after-image-tool.module.css`
- `word-break:keep-all`, segment button, mobile width 확인
- 실제 긴 문구: 比較前・比較後を入れ替え / 2枚を一緒に調整 / 画像全体を表示 / 拡大率を連動 / 中央の区切り線

## 사용방법 세로선 실패
- page class: `toolbox-tool-guide--five` + module `howTo`
- CSS: `before-after-image-tool.module.css .howTo`
- 목표: PC 3열×2행 / 가운데 세로선 2개 / 좌우 외곽 세로선 제거

## route/SEO 실패
- 주작업장 최신: `lib/site.ts`, `app/[locale]/[toolSlug]/page.tsx`, `app/sitemap.ts`
- slug: `before-after-image-maker`

## UI 도구번호 가짜 FAIL
- 내부 식별자: `015`
- 실제 사용자 UI 기대값: `15`
- core/regression 기대값을 `015`로 바꾸지 않는다.

## HARNESS_ERROR
- helper: `tests/helpers/tool-015.ts`
- preflight: `tests/tool-015-preflight.spec.ts`
- static: `scripts/check-tool-015-harness.mjs`
- 실제 DOM selector를 먼저 확인하고 기능 로직을 임의 수정하지 않는다.
