# QueueCut

QueueCut is a highly optimized, AI-powered amusement park itinerary generator and planning application. It helps users reduce waiting times, optimize schedules, and make the most out of their visits to theme parks like Wonderla, Black Thunder, and MGM Dizzee World.

## Features
- **Smart Recommendations**: Evaluates crowd levels, weather, and park schedules to recommend the best visit dates.
- **Dynamic Itineraries**: Generates balanced, family-friendly, or thrill-seeker optimized park itineraries.
- **Trip Management**: Save, view, and organize your planned trips.
- **Dual Authentication**: Supports both traditional Email/Password login and Google OAuth.
- **Development Modes**: Zero-credential mock modes allow local development without configuring actual SMTP or OAuth secrets.

## Tech Stack
- **Backend**: Java 21, Spring Boot 3.3.4, SQLite (`queuecut.db`)
- **Frontend**: React 18, TypeScript, Vite, Zustand, Tailwind CSS

## Prerequisites
- **Java 21**
- **Node.js** (v18+)
- **PowerShell** (for Windows)

## Getting Started

A unified launch script is provided to spin up both the backend API and the frontend dev server.

1. Clone the repository.
2. Ensure you have no processes running on port `8080` (Backend) and port `5173` (Frontend).
3. Run the launch script:
   ```powershell
   .\launch.ps1
   ```
4. Access the web interface at `http://localhost:5173`.

The backend API listens on `http://localhost:8080`; its health endpoint is
`http://localhost:8080/actuator/health`.

### Environment Variables
For production use, or to enable real Google OAuth and Gemini features, create `.env` files or set the following variables:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Enables real Google login. (If empty in non-prod, mock login is used).
- `GEMINI_API_KEY`: Enables AI generation features.
- `RESEND_API_KEY`: Enables real SMTP emailing. (If empty, console-based mock mailer is used).

For Google OAuth, register this exact local callback URI:
`http://localhost:8080/api/v1/auth/google/callback`. The API, Vite proxy, and test
configuration all use port 8080; port 8000 belongs to the removed FastAPI backend.

## Project Structure
- `apps/api`: The Spring Boot Java Backend.
- `apps/web`: The React Vite Frontend.
- `docs/`: Action matrices and other project documentation.
