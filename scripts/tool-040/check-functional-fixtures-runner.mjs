import fs from "node:fs";
import { convertTool040, parseTool040Items } from "../../lib/tool-040-delimiter-list.ts";

const cases = JSON.parse(fs.readFileSync("tests/fixtures/tool-040/cases.json", "utf8"));
let fail = 0;
const assert = (label, ok, detail = "") => {
  if (ok) console.log(`[PASS] ${label}${detail ? ` | ${detail}` : ""}`);
  else {
    console.error(`[FAIL] ${label}${detail ? ` | ${detail}` : ""}`);
    fail++;
  }
};

for (const c of cases) {
  const result = convertTool040(c.input, c.options);
  assert(`${c.id} exact output`, result.output === c.expected, `got=${JSON.stringify(result.output)}`);
}
assert("newline parser CRLF/LF/CR", JSON.stringify(parseTool040Items("a\r\nb\rc\nd", "newline")) === JSON.stringify(["a", "b", "c", "d"]));
assert("literal custom []", JSON.stringify(parseTool040Items("a[]b[]c", "custom", "[]")) === JSON.stringify(["a", "b", "c"]));
assert("literal custom backslash", JSON.stringify(parseTool040Items("a\\b\\c", "custom", "\\")) === JSON.stringify(["a", "b", "c"]));
assert("source text not mutated", (() => {
  const source = "  a  \n b ";
  convertTool040(source, { sourceKind: "newline", targetKind: "comma", trimItems: true, removeEmpty: true, quoteMode: "none", listMode: "none" });
  return source === "  a  \n b ";
})());

process.exitCode = fail ? 1 : 0;
