# TOOLBOX 공통 자동 검수

개발 환경에서만 사용하는 내부 검수 시스템입니다. 운영 배포에서는 `/dev/validation`이 404로 처리됩니다.

## 화면 검수

```powershell
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:3000/dev/validation
```

- `전체 도구 검수 시작`: 등록된 모든 도구의 한국어·영어·일본어 공개 경로를 확인합니다.
- `이 도구 검수`: 선택한 도구만 확인합니다.
- 004번은 샘플 JPG·PNG·WebP·EXIF JPG를 실제 압축 코드에 넣어 기능까지 확인합니다.

## Playwright 자동 검수

최초 한 번:

```powershell
npm install
npx playwright install chromium
```

실행:

```powershell
npm run test:toolbox
```

HTML 리포트 확인:

```powershell
npm run test:toolbox:report
```

## 새 도구 추가

`lib/validation/tool-registry.ts`에 도구 번호, 이름, 슬러그, 언어를 추가합니다. 단순 페이지는 언어별 경로 검수만 수행합니다. 별도 기능 검수가 필요한 도구는 기능 전용 suite를 추가합니다.

## 현재 검수 범위

- 001~004 한국어·영어·일본어 공개 경로
- H1 및 서버 오류 여부
- 004 JPG 실제 압축
- 004 PNG 무손실·투명도 처리
- 004 WebP 실제 압축
- 004 EXIF 방향 JPG 처리
- PC·모바일 Playwright 실행
- 화면 가로 넘침 기본 검사
- 운영 환경 검수 페이지 차단

자동 검수는 기능 실행과 구조 오류를 잡는 장치이며, 사람 눈으로 보는 화질·문장 자연스러움·세부 디자인 판단을 완전히 대체하지는 않습니다.
