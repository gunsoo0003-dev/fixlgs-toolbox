# 010 안전 운영 한도 최종 적용

실제 `010_limit-only` 자동 한계검수 결과를 기준으로 다음 값을 최종 적용한다.

- 최대 픽셀: 19,200,000px (19.2MP)
- 첫 실패 픽셀: 20,000,000px (20MP)
- 최대 한 변: 16,384px
- 첫 실패 한 변: 16,385px
- 영역 최대: 75개
- 영역 권장 경고 시작: 60개
- 히스토리 최대: 60단계

검수 결과:
- auto-limit: PASS
- 영역 75개 스트레스: PASS
- 76번째 영역 차단: PASS
- PC: PASS
- 모바일: PASS

적용 위치:
- `components/image-mosaic-blur-tool.tsx`
- `components/image-mosaic-blur-page.tsx` 한국어/영어/일본어 FAQ
- `tests/tool-010-auto-limit.spec.ts`
- `tests/tool-010-stress-limits.spec.ts`
- 010 검수 문서
