TOOL016 임시 INPUT PIPELINE DIAG UI 제거 패치

원인:
- components/add-text-to-image-tool.tsx에는 HARD DIAG가 없었지만
- 공통 components/stable-mobile-image-file-input.tsx가 TOOL016에서만
  [TOOL016 INPUT PIPELINE DIAG] 오버레이를 document.body에 직접 생성하고 있었음.

수정:
- 제품 흐름/이미지 처리 로직은 유지
- window.__tool016PipelineDiag / localStorage 진단 기록은 유지
- 화면에 보이는 overlay 생성/갱신 코드만 제거
- stale .next-tool016-runtime은 cleanup 스크립트로 삭제 가능

적용 후:
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-tool016-temp-runtime.ps1

그 다음 검수기 재실행.
