# QueueCut Frontend UX/UI Rebuild — Implementation Plan

## Codebase findings summary

**Stack:** React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + Framer Motion + Zustand + React Router DOM 6.
**State management:** Zustand with persist middleware. Three stores: `authStore` (user, session, trips, notifications), `uiStore` (splash/onboarding seen flags, theme), `plannerStore` (wizard flow state).
**Data fetching:** Plain `fetch` wrapped in `apiClient.ts` — no React Query or SWR. Credentials sent as cookies (`credentials: "include"`).
**Auth:** Session cookie (`queuecut_session`) set by FastAPI backend, httponly. Google OAuth fully implemented. Email register/login via `/api/v1/auth/register` and `/api/v1/auth/login`.
**Router:** React Router v6 nested routes. `/` → Splash → `/onboarding` → `/login` → `/app/*` (guarded by `AppGuard`).
**Build/lint/type-check commands:** `tsc && vite build` (from `package.json`). No vitest config found — no test runner present. Build verify: `cd "j:\QUEUE CUT\apps\web" && npx tsc --noEmit && npx vite build`.

**Current design problems (confirmed by reading the code):**
1. `globals.css` sets `body { @apply bg-slate-950 text-slate-100 }` — deep dark background everywhere.
2. `qc-page` class: `max-w-lg mx-auto px-4` — hard-codes a ~512px max-width, leaving huge empty gutters on desktop.
3. `AppShell.tsx` uses `bg-slate-950` with no desktop sidebar or multi-column layout.
4. `tailwind.config.js` has `brand.*` as indigo/violet, `qc.teal.*` as primary brand color. The new design direction is blue (#2563EB) — we add `qc.blue.*` tokens without removing teal (existing components use it).
5. `authStore.ts` has hardcoded fake user objects inside `loginWithGoogle` / `loginWithFacebook` — these must be replaced with real API calls.
6. `DestinationDetailPage.tsx` has hardcoded `intelligenceData` with fake per-park reasoning — must be driven from real API recommendation endpoint.
7. `HomePage.tsx` and `ExplorePage.tsx` hardcode `PEACE_SCORES` and `HERO_IMAGES` dicts — PEACE_SCORES are fake; we keep HERO_IMAGES (generic Unsplash URLs, not park-specific claims) but remove fake scores.
8. `plannerStore.ts` wizard currently embedded inside `HomePage` (LandingScreen/Step1-4) — must be surfaced as a proper "Plan My Visit" page at `/app/plan`.
9. `SplashPage.tsx` and `OnboardingPage.tsx` are dark-theme only — need image-forward white+blue treatment.
10. Onboarding slides use icons, not images — the rebuild uses Unsplash generic park images.
11. `LoginPage.tsx` uses a single page with animated state switches — this is acceptable and we keep the pattern but apply the new light aesthetic.

---

## Implementation Plan

- [ ] 1. **Extend Tailwind config with blue-first design tokens** (`tailwind.config.js`)

  Add `qc.blue` palette (`#EFF6FF` → `#1D4ED8`), update `surface` to include white/light-blue surface values, add `qc-gradient-blue` background image utility, update PWA manifest `theme_color` to `#2563EB` in `vite.config.ts`.
  
  Files: `apps/web/tailwind.config.js`, `apps/web/vite.config.ts`
  
  Verify: `cd "j:\QUEUE CUT\apps\web" && npx tsc --noEmit` — zero errors.

- [ ] 2. **Rebuild design tokens in globals.css** (`src/styles/globals.css`)

  Replace `body { @apply bg-slate-950 }` with `bg-white text-qc-navy`. Add new CSS custom properties: `--qc-primary: #2563EB`, `--qc-primary-dark: #1D4ED8`, `--qc-bg-light: #EFF6FF`, `--qc-navy: #0F172A`, `--qc-text-secondary: #64748B`, `--qc-border: #E2E8F0`. Rewrite component layer: `.qc-page` becomes `flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-2` (removes the `max-w-lg` bottleneck). Add `.btn-blue-primary` (solid blue), `.btn-blue-secondary` (outlined), `.qc-card-white` (white bg, border, shadow). Keep existing dark variants (`.qc-card`, `.btn-primary` etc.) intact — dark theme pages still use them for the existing auth/planner modals. Add skeleton that works on white backgrounds. Add `--bottom-nav-height` and `--top-bar-height` tokens.
  
  Files: `apps/web/src/styles/globals.css`, `apps/web/src/styles/index.css`
  
  Verify: `cd "j:\QUEUE CUT\apps\web" && npx tsc --noEmit` — zero errors.

- [ ] 3. **Rebuild SplashPage** (`src/pages/SplashPage.tsx`)

  White background, large QueueCut logo mark in blue (#2563EB), brand name in navy, short framer-motion scale+fade animation, blue-gradient pulse ring, tagline "Know Before You Go." in `#64748B`. Navigation logic unchanged (reads `hasSeenOnboarding`, routes to `/onboarding` or `/app/home`).
  
  Files: `apps/web/src/pages/SplashPage.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 4. **Rebuild OnboardingPage** (`src/pages/OnboardingPage.tsx`)

  3 slides with full-bleed Unsplash generic amusement-park background images (slide 1: `photo-1516450360452`, slide 2: `photo-1513889961551`, slide 3: `photo-1583086074738`). White overlay gradient at bottom. Large white heading per slide, white body copy. Progress dots in white/transparent. "Skip" button top-right in white/semitransparent. Blue "Get Started" / "Next" CTA on final/intermediate slides. No fake data. Titles: "Discover Better Days", "Avoid Long Queues", "Plan Your Perfect Visit". Navigation unchanged.
  
  Files: `apps/web/src/pages/OnboardingPage.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 5. **Rebuild LoginPage** (`src/pages/LoginPage.tsx`)

  White background with subtle blue gradient at top. Logo mark centered at top. Three distinct sub-views (`choice`, `signin`, `signup`, `guest`) with clean separation. Choice screen: Google button (white/shadow), Sign In button (blue outlined), Create Account button (blue solid), Guest link below divider. Each form (`signin`, `signup`) gets its own full-screen white card layout with blue focus rings, proper validation, real API wiring (already implemented — keep). Guest view: brief copy + "Continue as Guest" button. Remove hardcoded fake Google/Facebook user creation from `authStore.loginWithGoogle` — replace with the real API redirect flow (`window.location.assign("/api/v1/auth/google/login")`). `loginWithFacebook` can be removed (backend has no Facebook OAuth — the button was cosmetic). Error states in red below form fields. Loading spinner on submit. No fake user data.
  
  Files: `apps/web/src/pages/LoginPage.tsx`, `apps/web/src/store/slices/authStore.ts`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 6. **Rebuild AppShell** (`src/layouts/AppShell.tsx`)

  Desktop: white top navigation bar (sticky, white bg, blue logo, nav links as text tabs for Home / Explore / Trips / Profile on `md:` breakpoint and up, notification bell right). Mobile: keeps current bottom nav (4 tabs) but with white/light-blue styling. Main content area: `flex-1 overflow-y-auto`. The global page container class `qc-page` now uses `max-w-7xl` (changed in step 2) so content fills the screen on wide viewports. The sidebar pattern used on desktop (`md:flex-row` layout) allows a persistent side column when viewport ≥ 1024px. Add desktop sidebar (`lg:w-64`) with nav items as vertical list. The `isDetailPage` bottom-nav hide logic is preserved.
  
  Files: `apps/web/src/layouts/AppShell.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 7. **Rebuild HomePage** (`src/pages/HomePage.tsx`)

  White background. Hero section: full-width banner with blue gradient (`from-blue-600 to-blue-800`) and a generic park silhouette image. "Plan your next visit" as large white heading. "Plan a Visit" blue CTA button → `/app/plan`. Search bar below hero (white, rounded, shadow). "Explore Parks" section: horizontal-scroll cards using real API data from `useExploreStore` (already loads from `/api/v1/parks`). Remove ALL hardcoded `PEACE_SCORES` dict — replace usage with generic loading skeleton until real recommendation data is fetched. Remove `HERO_IMAGES` per-park registry — use generic fallback Unsplash image for all cards (single URL, no park-specific mapping). "My Trips" section: shows real saved trips for authenticated users (from `authStore.savedTrips`, loaded from `/api/v1/trips`); shows "No trips planned yet. Plan a Visit →" empty state for guests/new users. Desktop: two-column grid layout — left column hero + search + explore, right column (sidebar at 1024px+) shows trips summary and a "Plan a Visit" quick panel.
  
  **API connections:** `GET /api/v1/parks` (via `apiClient.getParks()`) for park cards. `GET /api/v1/trips` for user trips. No fake scores.
  
  Files: `apps/web/src/pages/HomePage.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 8. **Rebuild ExplorePage** (`src/pages/ExplorePage.tsx`)

  White background. Full-width search bar at top. Filter chips (All, Near Me, Low Crowd, Top Score) — same logic, new white/blue styling. Large park cards in a responsive grid: 1 col mobile, 2 col tablet, 3 col desktop. Remove hardcoded `PEACE_SCORES` — crowd level comes from park data only if API returns it (mark as `empty state` until recommendation endpoint is called per park). Remove per-park `HERO_IMAGES` registry, use single generic fallback. `DestinationCard` list variant redesigned: white card, blue accent, real data only. Empty state: search icon + "No parks found" + Clear Filters button. Loading state: skeleton cards. Error state: "Something went wrong loading parks." + retry.
  
  **API connections:** `GET /api/v1/parks` via `apiClient.getParks()` (already wired).
  
  Files: `apps/web/src/pages/ExplorePage.tsx`, `apps/web/src/components/destination/DestinationCard.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 9. **Rebuild DestinationDetailPage** (`src/pages/DestinationDetailPage.tsx`)

  Remove ALL `intelligenceData` hardcoded dict. Remove per-park `heroImages` registry. Hero: generic Unsplash fallback image. Park name, city, operating hours, rating from real API `parkDetail` (fetched via `apiClient.getPark(parkId)`). Crowd Intelligence panel: render ONLY when a real `RecommendationResponse` is available (fetch via `apiClient.recommend()` with today + next 3 days as candidates, "Best Balanced" priority); show skeleton while loading; show "We need more information before we can recommend a visit." empty state if recommendation fails. Weather panel: only render when `apiClient.getWeather()` returns real data; show "Weather information unavailable." if it fails. Pricing: from real `apiClient.getParkTariff()` — `pricing` object; show "—" if missing. Rides section: from `apiClient.getParkRides()` — list by category; show "Ride information is being updated." empty state if empty. Add "Plan My Visit" button → `/app/plan?park=${parkId}`. Add sticky bottom bar on mobile with "Plan a Visit" CTA.
  
  **API connections:**
  - `GET /api/v1/parks/:parkId` → park name, city, hours, coordinates
  - `GET /api/v1/parks/:parkId/tariff` → pricing, dress code
  - `GET /api/v1/parks/:parkId/rides` → ride categories
  - `GET /api/v1/telemetry/weather?park_id=X&date=Y` → weather + UV
  - `POST /api/v1/recommendation/recommend` → crowd intelligence (park + candidate_dates)
  
  Files: `apps/web/src/pages/DestinationDetailPage.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 10. **Create Plan My Visit page and route** (`src/pages/PlanMyVisitPage.tsx`, `src/App.tsx`)

  New `/app/plan` route added to `App.tsx` and `AppShell` nested routes. 5-step flow using `plannerStore` (already has all wizard state). Step 1: Choose Park — loads real parks from `apiClient.getParks()`, radio/card selection, NO hardcoded park list (replace Step1Park.tsx). Step 2: Choose Dates — keep existing date range picker logic from `Step2Dates.tsx`. Step 3: Priorities — group type, priority preference (reuse Step3Group/Step4Budget logic). Step 4: Loading + result — calls `apiClient.recommend()` with real inputs, shows premium result screen. Step 5: Save — shows recommendation result with "Save Trip" CTA that calls `apiClient.saveTrip()`. Progress bar at top (1-5 indicator). Mobile: full-screen modal-style; Desktop: centered card max-width-xl. Replace `LandingScreen.tsx` usage in `HomePage` with a simple CTA button → `/app/plan`.
  
  **API connections:**
  - `GET /api/v1/parks` → park selection list
  - `POST /api/v1/recommendation/recommend` → crowd + weather + price evaluation
  - `POST /api/v1/trips` → save trip
  
  Files: `apps/web/src/pages/PlanMyVisitPage.tsx`, `apps/web/src/App.tsx`, `apps/web/src/features/wizard/Step1Park.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 11. **Create Visit Forecast page** (`src/pages/VisitForecastPage.tsx`, route `/app/forecast/:parkId`)

  Premium result screen showing the recommendation from `plannerStore.activeRecommendation` (already populated from step 10 flow). If no active recommendation, shows "Select a park and dates to see your visit forecast." empty state with "Plan a Visit" CTA. Best day card: crowd level, predicted wait, ticket price, weather condition, FastTrack verdict — all from real `RecommendationResponse` shape (already typed in `types/api.ts`). Each `DayEvaluation` card in the comparison section. "Save Trip" CTA calls `apiClient.saveTrip()`. White background, blue accent cards.
  
  **API connections:** Data from `plannerStore.activeRecommendation` (populated by recommend endpoint).
  
  Files: `apps/web/src/pages/VisitForecastPage.tsx`, `apps/web/src/App.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 12. **Create Compare Dates page** (`src/pages/CompareDatesPage.tsx`, route `/app/compare/:parkId`)

  Side-by-side comparison of `DayEvaluation[]` from `activeRecommendation.evaluations`. On mobile: vertical stacked cards. On desktop: grid. Each column shows date, crowd level badge, predicted wait, ticket price, weather icon, FastTrack verdict. Real data only — no invented winner label; highlight the `recommended_date` with a blue border. Empty state if no evaluations.
  
  **API connections:** Data from `plannerStore.activeRecommendation`.
  
  Files: `apps/web/src/pages/CompareDatesPage.tsx`, `apps/web/src/App.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 13. **Rebuild TripsPage** (`src/pages/TripsPage.tsx`)

  White background. Empty state for guests: icon + "Sign in to view your saved trips" + Sign In button (already exists — apply new styling). Empty state for authenticated users with no trips: "No trips planned yet. 📍 Plan a Visit" + blue CTA → `/app/plan`. Real trips loaded from `apiClient.getTrips()` — already wired. Trip cards: park name, date, days-away indicator, crowd level badge, ticket price. Delete button. Upcoming/Past grouping preserved. Desktop: two-column grid for trip cards.
  
  Files: `apps/web/src/pages/TripsPage.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 14. **Rebuild NotificationsPage** (`src/pages/NotificationsPage.tsx`)

  White background. Authenticated users: real notifications from `apiClient.getNotifications()` (already wired). Empty state: bell-off icon + "You're all caught up." Filter tabs preserved. Mark-all-read CTA. Skeleton loading. Error state: "Something went wrong loading notifications." Guest users: show empty state "Sign in to receive personalized park alerts." No hardcoded `initialNotifications` — that's in `authStore.ts` and should be removed (the store seeds fake notifications). Remove the `initialNotifications` array from `authStore.ts` and initialize `notifications: []`.
  
  Files: `apps/web/src/pages/NotificationsPage.tsx`, `apps/web/src/store/slices/authStore.ts`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 15. **Rebuild ProfilePage + SettingsPage** (`src/pages/ProfilePage.tsx`, `src/pages/SettingsPage.tsx`)

  White background. Profile: avatar (real from user object or initials fallback), name, email, city, member-since. Stats row: Trips (real count from `savedTrips`), Parks visited (real count from unique parkIds). Menu items: Notification Preferences → `/app/settings`, App Settings → `/app/settings`, Privacy & Data → `/app/settings`. Sign Out. Guest state: "Sign in to view your profile." SettingsPage: sections for Notification Preferences, Account, Privacy, About. No fake data.
  
  Files: `apps/web/src/pages/ProfilePage.tsx`, `apps/web/src/pages/SettingsPage.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 16. **Global skeleton, empty, and error state components** (`src/components/ui/`)

  Create reusable components:
  - `src/components/ui/SkeletonCard.tsx` — white skeleton card, shimmer animation
  - `src/components/ui/SkeletonText.tsx` — text-line skeleton
  - `src/components/ui/EmptyState.tsx` — icon + heading + body + optional CTA button
  - `src/components/ui/ErrorState.tsx` — error icon + message + retry button
  - `src/components/ui/LoadingSpinner.tsx` — blue spinner
  
  Standardize usage across all pages.
  
  Files: `apps/web/src/components/ui/SkeletonCard.tsx`, `SkeletonText.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `LoadingSpinner.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 17. **Responsive desktop layout audit and fix**

  Verify every page against the `max-w-7xl` change from step 2. Pages that need multi-column desktop layouts: HomePage (2-col), ExplorePage (3-col grid), DestinationDetailPage (sidebar with weather/info alongside main content), TripsPage (2-col grid). Confirm no page uses `max-w-lg` or `max-w-sm` as its outermost container on desktop. Fix `AppShell.tsx` to add `lg:pl-64` padding when sidebar is visible so content isn't hidden behind it.
  
  Files: All pages + `apps/web/src/layouts/AppShell.tsx`
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 18. **Accessibility pass**

  - All interactive elements have `aria-label` or visible text
  - Bottom nav `role="tablist"` + `role="tab"` + `aria-selected` (already present in AppShell — verify preserved)
  - Form inputs have `<label>` associations (`htmlFor`)
  - Images have descriptive `alt` attributes
  - Focus-visible ring from `index.css` (`*:focus-visible`) preserved
  - Color contrast: blue (#2563EB) on white passes WCAG AA for large text; verify small-text uses navy (#0F172A)
  - Loading states have `aria-busy="true"` on containers
  - Error messages use `role="alert"`
  
  Files: All pages and components as needed.
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 19. **Visual polish and animation pass**

  - Framer Motion `initial/animate` on all page mounts (already present in most pages — verify new pages follow same pattern)
  - Card hover: subtle lift (`-translate-y-1`) + shadow on white cards
  - Page transitions: `AnimatePresence` on route changes if not already present
  - CTA buttons: blue hover state darkens to `#1D4ED8`
  - Status badges (crowd level) use semantic colors (green/amber/red) — existing `CrowdLevelBadge` component preserved
  
  Files: All pages and components.
  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 20. **Final build and typecheck**

  Run full build and fix any remaining type errors or import issues.
  
  Files: Any files with remaining errors.
  
  Verify: `cd "j:\QUEUE CUT\apps\web" && npx tsc --noEmit && npx vite build` — builds successfully with zero TypeScript errors.

---

## API contract summary (what each section needs)

| Screen | Endpoint | Method | Returns |
|---|---|---|---|
| Explore Parks | `/api/v1/parks` | GET | `ParkSummary[]` |
| Park Details | `/api/v1/parks/:id` | GET | Full park data |
| Park Tariff | `/api/v1/parks/:id/tariff` | GET | `pricing`, `dress_code_policy` |
| Park Rides | `/api/v1/parks/:id/rides` | GET | Ride categories object |
| Weather | `/api/v1/telemetry/weather?park_id=X&date=Y` | GET | `WeatherTelemetryResponse` |
| Recommendation | `/api/v1/recommendation/recommend` | POST | `RecommendationResponse` |
| Save Trip | `/api/v1/trips` | POST | Trip record |
| Get Trips | `/api/v1/trips` | GET | Trip array |
| Delete Trip | `/api/v1/trips/:id` | DELETE | `{status, trip_id}` |
| Notifications | `/api/v1/notifications` | GET | Notification array |
| Mark Read | `/api/v1/notifications/:id/read` | POST | Read status |
| Auth Register | `/api/v1/auth/register` | POST | `AuthResponse` |
| Auth Login | `/api/v1/auth/login` | POST | `AuthResponse` |
| Auth Logout | `/api/v1/auth/logout` | POST | 204 |
| Auth Google | `/api/v1/auth/google/login` | GET (redirect) | OAuth redirect |

## Gaps where API data is unavailable (empty state only)

- `crowd_level` per park in Explore — the `/parks` endpoint does NOT return real-time crowd data. Empty state: no crowd badge until user runs recommendation flow.
- `peace_score` / `visit_score` — computed by recommendation endpoint per date; not a park-level property.
- Push notifications — backend has notifications table but no push delivery. Show static empty state "You're all caught up." for new users.
- Park images — backend catalog has no hosted images. Generic Unsplash fallback URL used on all park cards.

## Files to keep without modification

- `src/services/apiClient.ts` — complete and correct; no changes needed
- `src/types/api.ts` — complete type definitions
- `src/store/slices/exploreStore.ts` — correct data flow
- `src/store/slices/plannerStore.ts` — complete wizard state
- `src/store/slices/uiStore.ts` — correct
- `src/hooks/useGeolocation.ts` — keep
- `src/hooks/useActionGuard.ts` — keep
- `src/App.tsx` — modify only to add `/app/plan`, `/app/forecast/:parkId`, `/app/compare/:parkId` routes
- `src/components/intelligence/*` — keep all (CrowdLevelBadge, PeaceScoreRing, ConfidenceIndicator, WhyThisPrediction)
- `src/components/recommendation/*` — keep
- `src/components/chat/*` — keep (AdvisorChatbot, AdvisorDrawer)
- `src/components/notifications/NotificationToasts.tsx` — keep
- `src/main.tsx` — no changes needed
- `vite.config.ts` — only change `theme_color` in PWA manifest

## Files to modify substantially

- `tailwind.config.js` — add blue tokens
- `src/styles/globals.css` — full rebuild of base/component layers
- `src/styles/index.css` — update CSS variables for white+blue
- `src/pages/SplashPage.tsx` — full rebuild
- `src/pages/OnboardingPage.tsx` — full rebuild
- `src/pages/LoginPage.tsx` — full rebuild (new aesthetic)
- `src/layouts/AppShell.tsx` — responsive desktop layout
- `src/pages/HomePage.tsx` — full rebuild
- `src/pages/ExplorePage.tsx` — full rebuild
- `src/pages/DestinationDetailPage.tsx` — remove fake data, full rebuild
- `src/pages/TripsPage.tsx` — new styling
- `src/pages/NotificationsPage.tsx` — new styling
- `src/pages/ProfilePage.tsx` — new styling
- `src/pages/SettingsPage.tsx` — new styling
- `src/store/slices/authStore.ts` — remove fake Google/FB users, remove initialNotifications
- `src/components/destination/DestinationCard.tsx` — new white card design
- `src/features/wizard/Step1Park.tsx` — replace hardcoded park list with real API data

## Files to create

- `src/pages/PlanMyVisitPage.tsx` — new Plan My Visit 5-step flow
- `src/pages/VisitForecastPage.tsx` — recommendation result screen
- `src/pages/CompareDatesPage.tsx` — date comparison screen
- `src/components/ui/SkeletonCard.tsx`
- `src/components/ui/SkeletonText.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/ErrorState.tsx`
- `src/components/ui/LoadingSpinner.tsx`
