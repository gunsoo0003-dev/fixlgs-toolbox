# TOOL 032 사전 고정 체크리스트

판정은 이 파일에서 하지 않는다. 구현·검수 후 `CHECKLIST_032_RESULT.md`에 실제 근거를 대입한다.

## A. 기능/역할
- [ ] 서명 그리기: mouse / pen / touch Pointer Events
- [ ] 그리기 Clear / redraw / pen width / black-blue / transparent export
- [ ] PNG/JPG/WebP 서명 이미지 decode + MIME magic 확인
- [ ] transparent PNG alpha 유지, JPG 흰 배경 자동제거 금지, EXIF orientation 정상화
- [ ] 미리보기 drag / corner resize / 원본 종횡비 유지 / 경계 clamp
- [ ] 3x3 위치 프리셋 + 키보드 접근 가능한 대체 조작
- [ ] 현재 / 전체 / 홀수 / 짝수 / 사용자 지정 페이지
- [ ] 중복 페이지 1회, 0/음수/초과/역범위 validation
- [ ] normalized placement를 mixed page size/rotation에 적용
- [ ] 대표 페이지 이동/미리보기
- [ ] 결과 파일명 + 재생성/재다운로드/새 PDF/전체 초기화
- [ ] 원본 PDF 페이지를 rasterize하지 않고 signature overlay만 저장
- [ ] 결과 PDF pageCount/적용 페이지 재검증
- [ ] 시각 서명과 인증서/PKI 디지털 서명을 명확히 구분

## B. 경계/안전/성능
- [ ] 손상/0-page/암호화 PDF 실패 처리
- [ ] PDF MIME/header mismatch 처리
- [ ] 빈 drawing 거부
- [ ] 이미지 decode/MIME mismatch/초대형 처리
- [ ] 다중 페이지는 순차/낮은 동시성으로 처리하고 실제 progress에 연결
- [ ] object URL / canvas / PDF.js task 정리
- [ ] 서버/API/계정/키/파일 업로드/Analytics content 전송 없음
- [ ] 서비스 유효상한은 경쟁사 → 현 코드 → 추천 → 사용자 승인 후 최종 동기화

## C. UI/디자인/다국어
- [ ] MAIN PDF 기준 도구 선정 및 실제 component/module CSS 비교
- [ ] SUB 기준 도구 필요 요소 기록
- [ ] 공통 shell/공통 HOW TO/FAQ/RELATED/EXPERT 구조 재사용
- [ ] 기능 고유 스타일은 `pdf-signature-tool.module.css`에만 작성
- [ ] globals/styles 전역 CSS 신규 032 오염 없음
- [ ] legacy sealed 직접 import/copy/extend 없음
- [ ] PC 2열 단순축소가 아닌 모바일 1열 반응형 코드
- [ ] KO/EN/JA 핵심 UI/SEO/FAQ
- [ ] 일본어 긴 문자열/버튼/overflow 대응 코드
- [ ] light/dark 공통 theme 상속, PDF/서명 자체 색상 비변형
- [ ] 선택선/resize handle/page guide가 최종 PDF에 포함되지 않음

## D. 검수/출고
- [ ] selector/state inventory 고정
- [ ] fixture: normal mixed/rotation/page size/PNG/JPG/WebP/broken/MIME/Unicode/range
- [ ] preflight/core/boundary/regression spec 구조 준비
- [ ] limit-only는 승인값 전까지 확정 금지
- [ ] 모바일 실기기 runner 등록용 selector/user path/success/download contract 준비
- [ ] 안전 로컬 OSS 필요 시 package patch + license/local/no-cost/no-exfil 기록
- [ ] REQ 1차 원자화 + 2차 독립 누락 탐색 + 최종 원본 재대조
- [ ] 공통 보호파일 pristine hash/diff 무변경
- [ ] HANDOFF 이식 파일 목록과 ZIP 1:1
- [ ] ZIP 최상위 `fixlgs-toolbox`, node_modules/.next/runtime/test-results 제외
- [ ] ZIP 재개봉 후 구현/검수/전달/원본 제작전달서 확인
