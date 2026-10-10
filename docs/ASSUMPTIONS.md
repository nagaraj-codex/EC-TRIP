# QueueCut assumptions

## 2026-10-10 — QC-001

- Local backend commands run from `apps/api`; this is required for the relative `./data/queuecut.db` datasource to target `apps/api/data/queuecut.db`.
- No production credentials are available in this checkout. Optional Google and Gemini integrations remain unconfigured unless environment variables are supplied.

