# FIXLGS TOOLBOX 모바일 이미지 첨부 오류 수정 보고서

## 작업 범위
- 기준본: CSS 대정리 / 물리분할 / 배포완료 최신본
- 대상: 카테고리 1(001~007), 카테고리 2(008~018)의 모바일 이미지 업로드 진입 및 이미지 디코딩 취약 경로
- 보호: 카테고리 3(019~024) 실행 코드는 변경하지 않음
- 금지 준수: 공통 CSS 대공사 없음, 전체 구조 리팩터링 없음, 정상 카테고리 3 수정 없음

## 진단 결과
기존 코드를 비교한 결과 모바일 업로드 문제는 한 종류로 단정할 수 없고, 두 개의 취약 경로가 확인됐다.

1. 업로드 진입 경로
   - 카테고리 1·2의 다수 구형 컴포넌트가 숨겨진 file input을 `inputRef.current?.click()`으로 여는 방식이었다.
   - 기존 Playwright 검수는 file input에 `setInputFiles()`를 직접 주입하는 검사가 많아 실제 UI 클릭 → filechooser 발생 여부를 검증하지 못했다.
   - 보강: 사용자 제스처에서 `showPicker()`를 우선 사용하고, 지원하지 않거나 거부되는 환경은 기존 `.click()`으로 fallback하는 최소 helper 적용.

2. 이미지 읽기/디코딩 경로
   - 일부 구형 구현은 `createImageBitmap()`이 존재하면 무조건 사용하고, 호출 자체가 reject될 때 HTMLImageElement/ObjectURL 경로로 재시도하지 않았다.
   - 모바일 브라우저/특정 파일 조합에서 `createImageBitmap()`만 실패하면 곧바로 이미지 읽기 실패로 종료될 수 있는 구조였다.
   - 취약 경로가 확인된 002, 008, 009, 010, 013, 014, 015를 fallback 가능한 경로로 보강했다.

## 변경 파일
### 신규
- `lib/file-picker.ts`
- `lib/mobile-image-loader.ts`
- `tests/mobile-upload-entry.spec.ts`

### 업로드 진입 최소 수정
- 001~018에 해당하는 기존 이미지 도구 컴포넌트 18개
- 기존 `.click()` 호출 지점만 `openFilePicker()`로 교체

### 디코딩 fallback 보강
- `components/heic-avif-converter-tool.tsx` (002)
- `components/image-cropper-rotator-tool.tsx` (008)
- `components/image-brightness-color-adjuster-tool.tsx` (009)
- `components/image-mosaic-blur-tool.tsx` (010)
- `components/image-merger-tool.tsx` (013)
- `components/image-collage-maker-tool.tsx` (014)
- `components/before-after-image-tool.tsx` (015)

## 검수기 보강
`tests/mobile-upload-entry.spec.ts` 추가.

검사 내용:
- 001~018: 실제 업로드 UI 클릭 → `filechooser` 발생 → fixture 선택 → `change` 발생
- 019~024: 정상 카테고리 3 대조군의 실제 업로드 진입 회귀
- 008/009/010/013/014/015 + 019/024: chooser → change → decode → preview
- 대표 포맷: JPG, PNG, WebP
- 큰 이미지
- 한글 파일명
- 일본어 파일명
- KO/EN/JA 대표 업로드 진입

실행 명령:
`npm run test:toolbox:mobile-upload`

## 현재 검증 결과
- 변경 TS/TSX 구문 검사: PASS (21 files, syntax error 0)
- `package.json` JSON 검사: PASS
- 카테고리 3 실행 컴포넌트 비교: 변경 없음
- 공통 CSS 변경: 없음
- node_modules/runtime 산출물: 전달본에서 제외

## 아직 현 환경에서 확정하지 않은 항목
이 샌드박스의 ZIP에는 설치된 프로젝트 의존성이 없고 `npm ci`를 완료할 수 없어 다음은 실제 실행 판정을 하지 않았다.
- Next.js production build
- Playwright 실제 Chromium 실행
- 실물 Android/iOS file chooser

따라서 이 보고서는 코드 수정 및 검수기 보강 완료본이며, 최종 `FAIL 0` 판정은 프로젝트 실행환경에서 아래 순서로 확인해야 한다.
1. `npm ci`
2. `npm run test:toolbox:mobile-upload`
3. 기존 관련 regression
4. `npm run build`
5. 실제 모바일 기기에서 카테고리 1·2 대표 실패 도구 최종 1회 확인

실기기 확인에서 chooser 자체가 계속 실패하는 특정 도구가 남으면, 그 도구에 한해 카테고리 3의 label/native-input 패턴으로 전환한다. 원인 확인 전 001~전체 일괄 markup 교체는 하지 않는다.
