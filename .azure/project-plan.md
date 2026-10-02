# QueueCut Project Plan

## Product

QueueCut helps visitors discover theme parks and plan visits around park, date, and available condition data. The primary client is the React/Vite PWA in `apps/web`; the API is the FastAPI service in `apps/api`.

## Completed

- Reworked the consumer-facing shell and home screen with responsive navigation, park discovery, search, and direct planning actions.
- Added route-based screens for explore, park details, visit planning, trips, profile, notifications, onboarding, and authentication.
- Kept the visit planner connected to park/API data and removed unsupported, hard-coded “best window” timing from the home screen.
- Added API support for park data, recommendations, telemetry/WebSockets, chat, feedback, itinerary, downloads, trips, notifications, and authentication.
- Added a unified FastAPI server for serving the production SPA alongside the API.
- Added a local development orchestrator, workspace tasks, health verification, and project documentation.
- Added Git ignore protection for local databases, environment files, caches, and auth session state.

## Verification

- `npm --prefix apps/web run build`: passing after the QueueCut redesign and hero CTA correction.
- `python -m pytest apps/api/tests -q`: 21 tests passed in the latest recorded run.
- Unified server: `/` served the React app with HTTP 200 and `/health` returned `healthy` on port 8001.
- Browser smoke check: onboarding, guest entry, home, and visit-planner routes rendered.

## Run Locally

- `python run_queuecut.py`: API on port 8000 and Vite on port 5173.
- Build the client with `npm --prefix apps/web run build`, then run `python queuecut_final.py --reload` to serve the SPA and API together (port 8000 by default).

Port 8000 was occupied by an unidentified local listener during the latest unified-server check, so the verified unified run used port 8001. The development orchestrator defaults remain 8000/5173.

## Follow-Up

- Resolve ownership of the stale listener on port 8000 before reusing that port.
- Re-run the API unit suite and system health audit after backend or environment changes.
- Keep live crowd, weather, and recommendation claims tied to verified API data.

## Last Updated

2026-10-02
