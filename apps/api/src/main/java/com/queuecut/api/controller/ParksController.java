package com.queuecut.api.controller;

import com.queuecut.api.config.ParksConfig;
import com.queuecut.api.exception.ApiException;
import com.queuecut.api.service.*;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/parks")
public class ParksController {

    private final ParkCatalogService catalog;
    private final WeatherService weather;
    private final ParksConfig parksConfig;

    public ParksController(ParkCatalogService catalog, WeatherService weather, ParksConfig parksConfig) {
        this.catalog     = catalog;
        this.weather     = weather;
        this.parksConfig = parksConfig;
    }

    @GetMapping
    public Map<String, Object> getAllParks() {
        Map<String, Object> parks = catalog.getParks();
        List<Map<String, Object>> summary = new ArrayList<>();
        for (Map.Entry<String, Object> entry : parks.entrySet()) {
            String pid = entry.getKey();
            @SuppressWarnings("unchecked")
            Map<String, Object> pdata = (Map<String, Object>) entry.getValue();
            @SuppressWarnings("unchecked")
            Map<String, Object> loc = (Map<String, Object>) pdata.getOrDefault("location", Map.of());
            @SuppressWarnings("unchecked")
            Map<String, Object> coords = (Map<String, Object>) loc.getOrDefault("coordinates", Map.of());
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("park_id",          pid);
            item.put("name",             pdata.get("name"));
            item.put("brand",            pdata.get("brand"));
            item.put("city",             loc.get("city"));
            item.put("state",            loc.get("state"));
            item.put("official_website", pdata.get("official_website"));
            item.put("coordinates",      coords);
            item.put("operating_hours",  pdata.get("operating_hours"));
            item.put("total_rides",      catalog.calculateTotalRides(pdata));
            item.put("provenance",       catalog.buildProvenance());
            summary.add(item);
        }
        return Map.of("status", "success", "count", summary.size(), "data", summary);
    }

    @GetMapping("/all")
    public Map<String, Object> getAllIntelligence() {
        List<Map<String, Object>> entries = new ArrayList<>();
        String today = LocalDate.now(ZoneOffset.UTC).toString();
        for (Map.Entry<String, ParksConfig.ParkMeta> e : parksConfig.getCoordinates().entrySet()) {
            ParksConfig.ParkMeta meta = e.getValue();
            Map<String, Object> wx = weather.forecast(meta.lat(), meta.lon(), today);
            String condition = (String) wx.getOrDefault("condition", "unavailable");
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("park_key",   meta.id());
            entry.put("park_name",  meta.name());
            entry.put("city",       meta.city());
            entry.put("crowd_level", "UNAVAILABLE");
            entry.put("weather",    condition);
            entries.add(entry);
        }
        return Map.of("status", "success", "parks", entries);
    }

    @GetMapping("/{parkId}/intelligence")
    public Map<String, Object> getParkIntelligence(@PathVariable String parkId) {
        if (!parksConfig.haspark(parkId)) throw new ApiException(404, "Park '" + parkId + "' not found.");
        ParksConfig.ParkMeta meta = parksConfig.getPark(parkId);
        String today = LocalDate.now(ZoneOffset.UTC).toString();
        Map<String, Object> wx = weather.forecast(meta.lat(), meta.lon(), today);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("park_key", parkId);
        result.put("park_name", meta.name());
        result.put("city", meta.city());
        result.put("date", today);
        result.put("weather", wx);
        result.put("crowd_level", "UNAVAILABLE");
        result.put("adjusted_score_percent", null);
        result.put("status", "success");
        return result;
    }

    @GetMapping("/{parkId}")
    public Map<String, Object> getParkDetails(@PathVariable String parkId) {
        Map<String, Object> pdata = catalog.getParkData(parkId);
        if (pdata.isEmpty()) throw new ApiException(404, "Park '" + parkId + "' not found in ground-truth database.");
        return Map.of("status", "success", "data", pdata);
    }

    @GetMapping("/{parkId}/rides")
    public Map<String, Object> getParkRides(@PathVariable String parkId) {
        Map<String, Object> pdata = catalog.getParkData(parkId);
        if (pdata.isEmpty()) throw new ApiException(404, "Park '" + parkId + "' not found.");
        Object rides = pdata.getOrDefault("attractions_and_rides",
            pdata.getOrDefault("rides_catalog", pdata.get("rides_and_attractions_breakdown")));
        return Map.of("status", "success", "park_id", parkId, "rides", rides != null ? rides : List.of());
    }

    @GetMapping("/{parkId}/tariff")
    public Map<String, Object> getParkTariff(@PathVariable String parkId) {
        Map<String, Object> pdata = catalog.getParkData(parkId);
        if (pdata.isEmpty()) throw new ApiException(404, "Park '" + parkId + "' not found.");
        return Map.of(
            "status", "success", "park_id", parkId,
            "pricing", pdata.get("ticket_pricing"),
            "dress_code", pdata.get("dress_code_policy"),
            "provenance", catalog.buildProvenance()
        );
    }
}