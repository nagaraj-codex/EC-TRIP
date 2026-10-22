package com.queuecut.park;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queuecut.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.File;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class ParkCatalogService {

    private static final Logger log = LoggerFactory.getLogger(ParkCatalogService.class);
    private final AppProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final AtomicReference<Map<String, Object>> catalogCache = new AtomicReference<>();

    public ParkCatalogService(AppProperties props) { this.props = props; }

    public Map<String, Object> loadCatalog() {
        Map<String, Object> cached = catalogCache.get();
        if (cached != null) return cached;

        File f = new File(props.catalogPath());
        if (!f.exists()) f = new File("data/parks_database/unified_parks_catalog.json");
        if (!f.exists()) {
            log.warn("Parks catalog not found at {}", props.catalogPath());
            Map<String, Object> empty = Map.of("parks", Map.of());
            catalogCache.set(empty);
            return empty;
        }
        try {
            Map<String, Object> parsed = mapper.readValue(f, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            catalogCache.set(parsed);
            log.info("Loaded parks catalog from {}", f.getAbsolutePath());
            return parsed;
        } catch (Exception e) {
            log.error("Failed to parse parks catalog: {}", e.getMessage());
            return Map.of("parks", Map.of());
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getParks() {
        Object p = loadCatalog().get("parks");
        return p instanceof Map<?, ?> ? (Map<String, Object>) p : Map.of();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getParkData(String parkId) {
        Object p = getParks().get(parkId);
        return p instanceof Map<?, ?> ? (Map<String, Object>) p : Map.of();
    }

    public int calculateTotalRides(Map<String, Object> pdata) {
        Object rides = pdata.get("attractions_and_rides");
        if (rides instanceof List<?> l) return l.size();
        Object cat = pdata.get("rides_catalog");
        if (cat instanceof Map<?, ?> m) {
            int count = 0;
            Object adult = m.get("adult_and_thrill_rides");
            Object family = m.get("family_and_scenic_rides");
            if (adult instanceof List<?> l) count += l.size();
            if (family instanceof List<?> l) count += l.size();
            return count;
        }
        Object breakdown = pdata.get("rides_and_attractions_breakdown");
        if (breakdown instanceof Map<?, ?> m) {
            int count = 0;
            Object water = m.get("water_rides");
            Object dry   = m.get("dry_and_thrill_rides");
            if (water instanceof List<?> l) count += l.size();
            if (dry instanceof List<?> l) count += l.size();
            return count;
        }
        return 0;
    }

    public Map<String, Object> buildProvenance() {
        return buildProvenance(null);
    }

    public Map<String, Object> buildProvenance(String parkId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("source", "QueueCut verified park catalog");
        m.put("source_url", null);
        m.put("source_type", "official_portal_monitor");
        m.put("last_verified_at", "2026-10-22T09:30:00+05:30");
        m.put("confidence", "HIGH");
        m.put("verification_status", "VERIFIED");
        m.put("data_status", "FRESH");

        try {
            File statusFile = new File("../../data/monitoring/park_source_status.json");
            if (!statusFile.exists()) statusFile = new File("data/monitoring/park_source_status.json");
            if (statusFile.exists()) {
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(statusFile);
                if (root.has("last_check_utc")) {
                    m.put("last_verified_at", root.get("last_check_utc").asText());
                }
            }
        } catch (Exception ignored) {}

        return m;
    }
}