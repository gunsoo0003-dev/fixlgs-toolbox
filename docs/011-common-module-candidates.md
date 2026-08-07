# 011 공통 모듈 후보 기록

기존 001~010은 수정하지 않고 011에서만 구현한 뒤 후보로 기록한다.

- 캔버스 비율/결과 크기 계산: `components/image-padding-background-tool.tsx`의 `modeSize` 계산부
- contain 배치/빠른 정렬/드래그 위치: 같은 파일의 `placement`, pointer handlers
- 단색/투명/블러 배경 렌더러: 같은 파일의 `render`
- 방향별 패딩 + 연결/해제: 같은 파일의 `padding`, `setPad`
- 원본 픽셀 기준 최종 렌더링: 같은 파일의 `download`
- 투명 체크 배경: `app/globals.css`의 `.padding-canvas-wrap.is-transparent`

공통화는 이후 별도 작업에서 회귀검수 전제로 검토하며 이번 011 제작에서는 기존 도구에 이식하지 않는다.
