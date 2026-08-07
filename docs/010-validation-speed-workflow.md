# 010 검수 고속화 운영 규칙

검수 항목을 삭제하지 않고 실행 시점을 세 단계로 분리한다.

## 수정 중 빠른검수

```powershell
npm run test:toolbox:010-fast
```

- 소스 검사
- 010 핵심 기능
- 영역 생성·히스토리·픽셀 출력
- 데스크톱 Chromium
- 작은 fixture
- trace·video 비활성
- 최대 4 workers
- 빌드·심층 회귀·대형 한계검수 제외

## 기능 완료 후 중간검수

```powershell
npm run test:toolbox:010-check
```

- 검수기 자체검사·소스·일본어
- 010 전체 기능
- 입력 오류·출력 재디코딩
- 모바일·태블릿·테마·메모리
- SEO·보안·경계검수
- 공통 스모크 회귀
- 최대 3 workers
- 빌드·001~009 심층 회귀·자동 한계탐색 제외

## 실패 항목만 재검수

```powershell
npm run test:toolbox:010-failed
```

직전 Playwright 실행에서 실패한 테스트만 다시 실행한다.

## 완료 직전 최종검수

```powershell
npm run test:toolbox:010-final
```

- 빌드
- 공통검수
- 010 전체 기능
- 추가·심층 회귀·경계
- 자동 한계검수
- 최종 결과 폴더와 ZIP

최종검수는 안전 한도 반영 후 마지막에 실행한다. 최종 완료 판정은 반드시 final 결과만 사용한다.
