# CURRENT SYSTEM AUDIT

## Risky Changes Reviewed (From Previous Session)

1. **Mass Accessor Rewrite & Record-ification of AppProperties**
   - AppProperties was migrated from a Class to a Java Record.
   - All references across services and controllers were updated (e.g., props.auth().getSessionDays() -> props.auth().sessionDays(), props.frontendUrl()).
   - Verified via mvn compile and mvn test - all pass.

2. **Security & Session Refactoring**
   - Implemented stateless API security via SecurityConfig and SessionFilter.
   - Updated UserPrincipal to implement UserDetails and properly marked the internal User object as 	ransient and suppressed serial warnings.
   - WebSocketConfig and CacheConfig updated.
   - Fixed all BOM characters in package-info.java files.

3. **Cookie Change**
   - Cookie name changed from qc_session to queuecut_session across pplication.yml and integration tests.

4. **PermitAll Endpoints**
   - GET|POST /api/v1/auth/**: Required for registration, login, logout, and checking google auth status without a session.
   - GET /api/v1/parks/**: Public park catalog.
   - POST /api/v1/recommendation/**: Public recommendation tool.
   - POST /api/v1/itinerary/**: Public itinerary generation.
   - GET /health, /api/v1/health/**, /actuator/health, /actuator/info: Health checks (must be public for load balancers).
   - GET /ws/telemetry: Public telemetry websocket.
   - GET /api-docs/**, /docs/**, /swagger-ui/**: Swagger API documentation.

## Module Status
- **Backend Build:** WORKING (0 compilation errors, 0 warnings).
- **Backend Tests:** WORKING (28/28 integration tests pass).
- **Auth (Email/Password):** WORKING.
- **Auth (Google):** INCOMPLETE (Awaiting real credentials).
- **Frontend Build:** TO BE VERIFIED.
