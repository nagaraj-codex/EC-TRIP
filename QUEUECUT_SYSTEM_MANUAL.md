# 🎢 QueueCut: Comprehensive System Architecture, Navigation & Operation Manual

**Version**: 3.0.0 (Local Audit Snapshot; not a production certification)
**Last Updated**: October 2, 2026
**Auditor**: Principal Codebase Auditor & Senior Systems Refactoring Specialist  
**Workspace**: `j:\QUEUE CUT`  

---

## 📑 Table of Contents

1. [Executive Summary & Technology Stack](#1-executive-summary--technology-stack)
2. [Complete Application Navigation & Screen Architecture](#2-complete-application-navigation--screen-architecture)
3. [Authentication & Guest Browsing Engine](#3-authentication--guest-browsing-engine)
4. [Account & App Settings Engine](#4-account--app-settings-engine)
5. [Core Intelligence Hub & Calculation Algorithms](#5-core-intelligence-hub--calculation-algorithms)
6. [Park Catalog and Provenance](#6-park-catalog-and-provenance)
7. [API Route & Spring Boot Endpoint Registry](#7-api-route--spring-boot-endpoint-registry)
8. [Monorepo Configuration & Tooling Standards](#8-monorepo-configuration--tooling-standards)
9. [VS Code Enterprise Developer Suite](#9-vs-code-enterprise-developer-suite)
10. [Local Development Server](#10-local-development-server)
11. [Continuous Integration & Deployment Pipelines](#11-continuous-integration--deployment-pipelines)
12. [Codebase Audit & Refactoring Summary](#12-codebase-audit--refactoring-summary)
13. [Automated Verification & Developer Runbooks](#13-automated-verification--developer-runbooks)

---

## 1. Executive Summary & Technology Stack

QueueCut is a React/Vite frontend with a Java Spring Boot backend offering a local park catalog, date recommendations, itinerary templates, account trips, weather/solar/routing integrations, user crowd reports, and an optional Gemini advisor. It has been locally built and tested. It is **not deployment-verified or production-ready**: catalog facts lack field-level provenance, crowd and wait outputs are provisional rules, itineraries contain templates, and deployment credentials/URLs are environment-specific.

### Technology Stack Overview

- **Frontend (`apps/web`)**: React 18, TypeScript, Vite 5, Tailwind CSS 3.4, Zustand, Lucide React, Mapbox GL JS. The browser token is a public Mapbox token and must be restricted; it is not a private API key.
- **Backend (`apps/api`)**: Java 21, Spring Boot 3.x, Spring Data JPA, Spring Security, SQLite-backed auth/trips/reports, and embedded Tomcat. CI runs `mvn clean test` against the JUnit 5 suite.
- **External providers**: Open-Meteo forecast and Air Quality, Sunrise-Sunset.org v2, Nager.Date, OSRM public demo, and optional Gemini. Each provider may report unavailable; public/demo services have usage and attribution terms.
- **Cache**: Redis when reachable, otherwise a bounded, locked in-memory fallback. The health endpoint reports the backend actually selected; memory cache is process-local and not shared across instances.
- **Analytics**: Recommendation crowd/wait figures are provisional calendar heuristics, not outputs of a validated machine-learning model. No confirmed real-observation dataset or 300-row training invariant was found in this audit.
- **CI/deployment**: GitHub Actions CI and a Vercel/Render deployment workflow exist. A workflow file does not prove that secrets, production URLs, runtime configuration, or a successful deployment are present.

---

## 2. Complete Application Navigation & Screen Architecture

QueueCut uses a single-page view router driven by Zustand state (`plannerStore.ts`), enabling seamless transitions between planning funnels and analytical views without page reloads.

```text
                              ┌──────────────────────────────────────────────┐
                              │            TopBar & Navigation Bar           │
                              │  [Logo] [Park Selector] [Notifs] [User Menu] │
                              └──────────────────────┬───────────────────────┘
                                                     │
               ┌─────────────────────────────────────┼─────────────────────────────────────┐
               │                                     │                                     │
               ▼                                     ▼                                     ▼
     ┌──────────────────┐                  ┌──────────────────┐                  ┌──────────────────┐
     │  Planner Wizard  │                  │  Parks Explorer  │                  │  Crowd Calendar  │
   │ (4-Step Funnel)  │                  │ (Local Catalog) │                  │ (Heuristic View) │
     └─────────┬────────┘                  └──────────────────┘                  └──────────────────┘
               │
               ├───────────────────► Step 1: Select Park (Wonderla / MGM / Black Thunder)
               ├───────────────────► Step 2: Select Date Range (Single Day vs 30-Day Window)
               ├───────────────────► Step 3: Group Makeup (Adults, Kids, Students, Seniors)
               └───────────────────► Step 4: Budget & Priority Optimization
                         │
                         ▼
               ┌──────────────────┐                  ┌──────────────────┐                  ┌──────────────────┐
               │  Results Engine  │ ───────────────► │  Itinerary View  │ ───────────────► │ Saved Trips View │
               │ (Rule-Based Score)                 │ (Schedule Template)         │ (Saved Trips)    │
               └──────────────────┘                  └──────────────────┘                  └──────────────────┘
                         │                                     │                                     │
                         └─────────────────────────────────────┼─────────────────────────────────────┘
                                                               │
                              ┌────────────────────────────────┴─────────────────────────────┐
                              │                    Global Modals & Drawers                   │
                              │  • AuthModal (Sign In / Sign Up / Guest)                     │
                              │  • AdvisorDrawer (AI Theme Park Chatbot)                     │
                              │  • CrowdReportModal (User Report + Approx. Proximity Check) │
                              │  • NotificationToasts (In-App WebSocket Alerts)             │
                              │  • SettingsView (Profile, Alerts, Telemetry & Security)      │
                              └──────────────────────────────────────────────────────────────┘
```

### The 7 Primary Screens

| Screen Identifier | Primary Component | Purpose & Features |
| :--- | :--- | :--- |
| **`landing`** | `LandingScreen.tsx` | 4-step wizard: Park selection, date interval selection, group demographics, and budget priorities. |
| **`results`** | `RecommendationScreen.tsx` | Rule-based visit score and provisional crowd/wait estimates; FastTrack ROI is unavailable without measured queue comparisons. |
| **`calendar`** | `CrowdCalendarView.tsx` | Calendar view; heuristic values are not measured or accuracy-validated queue forecasts. |
| **`parks`** | `ParksView.tsx` | Local catalog data; prices, rides, height rules, and dress-code fields have no field-level verification record. |
| **`itinerary`** | `ItineraryScreen.tsx` | Park-specific schedule template with estimated waits; not a globally optimized, operating-status-aware schedule. UV adjustment is flagged only when forecast data is available. |
| **`trips`** | `SavedTripsView.tsx` | Guest trips use local state; account trips are retrieved from the authenticated backend store. |
| **`settings`** | `SettingsView.tsx` | Profile, park defaults, notification preferences, and telemetry/security views; delivery channels remain provider-dependent. |

---

## 3. Authentication & Guest Browsing Engine

The web app supports guest access and email account registration/login. Account trips require an authenticated session and are isolated by user ID. Google OAuth is optional and remains unavailable until provider credentials and callback configuration are supplied. WhatsApp/SMS delivery is not configured.

```text
                                  ┌───────────────────────────┐
                                  │      AuthModal Shell      │
                                  │ [Sign In] [Sign Up] [Guest]│
                                  └─────────────┬─────────────┘
                                                │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  │                              │                              │
                  ▼                              ▼                              ▼
      ┌───────────────────────┐      ┌───────────────────────┐      ┌───────────────────────┐
      │      SignInTab        │      │       SignUpTab       │      │       GuestTab        │
      │  (Email / Password)   │      │  (Email / Password)   │      │ (Local Guest State)   │
      ├───────────────────────┤      ├───────────────────────┤      ├───────────────────────┤
      │ • Session cookie      │      │ • Account creation    │      │ • Catalog browsing    │
      │ • Optional Google OAuth│     │ • Password validation │      │ • Provisional estimates│
      │ • No reset endpoint   │      │ • Terms acknowledgement│     │ • Account upgrade     │
      │                       │      │                       │      │                       │
      │                       │      │                       │      │                       │
      └───────────────────────┘      └───────────────────────┘      └───────────────────────┘
```

---

## 4. Account & App Settings Engine

`apps/web/src/features/settings/SettingsView.tsx` provides a 4-tab profile, preferences, notifications, and security dashboard:

1. **Profile Tab (`ProfileSettingsTab.tsx`)**: Full name, username, bio, avatar, and phone number.
2. **Park Defaults Tab**: Preferred home park, default group makeup, travel mode (Car / Bike / Metro / Bus).
3. **Notifications Tab (`NotificationSettingsTab.tsx`)**: Account/in-app notification preferences. WhatsApp, SMS, and recurring alerts are unavailable until delivery providers are configured.
4. **Telemetry & Security Tab (`TelemetrySecurityTab.tsx`)**: GPS geofencing permissions, DPDP compliance toggle, offline caching.

---

## 5. Core Intelligence Hub & Calculation Algorithms

### 1. Implemented Visit Score

The implementation is in `apps/api/app/services/optimization/visit_scoring.py`. It combines normalized time-saving, money-saving, and weather-fit values using these weights:

| Priority | Time | Money | Weather |
| :--- | ---: | ---: | ---: |
| Cheapest | 0.15 | 0.70 | 0.15 |
| Least Crowded | 0.70 | 0.15 | 0.15 |
| Best Balanced | 0.34 | 0.33 | 0.33 |
| Maximum Rides | 0.60 | 0.20 | 0.20 |

Inputs for time and money are clamped to 0–1. Known weather fit values are Sunny 1.0, Cloudy 0.8, Light Rain 0.4, Heavy Rain 0.1. If weather is unavailable, its weight is excluded and the other two weights are renormalized. The result is a planning score, not a validated visit-quality prediction; available ticket prices and operating data still lack field-level provenance.

### 2. Crowd and Wait Estimates

`apps/api/app/services/intelligence_hub.py` uses a rule baseline: 25 points, +40 for weekends, +35 for a confirmed public holiday, and −30 for a heavy-rain forecast, clamped to 10–100. It may blend same-date, location-proximity-checked user reports at 60% baseline / 40% reported crowd category. The mapped “top ride wait” is `int(crowd_points * 0.9)` minutes when no measured report is used.

These values are returned as `ESTIMATED` / `ESTIMATED_RULE_BASED`, with low confidence. They are not live queues, are not accuracy-validated, and should not be used as an operational forecast. Proximity checking uses user-submitted coordinates and does not verify identity.

### 3. FastTrack ROI

The recommendation endpoint returns `UNAVAILABLE` for FastTrack ROI because the repository has no verified regular-versus-express queue observations for the visitor’s planned rides. The standalone calculator has threshold logic, but the current recommendation path deliberately does not turn unobserved queue assumptions into a buy/skip verdict. No time-saved or cost-per-hour claim is currently supported.

---

## 6. Park Catalog and Provenance

`data/parks_database/unified_parks_catalog.json` currently declares three parks: `wonderla-chennai`, `mgm-dizzee-chennai`, and `black-thunder-coimbatore`. Its catalog-level `updated_at` is not evidence that every field was checked. The JSON contains no field-level source URL, retrieval time, verification state, or confidence record.

The API therefore returns catalog provenance as `UNAVAILABLE` / `UNVERIFIED`; an official homepage URL is not treated as proof for every price, ride, coordinate, or operating hour. Existing catalog values must be confirmed with each park before production use. Do not call this file “verified ground truth” until field-level provenance and current primary-source checks are recorded.

---

## 7. API Route & Spring Boot Endpoint Registry

| HTTP Method | Route Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | API process health and selected cache backend; not provider-wide health. |
| `GET` | `/api/v1/health/integrations` | Observed provider status; configured credentials alone are not reported as healthy. |
| `GET` | `/` | Spring Boot actuator root / API metadata. |
| `GET` | `/quick-demo` | Runner-owned demo page, if enabled; not a routed endpoint. |
| `GET` | `/docs` | Interactive OpenAPI Swagger UI documentation. |
| `GET` | `/api/v1/parks` | Local catalog summary; provenance remains unverified without field-level records. |
| `GET` | `/api/v1/parks/all` | Park intelligence overview; crowd values may be unavailable or estimated. |
| `GET` | `/api/v1/parks/{park_id}/intelligence` | Per-park weather and crowd state. |
| `GET` | `/api/v1/parks/{park_id}` | Detailed local catalog entry. |
| `GET` | `/api/v1/parks/{park_id}/rides` | Catalog ride list. |
| `GET` | `/api/v1/parks/{park_id}/tariff` | Catalog pricing and dress-code data; current validity is not guaranteed. |
| `POST` | `/api/v1/recommendation/recommend` | Multi-date rule-based recommendation with provisional crowd/wait estimates. |
| `POST` | `/api/v1/itinerary/generate` | Current schedule template; not a live operating-status feed. |
| `GET` | `/api/v1/telemetry/weather` | Date-specific weather, UV, and solar results with unavailable states. |
| `GET` | `/api/v1/telemetry/commute` | OSRM estimated road distance/duration; not live traffic. |
| `POST` | `/api/v1/telemetry/trigger-alert` | Broadcasts an app-generated WebSocket alert, not SMS or WhatsApp. |
| `POST` | `/api/v1/feedback/report` | Persists a user report; proximity checking does not verify identity. |
| `POST` | `/api/v1/chat/ask` | Bounded advisor endpoint; response marks rule-based fallback when Gemini is unavailable. |
| `GET/POST/DELETE` | `/api/v1/trips` | Authenticated, account-owned trips. |
| `GET/POST` | `/api/v1/auth/*` | Email auth and optional Google OAuth. |
| `WS` | `/api/v1/telemetry/ws`, `/ws` | WebSocket telemetry endpoints. |

---

## 8. Monorepo Configuration & Tooling Standards

The active frontend is `apps/web`. The root `package.json` currently identifies a separate/stale React example and does not provide the QueueCut app scripts listed in older versions of this manual.

### Verified Local Commands

```powershell
# Start Java Spring Boot backend (port 8000):
Set-Location apps\api
.mvn\dist\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run

# Frontend-only development (port 5173):
Set-Location apps\web
npm run dev

# Frontend typecheck and production PWA build:
npm run build

# Backend tests from the apps\api directory:
.mvn\dist\apache-maven-3.9.9\bin\mvn.cmd clean test
```

The Java backend serves the REST API and WebSocket endpoints on port 8000. The Vite dev server on port 5173 proxies `/api` requests to the backend automatically.

### TypeScript Monorepo Architecture

- [tsconfig.json](file:///j:/QUEUE%20CUT/tsconfig.json) at the workspace root references `./apps/web`, enabling project-wide symbol resolution.
- [apps/web/tsconfig.json](file:///j:/QUEUE%20CUT/apps/web/tsconfig.json) provides ES2022 bundling rules with `bundler` module resolution and strict typechecking.

### Java Static Analysis

- [apps/api/pom.xml](file:///j:/QUEUE%20CUT/apps/api/pom.xml) configures the Spring Boot 3.x dependency tree, Maven Surefire for JUnit 5 tests, and the Spring Boot Maven Plugin for executable JAR packaging.

---

## 9. VS Code Enterprise Developer Suite

The repository includes a ready-to-use [.vscode](file:///j:/QUEUE%20CUT/.vscode) environment configured for zero-friction development:

1. **Workspace Settings ([.vscode/settings.json](file:///j:/QUEUE%20CUT/.vscode/settings.json))**:
   - TypeScript workspace SDK linked to `apps/web/node_modules/typescript/lib`.
   - Tailwind CSS language associations and suggestions.
   - Java source roots registered for the Spring Boot backend.

2. **One-Click Debugging ([.vscode/launch.json](file:///j:/QUEUE%20CUT/.vscode/launch.json))**:
   - `QueueCut: Spring Boot Backend` — Press **F5** to attach the debugger to the running Maven process.
   - `QueueCut: Backend Unit Tests` — Run and debug JUnit tests with breakpoints.

3. **Integrated Tasks ([.vscode/tasks.json](file:///j:/QUEUE%20CUT/.vscode/tasks.json))**:
   - Accessible tasks for `Web: Dev Server`, `Web: Build Production PWA`, `API: Run Spring Boot`, and `API: Run Backend Unit Tests`.

4. **Extension Recommendations ([.vscode/extensions.json](file:///j:/QUEUE%20CUT/.vscode/extensions.json))**:
   - Recommends Extension Pack for Java, Spring Boot Extension Pack, Tailwind CSS, Prettier, and ESLint.

---

## 10. Local Development Server

The backend is a Spring Boot application running via Maven on port 8000. The frontend Vite dev server runs on port 5173 and proxies `/api` to the backend. Neither runner validates production secrets, host configuration, or deployment health.

```powershell
# Start backend (port 8000) - run from apps\api:
.mvn\dist\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run

# Start frontend dev server (port 5173) - run from apps\web:
npm run dev

# Build an executable JAR for deployment:
.mvn\dist\apache-maven-3.9.9\bin\mvn.cmd clean package -DskipTests
java -jar target\queuecut-api-*.jar
```

The Spring Boot application exposes REST routes under `/api/v1`, WebSockets, `/health`, and the Actuator endpoint. The in-memory cache is process-local and not shared across instances. A local health result is not a production deployment check.

---

## 11. Continuous Integration & Deployment Pipelines

### 1. Continuous Integration ([.github/workflows/ci.yml](file:///j:/QUEUE%20CUT/.github/workflows/ci.yml))

Triggered on every push to `main` and pull request:

- **Backend Job**: Sets up JDK 21, runs `mvn clean test` against the Spring Boot application, and verifies the JUnit 5 suite passes.
- **Frontend Job**: Sets up Node 20, installs dependencies with `npm ci`, and executes `npm run build` (tsc + vite build).

### 2. Automated Dependency Updates ([.github/dependabot.yml](file:///j:/QUEUE%20CUT/.github/dependabot.yml))

- Scans `/apps/web` (npm) and `/apps/api` (Maven) weekly.
- Scans GitHub Actions workflows monthly.

### 3. Production Deployment ([.github/workflows/deploy.yml](file:///j:/QUEUE%20CUT/.github/workflows/deploy.yml))

- The frontend deployment uses **Vercel**; its `VITE_API_BASE_URL` and public Mapbox token must be configured in the Vercel project.
- The backend deployment uses a **Render deploy hook** when configured. The workflow skips backend deployment and health probing if required secrets are absent; workflow presence is not deployment evidence.
- For split Vercel/Render origins, configure exact `CORS_ORIGINS`, `AUTH_COOKIE_SAMESITE=none`, `AUTH_COOKIE_SECURE=true`, production database storage, Google OAuth callback, and any optional provider secrets in the host secret/config stores.

---

## 12. Codebase Audit & Refactoring Summary

This audit changed inaccurate provider fallbacks, report storage, cache reporting, recommendation confidence, and auth/config behavior. It did not verify every park fact or certify a production deployment.

Verified during this audit:

- Frontend production typecheck/build succeeds.
- Backend JUnit 5 suite succeeds (`mvn clean test` passes).
- Secret scan reported no likely real credentials in scanned repository files; root `.env` is absent and untracked.
- Guest/account trip ownership has a two-account regression test.

Still not verified: production URLs/secrets, external-provider availability at deployment time, Google OAuth credentials/callback, production database durability, field-level park provenance, calibrated crowd accuracy, real queue data, and live FastTrack ROI.

---

## 13. Automated Verification & Developer Runbooks

### 1. Backend tests

```powershell
Set-Location apps\api
.mvn\dist\apache-maven-3.9.9\bin\mvn.cmd clean test
```

Runs the full JUnit 5 suite via Maven Surefire. This is local test evidence, not an external-provider or deployment smoke test.

### 2. Frontend production build

```powershell
Set-Location apps\web
npm run build
```

This runs TypeScript checking and the Vite PWA build. The latest local build succeeded. Asset hashes and bundle sizes vary between builds and are not copied into this manual.

### 3. Park catalog compiler

The park catalog JSON lives in `data/parks_database/`. To recompile or extend it, edit the source JSON files directly. Successful JSON parsing does not independently verify the factual accuracy of catalog entries. Inspect any changes before accepting regenerated catalog data.

### 4. Release status

Current status: **LOCALLY VERIFIED, NOT DEPLOYMENT VERIFIED**. Do not label QueueCut production-ready until production API URLs, CORS, secure cookie settings, durable database storage, OAuth credentials, provider availability, and deployment smoke tests have all been verified.
