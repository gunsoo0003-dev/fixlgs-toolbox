# TOOL063 Service Limit Briefing

- max absolute numeric input: `1e15`
- display precision: `0..8`
- ratio terms: max `3`
- proportion fields: max `4`
- raw input length: max `30` characters
- negative values: excluded in general-user mode
- undefined cases: `0:0` and divide-by-zero proportion branches are errors

These values follow the TOOL063 delivery specification. The implementation, UI copy, fixture and static checker use the same constants. Final service-limit confirmation belongs to the main integrated workspace.
