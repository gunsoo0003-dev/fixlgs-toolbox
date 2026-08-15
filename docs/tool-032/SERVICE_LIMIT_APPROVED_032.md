# TOOL 032 서비스 유효상한 최종 승인

- 승인일: 2026-08-15
- 사용자 결정: 추천 A 승인
- PDF 파일 수: 1개
- PDF 파일당 용량: 30 MiB
- 총 페이지 수: 300
- 서명 이미지 파일당 용량: 10 MiB
- 서명 이미지 총 픽셀: 20 MP
- 그리기 stroke point: 20,000

## 동기화 대상

- 제품 상수: `lib/tool-032-pdf-signature.ts`의 `TOOL032_LIMITS`
- UI: KO/EN/JA 오류 문구 및 주의사항
- DOM 검수계약: `data-max-*` attributes
- 자동검수: `tests/tool-032-limit.spec.ts`
- FINAL runner: `scripts/tool-032/run-validation.mjs`

한도 검수의 기대값은 제품 코드를 런타임에 읽어 정답으로 삼지 않고, 승인된 독립값을 test 파일에 별도로 고정한다.
