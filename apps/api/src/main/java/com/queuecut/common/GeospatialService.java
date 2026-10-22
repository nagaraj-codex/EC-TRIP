package com.queuecut.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.queuecut.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

@Service
public class GeospatialService {
    private static final Logger log = LoggerFactory.getLogger(GeospatialService.class);
    private final AppProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();

    public GeospatialService(AppProperties props) { this.props = props; }

    /** Returns {distance_km, duration_minutes} or null on failure. */
    public Map<String, Double> fetchOsrmRoute(double startLat, double startLon, double endLat, double endLon) {
        String url = props.osrmUrl().replaceAll("/+$", "") + "/" +
            startLon + "," + startLat + ";" + endLon + "," + endLat + "?overview=false";
        try {
            HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url))
                .timeout(Duration.ofSeconds(4))
                .header("User-Agent", "QueueCut/3.0 (theme park travel estimates)")
                .GET().build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return null;
            JsonNode root   = mapper.readTree(resp.body());
            JsonNode routes = root.path("routes");
            if (!routes.isArray() || routes.isEmpty()) return null;
            double duration = routes.get(0).path("duration").asDouble();
            double distance = routes.get(0).path("distance").asDouble();
            if (duration < 0 || distance < 0) return null;
            return Map.of("duration_minutes", duration / 60.0, "distance_km", distance / 1000.0);
        } catch (Exception e) {
            log.debug("OSRM route failed: {}", e.getMessage());
            return null;
        }
    }

    /** Haversine great-circle distance in km. */
    public double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dlat = Math.toRadians(lat2 - lat1);
        double dlon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dlat/2)*Math.sin(dlat/2) +
                   Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))*
                   Math.sin(dlon/2)*Math.sin(dlon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    public boolean isVerifiedOnSite(double userLat, double userLon, double parkLat, double parkLon, double thresholdKm) {
        return haversineKm(userLat, userLon, parkLat, parkLon) <= thresholdKm;
    }
}