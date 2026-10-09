package com.queuecut.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.queuecut.api.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;

@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private final AppProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();
    // Simple TTL cache: key -> {timestamp, data}
    private final Map<String, long[]> cacheTimes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> cacheData = new ConcurrentHashMap<>();
    private static final long TTL_MS = 1_800_000L; // 30 min

    public WeatherService(AppProperties props) { this.props = props; }

    public Map<String, Object> forecast(double lat, double lon, String targetDate) {
        String key = String.format("wx:%.4f:%.4f:%s", lat, lon, targetDate);
        Map<String, Object> cached = getCache(key);
        if (cached != null) return cached;

        String url = props.openMeteo().forecastUrl() +
            "?latitude=" + lat + "&longitude=" + lon +
            "&daily=weathercode,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max" +
            "&timezone=Asia%2FKolkata";
        try {
            HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url))
                .timeout(Duration.ofSeconds(4)).GET().build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) throw new RuntimeException("HTTP " + resp.statusCode());
            JsonNode root   = mapper.readTree(resp.body());
            JsonNode daily  = root.path("daily");
            List<String> dates = new ArrayList<>();
            daily.path("time").forEach(n -> dates.add(n.asText()));
            int idx = dates.indexOf(targetDate);
            if (idx < 0) return unavailableWeather("Forecast date not found");
            int wCode = daily.path("weathercode").get(idx).asInt();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("condition",  conditionForCode(wCode));
            result.put("temp_max",   daily.path("temperature_2m_max").get(idx).asDouble());
            result.put("rain_prob",  daily.path("precipitation_probability_max").get(idx).asDouble());
            result.put("wind_kmh",   daily.path("wind_speed_10m_max").get(idx).asDouble());
            result.put("updated_at", OffsetDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
            result.put("data_status", "FRESH");
            result.put("source", "Open-Meteo");
            setCache(key, result);
            return result;
        } catch (Exception e) {
            log.warn("Weather fetch failed: {}", e.getMessage());
            return unavailableWeather(e.getMessage());
        }
    }

    public Map<String, Object> fetchSolarUv(double lat, double lon, String targetDate) {
        String key = String.format("solar:uv:%.4f:%.4f:%s", lat, lon, targetDate);
        Map<String, Object> cached = getCache(key);
        if (cached != null) return cached;

        String url = props.openMeteo().airQualityUrl() +
            "?latitude=" + lat + "&longitude=" + lon +
            "&hourly=uv_index&timezone=auto&start_date=" + targetDate + "&end_date=" + targetDate;
        try {
            HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url))
                .timeout(Duration.ofSeconds(3)).GET().build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) throw new RuntimeException("HTTP " + resp.statusCode());
            JsonNode root   = mapper.readTree(resp.body());
            JsonNode hourly = root.path("hourly");
            List<String> times  = new ArrayList<>();
            List<Double> values = new ArrayList<>();
            hourly.path("time").forEach(n -> times.add(n.asText()));
            hourly.path("uv_index").forEach(n -> values.add(n.isNull() ? null : n.asDouble()));
            double peak = Double.NEGATIVE_INFINITY;
            for (int i = 0; i < times.size(); i++) {
                if (times.get(i).startsWith(targetDate) && values.get(i) != null)
                    peak = Math.max(peak, values.get(i));
            }
            if (peak == Double.NEGATIVE_INFINITY) throw new RuntimeException("No UV data for date");
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("peak_uv", peak);
            result.put("advisory", peak > 6 ? "High UV forecast; consider shade, hydration, and indoor breaks." : "Moderate or lower UV forecast.");
            result.put("data_status", "FRESH");
            result.put("source", "Open-Meteo Air Quality");
            result.put("date", targetDate);
            setCache(key, result);
            return result;
        } catch (Exception e) {
            log.debug("UV fetch failed: {}", e.getMessage());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("peak_uv", null);
            m.put("advisory", "UV forecast unavailable for this date.");
            m.put("data_status", "UNAVAILABLE");
            m.put("source", "Open-Meteo Air Quality");
            m.put("date", targetDate);
            return m;
        }
    }

    public Map<String, Object> fetchSunriseSunset(double lat, double lon, String targetDate) {
        String key = String.format("solar:daylight:%.4f:%.4f:%s", lat, lon, targetDate);
        Map<String, Object> cached = getCache(key);
        if (cached != null) return cached;

        String url = props.sunriseSunsetUrl() + "?lat=" + lat + "&lng=" + lon + "&date=" + targetDate;
        try {
            HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url))
                .timeout(Duration.ofSeconds(3)).GET().build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) throw new RuntimeException("HTTP " + resp.statusCode());
            JsonNode root = mapper.readTree(resp.body());
            if (!root.path("error").isMissingNode() && !root.path("error").isNull())
                throw new RuntimeException("API error");
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("sunrise",     root.path("sunrise").asText(null));
            result.put("sunset",      root.path("sunset").asText(null));
            result.put("twilight_end",root.path("civil_twilight_end").asText(null));
            result.put("data_status", "FRESH");
            result.put("source", "Sunrise-Sunset.org");
            result.put("date", targetDate);
            setCache(key, result);
            return result;
        } catch (Exception e) {
            log.debug("Sunrise-sunset fetch failed: {}", e.getMessage());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("sunrise", null);
            m.put("sunset", null);
            m.put("twilight_end", null);
            m.put("data_status", "UNAVAILABLE");
            m.put("source", "Sunrise-Sunset.org");
            m.put("date", targetDate);
            return m;
        }
    }

    private String conditionForCode(int code) {
        if (code == 0 || code == 1) return "sunny";
        if (code == 2 || code == 3 || code == 45 || code == 48) return "cloudy";
        if (code == 51 || code == 53 || code == 55 || code == 61 || code == 80) return "light_rain";
        if (code == 63 || code == 65 || code == 81 || code == 82 || code == 95) return "heavy_rain";
        return "unavailable";
    }

    private Map<String, Object> unavailableWeather(String error) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("condition", "unavailable"); m.put("temp_max", null); m.put("rain_prob", null);
        m.put("wind_kmh", null); m.put("data_status", "UNAVAILABLE"); m.put("source", "Open-Meteo");
        m.put("error", error);
        return m;
    }

    private Map<String, Object> getCache(String key) {
        long[] ts = cacheTimes.get(key);
        if (ts != null && System.currentTimeMillis() - ts[0] < TTL_MS) return cacheData.get(key);
        return null;
    }

    private void setCache(String key, Map<String, Object> data) {
        cacheTimes.put(key, new long[]{System.currentTimeMillis()});
        cacheData.put(key, data);
    }
}