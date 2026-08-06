# TOOLBOX 008 Cropper.js PoC

- Cropper.js 2.1.1을 jsDelivr ESM 엔트리(`+esm`)로 불러온다.
- UMD 전역 객체를 생성자로 오인하던 `Cropper is not a constructor` 문제를 제거했다.
- 실제 제작 단계에서는 CDN 대신 npm 패키지를 Next.js 클라이언트 컴포넌트에서 동적 import한다.
- 검증 명령: `npm run test:toolbox:008-poc`
