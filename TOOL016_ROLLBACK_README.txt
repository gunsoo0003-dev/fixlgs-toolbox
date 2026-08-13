TOOL016 V1 원본픽셀크기판정 패치 원복본

원복 대상:
- components/add-text-to-image-tool.tsx : V1 적용 전 버전으로 복구
- lib/tool-016-service-limits.ts : 12,000,000px 원래 제한 유지

V1에서 새로 추가된 아래 파일은 덮어쓰기만으로 삭제되지 않으므로 프로젝트에서 삭제해야 함:
- lib/image-file-pixel-size.ts

PowerShell 삭제 명령:
Remove-Item .\lib\image-file-pixel-size.ts -Force -ErrorAction SilentlyContinue
