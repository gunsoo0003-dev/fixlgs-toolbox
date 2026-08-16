import fs from "node:fs";
import { TOOL036_MAX_GRAPHEMES, calculateTool036Statistics, limitTool036Text } from "../../lib/tool-036-text-statistics.ts";
const cases=JSON.parse(fs.readFileSync("tests/fixtures/tool-036/cases.json","utf8"));let fail=0;
function assert(label,ok,detail=""){if(ok)console.log("[PASS]",label,detail);else{console.error("[FAIL]",label,detail);fail++;}}
for(const c of cases){const s=calculateTool036Statistics(c.text,c.locale,200);console.log(`\n[CASE] ${c.id}`,s);assert(`${c.id}: finite`,Object.values(s).every(Number.isFinite));assert(`${c.id}: nonnegative`,Object.values(s).every(v=>v>=0));}
const empty=calculateTool036Statistics("","en");assert("empty all zero",Object.values(empty).every(v=>v===0));
const spaces=calculateTool036Statistics(" \t\n","en");assert("spaces included",spaces.charactersWithSpaces>0);assert("spaces excluded zero",spaces.charactersWithoutSpaces===0);assert("spaces words zero",spaces.words===0);assert("spaces sentences zero",spaces.sentences===0);assert("spaces paragraphs zero",spaces.paragraphs===0);
const emoji=calculateTool036Statistics("A👨‍👩‍👧‍👦é👍🏽","en");assert("emoji grapheme 4",emoji.charactersWithSpaces===4,`got=${emoji.charactersWithSpaces}`);
const ja=calculateTool036Statistics("今日は良い天気です。文章の文字数と単語数を確認します。","ja");assert("Japanese no-space words > 1",ja.words>1,`got=${ja.words}`);assert("Japanese sentences 2",ja.sentences===2,`got=${ja.sentences}`);
const mixed=calculateTool036Statistics("one\r\ntwo\rthree\nfour","en");assert("mixed EOL lines 4",mixed.lines===4,`got=${mixed.lines}`);
const paragraph=calculateTool036Statistics("one\nline\n\n two\n\n\nthree","en");assert("paragraphs separated by blank lines",paragraph.paragraphs===3,`got=${paragraph.paragraphs}`);
const utf=calculateTool036Statistics("가A😀","ko");assert("UTF-8 byte exact",utf.utf8Bytes===8,`got=${utf.utf8Bytes}`);

const below=limitTool036Text("a".repeat(299999),"en");assert("limit below accepted",!below.truncated&&below.graphemes===299999,`got=${below.graphemes}`);
const exact=limitTool036Text("a".repeat(300000),"en");assert("limit exact accepted",!exact.truncated&&exact.graphemes===TOOL036_MAX_GRAPHEMES,`got=${exact.graphemes}`);
const over=limitTool036Text("a".repeat(300000)+"b","en");assert("limit over truncated",over.truncated&&over.graphemes===300000&&over.text.length===300000,`graphemes=${over.graphemes} length=${over.text.length}`);
const zwjOver=limitTool036Text("a".repeat(299999)+"👨‍👩‍👧‍👦"+"Z","en");const zwjStats=calculateTool036Statistics(zwjOver.text,"en");assert("limit preserves ZWJ grapheme boundary",zwjOver.truncated&&zwjStats.charactersWithSpaces===300000&&zwjOver.text.endsWith("👨‍👩‍👧‍👦"),`graphemes=${zwjStats.charactersWithSpaces}`);
process.exitCode=fail?1:0;
