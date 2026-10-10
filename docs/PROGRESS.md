# QueueCut Progress

Last updated: 2026-10-10 10:35 IST  
Current task: QC-002  
Branch: `codex/qc-001-baseline`  Last good commit: `f3ba39e`

## Task ledger

| ID | Title | Status | Evidence | Notes |
| --- | --- | --- | --- | --- |
| QC-001 | Baseline and repository discovery | DONE | `mvnw.cmd -q -DskipTests=false verify` exit 0; `npx tsc --noEmit`, 14/14 Vitest, and build exit 0 | Discovery records D1-D8 and the JDBC-inspected schema. |
| QC-002 | Reconcile ports/URLs | DONE | Maven verify exit 0; typecheck 0; Vitest 14/14; build exit 0 | Test callback and README now use the real API callback on port 8080. |
| QC-003 | Environment templates and secret audit | TODO | — | — |
| QC-004 | Development and verification scripts | TODO | — | — |

## Open blockers

- None for QC-001.

## Assumptions made

- Local backend commands run from `apps/api`, which makes its configured relative SQLite path resolve to `apps/api/data/queuecut.db`.

## Measured results

- tsc errors: 0
- Vitest: 14/14 passed
- Maven verify: PASS
- npm audit: not run in this task
- Lighthouse mobile: not measured

