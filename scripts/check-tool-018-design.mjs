import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const tool001 = read('components/image-converter-tool.tsx');
const tool018 = read('components/image-metadata-checker-tool.tsx');
const page018 = read('components/image-metadata-checker-page.tsx');
const css018 = read('components/image-metadata-checker-tool.module.css');
const globalCss = read('app/globals.css');
const page015 = read('components/before-after-image-page.tsx');

const checks = [];
const add = (name, ok, detail) => checks.push({ name, ok, detail });

for (const cls of ['toolbox-workbench','toolbox-workbench-upload','toolbox-workbench-topline','toolbox-upload-focus','toolbox-upload-icon','toolbox-upload-active','toolbox-upload-active-head','toolbox-upload-active-actions','toolbox-file-stats']) {
  add(`001 workbench class: ${cls}`, tool001.includes(cls) && tool018.includes(cls), '001과 018이 동일 전역 작업영역 클래스를 직접 사용');
}
add('001 upload focus baseline exists', /\.toolbox-upload-focus\{[^}]*min-height:346px/.test(globalCss) && /border:2px dashed/.test(globalCss) && /\.toolbox-upload-icon\{[^}]*width:58px;height:58px/.test(globalCss), '346px / 2px dashed / 58px + 기준');
add('Primary action actual common scope', (tool018.match(/toolbox-workbench-actions/g) || []).length >= 2 && (tool018.match(/toolbox-primary-action/g) || []).length >= 2 && globalCss.includes('.toolbox-workbench-actions .toolbox-primary-action') && css018.includes('.actions .primary:disabled{opacity:.45'), '클래스명 존재가 아니라 실제 .toolbox-workbench-actions 내부에서 공통 Primary selector가 적용되고 disabled 45% 유지');
add('Responsive 980 one-column', css018.includes('@media(max-width:980px)') && css018.includes('.workspace,.infoGrid{grid-template-columns:1fr}'), 'PC 2열 → 태블릿/좁은 화면 1열');
add('Responsive 720 mobile cards', css018.includes('@media(max-width:720px)') && css018.includes('.metadataRow{grid-template-columns:1fr'), '모바일 metadata 세로형');
add('Long metadata wrap', css018.includes('overflow-wrap:anywhere') && css018.includes('white-space:pre-wrap'), '긴 파일명/메타데이터 값 overflow 방지');
add('Mobile filename wraps instead of ellipsis-only', css018.includes('.fileSelect strong{overflow:visible;text-overflow:clip;white-space:normal;overflow-wrap:anywhere}'), '720px 이하 긴 파일명이 한 줄 ellipsis 고정이 아니라 자연스럽게 줄바꿈');
add('KO/JA keep-all for guide and how-to', css018.includes('.keepWords{word-break:keep-all;overflow-wrap:normal}') && css018.includes('.howTo :global(li p){word-break:keep-all;overflow-wrap:normal}') && page018.includes('className={styles.keepWords}'), 'HOW TO 문장과 상세 가이드 제목의 의미 단위 줄바꿈 보정');
add('Use cases follow title-description card pattern', page018.includes('t.examples.map(([title,description],index)') && page018.includes('<h4>{title}</h4><p>{description}</p>'), '완료 도구의 결과 카드처럼 활용예시도 번호 + 제목 + 설명 계층을 유지');
add('External drag-over covers whole workbench', tool018.includes('onDragEnter={handleExternalDragEnter}') && tool018.includes('onDragOver={handleExternalDragOver}') && tool018.includes('onDrop={handleExternalDrop}') && tool018.includes("toolbox-workbench-upload ${drag ? 'is-dragging' : ''}") && tool018.includes("drag ? styles.contentDragging : ''"), '다중파일 업로드 + 결과/설정 작업영역 전체가 동일 외부 drag state 사용');
add('External file drag is separated from non-file drag', tool018.includes("Array.from(event.dataTransfer.types).includes('Files')") && tool018.includes('event.currentTarget.contains(related)'), 'Files 타입만 강조하고 자식 이동 dragleave 깜빡임 방지');
add('Editor density follows verified pattern', /\.content\{[^}]*gap:16px;[^}]*padding:28px;[^}]*border-top:1px solid var\(--tb-line\);[^}]*background:var\(--tb-soft\)/.test(css018) && /\.batchCard,\.stepCard,\.previewCard,\.privacyCard\{[^}]*border-radius:18px;[^}]*background:var\(--tb-panel\);padding:20px/.test(css018), '014/완료형과 같이 외부 작업 배경 soft + 내부 카드 panel, 28px/16px 밀도');
add('Drag-over visual continues into editor', css018.includes('.contentDragging{outline:2px dashed var(--blue)') && css018.includes('box-shadow:inset 0 0 0 3px'), '상단과 결과 작업영역이 동일 externalDrag 상태로 시각 강조');
add('No internal reorder drag conflict', !/draggable=|onDragStart=|onDragEnd=/.test(tool018), '018은 내부 순서 드래그 기능 없음');
add('Related tools compact spacing', page018.includes('toolbox-next-work toolbox-related-tools'), '기존 RELATED TOOLS 전용 간격 클래스 적용');
add('NEXT WORK precedes RELATED TOOLS', page018.indexOf('<p>NEXT WORK</p>') >= 0 && page018.indexOf('<p>RELATED TOOLS</p>') > page018.indexOf('<p>NEXT WORK</p>'), '공통 시각 계층: 작업영역 → NEXT WORK → RELATED TOOLS');
add('Next-work block preserved', page018.includes('<p>NEXT WORK</p>') && page015.includes('<p>NEXT WORK</p>'), 'B카테고리 완료형과 같은 next-work 계열');
add('Workspace labels use workspace naming', ['이미지 메타데이터 검사 작업장','Image metadata inspection workspace','画像メタデータ確認ワークスペース'].every((token) => tool018.includes(token)), 'WORKSPACE 아래 문구를 001/014/015와 같은 작업공간 명칭 형식으로 통일');
add('How-to blue signature section', page018.includes('toolbox-tool-guide') && globalCss.includes('Tool detail HOW TO USE — full-width Santorini blue signature section'), '공통 산토리니 블루 사용방법 섹션');
add('11-step desktop guide completed', page018.includes('styles.howTo') && css018.includes('grid-template-columns:repeat(6,minmax(0,1fr))') && css018.includes('li:nth-child(10)){grid-column:span 2') && css018.includes('li:nth-child(11)){grid-column:span 4'), '1~9는 3열, 마지막 줄은 10번 1/3 + 11번 2/3로 상단 그리드 라인 정렬');
add('Guide separators completed', css018.includes('li:nth-child(n+4)') && css018.includes('border-top:1px solid rgba(255,255,255,.28)!important'), '다행 사용방법의 행/열 구분선 명시');
add('How-to outer edge padding rhythm', ['li:nth-child(1)','li:nth-child(4)','li:nth-child(7)','li:nth-child(10)','li:nth-child(3)','li:nth-child(6)','li:nth-child(9)','li:nth-child(11)'].every((token) => css018.includes(token)) && css018.includes('padding-left:0!important') && css018.includes('padding-right:0!important'), '각 행 첫/마지막 카드 외곽 패딩을 013/014/015 완료형 리듬에 맞춤');
add('Guide / caution / expert / use cases / FAQ / note present', ['toolbox-tool-guide','toolbox-tool-expert-post','toolbox-tool-format-notes','주의사항','Important notes','注意事項','USE CASES','toolbox-tool-faq','toolbox-tool-processing-note'].every((token) => page018.includes(token)), '3차 지시서 구성요소 누락 없음');
add('Dark status contrast overrides', css018.includes('html[data-theme="dark"]') && css018.includes('#f0b35a') && css018.includes('#6ee7a0') && css018.includes('#ff8a80'), '작은 경고/성공/오류 텍스트 dark 대비 보강');
add('No 018-specific common CSS', !/tool018|image-metadata-checker/i.test(globalCss), '018 디자인 때문에 공통 CSS에 전용 규칙 추가하지 않음');

let failed = 0;
for (const c of checks) {
  console.log(`${c.ok ? 'PASS' : 'FAIL'} | ${c.name} | ${c.detail}`);
  if (!c.ok) failed += 1;
}
console.log(`018 DESIGN STATIC CROSS-CHECK: ${failed ? `FAIL (${failed})` : `PASS (${checks.length} checks)`}`);
process.exit(failed ? 1 : 0);
