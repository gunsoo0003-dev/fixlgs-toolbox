# FLOW CHECKLIST
기준 문서: `MOBILE_REALPHOTO_001_024_SOURCE_AUDITED_CHECKLIST.md`

이 버전(V9)부터 Android 화면 문구/순서를 고정한 이전 체크리스트는 폐기한다.
실제 프로젝트 소스 + 실행 시 UIAutomator dump를 기준으로 흐름을 결정한다.


## V10 Android picker route correction
- Required route after media action: visible `갤러리` control -> visible `카메라` control -> proven repeated photo grid -> slot 1.
- Gallery/Recents are separate mandatory states; they no longer compete in one generic navigation score.
- Phase matching uses visible text/content-desc and clickable ancestor only, not package/resource-id words.
- After slot selection and browser return, immediate small downward scroll remains mandatory.


## V11 Gallery accessibility fix
- Gallery/Recents visible labels are matched against `text` and `content-desc` independently.
- Duplicate accessibility labels such as text=`갤러리`, content-desc=`갤러리` no longer become a false non-match.
- Prefer the labelled node itself when clickable; otherwise tap only its nearest actionable ancestor.
