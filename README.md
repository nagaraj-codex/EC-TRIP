# QueueCut

QueueCut is a theme-park visit planning platform. It combines park discovery and visit planning in a React progressive web app with a Java/Spring Boot service for park data, recommendations, telemetry, notifications, trips, and related APIs.

## Start From Scratch

Prerequisites: Java 21 or newer, Maven, Node.js 20 or newer, and npm.

From the repository root, install the web dependencies:

```powershell
npm --prefix apps/web install
```

Start the Java API backend (runs on port 8000):

```powershell
cd apps/api
mvn spring-boot:run
```

In a separate terminal, start the Vite development server (runs on port 5173):

```powershell
cd apps/web
npm run dev
```

The API documentation (Swagger) is available at `http://localhost:8000/docs`.

## Implemented Product Areas

- Home and park discovery with search and park cards.
- Explore and park detail screens.
- A step-by-step visit planner for choosing a park and date and requesting a recommendation.
- Trips, profile, notifications, and guest/authentication flows.
- Responsive navigation, onboarding, and an in-app advisor interface.
- Spring Boot REST controllers for parks, recommendations, telemetry/WebSockets, trips, notifications, chat, feedback, itinerary, downloads, and authentication.

The interface uses the park catalog and API responses; it should not display invented live conditions or recommendations.

## Build and Test

Build the web app:

```powershell
npm --prefix apps/web run build
```

Run Java backend tests:

```powershell
cd apps/api
mvn clean test
```

## Repository Map

- `apps/web/`: React, TypeScript, Vite, and PWA client.
- `apps/api/`: Spring Boot Java backend service, JPA entities, controllers, and services.
- `data/`: park catalogs and supporting datasets.
- `scripts/`: data compilation and verification utilities.
- `docs/`: API, product, data, security, deployment, and testing documentation.

Do not commit `.env` files, `queuecut.db`, generated caches, or user/session data. Configure credentials through local environment variables or application.properties.