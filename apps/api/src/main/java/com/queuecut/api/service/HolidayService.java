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
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class HolidayService {
    private static final Logger log = LoggerFactory.getLogger(HolidayService.class);
    private final AppProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();
    // Long-lived cache: 30 days
    private final Map<String, Object[]> cache = new ConcurrentHashMap<>();
    private final Map<String, Long>     cacheTs = new ConcurrentHashMap<>();
    private static final long TTL_MS = 30L * 86_400_000;

    public HolidayService(AppProperties props) { this.props = props; }

    /** Returns [isHoliday(Boolean), name(String), status(String)] */
    public Object[] checkHoliday(int year, String dateStr) {
        String key = "holiday_" + year + "_" + dateStr;
        Object[] cached = cache.get(key);
        if (cached != null && System.currentTimeMillis() - cacheTs.getOrDefault(key, 0L) < TTL_MS)
            return cached;

        String url = props.nagerUrl() + "/" + year + "/IN";
        try {
            HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url))
                .timeout(Duration.ofSeconds(4)).GET().build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return new Object[]{null, null, "UNAVAILABLE"};
            JsonNode arr = mapper.readTree(resp.body());
            if (!arr.isArray()) return new Object[]{null, null, "UNAVAILABLE"};
            for (JsonNode h : arr) {
                String hDate = h.path("date").asText();
                String hName = h.path("localName").asText("Public holiday");
                Object[] hit = new Object[]{true, hName, "FRESH"};
                cache.put("holiday_" + year + "_" + hDate, hit);
                cacheTs.put("holiday_" + year + "_" + hDate, System.currentTimeMillis());
            }
            Object[] result = cache.getOrDefault(key, new Object[]{false, null, "FRESH"});
            cache.put(key, result);
            cacheTs.put(key, System.currentTimeMillis());
            return result;
        } catch (Exception e) {
            log.debug("Holiday check failed: {}", e.getMessage());
            return new Object[]{null, null, "UNAVAILABLE"};
        }
    }
}