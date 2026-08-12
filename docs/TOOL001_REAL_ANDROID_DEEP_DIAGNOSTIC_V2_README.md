# TOOL001 실갤럭시 심층진단 V2

목적: Windows PC의 모바일 에뮬레이션이 아니라 **실제 Android 기기 + 실제 Chrome + 실제 Android 파일 선택기**에서 TOOL001 업로드 경로를 진단합니다.

## 수집 범위
- ADB 연결 상태
- 제조사 / 모델 / Android 버전 / SDK
- Chrome 패키지 버전
- `pageshow/pagehide`, `visibilitychange`, `focus/blur`
- `pointerdown/touchstart/click/input/change`
- 각 이벤트의 `performance.now()` / epoch 시간 / visibility / focus 상태
- 각 선택 시도별 `File.name/type/size/lastModified`
- `arrayBuffer` 1차/2차 재시도, slice read
- FileReader
- objectURL 생성 + Image decode
- createImageBitmap
- naturalWidth / naturalHeight
- DOM preview 신호(img/canvas/blob URL/data URL/alert/error text)
- 제품 페이지 console / pageerror
- ADB logcat
- 동일 세션 1차/2차/3차 선택 결과 비교

## 실행
PowerShell, 프로젝트 최상위(`fixlgs-toolbox`)에서:

```powershell
node scripts/run-tool-001-real-android-deep-v2.mjs --url "https://toolbox.fixlgs.com/ko/jpg-png-webp-image-converter"
```

기본은 **실제 파일 선택기 3회**입니다.
터미널이 `ATTEMPT 1/3 READY`라고 표시하면 폰에서 업로드 영역을 눌러 실제 갤러리/내 파일에서 이미지를 고르세요.
검수기는 `change` 이벤트를 자동 감지하므로 PC에서 Enter를 누를 필요가 없습니다.

### 옵션
```text
--url <URL>          필수
--attempts <N>       기본 3
--wait-change <ms>   각 선택 감지 제한시간, 기본 90000
--settle <ms>        선택 후 DOM 안정화 대기, 기본 3500
--selector <CSS>     기본 input[type=file]
```

## 결과
Windows 바탕화면:

```text
TOOLBOX_001_REAL_ANDROID_DEEP_V2_<timestamp>/
TOOLBOX_001_REAL_ANDROID_DEEP_V2_<timestamp>.zip
```

주요 파일:
- `summary.txt`
- `result.json`
- `timeline.json`
- `attempts.json`
- `page-console.log`
- `adb-devices.txt`
- `android-device-info.txt`
- `chrome-package-info.txt`
- `adb-logcat.txt`
- `attempt-01-after.png` 등

## 판정 주의
이 V2는 실제 Android에서 실행되므로 PC 모바일 에뮬레이션보다 훨씬 강한 증거입니다.
하지만 사용자가 실제 파일을 선택하는 수동 동작이 포함되므로 결과는 `REAL_ANDROID_DIAGNOSTIC`이며,
최종 사용성 확인은 별도의 `REAL_DEVICE_PASS`로 유지합니다.
