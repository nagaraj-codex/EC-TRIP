# 🎢 QueueCut: Comprehensive System Architecture, Navigation & Operation Manual

**Version**: 2.0.0 (Production Refactored)  
**Last Updated**: September 6, 2026  
**Auditor**: Principal Codebase Auditor & Senior Systems Refactoring Specialist  
**Workspace**: `j:\QUEUE CUT`  

---

## 📑 Table of Contents
1. [Executive Summary & Technology Stack](#1-executive-summary--technology-stack)
2. [Complete Application Navigation & Screen Architecture](#2-complete-application-navigation--screen-architecture)
3. [Authentication & Guest Browsing Engine](#3-authentication--guest-browsing-engine)
4. [Account & App Settings Engine](#4-account--app-settings-engine)
5. [Core Intelligence Hub & Calculation Algorithms](#5-core-intelligence-hub--calculation-algorithms)
6. [Verified 2026 Ground-Truth Parks Catalog](#6-verified-2026-ground-truth-parks-catalog)
7. [API Route & Pydantic v2 Schema Registry](#7-api-route--pydantic-v2-schema-registry)
8. [Codebase Audit & Refactoring Summary](#8-codebase-audit--refactoring-summary)
9. [Automated Verification & Developer Runbooks](#9-automated-verification--developer-runbooks)

---

## 1. Executive Summary & Technology Stack

QueueCut is a high-performance theme park intelligence platform delivering **crowd forecasting, dynamic pricing optimization, FastTrack return-on-investment (ROI) calculations, and automated itineraries** for premier Indian attractions (including Wonderla Chennai, MGM Dizzee World, and Black Thunder Coimbatore).

### Technology Stack Overview
- **Frontend Layer (`apps/web`)**: React 18, TypeScript 5, Vite 5, TailwindCSS 3, Zustand 4 (persisted state slices), Lucide React, Mapbox GL.
- **Backend Layer (`apps/api`)**: FastAPI, Python 3.14, Pydantic v2, HTTPX (async non-blocking client), Uvicorn, SQLAlchemy.
- **Machine Learning & Analytics (`ml`)**: Scikit-Learn (Decision Tree Classifier with 300-row invariant check), Pandas, NumPy, StandardScaler.
- **Data & Intelligence (`data`)**: Ground-truth JSON catalogs, Open-Meteo Weather API, Air Quality & Solar UV Index, Sunrise-Sunset civil twilight API, Nager.Date Public Holidays API, OSRM road routing engine.

---

## 2. Complete Application Navigation & Screen Architecture

QueueCut uses a single-page view router driven by Zustand state (`plannerStore.ts`), enabling seamless transitions between planning funnels and analytical views without page reloads.

```
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
     │ (4-Step Funnel)  │                  │ (Ground-Truth DB)│                  │ (Heatmap Matrix) │
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
               │ (AI Visit Score) │                  │ (Hourly Planner) │                  │ (Offline History)│
               └──────────────────┘                  └──────────────────┘                  └──────────────────┘
                         │                                     │                                     │
                         └─────────────────────────────────────┼─────────────────────────────────────┘
                                                               │
                              ┌────────────────────────────────┴─────────────────────────────┐
                              │                    Global Modals & Drawers                   │
                              │  • AuthModal (Sign In / Sign Up / Guest)                     │
                              │  • AdvisorDrawer (AI Theme Park Chatbot)                     │
                              │  • CrowdReportModal (Live Geofenced Observation)             │
                              │  • NotificationToasts (Realtime Weather & Price Drops)       │
                              │  • SettingsView (Profile, Alerts, Telemetry & Security)      │
                              └──────────────────────────────────────────────────────────────┘
```

### The 7 Primary Screens

| Screen Identifier | Primary Component | Purpose & Features |
|:---|:---|:---|
| **`landing`** | `LandingScreen.tsx` | 4-step wizard: Park selection, date interval selection, group demographics, and budget priorities. |
| **`results`** | `RecommendationScreen.tsx` | AI Visit Score breakdown (0–100), price vs crowd trade-offs, FastTrack ROI verdicts, and top candidate dates. |
| **`calendar`** | `CrowdCalendarView.tsx` | 30-day crowd intensity calendar matrix with color-coded wait times and weekend/holiday badges. |
| **`parks`** | `ParksView.tsx` | Directory of verified theme parks with 2026 pricing, ride breakdowns, height rules, and dress codes. |
| **`itinerary`** | `ItineraryScreen.tsx` | Dynamic timeline scheduling thriller rides, midday water ride shifts (UV protection), and email PDF dispatch. |
| **`trips`** | `SavedTripsView.tsx` | Local persistence of candidate visit plans, quick reload, and travel history export. |
| **`settings`** | `SettingsView.tsx` | 4-tab dashboard: Profile & Bio, Park Defaults, Notification Toggles, and Telemetry/Security. |

---

## 3. Authentication & Guest Browsing Engine

QueueCut implements a **3-Face Modular Authentication Pattern** inside `apps/web/src/features/auth/AuthModal.tsx`. It provides unrestricted guest browsing while guarding write actions (saving trips, WhatsApp alerts) via `useActionGuard.ts`.

```
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
     │  (Instagram UI Model) │      │  (Facebook UI Model)  │      │ (Zero-Obligation Pass)│
     ├───────────────────────┤      ├───────────────────────┤      ├───────────────────────┤
     │ • Mobile / Username / │      │ • First & Last Name   │      │ • Instant Access      │
     │   Email input         │      │ • DOB Day/Month/Year  │      │ • Unlocked Pricing    │
     │ • Password Show/Hide  │      │ • Gender dropdown     │      │ • Live Weather & UV   │
     │ • Forgot Password Flow│      │ • Mobile / Email      │      │ • FastTrack ROI Calc  │
     │ • 1-Click Google Auth │      │ • Password & Terms    │      │ • 1-Click Upgrade     │
     └───────────────────────┘      └───────────────────────┘      └───────────────────────┘
```

### 1. Face 1: Sign In (`SignInTab.tsx`)
- **Instagram-Style Clean Login**:
  - Single input field for Mobile Number, Username, or Email.
  - Password input with toggleable show/hide eyeball icon.
  - Primary blue submission button with active tactile feedback.
- **Forgot Password Recovery Sub-Flow**:
  - Clicking "Forgot password?" activates an in-modal recovery form.
  - Validates email and displays a green confirmation badge upon dispatch.
- **1-Click Google OAuth**:
  - Instant login with pre-configured avatar, profile data, and cloud synchronization.

### 2. Face 2: Sign Up (`SignUpTab.tsx`)
- **Facebook-Style Detailed Registration**:
  - **Full Name**: 2-column layout for First Name and Surname.
  - **Date of Birth**: 3-column dropdowns (Days 1–31, Months Jan–Dec, Years 1954–2018).
  - **Gender**: Female, Male, Custom selection.
  - **Contact & Password**: Mobile number or email address with strict 6+ character password validation.
  - **Legal Compliance Block**: Explicitly formatted Privacy Policy, Terms of Service, and Cookies Policy agreement.

### 3. Face 3: Instant Guest Access (`GuestTab.tsx`)
- **Zero Obligation Browsing**:
  - Closes the modal immediately and enables `isGuest: true` in `authStore.ts`.
  - Grants unrestricted access to all 2026 pricing baselines, Open-Meteo forecasts, crowd heatmaps, and ride lists.
  - Prompts login only when attempting to save trips or configure WhatsApp push alerts via `useActionGuard.ts`.

---

## 4. Account & App Settings Engine

The settings engine in `apps/web/src/features/settings/SettingsView.tsx` is organized into 4 specialized tabs:

### Tab 1: Profile & Bio (`ProfileSettingsTab.tsx`)
- **Dynamic Avatar**: Fetches Google avatar or dynamically generates high-contrast UI avatars from `ui-avatars.com`.
- **User Metadata**: Full Name, Email Address, Phone Number (for WhatsApp alerts), and Home City (for OSRM driving distance and fuel cost computation).
- **Persistence**: Flashes an alert banner upon successful profile update in the Zustand store.

### Tab 2: Park Preferences
- **Default Theme Park Selector**: Set default attraction (`wonderla-chennai`, `mgm-dizzee-chennai`, `black-thunder-coimbatore`).
- **Currency & Units**: Displays active currency (`₹ INR`) and temperature scale (`Celsius °C`).
- **Baseline Version**: Locks calculations to official **2026 Verified Tariff Rates**.

### Tab 3: Notification Alerts (`NotificationSettingsTab.tsx`)
- **Email Itinerary Delivery**: Toggle automated PDF and timeline email delivery via Resend API.
- **WhatsApp Crowd Surge Alerts**: Instant push alert if top-tier ride wait times exceed 35 minutes.
- **Open-Meteo Rain Flash Advisory**: Precipitation alert dispatched 2 hours before sudden weather changes.
- **Discounts & College Offers**: Price drop alerts for student IDs, BOGO offers, and weekday passes.

### Tab 4: Privacy & Security (`TelemetrySecurityTab.tsx`)
- **Export Personal Travel History**: Downloads a clean, timestamped `queuecut_telemetry_{timestamp}.json` file containing all preferences, search history, and saved trips.
- **Delete Account & Reset Telemetry**: Purges profile, resets Zustand storage, and reverts user to guest mode with immediate UI teardown.

---

## 5. Core Intelligence Hub & Calculation Algorithms

All crowd predictions, price optimizations, and FastTrack ROI recommendations are calculated across `apps/api/app/services/intelligence_hub.py`, `visit_scoring.py`, and `roi_calculator.py`.

### 1. Concurrent Multi-Signal Fetching with In-Memory TTL Caching
When candidate dates are evaluated, `evaluate_candidate_date` queries in-memory TTL cached endpoints (1-hour expiry) to prevent third-party rate limit exhaustion:
```python
weather_res, uv_res, sun_res, holiday_res = await asyncio.gather(
    fetch_open_meteo_weather(lat, lon, date_str),
    fetch_solar_uv(lat, lon),
    fetch_sunrise_sunset(lat, lon),
    check_nager_holiday(year, date_str),
    return_exceptions=True
)
```

### 2. Multi-Judge Crowd Intensity & Active Feedback Calibration
- **Judge 1 (Calendar & Baseline)**: Base weekday (25 pts), weekend surge (+40 pts), public holiday (+35 pts).
- **Judge 2 (Environmental)**: Heavy rain damping (-30 pts).
- **Judge 3 (Active Crowdsourced Ground Truth)**: Verified on-site reports blend 40% ground truth into the 60% rule forecast, upgrading prediction confidence to **High** with transparent audit reasoning.
```python
recent_reports = get_recent_observations(park_id, actual_date_str)
if recent_reports:
    # 60% rules + 40% ground truth
    crowd_points = int(0.6 * crowd_points + 0.4 * avg_obs)
    confidence = "High"
    reasoning = f"Calibrated with on-site verified ground-truth crowd reports ({len(recent_reports)} report(s)) and Open-Meteo weather."
```

### 3. Visit Score Formula (0 to 100)
- **Best Balanced**: $0.45 \times \text{TimeSaving} + 0.35 \times \text{MoneySaving} + 0.20 \times \text{WeatherFactor}$
- **Lowest Crowds**: $0.70 \times \text{TimeSaving} + 0.15 \times \text{MoneySaving} + 0.15 \times \text{WeatherFactor}$
- **Budget Priority**: $0.15 \times \text{TimeSaving} + 0.70 \times \text{MoneySaving} + 0.15 \times \text{WeatherFactor}$

### 4. FastTrack ROI Formula
$$\text{Cost Per Minute Saved} = \frac{\text{FastTrack Price}}{\max(1, \text{Total Saved Wait Minutes})}$$
- If $\text{Cost Per Minute} \le ₹12.00$ and $\text{Wait} > 40\text{m}$ $\rightarrow$ **"Strong Buy"**
- If $₹12.00 < \text{Cost Per Minute} \le ₹25.00$ $\rightarrow$ **"Situational"**
- If $\text{Cost Per Minute} > ₹25.00$ or $\text{Wait} \le 20\text{m}$ $\rightarrow$ **"Skip (Low Value)"**

---

## 6. Verified 2026 Ground-Truth Parks Catalog

Ground-truth data is maintained in `data/parks_database/unified_parks_catalog.json` and synchronized with `apps/web/public/data/parks.json`:

### 1. Wonderla Amusement Park (Chennai)
- **Address**: 45/1F, OMR Road, Thiruporur Post, Chengalpattu, Tamil Nadu - 603110
- **Coordinates**: `12.74203 N, 80.17178 E`
- **Pricing**: Weekday: ₹1,312 | Weekend: ₹1,549 | FastTrack: ₹999 add-on
- **Signature Rides**: Recoil (Reverse Loop Coaster), Maverick, Equinox, Wave Pool, Wonder Splash, Hurricane.
- **Dress Code**: 100% Synthetic / Lycra / Nylon mandatory on water rides. Cotton/denim strictly prohibited.

### 2. MGM Dizzee World (Chennai)
- **Address**: 1/74, East Coast Road (ECR), Muttukadu, Chennai, Tamil Nadu - 603112
- **Coordinates**: `12.82420 N, 80.24350 E`
- **Pricing**: Weekday: ₹699 | Weekend: ₹849 | FastTrack: ₹400 add-on
- **Signature Rides**: Roller Coaster, Karnakasi, Revolution, Big Wheel, Water Slides, Caribbean Wave.

### 3. Black Thunder Water Theme Park (Coimbatore)
- **Address**: Nagapattinam-Gudalur-Solapur Highway, Mettupalayam, Coimbatore, Tamil Nadu - 641305
- **Coordinates**: `11.30050 N, 76.93880 E`
- **Pricing**: Weekday: ₹1,090 | Weekend: ₹1,090 | FastTrack: ₹500 add-on
- **Signature Rides**: Mega Wave Pool, Wild River Ride, Speed Slide, Zipline Coaster, Tandem Wire Bicycle.

---

## 7. API Route & Pydantic v2 Schema Registry

### Core Endpoints

| HTTP Method | Route Path | Description |
|:---|:---|:---|
| `GET` | `/health` | Service health status and version metadata. |
| `GET` | `/` | API root welcome notice. |
| `GET` | `/api/v1/parks` | Full catalog summary of all parks. |
| `GET` | `/api/v1/parks/{park_id}` | Exhaustive ground-truth details for a park. |
| `GET` | `/api/v1/parks/{park_id}/rides` | All ride and attraction lists for a park. |
| `GET` | `/api/v1/parks/{park_id}/tariff` | Ticket rates, fastrack surcharge, and dress code. |
| `POST` | `/api/v1/recommendation/recommend` | Multi-date optimization engine generating visit scores. |
| `POST` | `/api/v1/feedback/report` | Crowdsourced observation submission with geofence check. |
| `POST` | `/api/v1/chat/ask` | AI Advisor chatbot powered by Gemini Flash integration. |

---

## 8. Codebase Audit & Refactoring Summary

### 1. Monolith Decomposition
- `AuthModal.tsx` (**606 lines**) $\rightarrow$ Split into `SignInTab.tsx`, `SignUpTab.tsx`, `GuestTab.tsx`, and shell.
- `SettingsView.tsx` (**374 lines**) $\rightarrow$ Split into `ProfileSettingsTab.tsx`, `NotificationSettingsTab.tsx`, `TelemetrySecurityTab.tsx`, and shell.
- `compile_parks_database.py` (**606 lines**) $\rightarrow$ Refactored into a 52-line dynamic catalog compiler (**-91.4% code reduction**).

### 2. Purged Dead Files (>3,350 lines eliminated)
- `build_phase5_frontend.py` (1,036 lines) — deleted.
- `build_phase5_wizard.py` (803 lines) — deleted.
- `build_phase4_hub.py` (265 lines) — deleted.
- `build_phase6.py` (216 lines) — deleted.
- `build_entire_project.py` (340 lines) — deleted.
- `setup_workspace.ps1` (root duplicate) — deleted.
- `apps/web/src/features/auth/AuthScreens.tsx` (360 lines) — deleted.
- `apps/web/src/features/results/ResultsPanel.tsx` (60 lines) — deleted.
- `apps/web/src/features/settings/SettingsScreen.tsx` (64 lines) — deleted.
- `apps/api/main.py` (0-byte empty file) — deleted.
- `apps/api/app/services/integrations/services_suite.py` (59 lines) — deleted.
- `apps/api/app/db/models/observations.py` (38 lines) — deleted.

---

## 9. Automated Verification & Developer Runbooks

### 1. Run Backend Unit Tests
```bash
python apps/api/tests/unit/test_api.py
```
*Expected Output:*
```
Ran 8 tests in 1.083s
OK (All 8 tests passing: health, root, parks list, single park, 404 handler, feedback, chat, recommendation)
```

### 2. Run Frontend Build & Typecheck
```bash
cmd /c "cd apps\web && npm run build"
```
*Expected Output:*
```
✓ 1888 modules transformed.
dist/index.html                   0.78 kB │ gzip:  0.48 kB
dist/assets/index-D7lcmJ3J.css   46.52 kB │ gzip:  7.72 kB
dist/assets/index-Day4Y40h.js   264.04 kB │ gzip: 74.03 kB
✓ built in 1.60s (0 errors)
```

### 3. Re-compile Ground-Truth Parks Catalog
```bash
python scripts/compile_parks_database.py
```
*Expected Output:*
```
  [LOADED] wonderla_chennai.json
  [LOADED] mgm_dizzee_chennai.json
  [LOADED] black_thunder_coimbatore.json
  [SAVED] data/parks_database/unified_parks_catalog.json
  [SYNCED] apps/web/public/data/parks.json
>>> COMPILED ALL GROUND-TRUTH PARKS SUCCESSFULLY <<<
```
