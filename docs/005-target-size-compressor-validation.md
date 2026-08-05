# 005 목표 용량 이미지 압축기 검수

## 일반 기능 검수

```powershell
npm run test:toolbox:005
```

검수 대상:

- JPG·WebP 목표 이하 품질 탐색
- PNG 무손실·색상 최적화
- 이미 목표 이하 원본 유지
- 크기 축소 허용
- 0 목표값 차단
- 파일별 목표값
- ZIP 포함 정책
- 비교 화면·전체 초기화

## 부하·안전선 검수

```powershell
npm run test:toolbox:load
```

5개와 10개의 대형 JPG를 PC·모바일 프로젝트에서 순차 처리하고 처리 시간·상태·탐색 횟수를 `test-results` 첨부 JSON으로 기록한다.

## 전체 회귀 검수

```powershell
npm run test:toolbox
```

실패 항목만 재검수:

```powershell
npm run test:toolbox -- --last-failed
```
