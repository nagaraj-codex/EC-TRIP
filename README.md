# QueueCut

QueueCut is a theme-park visit planning platform. It combines park discovery and visit planning in a React progressive web app with a FastAPI service for park data, recommendations, telemetry, notifications, trips, and related APIs.

## Start From Scratch

Prerequisites: Python 3.11 or newer, Node.js 20 or newer, and npm.

From the repository root, create and activate a Python virtual environment, then install the API dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r apps\api\requirements.txt
```

Install the web dependencies and start both development servers:

```powershell
npm --prefix apps/web install
python run_queuecut.py
```

The development orchestrator starts the API at `http://127.0.0.1:8000` and the Vite web app at `http://127.0.0.1:5173`. The API documentation is at `http://127.0.0.1:8000/docs`; the health endpoint is `/health`.

To run the unified server with the production web bundle:

```powershell
npm --prefix apps/web run build
python queuecut_final.py --reload
```

The unified server serves the built web app and API at `http://localhost:8000`.

## Implemented Product Areas

- Home and park discovery with search and park cards.
- Explore and park detail screens.
- A step-by-step visit planner for choosing a park and date and requesting a recommendation.
- Trips, profile, notifications, and guest/authentication flows.
- Responsive navigation, onboarding, and an in-app advisor interface.
- FastAPI routes for parks, recommendations, telemetry/WebSockets, trips, notifications, chat, feedback, itinerary, downloads, and authentication.
- A unified FastAPI/SPA server and a development orchestrator for running the API and Vite app together.

The interface uses the park catalog and API responses; it should not display invented live conditions or recommendations.

## Build and Test

Build the web app:

```powershell
npm --prefix apps/web run build
```

Run API tests:

```powershell
python -m pytest apps/api/tests -q
```

Run the system health audit:

```powershell
python verify_system_health.py
```

## Repository Map

- `apps/web/`: React, TypeScript, Vite, and PWA client.
- `apps/api/`: FastAPI service, schemas, providers, and tests.
- `data/`: park catalogs and supporting datasets.
- `scripts/`: data compilation and verification utilities.
- `docs/`: API, product, data, security, deployment, and testing documentation.
- `run_queuecut.py`: local API + Vite development launcher.
- `queuecut_final.py`: unified server for the built SPA and API.

Do not commit `.env` files, local databases, generated caches, or user/session data. Configure credentials through local environment variables or a deployment secret store.