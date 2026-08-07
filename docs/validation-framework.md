# TOOLBOX 공통 자동 검수 프레임워크

이 프레임워크는 개발 환경에서만 실행하며 공개 사용자 화면에는 노출되지 않습니다.

## 실행

```powershell
npm run test:toolbox
```

기능 검수만 실행:

```powershell
npm run test:toolbox:function
```

공통 경로·SEO·반응형 검수만 실행:

```powershell
npm run test:toolbox:common
```

HTML 결과 확인:

```powershell
npm run test:toolbox:report
```

## 자동 검수 범위

- 001~004 한국어·영어·일본어 공개 경로
- H1과 서버 오류
- canonical·hreflang·메타 설명·구조화 데이터
- sitemap.xml·robots.txt
- PC·모바일 가로 넘침
- 실패 시 스크린샷·동영상·trace 저장
- 004 JPG·PNG·WebP 실제 처리
- PNG 무손실·균형·강한 압축
- EXIF 방향 정상화
- 원본 유지
- ZIP 생성
- 동일 파일명 충돌 방지
- 비교 화면
- 전체 초기화

## 결과 파일

- `playwright-report/`: 사람이 확인하는 HTML 리포트
- `test-results/toolbox-validation.json`: 기계 판독용 JSON 결과
- 실패 항목의 screenshot, video, trace는 `test-results/` 아래에 저장

## 새 도구 등록

1. `lib/validation/tool-registry.ts`에 번호·슬러그·언어별 H1을 등록합니다.
2. 공통 검수는 자동 적용됩니다.
3. 도구 전용 기능 검수는 `tests/tool-XXX-*.spec.ts`로 추가합니다.
4. 기능 컴포넌트에는 안정적인 `data-testid`와 결과 데이터 속성을 제공합니다.

## 주의

자동 검수는 기능 실행·파일 생성·레이아웃 오류를 잡지만, 사람의 눈으로 보는 미세한 화질 선호까지 완전히 대신하지는 않습니다. 다만 실행 실패, 모듈 로딩 실패, ZIP 오류, 경로 누락, 반응형 넘침은 자동으로 검출합니다.


## 001~136 선제 검수 계획

- 마스터: `docs/validation/tool-001-136-validation-plan.json`
- TypeScript 조회: `lib/validation/tool-001-136-plan.ts`
- 자체검사: `npm run check:validation:136-plan`
- 목적: 전체 공통검수와 유형별 검수를 미리 조립하고, 실제 제작 직전에 최종 전달서 기반 고유검수를 연결한다.
- 보호: 기존 통과 검수기는 교체하지 않으며 추가 방식으로만 사용한다.
