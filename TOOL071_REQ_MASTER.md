# TOOL071 REQ MASTER — 광고·매출 성과 계산기

## 1차 원자화
- 071-F01 CTR = clicks / impressions × 100
- 071-F02 CPC = ad spend / clicks
- 071-F03 CPM = ad spend / impressions × 1,000
- 071-F04 CVR = conversions / clicks × 100
- 071-F05 CAC = acquisition spend / new customers
- 071-F06 ROAS = attributed revenue / ad spend, x + % 표시
- 071-F07 ROI = (return - cost) / cost × 100
- 071-F08 AOV = revenue / orders
- 071-C01 KPI별 독립 schema
- 071-C02 공식 + 실제 denominator 표시
- 071-C03 zero denominator 오류
- 071-C04 raw input 계산 후 최종 표시만 반올림
- 071-C05 금액 <= 1e15 / count <= 1e12 / input <=30 chars / display precision <=8
- 071-C06 A/B 최대 2세트
- 071-I01 KO/EN/JA
- 071-I02 PC/mobile responsive code
- 071-I03 copy/reset
- 071-S01 브라우저 로컬, 외부 API/서버/로그인 없음
- 071-S02 실제 KPI 숫자 외부 전송 없음
- 071-A01 aria-live result
- 071-Q01 8 KPI fixture
- 071-Q02 boundary/raw-vs-rounded/limit/regression harness

## 2차 독립 누락 탐색에서 추가
- 071-C07 ROAS와 ROI 설명을 결과/콘텐츠에서 명시적으로 분리
- 071-C08 CAC 신규 고객 기준 안내
- 071-C09 AOV 주문수 기준 안내
- 071-C10 metric selector 변경 시 이전 KPI 입력값을 초기화하여 schema 혼입 방지
- 071-Q03 ROAS 4x/400% 동시 검증
- 071-Q04 실제 분모 label이 현재 KPI schema와 일치하는지 검증
