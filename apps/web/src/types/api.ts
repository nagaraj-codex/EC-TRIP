export interface DayEvaluation {
  date: string;
  visit_score: number;
  crowd_level: "low" | "medium" | "high" | "very_high";
  predicted_wait_top_ride_minutes: number;
  ticket_price: number;
  weather_condition: "sunny" | "cloudy" | "light_rain" | "heavy_rain";
  temp_max: number;
  fasttrack_verdict: "SKIP" | "CONSIDER" | "RECOMMENDED";
  cost_per_minute_saved: number;
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
  official_website?: string;
  coordinates?: { lat: number; lon: number };
  operating_hours?: string;
  total_rides: number;
  weekday_price?: number;
  weekend_price?: number;
  status?: string;
  image?: string;
  rating?: string;
  features?: string[];
}

export interface WeatherTelemetryResponse {
  park_id: string;
  visit_date: string;
  weather: {
    temp_max_c: number;
    temp_min_c: number;
    precipitation_sum_mm: number;
    condition: string;
    rain_probability_pct: number;
  };
  solar_uv: {
    peak_uv: number;
    uv_category: string;
    peak_hours: string;
    advisory: string;
  };
}

export interface CommuteTelemetryResponse {
  park_id: string;
  park_name: string;
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  distance_km: number;
  estimated_minutes: number;
  traffic_multiplier: number;
  status: string;
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
  verified_on_site: boolean;
}

export interface FeedbackSummaryResponse {
  status: string;
  park_id: string;
  active_observations_count: number;
  average_reported_wait: number;
  crowd_adjustment_factor: number;
}
