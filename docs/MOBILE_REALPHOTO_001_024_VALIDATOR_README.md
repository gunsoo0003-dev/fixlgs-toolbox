# V9 SOURCE-AUDITED / RUNTIME UI DISCOVERY

V9는 사용자가 알려준 Android 화면 문구를 순서대로 하드코딩하지 않는다.

1. 프로젝트 소스와 검수기 TOOL map을 source-audit로 대조한다.
2. Android picker가 열리면 매 화면의 UIAutomator XML을 읽고 실제 선택지를 분류한다.
3. 미디어 화면 진입 후에도 고정 `카메라`/`갤러리` 순서를 가정하지 않고 현재 UI의 navigation 후보를 점수화해 이동한다.
4. 반복 thumbnail grid가 기하학적으로 확인된 뒤에만 1번째 사진을 선택한다.
5. Chrome 복귀 즉시 아래로 짧게 1회 스크롤한다. 고정 5초 sleep은 없다.
6. TOOL별 실제 소스 workflow를 실행한다.

## 실행 전 자체검사
```powershell
cd C:\Users\Administrator\Desktop\WebProjects\fixlgs-toolbox
node .\scripts\check-mobile-real-photo-validator.mjs
```

## TOOL001만 검수기 자체 확인
```powershell
node .\scripts\run-mobile-real-photo-001-024.mjs --only 1
```

## 전체 001~024
```powershell
node .\scripts\run-mobile-real-photo-001-024.mjs
```

실패 시 Desktop 결과폴더에 각 Android 단계의 XML, nodes JSON, PNG가 남는다. 다음 수정은 사용자 화면 설명이 아니라 이 산출물을 기준으로 한다.


## V10 Android picker route correction
- Required route after media action: visible `갤러리` control -> visible `카메라` control -> proven repeated photo grid -> slot 1.
- Gallery/Recents are separate mandatory states; they no longer compete in one generic navigation score.
- Phase matching uses visible text/content-desc and clickable ancestor only, not package/resource-id words.
- After slot selection and browser return, immediate small downward scroll remains mandatory.


## V11 Gallery accessibility fix
- Gallery/Recents visible labels are matched against `text` and `content-desc` independently.
- Duplicate accessibility labels such as text=`갤러리`, content-desc=`갤러리` no longer become a false non-match.
- Prefer the labelled node itself when clickable; otherwise tap only its nearest actionable ancestor.
