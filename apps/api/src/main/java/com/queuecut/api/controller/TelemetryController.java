package com.queuecut.api.controller;

import com.queuecut.api.config.ParksConfig;
import com.queuecut.api.exception.ApiException;
import com.queuecut.api.service.*;

import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemetryController {

    private final WeatherService weather;
    private final GeospatialService geo;
    private final TelemetryWebSocketHandler wsHandler;
    private final ParksConfig parks;

    public TelemetryController(WeatherService weather, GeospatialService geo,
                                TelemetryWebSocketHandler wsHandler, ParksConfig parks) {
        this.weather   = weather;
        this.geo       = geo;
        this.wsHandler = wsHandler;
        this.parks     = parks;
    }

    @GetMapping("/weather")
    public Map<String, Object> getWeather(
            @RequestParam(required=false) String park_id,
            @RequestParam(required=false) Double lat,
            @RequestParam(required=false) Double lon,
            @RequestParam(required=false) String date) {

        if (park_id != null && !parks.haspark(park_id))
            throw new ApiException(404, "Park '" + park_id + "' not found.");
        if ((lat == null) != (lon == null))
            throw new ApiException(422, "Provide both latitude and longitude.");

        double targetLat, targetLon;
        String parkName;
        if (park_id != null) {
            ParksConfig.ParkMeta meta = parks.getPark(park_id);
            targetLat = meta.lat(); targetLon = meta.lon(); parkName = meta.name();
        } else if (lat != null && lon != null) {
            targetLat = lat.doubleValue(); targetLon = lon.doubleValue(); parkName = "Custom Location";
        } else {
            throw new ApiException(422, "Provide a park identifier or both coordinates.");
        }

        String targetDate;
        if (date != null) {
            try { targetDate = LocalDate.parse(date).toString(); }
            catch (Exception e) { throw new ApiException(422, "Date must use YYYY-MM-DD."); }
        } else {
            targetDate = LocalDate.now(ZoneOffset.ofHoursMinutes(5, 30)).toString();
        }

        Map<String, Object> wx     = weather.forecast(targetLat, targetLon, targetDate);
        Map<String, Object> uvData = weather.fetchSolarUv(targetLat, targetLon, targetDate);
        Map<String, Object> sun    = weather.fetchSunriseSunset(targetLat, targetLon, targetDate);

        return Map.of(
            "status",      "success",
            "park_name",   parkName,
            "date",        targetDate,
            "coordinates", Map.of("lat", targetLat, "lon", targetLon),
            "weather",     wx,
            "solar_uv",    uvData,
            "daylight",    sun
        );
    }

    @GetMapping("/commute")
    public Map<String, Object> getCommute(
            @RequestParam(defaultValue="wonderla-chennai") String park_id,
            @RequestParam(defaultValue="Current location") String origin_city,
            @RequestParam(defaultValue="13.0827") double origin_lat,
            @RequestParam(defaultValue="80.2707") double origin_lon) {

        if (!parks.haspark(park_id)) throw new ApiException(404, "Park '" + park_id + "' not found.");
        ParksConfig.ParkMeta dest = parks.getPark(park_id);
        Map<String, Double> route = geo.fetchOsrmRoute(origin_lat, origin_lon, dest.lat(), dest.lon());

        if (route == null) {
            Map<String, Object> unavail = new LinkedHashMap<>();
            unavail.put("status", "unavailable");
            unavail.put("origin", origin_city);
            unavail.put("destination", dest.name());
            unavail.put("distance_km", null);
            unavail.put("duration_minutes", null);
            unavail.put("estimated_fuel_cost_inr", null);
            unavail.put("assumptions", null);
            unavail.put("source", "OSRM");
            unavail.put("error", "No route estimate is currently available.");
            return unavail;
        }
        double distKm  = route.get("distance_km");
        double durMins = route.get("duration_minutes");
        double petrolRate = 101.0, mileage = 15.0;
        double fuelCost   = Math.round((distKm / mileage) * petrolRate * 100.0) / 100.0;
        return Map.of(
            "status","success","origin",origin_city,"destination",dest.name(),
            "distance_km",distKm,"duration_minutes",durMins,
            "estimated_fuel_cost_inr",fuelCost,
            "assumptions",Map.of("fuel_type","Petrol","fuel_price_per_liter",petrolRate,"vehicle_mileage_kmpl",mileage)
        );
    }

    public record AlertPayload(String title, String message, String level, String park_id, String badge) {}

    @PostMapping("/trigger-alert")
    public Map<String, Object> triggerAlert(
            @RequestParam(required=false) String message,
            @RequestBody(required=false) AlertPayload payload) {
        Map<String, Object> alert = new LinkedHashMap<>();
        alert.put("type",     "telemetry_alert");
        alert.put("title",    payload != null && payload.title() != null ? payload.title() : "Weather Flash Advisory");
        alert.put("message",  message != null ? message : (payload != null && payload.message() != null ? payload.message() : "Sudden rain clouds detected."));
        alert.put("level",    payload != null && payload.level() != null ? payload.level() : "warning");
        alert.put("park_id",  payload != null ? payload.park_id() : "wonderla-chennai");
        alert.put("badge",    payload != null && payload.badge() != null ? payload.badge() : "RADAR 2KM");
        wsHandler.broadcast(alert);
        return Map.of("status","broadcast_complete","recipients_count",wsHandler.getConnectionCount(),"payload",alert);
    }
}