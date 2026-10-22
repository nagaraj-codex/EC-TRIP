# QueueCut discovery

Last inspected: 2026-10-10 IST (QC-001)

## D1. Backend layout

`apps/api` is a Maven/Spring Boot 3.4.4 application on Java 21. The root package is
`com.queuecut.api`, arranged into `config`, `controller`, `service`, `entity`,
`repository`, `security`, `exception`, and `integration` packages. JPA entities are
`User`, `Trip`, `Session`, `Notification`, and `CrowdObservation`; their Spring Data
repositories are in `repository/`. `application.yml` configures SQLite, JPA
`ddl-auto: update`, Caffeine, Spring Security, actuator, and external service URLs.

The current park catalogue is JSON, loaded by `ParkCatalogService` from
`data/parks_database/unified_parks_catalog.json`; it is not yet a JPA park/ride/ticket
data model. `ParksConfig` also has code-level park metadata/pricing, so the requested
future data-only park extension is not yet true.

## D2. HTTP API and consumers

All browser API calls currently live in `apps/web/src/services/apiClient.ts`, except the
OAuth browser redirect. Responses are predominantly ad-hoc maps with `status` and
`data`, rather than one shared error envelope.

| Endpoint | Shape / purpose | Web caller |
| --- | --- | --- |
| `GET /actuator/health` | Spring actuator health | verification only |
| `GET /health`, `/api/health`, `/api/v1/health/integrations`, `/` | app/integration health and root | none found |
| `GET /api/v1/parks` | `{status,count,data[]}` park summaries | `getParks` |
| `GET /api/v1/parks/all` | `{status,parks[]}` weather/crowd placeholders | none found |
| `GET /api/v1/parks/{id}`, `/rides`, `/tariff`, `/intelligence` | catalogue/detail views | matching park callers |
| `POST /api/v1/recommendation/recommend` | recommendation request/result | `recommend` |
| `POST /api/v1/itinerary/generate` | itinerary request/result | `generateItinerary` |
| `GET /api/v1/telemetry/weather`, `/commute`; `POST /trigger-alert` | telemetry | matching telemetry callers |
| `POST /api/v1/chat/ask` | `{response,is_fallback}` | `chat` |
| `POST /api/v1/feedback/report`; `GET /observations/{parkId}` | crowd reports | matching feedback callers |
| `POST /api/v1/download/export` | downloadable export | `exportData` |
| `GET/POST/DELETE /api/v1/trips[/{id}]` | account trip CRUD | matching trip callers |
| `GET/POST /api/v1/notifications...` | list/read notifications | matching notification callers |
| `GET /api/v1/news` | currently unavailable news response | `getNews` |
| `POST /api/v1/auth/register`, `/login`, `/verify-email`, `/resend-verification`, `/forgot-password`, `/reset-password`, `/logout`; `GET /me` | email/password and session paths | auth store/client |
| `GET /api/v1/auth/google/status`, `/google/login`, `/google/callback` | Google configuration and OAuth flow | status plus browser redirect |

WebSocket telemetry is registered at `/ws/telemetry`; Vite proxies `/ws` to port 8080.

## D3. Database and seed state

The configured local database is `apps/api/data/queuecut.db` when Maven is launched
from `apps/api`. Its schema was read with JDBC on 2026-10-10. It has tables `users`,
`trips`, `sessions`, `notifications`, and `crowd_observations`. Each has a primary-key
autoindex; `users.email` also has a unique autoindex. There are no Park, Ride,
TicketProduct, CalendarDay, audit, or monitor tables, and no non-primary indexes.

`users` includes credentials and verification/reset hashes; `trips` stores a JSON `TEXT`
payload; observations store park/date, aggregate crowd/wait data, FastTrack and proximity
flags. Hibernate currently updates this schema; there is no migration tool. Data files
exist in `data/parks_database/` and duplicated `data/seed/` locations, but there is no
versioned, idempotent application seed runner under `src/main/resources/seed`.

## D4. Frontend

`apps/web` is React 18 + TypeScript + Vite 8 + React Router DOM 7 + Zustand + Vitest.
`main.tsx` mounts `BrowserRouter`; `App.tsx` provides splash, onboarding, login, and
guarded `/app/*` routes: home, explore, destination detail, compare, trips, saved,
notifications, profile, settings, and plan. State slices are `authStore`, `uiStore`,
`plannerStore`, and `exploreStore`. The PWA is configured in `vite.config.ts`.

The API base is `VITE_API_BASE_URL` (default `/api/v1`) and Vite proxies `/api` and `/ws`
to `http://localhost:8080`. Existing PWA manifest icons point to a third-party URL, a
future QC-052 issue.

## D5. Gemini

`ChatService` reads `app.gemini.api-key` from `GEMINI_API_KEY`. If it is blank, or a
Gemini HTTP/parsing call fails, it returns a catalogue-based heuristic with
`is_fallback: true`. On a configured successful call it uses `gemini-1.5-flash` by
default and returns `is_fallback: false`. The key remains server-side.

## D6. Monitoring / scheduler

No `@Scheduled` annotation, scheduler configuration, ingestion job, source monitor,
parser fixture, conditional-request code, or monitor alert data model was found. Existing
`data/raw_crawls/` files are static artefacts rather than a scheduler.

## D7. Port truth

The real API port is `8080`; frontend port is `5173`. The production/default Google
callback is `http://localhost:8080/api/v1/auth/google/callback`, and Vite's proxies target
8080. The stale `8000` reference is only
`apps/api/src/test/resources/application-test.properties` (`app.google.redirect-uri`).
`docs/MASTER_PROMPT_PACK.md` has a historical 8080 value, not a stale 8000 value.

## D8. Tooling

`apps/api/mvnw.cmd` exists. Runtime inspection reported Node `v24.20.0`, npm `11.19.0`,
and OpenJDK `21.0.12` LTS. The installed Vite 8 package declares Node
`^20.19.0 || >=22.12.0`, so Node 24 is supported. Maven wrapper verification passed.

## Baseline evidence

* `apps/api> .\mvnw.cmd -q -DskipTests=false verify` — exit 0 on 2026-10-10.
* `apps/web> npx tsc --noEmit; npx vitest run; npm run build` — exit 0; 14/14 tests
  passed; production build completed.

