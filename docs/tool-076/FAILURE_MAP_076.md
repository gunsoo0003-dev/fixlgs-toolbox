# TOOL076 FAILURE MAP
- 빈값/NaN/Infinity: result 미생성 또는 오류
- purchase <0 / >1e15: 오류
- months non-integer / <1 / >120: 오류
- rate <0 / >100: 오류
- purchase=0: fee/total/monthly 모두 0
- rate=0: 무이자 reference
- scenario: 동일 purchase/rate 계약. 기간별 total이 달라지면 PRODUCT_FAIL
- 실제 카드사 조건과 일치한다고 표시하면 PRODUCT_FAIL
- selector/spec 불일치: HARNESS_ERROR 우선 분리
