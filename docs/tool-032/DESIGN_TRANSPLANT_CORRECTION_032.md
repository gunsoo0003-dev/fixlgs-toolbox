# TOOL032 디자인 이식 재검수 / 수정 기록

기준 TOOL: TOOL031 PDF 페이지 번호·워터마크 도구
수정 사유: 1차 주작업장 통합본이 031의 상태전이 일부만 반영하고, 032 보조작업장 고유 골격/CSS를 유지하여 디자인 이식 기준 미달.

## 재대입 기준
- wrapper gap 20px
- 031형 LOCAL note
- 031형 + 원형 아이콘 Dropzone / dashed blue state
- 업로드 후 compact uploaded file bar
- shared dragActive = dragging || workspaceDragging
- 031형 2열 workspace, 900px 이하 1열
- 왼쪽 PREVIEW panel / 오른쪽 032 settings panel
- 오른쪽 panel 내부 group card 구조로 서명 생성 + 적용 페이지 배치
- 031형 primary / secondary / ghost action hierarchy
- workspace 아래 action row + result card
- 720px 모바일 단일 열/전체폭 버튼

## TOOL032 고유 기능 보존
- 서명 그리기 / 이미지 서명
- PDF preview 위 signature overlay drag/resize
- 위치 preset / 크기 / 회전
- current/all/odd/even/custom page scope
- result generation/download

## 정적 검증
- check-syntax PASS
- check-design-static PASS (031 breakpoint 900px)
- check-source PASS
- check-main-integration PASS
- check-runner-contract PASS
- check-content PASS
- check-limit-static PASS
- check-fixtures PASS
- check-logic PASS
- check-package-static PASS
