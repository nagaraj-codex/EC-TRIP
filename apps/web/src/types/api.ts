export interface DayEvaluation {
  date: string;
  visit_score: number;
  crowd_level: "low" | "medium" | "high" | "very_high";
  predicted_wait_top_ride_minutes: number;
  crowd_status: string;
  crowd_source: string;
  wait_estimate_status: string;
  ticket_price: number;
  weather_condition: "sunny" | "cloudy" | "light_rain" | "heavy_rain" | "unavailable";
  temp_max: number | null;
  fasttrack_verdict: "SKIP" | "CONSIDER" | "RECOMMENDED" | "UNAVAILABLE";
  cost_per_minute_saved: number | null;
  confidence: "High" | "Medium" | "Low";
  reasoning: string;
}

export interface RecommendationResponse {
  park_id: string;
  park_name: string;
  recommended_date: string;
  summary: string;
  evaluations: DayEvaluation[];
}

export interface RecommendationRequest {
  park_id: string;
  candidate_dates: string[];
  priority: "Cheapest" | "Least Crowded" | "Best Balanced" | "Maximum Rides";
  budget_limit?: number;
  email?: string;
}

export interface TimelineItem {
  time_slot: string;
  activity: string;
  category: "Thrill Ride" | "Water Ride" | "Dining" | "Scenic/Family";
  estimated_wait_minutes: number;
  tip: string;
  uv_exposure: "Low" | "Moderate" | "High / Caution";
}

export interface ItineraryResponse {
  park_id: string;
  park_name: string;
  visit_date: string;
  total_estimated_wait_minutes: number;
  uv_shield_applied: boolean;
  uv_data_status: "FRESH" | "UNAVAILABLE";
  timeline: TimelineItem[];
  email_status?: string | null;
}

export interface ItineraryRequest {
  park_id: string;
  visit_date: string;
  priority?: string;
  email?: string;
  group_size?: number;
}

export interface ParkSummary {
  park_id: string;
  name: string;
  brand: string;
  city: string;
  state?: string;
  official_website?: string;
  coordinates?: { lat: number; lon: number };
  operating_hours?: unknown;
  total_rides: number;
  weekday_price?: number;
  weekend_price?: number;
  status?: string;
  image?: string;
  rating?: string;
  features?: string[];
  provenance?: {
    source: string;
    source_url?: string | null;
    source_type: string;
    last_verified_at?: string | null;
    confidence: string;
    data_status: "FRESH" | "STALE" | "EXPIRED" | "UNAVAILABLE";
  };
}

export interface ParkDetail {
  park_id?: string;
  name?: string;
  brand?: string;
  official_website?: string;
  location?: {
    city?: string;
    state?: string;
    coordinates?: { lat: number; lon: number };
    [field: string]: unknown;
  };
  operating_hours?: unknown;
  ticket_pricing?: Record<string, unknown>;
  [field: string]: unknown;
}

export interface ParkRidesResponse {
  status: string;
  park_id: string;
  rides: unknown;
}

export interface ParkTariffResponse {
  status: string;
  park_id: string;
  pricing: Record<string, unknown> | null;
  dress_code: unknown;
  provenance?: {
    source: string;
    source_url?: string | null;
    source_type: string;
    last_verified_at?: string | null;
    confidence: string;
    data_status: "FRESH" | "STALE" | "EXPIRED" | "UNAVAILABLE";
  };
}

export interface WeatherTelemetryResponse {
  status: string;
  park_name: string;
  date: string;
  coordinates: { lat: number; lon: number };
  weather: {
    condition: string | null;
    temp_max: number | null;
    rain_prob: number | null;
    wind_kmh?: number | null;
    updated_at?: string;
    data_status: "FRESH" | "STALE" | "EXPIRED" | "UNAVAILABLE";
    source: string;
  };
  solar_uv: {
    peak_uv: number | null;
    advisory: string;
    data_status: "FRESH" | "UNAVAILABLE";
    source: string;
    date: string;
  };
  daylight?: {
    sunrise?: string | null;
    sunset?: string | null;
    twilight_end?: string | null;
    data_status?: "FRESH" | "UNAVAILABLE";
    source?: string;
    date?: string;
  };
}

export interface CommuteTelemetryResponse {
  status: "success" | "unavailable";
  origin: string;
  destination: string;
  distance_km: number | null;
  duration_minutes: number | null;
  estimated_fuel_cost_inr: number | null;
  assumptions: {
    fuel_type: string;
    fuel_price_per_liter: number;
    vehicle_mileage_kmpl: number;
  } | null;
  source?: string;
  error?: string;
}

export interface FeedbackObservationReport {
  park_id: string;
  visit_date: string;
  observed_crowd: "low" | "medium" | "high" | "very_high";
  observed_wait_top_ride_minutes: number;
  fasttrack_purchased?: boolean;
  user_lat?: number;
  user_lon?: number;
}

export interface FeedbackSubmissionResponse {
  status: string;
  message: string;
  location_proximity_checked: boolean;
}

export interface FeedbackSummaryResponse {
  status: string;
  park_id: string;
  active_observations_count: number;
  average_reported_wait: number;
  crowd_adjustment_factor: number;
}
