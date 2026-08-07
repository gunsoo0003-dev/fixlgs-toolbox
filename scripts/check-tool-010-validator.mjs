import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const manifestPath = path.join(root, "docs/010-validation-coverage.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));

if (manifest.requirements.length !== 90) failures.push(`완료 기준 수가 90이 아님: ${manifest.requirements.length}`);
const ids = new Set();
for (const item of manifest.requirements) {
  if (ids.has(item.id)) failures.push(`중복 완료 기준 ID: ${item.id}`);
  ids.add(item.id);
  if (!exists(item.validator)) failures.push(`검수 파일 없음: ${item.id} -> ${item.validator}`);
  if (!item.mode || !["automated", "completion-gate"].includes(item.mode)) failures.push(`검수 모드 오류: ${item.id}`);
}


const requiredMappings = {
  "010-10": "tests/tool-010-input-errors.spec.ts",
  "010-11": "tests/tool-010-output-decode.spec.ts",
  "010-49": "tests/tool-010-memory-lifecycle.spec.ts",
  "010-51": "tests/tool-010-device-theme.spec.ts",
  "010-52": "tests/tool-010-device-theme.spec.ts",
  "010-54": "tests/tool-010-device-theme.spec.ts",
  "010-81": "scripts/check-tool-010-validator.mjs",
  "010-82": "tests/tool-010-regression-deep.spec.ts",
};
for (const [id, validator] of Object.entries(requiredMappings)) {
  const item = manifest.requirements.find(entry => entry.id === id);
  if (!item || item.validator !== validator) failures.push(`핵심 완료 기준 매핑 오류: ${id} -> ${item?.validator ?? "없음"}`);
}

const requiredSpecs = [
  "tests/tool-010-input-errors.spec.ts",
  "tests/tool-010-selection-history.spec.ts",
  "tests/tool-010-rendering-output.spec.ts",
  "tests/tool-010-output-decode.spec.ts",
  "tests/tool-010-view-mobile-accessibility.spec.ts",
  "tests/tool-010-device-theme.spec.ts",
  "tests/tool-010-memory-lifecycle.spec.ts",
  "tests/tool-010-seo-security-regression.spec.ts",
  "tests/tool-010-regression-deep.spec.ts",
  "tests/tool-010-auto-limit.spec.ts",
  "tests/tool-010-stress-limits.spec.ts",
  "tests/tool-010-limit.spec.ts",
  "tests/tool-010-regression.spec.ts",
];
for (const file of requiredSpecs) {
  if (!exists(file)) failures.push(`필수 010 검수 파일 없음: ${file}`);
  else if (!/\btest(?:\.describe|\.beforeEach)?\s*\(/.test(read(file))) failures.push(`테스트 선언 없음: ${file}`);
}

const semanticChecks = [
  ["자동 한계 단계 탐색", "tests/tool-010-auto-limit.spec.ts", ["incrementally discovers", "recommendedPixels", "firstFailedPixels", "safetyMargin", "discoveredPixelBoundary"]],
  ["영역·브러시·히스토리 스트레스", "tests/tool-010-stress-limits.spec.ts", ["progressively probes", "maxResponsiveRegions", "brushPointsAttempted", "historyBounded"]],
  ["태블릿 전용 viewport", "tests/tool-010-device-theme.spec.ts", ["tablet portrait", "tablet landscape", "768", "1024"]],
  ["실제 터치 포인터", "tests/helpers/tool-010.ts", ["pointerType: \"touch\"", "dispatchTouchPointer"]],
  ["멀티터치·회전", "tests/tool-010-device-theme.spec.ts", ["two pointers", "screen rotation"]],
  ["라이트·다크 실화면", "tests/tool-010-device-theme.spec.ts", ["light and dark themes", "screenshot", "active-state contrast"]],
  ["EXIF 방향·좌표·출력", "tests/tool-010-input-errors.spec.ts", ["EXIF orientation consistently to preview, coordinates and final output", "decodeDownloadedImage"]],
  ["최종 다운로드 재디코딩", "tests/tool-010-output-decode.spec.ts", ["decodeDownloadedImage", "preserves source dimensions", "selection guides"]],
  ["PNG/WebP 투명도와 JPG 배경", "tests/tool-010-output-decode.spec.ts", ["transparent PNG stays transparent", "JPG uses selected background"]],
  ["메모리와 URL 해제", "tests/tool-010-memory-lifecycle.spec.ts", ["URL.createObjectURL", "URL.revokeObjectURL", "stale asynchronous results"]],
  ["001~009 심층 회귀", "tests/tool-010-regression-deep.spec.ts", ["001-009 routes", "category numbering", "sitemap"]],
  ["정상 이미지 보안 흐름", "tests/tool-010-seo-security-regression.spec.ts", ["normal image editing and download", "private-sample.jpg", "do not transmit"]],
];
for (const [label, file, markers] of semanticChecks) {
  if (!exists(file)) continue;
  const source = read(file);
  for (const marker of markers) if (!source.includes(marker)) failures.push(`${label} 검수 표식 누락: ${file} -> ${marker}`);
}

const pkg = JSON.parse(read("package.json"));
for (const script of [
  "check:tool010-source", "check:tool010-validator", "test:toolbox:010-core", "test:toolbox:010-additional",
  "test:toolbox:010-regression", "test:toolbox:010-limit", "test:toolbox:010-auto-limit", "test:toolbox:010-validator-deep", "test:toolbox:010-final",
]) if (!pkg.scripts?.[script]) failures.push(`package script 없음: ${script}`);
for (const file of ["tool-010-output-decode.spec.ts", "tool-010-device-theme.spec.ts", "tool-010-memory-lifecycle.spec.ts"]) {
  if (!pkg.scripts["test:toolbox:010-core"].includes(file)) failures.push(`010 core 명령에서 누락: ${file}`);
}
if (!pkg.scripts["test:toolbox:010-regression"].includes("tool-010-regression-deep.spec.ts")) failures.push("심층 회귀검수가 regression 명령에 연결되지 않음");

const runner = read("scripts/run-tool-010-final-validation.mjs");
for (const phase of ["validator", "source", "ja-terms", "build", "common", "core", "additional", "regression", "boundary", "auto-limit"]) {
  if (!runner.includes(`name: "${phase}"`)) failures.push(`최종 실행기 단계 없음: ${phase}`);
}
if (!runner.includes("prerequisiteFailed")) failures.push("한계검수 선행 실패 차단 없음");
if (!runner.includes("04_실패자료")) failures.push("실패자료 보존 경로 없음");
if (!runner.includes("010_final_검수결과_") || !runner.includes("desktopZip")) failures.push("바탕화면 ZIP 생성 경로 없음");

const completionGate = read("docs/010-four-gate-validation.md");
for (const marker of ["실패 0", "스킵 0", "PC", "모바일", "다크", "한계", "회귀", "빌드"]) {
  if (!completionGate.includes(marker)) failures.push(`4대 검증 완료 게이트 근거 누락: ${marker}`);
}

if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: "PASS", requirements: 90, requiredSpecs: requiredSpecs.length, semanticChecks: semanticChecks.length, phases: 10 }, null, 2));
