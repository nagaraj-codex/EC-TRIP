# PHASE 3 ARCHITECTURE AUDIT

## Frontend
- **Entry point**: `apps/web/src/main.tsx` and `App.tsx`
- **Routing**: `react-router-dom` used for routing across pages in `apps/web/src/pages/`
- **State management**: `zustand` slices located in `apps/web/src/store/slices/`
- **API client**: `apps/web/src/services/apiClient.ts` providing typed `fetchWithTimeout` wrapper.
- **Authentication flow**: Email/Password + Google OAuth via `apiClient.ts` mapped to Zustand slices.
- **Guest flow**: Supported via `GuestTab.tsx` and Zustand states.
- **Development startup**: `npm run dev` (Vite)
- **Production build**: `npm run build` (tsc && vite build)

## Backend
- **Entry point**: `apps/api/src/main/java/com/queuecut/api/QueueCutApplication.java` (Spring Boot 3.3.4, Java 21)
- **Controller layer**: `apps/api/src/main/java/com/queuecut/api/controller/` (12 REST controllers)
- **Service layer**: `apps/api/src/main/java/com/queuecut/api/service/` (Handles logic & external integrations)
- **Repository layer**: `apps/api/src/main/java/com/queuecut/api/repository/` (Spring Data JPA)
- **Database configuration**: Embedded SQLite via `application.yml` (`jdbc:sqlite:./data/queuecut.db`)
- **Exception handling**: `GlobalExceptionHandler.java` provides unified `{ "detail": "message" }` format.
- **External API integrations**: Open-Meteo, Nager.Date, Resend, OSRM, Gemini API.
- **Environment configuration**: `application.yml` maps env vars like `${GOOGLE_CLIENT_ID:}`.
- **Development startup**: `./mvnw.cmd spring-boot:run`
- **Production build**: `./mvnw.cmd clean package`
- **Test command**: `./mvnw.cmd clean test`

## Flags & Anomalies
- No DUPLICATE or DEAD CODE visibly problematic.
- No UNKNOWN architectures.
- The repository fully mirrors the expected Java + React design.
