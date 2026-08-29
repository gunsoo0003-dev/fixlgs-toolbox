# HANDOFF TOOL075
도구: 075 대출이자 계산기
카테고리: H. 사업·금융 계산기
slug: loan-interest-calculator
예상 URL: /{ko|en|ja}/loan-interest-calculator
상태: 보조작업장 전용 구현/정적검수 완료 후 READY 예정

구현: 원리금 균등 / 원금 균등 / 만기일시 / 3방식 비교 / 월별 상환표 / 총이자 / 총상환액 / 첫·마지막 회차 / zero rate / month-year normalization / final balance 0 / copy/reset / KO·EN·JA / metadata.
제외: 중도상환, 수수료·보증료·보험료 자동계산, 실시간 금융기관 금리, 상품추천, 승인 가능성, DSR/DTI, 변동금리 예측.
공통파일 변경: 없음.
신규 OSS: 없음.
MAIN 디자인 기준: TOOL066.
주작업장 통합검증: 실제 브라우저·Playwright·PC/모바일·KO/EN/JA·light/dark, production build, 전체 regression, category/site/sitemap/robots 연결, 배포/Search Console/색인.
