# QUEUE CUT Project Inventory

## Overview
QueueCut is an AI-powered amusement park itinerary generator and planning application.

## 1. Architecture Summary
- **Frontend Framework**: React 18, TypeScript, Vite
- **Backend Framework**: Java 21, Spring Boot 3.3.4 (Maven)
- **Database**: SQLite
- **State Management**: Zustand
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: JWT, Email/Password, Google OAuth (with mock modes)

## 2. Frontend Modules (`apps/web/src/`)
- **`components/`**: Reusable React UI components (buttons, inputs, cards).
- **`features/`**: Feature-specific logic and UI (e.g., itinerary generation, trip management).
- **`pages/`**: Routable page components.
- **`services/`**: API client layer for communicating with the Spring Boot backend.
- **`store/`**: Zustand stores for global state management (e.g., auth state, user profile).
- **`hooks/`**: Custom React hooks for data fetching and component logic.
- **`layouts/`**: Shared structural components (e.g., headers, footers, sidebars).
- **`types/`**: TypeScript interfaces and types for models and API payloads.
- **`utils/`**: Helper functions, formatters, and constants.

## 3. Backend Modules (`apps/api/src/main/java/com/queuecut/api/`)
- **`config/`**: Spring configuration classes (Security, Web/CORS, Database).
- **`controller/`**: REST API controllers handling HTTP requests and routing.
- **`service/`**: Core business logic and transaction management.
- **`repository/`**: Spring Data JPA interfaces for database access.
- **`entity/`**: JPA entity classes mapping to the SQLite schema.
- **`dto/`**: Data Transfer Objects for request/response payloads.
- **`security/`**: JWT filters, user principal details, and authorization logic.
- **`integration/`**: Adapters for external services (Gemini AI, Resend SMTP, Google OAuth).
- **`exception/`**: Global error handling and custom exception classes.

## 4. Dependencies & Infrastructure
- **CI/CD**: GitHub Actions (`deploy.yml` for Vercel + Render).
- **Build Systems**: Vite (Frontend), Maven (Backend).
- **Data persistence**: Local SQLite files (`queuecut.db`, `queuecut-test.db`).

*(This document is continuously updated as the audit progresses)*
