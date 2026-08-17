# TOOL044 REQ MASTER
- REQ-044-001 PASS: 5 fixed functions — word frequency, keyword density, repeated sentences, duplicate sentences, top keywords.
- REQ-044-002 PASS: KO/EN/JA Intl.Segmenter-first analyzer with deterministic fallback.
- REQ-044-003 PASS: density = count / total analyzable words * 100; zero never emits NaN/Infinity.
- REQ-044-004 PASS: frequency descending, tie by first appearance.
- REQ-044-005 PASS: duplicate sentence comparison trims outer whitespace, collapses internal whitespace and folds case; display source preserved.
- REQ-044-006 PASS: browser-local only; no source/result analytics or server transport added.
- REQ-044-007 PASS: TOOL043/latest shared text input visual contract reused; 044-specific result UI only.
- REQ-044-008 PASS: KO/EN/JA metadata, canonical/hreflang, FAQ structured data, related tools, sitemap/card integration.
- REQ-044-009 PASS: user-approved service limits fixed at 300,000 chars / 30,000 sentences / 50,000 unique keywords; single constants shared by product and checker.
- REQ-044-010 PENDING ENVIRONMENT: Playwright + full TypeScript + Next build actual execution.
- REQ-044-011 PASS: static/logic self-check and actual fixture contract.


## 2026-08-17 작업영역 공통 CSS / Drag & Drop 재정합
- TOOL042 실제 작업영역을 공통 계약의 원본으로 재확정.
- TOOL042 shared 요소(workspace/dropzone/file bar/editor/textarea/button/action/result)는 `text-tool-input-common.module.css`를 직접 참조하도록 전환.
- TOOL044도 같은 공통 CSS를 직접 사용하며 TXT/MD/CSV 파일 선택과 작업영역 전체 drag & drop을 지원.
- 파일 로드 후 파일명/용량 표시, 새 파일 교체, 기존 입력이 있을 때 교체 확인 dialog, reset 시 파일 상태 초기화를 적용.
- TOOL044 고유 CSS는 키워드 표·요약 확장·중복문장 결과 표현만 유지.
- checker: TOOL042/044 공통 CSS 직접참조 + TOOL044 file/drop handlers를 static gate에 추가. STATIC 64 PASS / LOGIC 14 PASS / FAIL 0.
