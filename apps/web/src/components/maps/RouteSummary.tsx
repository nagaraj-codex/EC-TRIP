import { useEffect, useState } from "react";
import { Clock, LoaderCircle, MapPin, Navigation } from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { useGeolocation } from "../../hooks/useGeolocation";
import type { CommuteTelemetryResponse } from "../../types/api";
import ErrorState from "../common/ErrorState";

export default function RouteSummary({ parkId }: { parkId: string }) {
  const { coordinates, loading: locationLoading, error: locationError, refresh } = useGeolocation();
  const [route, setRoute] = useState<CommuteTelemetryResponse | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!coordinates || !parkId) return;
    let isCurrentRequest = true;
    setRoute(null);
    setRouteError("");
    setRouteLoading(true);
    apiClient.getCommute(parkId, coordinates.lat, coordinates.lon)
      .then((result) => { if (isCurrentRequest) setRoute(result); })
      .catch(() => { if (isCurrentRequest) setRouteError("Route information is temporarily unavailable."); })
      .finally(() => { if (isCurrentRequest) setRouteLoading(false); });
    return () => { isCurrentRequest = false; };
  }, [coordinates, parkId, retry]);

  return (
    <section aria-labelledby="route-summary-heading" className="qc-card rounded-2xl p-5">
      <h2 id="route-summary-heading" className="flex items-center gap-2 font-display text-sm font-bold text-white">
        <Navigation className="h-4 w-4 text-brand-400" aria-hidden="true" /> Route estimate
      </h2>

      {routeLoading || locationLoading ? (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" /> Checking route...</p>
      ) : routeError ? (
        <div className="mt-3"><ErrorState title="Route estimate failed." description={routeError} tone="dark" onRetry={() => setRetry((count) => count + 1)} /></div>
      ) : route?.status === "success" && route.distance_km !== null && route.duration_minutes !== null && route.estimated_fuel_cost_inr !== null && route.assumptions ? (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Distance</p>
              <p className="mt-1 text-sm font-semibold text-white">{route.distance_km.toFixed(1)} km</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500"><Clock className="h-3 w-3" /> Estimated drive</p>
              <p className="mt-1 text-sm font-semibold text-white">{Math.round(route.duration_minutes)} min</p>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-slate-500">Route estimate · Fuel estimate ₹{Math.round(route.estimated_fuel_cost_inr).toLocaleString("en-IN")} assumes {route.assumptions.fuel_type} at ₹{route.assumptions.fuel_price_per_liter}/L and {route.assumptions.vehicle_mileage_kmpl} km/L. Traffic may change travel time.</p>
        </div>
      ) : route ? (
        <div className="mt-3">
          <p role="status" className="text-sm text-slate-400">Estimated route is currently unavailable from the routing provider.</p>
          <button type="button" onClick={() => setRetry((count) => count + 1)} className="mt-3 min-h-10 rounded-md border border-white/15 px-3 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400">Retry route estimate</button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-slate-400">Use your current location to calculate an estimated route.</p>
          {locationError && <p role="status" className="mt-2 text-xs text-slate-500">{locationError}</p>}
          <button type="button" onClick={refresh} disabled={locationLoading} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 px-3 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-60">
            <MapPin className="h-3.5 w-3.5" /> Use my location
          </button>
        </div>
      )}
    </section>
  );
}
