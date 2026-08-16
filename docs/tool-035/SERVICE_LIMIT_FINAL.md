# TOOL 035 서비스 유효상한 확정

승인일: 2026-08-15
승인: 사용자 `추천대로 진행`

- 입력 PDF: 1개
- 최대 파일 용량: 50MB (50 × 1024 × 1024 bytes)
- 최대 페이지 수: 200페이지
- 추출 이미지: 500개 초과부터 경고
- 추출 이미지: 1,000개 도달 시 추가 이미지 추출 안전 중단, 이미 생성된 결과 유지
- 페이지 처리 동시성: 1 (순차)

단일 기준 위치: `lib/tool-035-pdf-extractor.ts`의 `TOOL035_SERVICE_LIMITS`.
승인 상태: `TOOL035_LIMIT_STATUS = "APPROVED_2026_08_15"`.

동기화 대상: 제품 업로드/페이지 validation, UI/FAQ/주의 문구, limit spec, static checker, HANDOFF.
