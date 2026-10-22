package com.queuecut.common;

import com.queuecut.config.ParksConfig;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {
    
    private final FeedbackService feedback;
    private final GeospatialService geo;
    private final ParksConfig parks;

    public FeedbackController(FeedbackService feedback, GeospatialService geo, ParksConfig parks) {
        this.feedback = feedback;
        this.geo      = geo;
        this.parks    = parks;
    }

    private String getClientIp(HttpServletRequest req) {
        String ip = req.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = req.getRemoteAddr();
        return ip != null ? ip.split(",")[0].trim() : "unknown";
    }

    public record ReportRequest(
        @NotBlank String park_id,
        @NotBlank String visit_date,
        @NotBlank String observed_crowd,
        @Min(0) int observed_wait_top_ride_minutes,
        boolean fasttrack_purchased,
        Double user_lat,
        Double user_lon
    ) {}

    @PostMapping("/report")
    public Map<String, Object> report(@Valid @RequestBody ReportRequest req, HttpServletRequest httpReq) {
        String ip = getClientIp(httpReq);
        if (!feedback.checkRateLimit(ip)) throw new ApiException(429, "Rate limit exceeded. Try again later.");
        if (!parks.haspark(req.park_id())) throw new ApiException(404, "Park '" + req.park_id() + "' not found.");
        
        boolean verified = false;
        if (req.user_lat() != null && req.user_lon() != null) {
            ParksConfig.ParkMeta meta = parks.getPark(req.park_id());
            verified = geo.isVerifiedOnSite(req.user_lat(), req.user_lon(), meta.lat(), meta.lon(), 1.5);
        }

        Map<String, Object> obs = feedback.recordObservation(
            req.park_id(), req.visit_date(), req.observed_crowd(),
            req.observed_wait_top_ride_minutes(), req.fasttrack_purchased(), verified
        );

        return Map.of("status", "success", "message", "Crowd report recorded. Thank you for contributing!", "data", obs);
    }

    @GetMapping("/observations/{parkId}")
    public Map<String, Object> getObservations(@PathVariable String parkId, @RequestParam(required=false) String date) {
        if (!parks.haspark(parkId)) throw new ApiException(404, "Park '" + parkId + "' not found.");
        String targetDate = date != null ? date : java.time.LocalDate.now().toString();
        List<Map<String, Object>> obs = feedback.getRecentObservations(parkId, targetDate);
        return Map.of("status", "success", "park_id", parkId, "visit_date", targetDate, "count", obs.size(), "data", obs);
    }
}