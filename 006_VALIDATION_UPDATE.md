# 006 기능검수·부하한계검수 보강

## 수정
- 오류 현지화 기능검수 선택자를 Next.js Route Announcer와 충돌하지 않는 `resizer-alert` 전용 선택자로 변경
- 실제 오류 알림 요소에 `data-testid="resizer-alert"` 추가

## 신규 검수
- `tests/tool-006-load-limit.spec.ts`
- 단계 상승형 출력 픽셀 계측
  - 데스크톱: 4MP → 12MP → 24MP → 36MP
  - 모바일 프로젝트: 4MP → 8MP → 12MP → 16MP
- 각 단계 처리 시간, 결과 크기, 통과·실패 상태를 JSON 첨부파일로 저장
- 결과 처리 후 `다시 크기 변경` 재실행 상태 확인
- 임시 파일 수 제한(10개)과 출력 픽셀 제한(4,000만 픽셀) 차단 확인
- 모바일 프로젝트 결과는 실제 모바일 기기 메모리 한계가 아니라 테스트 PC의 모바일 viewport 에뮬레이션임을 결과에 명시

## 실행 명령
```powershell
npm run test:toolbox:006
npm run test:toolbox:006-load
```

현재 안전선 수치는 확정값이 아니라 임시 보호값이다. 부하·한계검수 결과를 검토한 뒤 운영 안전선을 확정한다.
