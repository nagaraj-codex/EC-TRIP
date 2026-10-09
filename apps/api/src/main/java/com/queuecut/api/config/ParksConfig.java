package com.queuecut.api.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.io.File;
import java.util.*;

@Component
public class ParksConfig {

    private static final Logger log = LoggerFactory.getLogger(ParksConfig.class);

    public record ParkMeta(String id, String name, String city, double lat, double lon) {}
    public record ParkPricing(double weekday, double weekend, double fasttrack) {}

    private final Map<String, ParkMeta> coordinates;
    private final Map<String, ParkPricing> pricing;

    public ParksConfig(AppProperties props) {
        Map<String, ParkMeta> coords = new LinkedHashMap<>();
        Map<String, ParkPricing> prices = new LinkedHashMap<>();

        // Hardcoded fallback
        coords.put("wonderla-bengaluru",           new ParkMeta("wonderla-bengaluru",           "Wonderla Bengaluru",        "Bengaluru",      12.8349, 77.4009));
        coords.put("wonderla-kochi",               new ParkMeta("wonderla-kochi",               "Wonderla Kochi",            "Kochi",          10.0271, 76.3912));
        coords.put("wonderla-hyderabad",           new ParkMeta("wonderla-hyderabad",           "Wonderla Hyderabad",        "Hyderabad",      17.2188, 78.5323));
        coords.put("mgm-dizzee-chennai",           new ParkMeta("mgm-dizzee-chennai",           "MGM Dizzee World Chennai",  "Chennai",        12.8228, 80.2422));
        coords.put("black-thunder-mettupalayam",   new ParkMeta("black-thunder-mettupalayam",   "Black Thunder Mettupalayam","Mettupalayam",   11.3129, 76.9298));

        prices.put("wonderla-bengaluru",         new ParkPricing(1249.0, 1499.0, 999.0));
        prices.put("wonderla-kochi",             new ParkPricing(999.0,  1199.0, 799.0));
        prices.put("wonderla-hyderabad",         new ParkPricing(1099.0, 1299.0, 899.0));
        prices.put("mgm-dizzee-chennai",         new ParkPricing(699.0,  849.0,  400.0));
        prices.put("black-thunder-mettupalayam", new ParkPricing(1090.0, 1090.0, 500.0));

        // Attempt to enrich from unified catalog JSON
        try {
            File catalogFile = new File(props.catalogPath());
            if (!catalogFile.exists()) catalogFile = new File("data/parks_database/unified_parks_catalog.json");
            if (catalogFile.exists()) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(catalogFile);
                JsonNode parks = root.path("parks");
                parks.fields().forEachRemaining(entry -> {
                    String pid = entry.getKey();
                    JsonNode pdata = entry.getValue();
                    JsonNode loc = pdata.path("location");
                    JsonNode c = loc.path("coordinates");
                    if (!c.path("lat").isMissingNode() && !c.path("lon").isMissingNode()) {
                        coords.put(pid, new ParkMeta(
                            pid,
                            pdata.path("name").asText(pid),
                            loc.path("city").asText("Tamil Nadu"),
                            c.path("lat").asDouble(), c.path("lon").asDouble()
                        ));
                    }
                    JsonNode tp = pdata.path("ticket_pricing");
                    JsonNode reg = tp.path("regular_rates");
                    double weekday  = reg.path("adult_weekday").asDouble(prices.getOrDefault(pid, new ParkPricing(999,999,500)).weekday());
                    double weekend  = reg.path("adult_weekend").asDouble(prices.getOrDefault(pid, new ParkPricing(999,999,500)).weekend());
                    double ftPrice  = tp.path("fastrack_pass").path("price").asDouble(prices.getOrDefault(pid, new ParkPricing(999,999,500)).fasttrack());
                    prices.put(pid, new ParkPricing(weekday, weekend, ftPrice));
                });
                log.info("Enriched park catalog from {}", catalogFile.getAbsolutePath());
            }
        } catch (Exception e) {
            log.warn("Could not load parks catalog JSON: {}", e.getMessage());
        }

        this.coordinates = Collections.unmodifiableMap(coords);
        this.pricing      = Collections.unmodifiableMap(prices);
    }

    public Map<String, ParkMeta> getCoordinates()  { return coordinates; }
    public Map<String, ParkPricing> getPricing()    { return pricing; }
    public boolean haspark(String id)               { return coordinates.containsKey(id); }
    public ParkMeta getPark(String id)              { return coordinates.get(id); }
    public ParkPricing getPrice(String id)          { return pricing.get(id); }
    public Set<String> getParkIds()                 { return coordinates.keySet(); }
}