# 015 검수 준비 계획
- preflight: route/root/Before/After/preview/settings/state/core selectors 연결만 확인
- core-only: 두 슬롯, 좌우/상하, Cover/Contain, swap, label/divider 표시, 결과 크기/형식
- regression-only: 001-013 보호 route, 015 ko/en/ja, UI 표시번호 15, canonical/hreflang, category card, sitemap/robots, JSON-LD/contact
- limit-only: 정확히 2장 계약 + 보수적 서비스 후보 probe
- PRODUCT_FAIL과 HARNESS_ERROR를 분리
- 실제 단계별 PASS/FAIL 최종 판정은 주작업장


[출고 보완 4항목 반영]
- 제품 코드의 임시 16384px / 100MP 하드 차단값 제거: 최종 서비스 한계 확정 전 후보값을 제품 제한으로 오인하지 않도록 함.
- limit-only 준비 확장: 개별 파일 15MiB, 총 30MiB, 원본 24MP 후보를 실제 유효 PNG fixture로 생성해 후보 단계에서 바로 검수 가능.
- preflight 실행기도 기존 결과 규칙에 맞춰 결과 ZIP 생성 연결.
- regression-only는 기존 001~014 KO/EN/JA route 보호 및 015 관련 도구 링크(013/014/004/006) 연결까지 검사.
