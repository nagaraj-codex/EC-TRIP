import type {
  RecommendationRequest,
  RecommendationResponse,
  ItineraryRequest,
  ItineraryResponse,
  ParkSummary,
  WeatherTelemetryResponse,
  CommuteTelemetryResponse,
  FeedbackObservationReport,
  FeedbackSubmissionResponse,
  FeedbackSummaryResponse,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  // Recommendation & Crowd Engine
  recommend: (payload: RecommendationRequest): Promise<RecommendationResponse> =>
    apiFetch("/recommendation/recommend", { method: "POST", body: JSON.stringify(payload) }),

  // Itinerary Generator
  generateItinerary: (payload: ItineraryRequest): Promise<ItineraryResponse> =>
    apiFetch("/itinerary/generate", { method: "POST", body: JSON.stringify(payload) }),

  // Parks Database & Tariff
  getParks: async (): Promise<ParkSummary[]> => {
    try {
      const res = await apiFetch<{ status: string; count: number; data: ParkSummary[] }>("/parks");
      return res.data;
    } catch {
      return [];
    }
  },

  getPark: (parkId: string) =>
    apiFetch<{ status: string; data: any }>(`/parks/${parkId}`),

  getParkRides: (parkId: string) =>
    apiFetch<{ status: string; park_id: string; rides: any }>(`/parks/${parkId}/rides`),

  getParkTariff: (parkId: string) =>
    apiFetch<{ status: string; park_id: string; pricing: any; dress_code: any }>(`/parks/${parkId}/tariff`),

  // Telemetry: Live Open-Meteo & Commute
  getWeather: (parkId: string, date?: string): Promise<WeatherTelemetryResponse> => {
    const query = date ? `?park_id=${encodeURIComponent(parkId)}&date=${encodeURIComponent(date)}` : `?park_id=${encodeURIComponent(parkId)}`;
    return apiFetch(`/telemetry/weather${query}`);
  },

  getCommute: (parkId: string, originLat: number, originLon: number): Promise<CommuteTelemetryResponse> =>
    apiFetch(`/telemetry/commute?park_id=${encodeURIComponent(parkId)}&origin_lat=${originLat}&origin_lon=${originLon}`),

  // Conversational AI Assistant
  chat: (prompt: string, context: object): Promise<{ response: string }> =>
    apiFetch("/chat/ask", { method: "POST", body: JSON.stringify({ prompt, context }) }),

  // Crowdsourced Feedback & Active Calibration
  submitCrowdReport: (payload: FeedbackObservationReport): Promise<FeedbackSubmissionResponse> =>
    apiFetch("/feedback/report", { method: "POST", body: JSON.stringify(payload) }),

  getFeedbackSummary: (parkId: string): Promise<FeedbackSummaryResponse> =>
    apiFetch(`/feedback/observations/${encodeURIComponent(parkId)}`),
};
