TOOL016 원본 픽셀 크기 판정 수정본 V1

변경 파일
- components/add-text-to-image-tool.tsx
- lib/image-file-pixel-size.ts (신규)
- lib/tool-016-service-limits.ts (12,000,000px 원복 포함)

핵심 변경
- TOOL016의 원본 크기/12MP 판정을 new Image().naturalWidth/naturalHeight 단독 의존에서 분리
- JPG: JPEG SOF + EXIF Orientation 기준 실제 파일 픽셀 크기 판독
- PNG: IHDR 기준 픽셀 크기 판독
- WebP: VP8X/VP8/VP8L 헤더 기준 픽셀 크기 판독
- 헤더 판독 실패 시에만 기존 naturalWidth/naturalHeight로 fallback
- 모바일 공통 StableMobileImageFileInput은 수정하지 않음
- 12MP 제한은 12,000,000px 유지

덮어쓰기 후 권장 확인
1) 같은 원본을 PC TOOL016에 첨부 -> '원본 크기' 확인
2) 모바일 TOOL016에 같은 사진 첨부 -> 첨부/원본 크기 확인
3) 글자 추가 -> 다운로드까지 확인
