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

## AdSense 최종정리 공통 정적 검수

TOOL001~071 공개 상태에서 사이트 전체 링크·검색·카테고리·공통 내비게이션 정합성을 확인한다.

- 실행: `npm run check:adsense-final`
- 검수기: `scripts/toolbox/check-adsense-final.mjs`
- 범위:
  - 공개 도구 TOOL001~071 및 실제 라우트 존재
  - 공개 카테고리 01~08 / 09~11 비노출 및 sitemap 제외
  - 메인 검색 기능 / 검색 결과 locale 링크 / 71+ 표시
  - 많이 찾는 도구 링크 연결
  - NEXT WORK / RELATED TOOLS 공통 `ToolNavigation` 적용 및 CTA 통일
  - TOOL071에서 존재하지 않는 TOOL072 NEXT 비노출
  - `href="#"`, 빈 href, `javascript:void(0)`, 빈 onClick, 구도구 도메인 잔존 검사
  - 카테고리 03~08 전용 가이드/전문 콘텐츠 구조 확인
  - 카테고리별 공개 도구 수 라벨 정합성

이 검수는 개별 도구 기능 검수를 대체하지 않고, 애드센스 재심사 전 사이트 전체 완성도/연결성 회귀를 추가로 막는 공통 게이트다.
