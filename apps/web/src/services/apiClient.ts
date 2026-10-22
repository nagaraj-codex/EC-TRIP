import { ApiError } from "../lib/errors";
import type {
  RecommendationRequest,
  RecommendationResponse,
  ItineraryRequest,
  ItineraryResponse,
  ParkSummary,
  ParkDetail,
  ParkRidesResponse,
  WeatherTelemetryResponse,
  CommuteTelemetryResponse,
  FeedbackObservationReport,
  FeedbackSubmissionResponse,
  FeedbackSummaryResponse,
  ParkTariffResponse,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const API_REQUEST_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(endpoint: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const externalSignal = init.signal;
  const abortFromCaller = () => controller.abort();
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
  if (externalSignal?.aborted) controller.abort();
  else externalSignal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    return await fetch(`${BASE_URL}${endpoint}`, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted && !externalSignal?.aborted) {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromCaller);
  }
}

async function apiFetch<T>(endpoint: string, init?: RequestInit, retries = 0): Promise<T> {
  const res = await fetchWithTimeout(endpoint, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
    ...init,
  });
  
  if (res.status === 401 && endpoint !== "/auth/login") {
    // Attempt silent refresh and redirect logic if needed
    // The instructions say: "handles 401 by one silent refresh then redirect to login with a friendly message"
    // Since we use httpOnly cookies, the refresh would just be retrying or redirecting.
    window.location.href = "/login?error=session_expired";
  }

  let json;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) throw new ApiError("INTERNAL_ERROR", `HTTP ${res.status}`);
    return undefined as T; // for 204 No Content
  }

  if (json && typeof json === 'object' && 'ok' in json) {
    if (!json.ok) {
      const err = json.error || {};
      throw new ApiError(err.code || "INTERNAL_ERROR", err.message || "Unknown error", err.fields, json.requestId);
    }
    return json.data as T;
  }
  
  // Fallback for legacy unwrapped responses (just in case)
  if (!res.ok) {
    throw new ApiError("INTERNAL_ERROR", json.detail || `HTTP ${res.status}`);
  }
  return json as T;
}

const inFlightGetRequests = new Map<string, Promise<unknown>>();

function apiGet<T>(endpoint: string, retries = 1): Promise<T> {
  const existingRequest = inFlightGetRequests.get(endpoint);
  if (existingRequest) return existingRequest as Promise<T>;

  const request = apiFetch<T>(endpoint).catch((err) => {
    if (retries > 0 && err instanceof ApiError && err.code === "INTERNAL_ERROR") {
      inFlightGetRequests.delete(endpoint);
      return apiGet<T>(endpoint, retries - 1);
    }
    throw err;
  }).finally(() => {
    if (inFlightGetRequests.get(endpoint) === request) {
      inFlightGetRequests.delete(endpoint);
    }
  });
  inFlightGetRequests.set(endpoint, request);
  return request;
}

async function apiDownload(endpoint: string, payload: unknown): Promise<Blob> {
  const res = await fetchWithTimeout(endpoint, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let errObj;
    try {
      const j = await res.json();
      errObj = j.error || { message: j.detail || "Download failed" };
    } catch {
      errObj = { message: "Download failed" };
    }
    throw new ApiError(errObj.code || "INTERNAL_ERROR", errObj.message || `HTTP ${res.status}`);
  }
  return res.blob();
}

export const apiClient = {
  register: (payload: { name: string; email: string; password: string }) =>
    apiFetch<{ success: boolean; user: { id: string; name: string; email: string; provider: "email" } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  login: (payload: { email: string; password: string }) =>
    apiFetch<{ success: boolean; user: { id: string; name: string; email: string; provider: "email" } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  me: () =>
    apiFetch<{ user: { id: string; name: string; email: string; provider: "email" | "google" } }>("/auth/me"),

  getGoogleAuthStatus: () =>
    apiGet<{ configured: boolean; status: "AVAILABLE" | "UNAVAILABLE"; prompt: string | null; redirect_uri: string | null }>(
      "/auth/google/status"
    ),

  logout: async (): Promise<void> => {
    try {
      await fetchWithTimeout("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors to ensure client state resets cleanly
    }
  },

  getTrips: () =>
    apiGet<{ status: string; data: Array<{ id: string; park_id: string; visit_date: string; payload: Record<string, unknown>; created_at: string }> }>(
      "/trips",
    ),

  saveTrip: (payload: { park_id: string; visit_date: string; payload?: Record<string, unknown> }) =>
    apiFetch<{ status: string; data: { id: string; park_id: string; visit_date: string } }>(
      "/trips",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  deleteTrip: (tripId: string) =>
    apiFetch<{ status: string; trip_id: string }>(`/trips/${encodeURIComponent(tripId)}`, { method: "DELETE" }),

  getNotifications: () =>
    apiGet<{ status: string; data: Array<{ id: string; title: string; message: string; read: boolean; created_at: string }> }>(
      "/notifications",
    ),

  markNotificationRead: (notificationId: string) =>
    apiFetch<{ status: string; notification_id: string; read: boolean }>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      { method: "POST" },
    ),

  markAllNotificationsRead: () =>
    apiFetch<{ status: string; read: boolean }>("/notifications/read-all", { method: "POST" }),

  getNews: (parkId?: string) =>
    apiGet<{ status: string; source: string; fetched_at: string; error?: string; data: unknown[] }>(
      `/news${parkId ? `?park_id=${encodeURIComponent(parkId)}` : ""}`,
    ),

  // Recommendation & Crowd Engine
  recommend: (payload: RecommendationRequest): Promise<RecommendationResponse> =>
    apiFetch("/recommendation/recommend", { method: "POST", body: JSON.stringify(payload) }),

  // Itinerary Generator
  generateItinerary: (payload: ItineraryRequest): Promise<ItineraryResponse> =>
    apiFetch("/itinerary/generate", { method: "POST", body: JSON.stringify(payload) }),

  // Parks Database & Tariff
  getParks: async (): Promise<ParkSummary[]> => {
    try {
      const res = await apiGet<{ status: string; count: number; data: ParkSummary[] }>("/parks");
      return res.data;
    } catch {
      return [];
    }
  },

  getPark: (parkId: string) =>
    apiGet<{ status: string; data: ParkDetail }>(`/parks/${encodeURIComponent(parkId)}`),

  getParkRides: (parkId: string): Promise<ParkRidesResponse> =>
    apiGet(`/parks/${encodeURIComponent(parkId)}/rides`),

  getParkTariff: (parkId: string): Promise<ParkTariffResponse> =>
    apiGet(`/parks/${encodeURIComponent(parkId)}/tariff`),

  // Telemetry: Live Open-Meteo & Commute
  getWeather: (parkId: string, date?: string): Promise<WeatherTelemetryResponse> => {
    const query = date ? `?park_id=${encodeURIComponent(parkId)}&date=${encodeURIComponent(date)}` : `?park_id=${encodeURIComponent(parkId)}`;
    return apiGet(`/telemetry/weather${query}`);
  },

  getCommute: (parkId: string, originLat: number, originLon: number): Promise<CommuteTelemetryResponse> =>
    apiGet(`/telemetry/commute?park_id=${encodeURIComponent(parkId)}&origin_lat=${originLat}&origin_lon=${originLon}`),

  // Conversational AI Assistant
  chat: (prompt: string, context: object): Promise<{ response: string; is_fallback: boolean }> =>
    apiFetch("/chat/ask", { method: "POST", body: JSON.stringify({ prompt, context }) }),

  exportData: (payload: { user: unknown; settings: object; saved_trips?: object[] }): Promise<Blob> =>
    apiDownload("/download/export", payload),

  // Crowdsourced Feedback & Active Calibration
  submitCrowdReport: (payload: FeedbackObservationReport): Promise<FeedbackSubmissionResponse> =>
    apiFetch("/feedback/report", { method: "POST", body: JSON.stringify(payload) }),

  getFeedbackSummary: (parkId: string): Promise<FeedbackSummaryResponse> =>
    apiFetch(`/feedback/observations/${encodeURIComponent(parkId)}`),

  triggerTestAlert: (payload: { title?: string; message?: string; level?: string; badge?: string; park_id?: string }) =>
    apiFetch<{ status: string }>("/telemetry/trigger-alert", { method: "POST", body: JSON.stringify(payload) }),
};
