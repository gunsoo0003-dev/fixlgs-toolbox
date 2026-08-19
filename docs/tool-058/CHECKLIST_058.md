# TOOL058 AUXILIARY WORKSHOP CHECKLIST

| Check | Evidence | Result |
|---|---|---|
| Fixed scope preserved | REQ master + implementation | PASS |
| Data decimal engine | independent logic check | PASS |
| Data binary engine | independent logic check | PASS |
| 8bit=1byte | logic check | PASS |
| 1GB decimal=1000MB | logic check | PASS |
| 1GiB binary=1024MiB | logic check | PASS |
| Cooking 240/15/5 reference | logic/fixture | PASS |
| 1cup=16tbsp=48tsp | logic check | PASS |
| Reverse 500mL conversion | logic check | PASS |
| Data/cooking registry isolation | separate registries + dimension spec | PASS |
| 0 / negative / over-limit | logic + boundary spec | PASS |
| Precision max 8 | source/limit spec | PASS |
| KO/EN/JA structure | route/page/product/unit registry | PASS |
| Japanese mobile code preparation | DESIGN-CODE check | PASS |
| SEO canonical/hreflang | route source | PASS |
| FAQ structured data matches visible FAQ | source check | PASS |
| Common sections | shared class reuse | PASS |
| MAIN design baseline | TOOL055 | PASS |
| Dedicated module CSS | TOOL058 module only | PASS |
| Global CSS contamination | hash/source check | PASS |
| Legacy sealed direct use | none | PASS |
| Common protected files | SHA-256 before/after identical | PASS |
| Data engine TypeScript compile | global `tsc` isolated lib compile | PASS |
| Full Next/React typecheck | dependencies/types absent from provided archive | MAIN-WORK INTEGRATION VERIFICATION |
| Actual browser / Playwright | local node_modules absent; latest instruction assigns integration runtime to main work | MAIN-WORK INTEGRATION VERIFICATION |
| production build / integrated regression | latest instruction assigns to main work | MAIN-WORK INTEGRATION VERIFICATION |
| category card/site registry/sitemap/robots | common protected files intentionally not modified | MAIN-WORK INTEGRATION VERIFICATION |
| Package/HANDOFF 1:1 | final ZIP verification | PASS after packaging |
