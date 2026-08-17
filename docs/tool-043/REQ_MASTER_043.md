# TOOL043 REQ MASTER

Status legend: PASS / FAIL / N/A. This master is extracted from the TOOL043 final production brief and re-checked independently before FINAL.

| REQ-ID | Source | Requirement | Target | Verification | Status |
|---|---|---|---|---|---|
| REQ-043-001 | §1 | 추가·삭제·변경 기능 | diff model/UI | exact fixture | PASS |
| REQ-043-002 | §1/7 | 줄 단위 비교 | UI/model | line fixture | PASS |
| REQ-043-003 | §1/8 | 단어 단위 비교 | changed blocks | reconstruction | PASS |
| REQ-043-004 | §1/9 | 비교 결과 복사 | clipboard/report | actual browser clipboard pending | FAIL |
| REQ-043-005 | §5 | A/B 원문 보존 | model | reconstruction invariant | PASS |
| REQ-043-006 | §5 | deterministic diff | model | repeated fixture | PASS |
| REQ-043-007 | §5 | 동일 텍스트 0/0/0 | model/UI | exact fixture | PASS |
| REQ-043-008 | §6 | + - ~ = 비색상 라벨 | UI | static/runtime | PASS |
| REQ-043-009 | §7 | 원본 A/B 줄번호 | UI/model | runtime pending | PASS |
| REQ-043-010 | §7 | 빈 줄 차이 보존 | model | exact fixture | PASS |
| REQ-043-011 | §7 | 줄 끝 공백 차이 | model | boundary fixture | PASS |
| REQ-043-012 | §8 | 단어·공백·구두점 원문순서 | model | reconstruction | PASS |
| REQ-043-013 | §8 | KO/EN/JA word segmentation | model | fixtures | PASS |
| REQ-043-014 | §8 | emoji/surrogate 안전 | model | fixture | PASS |
| REQ-043-015 | §9 | plain-text report | report | logic checker | PASS |
| REQ-043-016 | §9 | clipboard 실패 안내 | UI | static/runtime pending | PASS |
| REQ-043-017 | §10 | 재비교 stale 제거 | UI state | static/runtime pending | PASS |
| REQ-043-018 | §10 | complete reset | UI state | static | PASS |
| REQ-043-019 | §11 | TOOL042 실제 디자인 우선 | page/tool CSS | code review | PASS |
| REQ-043-020 | §11 | PC A/B 2열 | CSS | static | PASS |
| REQ-043-021 | §11 | Mobile 세로/unified | CSS | static/runtime pending | PASS |
| REQ-043-022 | §12 | explicit labels | UI | static | PASS |
| REQ-043-023 | §12 | keyboard mode buttons | UI | native button/tab | PASS |
| REQ-043-024 | §12 | copy aria-live polite | UI | static | PASS |
| REQ-043-025 | §13 | KO/EN/JA routes/content | page/site | static | PASS |
| REQ-043-026 | §13 | no NFC/NFD normalization | model | boundary fixture | PASS |
| REQ-043-027 | §13 | explicit compare for IME | UI | static | PASS |
| REQ-043-028 | §14 | character limit candidate | model/UI | candidate 200k | PASS |
| REQ-043-029 | §14 | line limit candidate | model/UI | candidate 20k | PASS |
| REQ-043-030 | §14 | final limit requires user approval | policy | user approved 200,000 chars / 20,000 lines | PASS |
| REQ-043-031 | §15 | browser local only | architecture | static | PASS |
| REQ-043-032 | §15 | no source analytics/console | product | static review | PASS |
| REQ-043-033 | §16 | empty/one-sided/identical | UI/model | fixtures | PASS |
| REQ-043-034 | §16 | limit error preserves input | UI | runtime pending | PASS |
| REQ-043-035 | §17 | exact fixture set | checker | core.json | PASS |
| REQ-043-036 | §18 | A/B reconstruction invariant | checker/model | logic checker | PASS |
| REQ-043-037 | §18 | stats/report consistency | checker | logic/runtime pending | PASS |
| REQ-043-038 | §20 | checker self-check before FINAL | checker | static self-check | PASS |
| REQ-043-039 | §22 | actual PC/mobile/KO/EN/JA runtime | Playwright | ENVIRONMENT BLOCKED: npm registry EAI_AGAIN; dependencies unavailable | FAIL |
| REQ-043-040 | §26 | canonical/hreflang/sitemap | route/site | static | PASS |
| REQ-043-041 | §26 | FAQ required topics | page | static review | PASS |
| REQ-043-042 | §29 | related only existing routes | page | 042/036 | PASS |
| REQ-043-043 | §30 | no AI/merge/DOCX/PDF/OCR | scope | static review | PASS |
| REQ-043-044 | §31 | no runtime/temp in delivery ZIP | packaging | delivery ZIP reopen/root/forbidden check | PASS |

## 2026-08-17 user-approved additive UX requirements

| REQ-ID | Source | Requirement | Target | Verification | Status |
|---|---|---|---|---|---|
| REQ-043-045 | User meeting | A/B independent plain-text file input | UI/file reader | static + Playwright setInputFiles | FAIL |
| REQ-043-046 | User meeting | TXT/MD/CSV/JSON/XML/LOG input scope | input accept/validation | static + fixture | PASS |
| REQ-043-047 | User meeting | A/B independent drag-and-drop | A/B editor cards | static + Playwright drop | FAIL |
| REQ-043-048 | User meeting | A ↔ B swap | UI/state | static + Playwright | FAIL |
| REQ-043-049 | User meeting | actual line numbers in diff output | result renderer | static + Playwright | FAIL |
| REQ-043-050 | User meeting | changes-only view | result filter | static + Playwright | FAIL |
| REQ-043-051 | User meeting | TXT diff report download | report output | static + Playwright download | FAIL |
| REQ-043-052 | State contract | reset clears file names/filter/input values | UI state | source/self-check | PASS |

## 2026-08-17 empty-state design alignment

| REQ-ID | Source | Requirement | Target | Verification | Status |
|---|---|---|---|---|---|
| REQ-043-053 | User meeting | Initial A/B areas use shared light-blue dashed workspace language | input empty state | static checker + CSS review | PASS |
| REQ-043-054 | User meeting | A and B are visibly distinguished in empty and active states | input cards | static checker; browser runtime pending | FAIL |
| REQ-043-055 | User meeting | Supported formats TXT/MD/CSV/JSON/XML/LOG are visible before input | empty A/B workspace | static checker | PASS |
| REQ-043-056 | User meeting | Click/paste/file/drop converts only the acted-on side to textarea state | state transition | static checker + Playwright scenarios; browser runtime pending | FAIL |
