# 006 output boundary validation

This update adds independent desktop stages at 38 MP and exactly 40 MP, while changing the guardrail test to verify that 40,005,000 output pixels are blocked.

Purpose:
- confirm the highest value currently allowed by the production guardrail;
- avoid wasteful 48–64 MP tests that production code intentionally rejects;
- use the result to choose a conservative operating limit after the test.

Run:

```powershell
npm run test:toolbox:006-load
```
