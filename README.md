# QueueCut

QueueCut is an amusement park planning, queue intelligence, and date-recommendation platform. It helps visitors reduce wait times, optimize schedules, and plan visits to major amusement and water parks across Tamil Nadu and South India: **Wonderla Amusement Park (Chennai)**, **Black Thunder Water Theme Park (Coimbatore / Mettupalayam)**, and **MGM Dizzee World (Chennai)**.

---

## 1. System Architecture

```text
QueueCut Architecture (Java 21 + React / Vite Monorepo)

+--------------------------------------------------------------+
|                    Browser / Client UI                      |
|            React 18 + Vite + TypeScript + Tailwind           |
|            Port: http://localhost:5173                       |
+------------------------------+-------------------------------+
                               |  REST / Cookies (HTTP-only)
                               v
+--------------------------------------------------------------+
|                  Backend API (Spring Boot 3.3.13)            |
|                  Java 21 + Virtual Threads                   |
|                  Port: http://localhost:8080                 |
|                                                              |
|  - Auth: Email/Password + Google OAuth (Stateless Sessions)  |
|  - Catalog: Parks Database & Official Provenance             |
|  - Intelligence Engine: Weather (Open-Meteo) + Holidays      |
|  - Itinerary Engine: Dynamic timeline & rule-based planner   |
|  - Telemetry: Live weather and connection status             |
|  - Monitoring: Scheduled official website verification       |
+------------------------------+-------------------------------+
                               |  JDBC (HikariCP, WAL mode)
                               v
+--------------------------------------------------------------+
|               SQLite Database (Local / Embedded)             |
|               File: apps/api/data/queuecut.db                |
+--------------------------------------------------------------+
```

---

## 2. Prerequisites

- **Java 21 JDK** (e.g. Microsoft OpenJDK 21 or Eclipse Temurin 21)
- **Node.js** (v18, v20, or v22 LTS)
- **PowerShell** (for Windows development)
- **Git**

---

## 3. Quick Start (Windows)

A single PowerShell script launches both the Spring Boot backend and the React frontend in development mode:

```powershell
.\launch.ps1
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Health Checks**:
  - Actuator Health: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
  - API Health: [http://localhost:8080/health](http://localhost:8080/health)
  - Integrations Status: [http://localhost:8080/api/v1/health/integrations](http://localhost:8080/api/v1/health/integrations)

---

## 4. Manual Startup & Testing

### Backend (Spring Boot 3.3.13)

Run from the `apps/api` directory:

```powershell
cd apps\api

# Run integration tests (all 28 tests pass)
.\mvnw.cmd test

# Compile and package production JAR
.\mvnw.cmd clean package -DskipTests

# Run the API locally
.\mvnw.cmd spring-boot:run
```

### Frontend (React 18 + Vite)

Run from the `apps/web` directory:

```powershell
cd apps\web

# Run unit and component tests (Vitest)
npm test

# Type-check and build production bundle
npm run build

# Start dev server
npm run dev
```

---

## 5. Google OAuth Setup

QueueCut includes a complete, secure Google OAuth 2.0 implementation with PKCE state validation and HTTP-only session cookies.

### Local Development (Zero-Credential Mock Mode)

- When `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are left empty in local development, the application automatically runs in **Mock Mode** (`AVAILABLE_MOCK`).
- Clicking "Sign in with Google" logs in as a local test user without needing external Google Cloud credentials.

### Production Google Cloud Credentials Setup

When you are ready to enable real Google authentication:

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `QueueCut`).
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**
   - App Name: `QueueCut`
   - User Support Email: your email
   - Scopes: `openid`, `email`, `profile`
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `QueueCut Local Web Client`.
   - **Authorized JavaScript origins**: `http://localhost:5173` and `http://localhost:8080`
   - **Authorized redirect URIs**: `http://localhost:8080/api/v1/auth/google/callback`
5. Copy the generated **Client ID** and **Client Secret**.
6. Add them to your local `apps/api/.env` file:

   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8080/api/v1/auth/google/callback
   ```

---

## 6. Official Park Website Monitoring

QueueCut tracks official park websites for published hours, ticket prices, closures, and ride advisories. It never fabricates live crowd data or wait times.

### Monitored Official Portals

- **Wonderla Chennai**: `https://www.wonderla.com/chennai/` & `https://www.wonderla.com/offers`
- **Black Thunder Coimbatore**: `https://www.blackthunder.in/`, `/tariff/`, `/rides/`
- **MGM Dizzee World Chennai**: `https://www.mgmdizzeeworld.com/`, `/tickets/`, `/rides/`

### Running the Monitor Locally

From the project root:

```powershell
npm run monitor:parks
# or directly:
node scripts/monitor-parks.mjs
```

- Results are saved to `data/monitoring/park_source_status.json`.
- Changes detected from previous snapshots are logged in `data/monitoring/changelog.json`.

### GitHub Actions Scheduled Monitoring

The workflow [`.github/workflows/park-monitoring.yml`](file:///.github/workflows/park-monitoring.yml) runs every morning at **04:00 UTC (09:30 AM IST)** before park gates open. It records source freshness, detects content changes, and uploads diagnostic artifacts.

---

## 7. Deployment & Secrets Configuration

### GitHub Actions Workflows

- **Continuous Integration** ([`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml)): Runs backend tests (Java 21) and frontend build/typechecks on every pull request.
- **Production Deployment** ([`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml)): Deploys frontend to Vercel and backend to Render when commits land on `main`.

### Required GitHub Repository Secrets

To enable automated production deployments, configure these repository secrets in **GitHub** > **Settings** > **Secrets and variables** > **Actions**:

| Secret Name | Destination | Description |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | Frontend | Personal Access Token from Vercel account settings |
| `VERCEL_ORG_ID` | Frontend | Vercel team/org identifier from project settings |
| `VERCEL_PROJECT_ID` | Frontend | Vercel project identifier |
| `RENDER_DEPLOY_HOOK_URL` | Backend | Deploy Hook URL created in Render web service settings |
| `BACKEND_HEALTHCHECK_URL` | Verification | Full URL to test backend availability (e.g. `https://api.yourdomain.com/health`) |

---

## 8. Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `Port 8080 already in use` | Another process is holding the API port | Run `netstat -ano \| findstr :8080` in PowerShell and terminate the process with `taskkill /F /PID <pid>` |
| `Port 5173 already in use` | Another Vite server is running | Vite will offer port 5174; update `APP_FRONTEND_URL` in `.env` if needed |
| `database is locked` in SQLite | Multiple connections writing concurrently | HikariCP pool size is explicitly set to `1` in `application.yml` with `WAL` journal mode. Keep pool size at 1 for SQLite |
| `Google OAuth state invalid` | Expired OAuth session or cross-site cookie block | Ensure cookies are enabled and callback occurs within 10 minutes |
| Legacy runtime errors | Obsolete dependencies | The backend has been completely migrated to Java 21; run `.\scripts\check-no-python.ps1` to verify clean workspace |

---

## 9. Repository Structure

```text
J:\QUEUE CUT\
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI test suite (Java + Vite)
│       ├── deploy.yml             # Vercel & Render automated deployment
│       └── park-monitoring.yml    # Daily official park website verification
├── apps/
│   ├── api/                       # Spring Boot 3.3.13 (Java 21)
│   │   ├── pom.xml                # Maven project definition
│   │   ├── src/main/java/         # Modular backend (auth, park, itinerary, etc.)
│   │   ├── src/test/java/         # Integration test suite (28 tests)
│   │   └── data/                  # SQLite database and offline catalogs
│   └── web/                       # React 18 + Vite Frontend
│       ├── package.json
│       ├── src/components/        # Reusable UI component design system
│       ├── src/features/          # Park planner, recommendations, itinerary
│       └── src/pages/             # Page views & routing
├── data/
│   ├── monitoring/                # Daily park monitor status & changelog
│   └── parks_database/            # Unified park catalogs
├── scripts/
│   ├── monitor-parks.mjs          # Official website monitoring engine
│   └── check-no-python.ps1        # Workspace hygiene verification script
├── launch.ps1                     # Unified local development launch script
└── README.md                      # Platform documentation
```
