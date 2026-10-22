# QueueCut assumptions

## 2026-10-10 — QC-001

- Local backend commands run from `apps/api`; this is required for the relative `./data/queuecut.db` datasource to target `apps/api/data/queuecut.db`.
- No production credentials are available in this checkout. Optional Google and Gemini integrations remain unconfigured unless environment variables are supplied.

## 2026-10-10 — QC-003

- `APP_BASE_URL`, `API_BASE_URL`, `ALLOWED_ORIGINS`, and `ADMIN_EMAILS` are documented for the requested target state. The current application consumes `APP_CORS_ORIGINS`, rather than the two origin aliases, and has no admin endpoint yet.

