TOOL016 임시 진단 UI 삭제 전용 패치

포함 파일
- components/add-text-to-image-tool.tsx

적용 내용
- 모바일/공통 화면에 노출되던 TOOL016 임시 진단 UI(HARD DIAG / JSON 표기) 제거
- 기본 출력 정보(원본 크기 / 결과 크기 / 글자 수)만 유지

주의
- TOOL018 관련 수정은 포함하지 않음
- TOOL016 서비스 제한값(15MB / 20MP / 6000px / 레이어/문자수 제한) 변경 없음
