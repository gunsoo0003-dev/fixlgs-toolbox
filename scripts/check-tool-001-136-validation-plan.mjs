import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "docs", "validation", "tool-001-136-validation-plan.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
if (data.tools.length !== 136) errors.push(`도구 수 오류: ${data.tools.length}`);
const expected = Array.from({length:136}, (_,i)=>String(i+1).padStart(3,"0"));
const actual = data.tools.map((t)=>t.number);
for (let i=0;i<expected.length;i++) if (actual[i] !== expected[i]) errors.push(`번호 누락/순서 오류: ${expected[i]} != ${actual[i]}`);
for (const tool of data.tools) {
  if (!tool.name || !tool.category || !tool.archetype) errors.push(`${tool.number}: 기본 메타 누락`);
  if (!Array.isArray(tool.features) || tool.features.length === 0) errors.push(`${tool.number}: 기능 목록 누락`);
  if (!Array.isArray(tool.profiles) || tool.profiles.length === 0) errors.push(`${tool.number}: 검수 프로필 누락`);
  if (!Array.isArray(tool.anticipatedChecks) || tool.anticipatedChecks.length === 0) errors.push(`${tool.number}: 예상 검수 누락`);
}
if (!Array.isArray(data.commonChecks) || data.commonChecks.length < 30) errors.push("공통검수 항목 부족");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
const archetypes = new Set(data.tools.map((t)=>t.archetype));
console.log(`001~136 선제 검수 계획 PASS`);
console.log(`도구: ${data.tools.length}`);
console.log(`카테고리: ${data.categories.length}`);
console.log(`검수 유형: ${archetypes.size}`);
console.log(`공통검수: ${data.commonChecks.length}`);
