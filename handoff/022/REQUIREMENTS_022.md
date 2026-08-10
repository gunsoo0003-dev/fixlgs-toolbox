# TOOL 022 REQ MASTER

원본 전달서 1차 원자화 후, 원본을 다시 대조한 2차 누락 탐색을 합친 보조작업장 REQ 마스터다. PASS는 022 전용 구현/정적검수/격리 브라우저 근거를 의미하며, 공통 통합 항목은 MAIN-INTEGRATION-VERIFY로 분리한다.

| REQ-ID | 전달서 근거 | 최소 요구사항 | 구현 위치 | 검증 방법 | 판정 |
|---|---|---|---|---|---|
| 022-001 | 제작대상/16 | Naver Blog preset | lib/tool-022-blog-og.ts | source checker + preset spec | PASS |
| 022-002 | 제작대상/16 | Google/Blogger preset | lib/tool-022-blog-og.ts | source checker + preset spec | PASS |
| 022-003 | 제작대상/16 | Website Featured preset | lib/tool-022-blog-og.ts | source checker + preset spec | PASS |
| 022-004 | 제작대상/16 | Open Graph 1200×630 | lib/tool-022-blog-og.ts | source checker + actual JPG/PNG dimensions | PASS |
| 022-005 | 12/16 | 배경 이미지 시작 | tool component | input fixture + isolated browser | PASS |
| 022-006 | 12/16 | 빈 디자인 시작 | tool component | core spec + isolated browser | PASS |
| 022-007 | 13 | 브라우저 로컬 처리 / 서버 업로드 없음 | tool/page | source review | PASS |
| 022-008 | 14 | JPG/JPEG/PNG/WebP 배경 입력 | tool component | accept/decode + fixture | PASS |
| 022-009 | 14 | 로고 JPG/JPEG/PNG/WebP + alpha | tool component | transparent logo fixture | PASS |
| 022-010 | 14/49 | 손상/MIME 오류 처리 | tool component + boundary spec | corrupted fixture | PASS |
| 022-011 | 15/16 | JPG 출력 | tool component | actual browser downloaded file | PASS |
| 022-012 | 15/16 | PNG 출력 | tool component | actual browser downloaded file | PASS |
| 022-013 | 15/23 | 개별 다운로드 | tool component | actual browser download | PASS |
| 022-014 | 15/23 | 선택 규격 ZIP | tool component + lib/zip 사용 | actual ZIP count/order/dimensions | PASS |
| 022-015 | 23/50 | ZIP은 현재 선택 규격 전체를 새로 생성 | tool component | regression source fix + core spec | PASS |
| 022-016 | 16/17 | Common Design State | tool component | source checker | PASS |
| 022-017 | 16/17 | Per-Preset Override | tool component | core spec + source checker | PASS |
| 022-018 | 17 | override 없는 값은 common 참조 | tool component | state merge review | PASS |
| 022-019 | 17 | 특정 preset 수정이 다른 preset 침범 금지 | tool component | core spec | PASS |
| 022-020 | 17 | 현재 규격 override만 초기화 | tool component | UI/source review | PASS |
| 022-021 | 18 | No Stretch / 원본 종횡비 유지 cover crop | fitCover() | source checker + isolated renderer | PASS |
| 022-022 | 18 | crop X/Y | tool component | controls/source/core | PASS |
| 022-023 | 18 | zoom | tool component | controls/source/core | PASS |
| 022-024 | 18 | normalized crop 저장 | Common/Override crop -1..1 | source review | PASS |
| 022-025 | 19 | 제목 독립 layer | tool component renderer | source/browser output | PASS |
| 022-026 | 19 | 제목 크기/색/정렬/X/Y | tool component | source checker + controls | PASS |
| 022-027 | 19 | 설명 독립 layer | tool component renderer | source/browser output | PASS |
| 022-028 | 19 | 설명 크기/색/X/Y | tool component | source checker + controls | PASS |
| 022-029 | 19 | 로고 1개, 위치/크기/투명도 | tool component | source checker + logo fixture | PASS |
| 022-030 | 20 | TOOLBOX 가독성 여백 가이드 | tool component | UI/source review | PASS |
| 022-031 | 20 | 가이드는 export에 미포함 | DOM overlay / Canvas 분리 | source review | PASS |
| 022-032 | 21 | 전체 규격 미리보기 | Preview components | source/design checker | PASS |
| 022-033 | 21 | 용도/픽셀/sourceType 표시 | preset cards | source/design checker | PASS |
| 022-034 | 22 | Open Graph 카드형 preview | OgPreview | source/design checker | PASS |
| 022-035 | 22 | OG preview UI는 export 미포함 | DOM/Canvas 분리 | source review | PASS |
| 022-036 | 24 | JPG 품질 조절 | quality state/control | source/core spec | PASS |
| 022-037 | 24 | PNG 품질 slider 의미 분리 | PNG일 때 quality disabled | source review | PASS |
| 022-038 | 24/16 | 실제 Blob 크기 결과 표시 | resultGrid | source review | PASS |
| 022-039 | 26 | PC preview + 설정 패널 | CSS workspace grid | design checker + PC screenshot | PASS |
| 022-040 | 27 | 모바일 PC 단순축소 금지 / 단일열 | CSS media rules | mobile screenshot | PASS |
| 022-041 | 27 | 모바일 preset 2열 | CSS presetGrid | actual 390px check | PASS |
| 022-042 | 27 | 모바일 drag/scroll 충돌 완화 | touch-action:none + separate controls | source/design review | PASS |
| 022-043 | 28 | TOOLBOX light/dark theme 규칙 준수 | CSS variables + dark primary rule | design checker | PASS |
| 022-044 | 28 | theme 전환이 Canvas 결과색 변경 금지 | renderer state independent of theme | source review | PASS |
| 022-045 | 29~31 | KO 핵심 UI | page/tool copy | source checker | PASS |
| 022-046 | 29~31 | EN 핵심 UI | page/tool copy | source checker | PASS |
| 022-047 | 29~32 | JA 핵심 UI | page/tool copy | source checker | PASS |
| 022-048 | 32 | 일본어 긴 문구 / no-space / overflow | JA copy + CSS | isolated mobile browser evidence | PASS |
| 022-049 | 33 | 사용 방법 4단계 | page component | source review | PASS |
| 022-050 | 35/36 | 주의/FAQ 내용 | page component | source review | PASS |
| 022-051 | 37 | locale별 022 경로 | app/[locale]/blog-open-graph-image-maker | route source check | PASS |
| 022-052 | 38~40 | metadata/canonical/hreflang | page.tsx | source review | PASS |
| 022-053 | 39 | WebApplication/FAQPage/BreadcrumbList | page component JSON-LD | source review | PASS |
| 022-054 | 41 | sitemap/robots 공통파일 직접 수정 금지 | HANDOFF | SHA-256 common protection | PASS |
| 022-055 | 43 | 이미지/파일명/실텍스트/crop 결과 외부전송 금지 | local implementation | source review | PASS |
| 022-056 | 44 | label/aria-live/native keyboard controls | tool component | source review | PASS |
| 022-057 | 44 | 현재 preset screen reader 상태 | aria-pressed | source review | PASS |
| 022-058 | 44 | drag 대체 조작 | X/Y/zoom sliders | source review | PASS |
| 022-059 | 46 | browser-only API client component에서 사용 | 'use client' | source review | PASS |
| 022-060 | 47/48 | 고해상도 Canvas 상시 다중 유지 금지 | preview scale + export-on-demand | source review | PASS |
| 022-061 | 48 | ImageBitmap 교체/종료 처리 | close() lifecycle | source review | PASS |
| 022-062 | 49 | 0 preset 선택 오류 | makeResults guard | boundary spec | PASS |
| 022-063 | 49 | 초기화 후 재실행 | resetAll | boundary/source | PASS |
| 022-064 | 50/51 | 022 전용 fixture/spec/helper | tests/tool-022-* | harness checker | PASS |
| 022-065 | 52 | 배경 20MB 서비스 상한 | TOOL022_LIMITS | limit config/spec | PASS |
| 022-066 | 52 | 원본 40MP 서비스 상한 | TOOL022_LIMITS | limit config/spec | PASS |
| 022-067 | 52 | 제목 140자 | TOOL022_LIMITS + maxlength | source/limit | PASS |
| 022-068 | 52 | 설명 280자 | TOOL022_LIMITS + maxlength | source/limit | PASS |
| 022-069 | 56 | preflight/core/boundary/regression/limit 준비 | tests + config | harness checker | PASS |
| 022-070 | 59~63 | 실제 PC/모바일/JPG/PNG/ZIP 격리실행 근거 | validation/tool-022 | Chromium browser report | PASS |
| 022-071 | 59~63 | console/runtime page error | validation report | Playwright pageerror | PASS |
| 022-072 | 공통보호 | 기존 018 파일 수정 0 | 전체 작업트리 | SHA-256 compare | PASS |
| 022-073 | 65 | 관련도구 노출은 실제 최신 경로 확인 후 | main integration | HANDOFF | MAIN-INTEGRATION-VERIFY |
| 022-074 | 66/67 | 카테고리/공통 route/sitemap 최신 통합 | main integration | HANDOFF | MAIN-INTEGRATION-VERIFY |
| 022-075 | 61/62 | 최신 프로젝트 전체 regression/production build/integrated FINAL | main workshop | latest integrated tree | MAIN-INTEGRATION-VERIFY |

## 2차 독립 누락 탐색 결과

원본 전달서의 기능 범위, 처리방식, 입력/출력, 공통+override, No Stretch, 텍스트/로고, preview, ZIP, PC/mobile/theme, KO/EN/JA, 오류·경계, fixture, 서비스 상한, 접근성, SEO, 개인정보, 검수/출고, 공통보호 항목을 다시 대조했다. 보조작업장 구현 대상에서 추가 미반영 REQ는 0건으로 판정했다. 공통 통합 권한이 필요한 항목은 삭제하지 않고 REQ-073~075로 명시적으로 이관했다.
