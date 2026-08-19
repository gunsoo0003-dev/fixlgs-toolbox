# TOOL052 REQ MASTER

- 도구: 052 세계시간·타임존 변환기
- 카테고리: F. 날짜·시간 도구
- slug: `world-time-timezone-converter`
- 기준 문서: TOOL052 최종 제작전달서 + 도장깨기 목록 052 + 보조작업장 1/2/3차 최신 개정

## 필수 요구사항
1. 도시 선택/검색 — PASS
2. UTC 기준 입력/변환 — PASS
3. 여러 도시 동일 instant 비교 — PASS
4. 현재 시각 보기 — PASS
5. 지정 날짜/시각 변환 — PASS
6. DST 자동 반영 구조 — PASS (`Intl.DateTimeFormat` IANA zone rules)
7. UTC offset 표시 — PASS
8. 날짜 경계 이전 날/같은 날/다음 날 — PASS
9. 12/24 시간 표시 — PASS
10. 공통 회의시간 — PASS
11. DST nonexistent local time — PASS, 임의 보정 금지
12. DST ambiguous local time — PASS, 2개 instant 선택 UI
13. 30분/45분 offset — PASS (Kolkata/Eucla, Kathmandu/Chatham 포함)
14. 최대 12개 도시 — PASS, 단일 constant
15. 기본 업무시간 09:00-18:00 + 도시별 수정 — PASS
16. 결과 복사 — PASS
17. 도시 삭제/순서 변경 — PASS
18. KO/EN/JA — PASS
19. 모바일 세로 카드 — DESIGN-CODE PASS
20. WebApplication/Breadcrumb/FAQ structured data — PASS
21. canonical/hreflang — PASS
22. 브라우저 로컬 계산 — PASS
23. 지도/로그인/서버저장/공유URL/캘린더/GPS/항공/시장시간 제외 — PASS

## 데이터 구조
- `lib/tool-052-timezone-data.ts`: 도시 metadata / IANA zone / locale labels / IANA release metadata
- `lib/tool-052-timezone.ts`: instant-zone 변환 / offset / DST / ambiguous/nonexistent / meeting overlap
- 데이터 기준 메타: IANA TZDB `2026c`, release date `2026-07-08`
- 런타임 실제 zone rule 해석: 브라우저 `Intl.DateTimeFormat`. 따라서 배포 브라우저/OS의 tzdata 최신성은 주작업장 통합검증 항목.

## 주작업장 통합검증 전용
- 실제 PC/모바일/KO/EN/JA/light/dark 렌더링
- Playwright preflight/core/boundary/feature/regression/limit 실제 실행
- production build
- 최신 통합본 045~051 전체 regression
- site/category/sitemap/robots 연결
- Search Console/배포/색인
