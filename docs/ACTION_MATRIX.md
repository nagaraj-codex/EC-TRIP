# QueueCut API Action Matrix & E2E Verification

This matrix verifies that all essential user stories map to functional API endpoints and that the application architecture correctly handles security, auth states, and domain logic.

| Action / Flow | Endpoint | Method | Auth Required | E2E Verified? | Handled Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Registration** | `/api/v1/auth/register` | POST | No | Yes | Duplicates rejected (409), weak passwords rejected (422) |
| **Login (Email)** | `/api/v1/auth/login` | POST | No | Yes | Wrong pass/email rejected (401), Success generates cookie |
| **Logout** | `/api/v1/auth/logout` | POST | Yes | Yes | Validates and expires session cookie |
| **Get Current User** | `/api/v1/auth/me` | GET | Yes | Yes | Fetches user profile for session, 401 if invalid |
| **Get Google Status** | `/api/v1/auth/google/status` | GET | No | Yes | Detects if mock mode or real OAuth is available |
| **Google Login Flow** | `/api/v1/auth/google/login` | GET | No | Yes | Redirects to Google or uses Mock Auth if unconfigured |
| **Google Callback** | `/api/v1/auth/google/callback` | GET | No | Yes | Validates OAuth state and exchanges code for token |
| **Park Catalog** | `/api/v1/parks` | GET | No | Yes | Returns list of all supported amusement parks |
| **Park Details** | `/api/v1/parks/{park_id}` | GET | No | Yes | Detailed park stats, operating hours, prices |
| **Generate Recommendations**| `/api/v1/recommendation/recommend`| POST | No | Yes | Recommends best visit dates based on crowd/weather |
| **Generate Itinerary** | `/api/v1/itinerary/generate` | POST | No | Yes | Creates an optimized ride schedule |
| **Create Trip** | `/api/v1/trips` | POST | Yes | Yes | User can save a trip itinerary |
| **List Trips** | `/api/v1/trips` | GET | Yes | Yes | Lists only trips belonging to the authenticated user |
| **Delete Trip** | `/api/v1/trips/{id}` | DELETE | Yes | Yes | User can delete their own trip |

## E2E Security Highlights
- **Trip Isolation**: `QueueCutIntegrationTest` explicitly confirms `userB_cannotSeeUserATrips` and `userB_cannotDeleteUserATrip` meaning horizontal privilege escalation is prevented.
- **Data Leakage**: `loginError_doesNotLeakPasswordHash` verifies that the API never sends PBKDF2 hashes or salts to the frontend under any condition.
- **Mock Fallback**: Google OAuth smoothly falls back to a Mock User flow when `GOOGLE_CLIENT_ID` is empty and profile is NOT `prod`.
