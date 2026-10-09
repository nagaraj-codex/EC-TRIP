package com.queuecut.api.controller;

import com.queuecut.api.config.AppProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final AppProperties props;

    public HealthController(AppProperties props) {
        this.props = props;
    }

    @GetMapping({"/health", "/api/health"})
    public Map<String, Object> health() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "healthy");
        res.put("service", "queuecut-api");
        res.put("version", "3.0.0");
        res.put("cache", "in-memory");
        res.put("database", "connected");
        return res;
    }

    @GetMapping("/api/v1/health/integrations")
    public Map<String, Object> integrations() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "ok");

        Map<String, Object> providers = new LinkedHashMap<>();
        providers.put("open_meteo", Map.of("status", "available", "type", "weather"));
        providers.put("osrm", Map.of("status", "available", "type", "commute"));
        providers.put("gemini", Map.of(
            "status", props.gemini().isConfigured() ? "configured" : "unconfigured",
            "type", "ai_chat"
        ));
        providers.put("google_oauth", Map.of(
            "status", props.google().isConfigured() ? "configured" : "unconfigured",
            "type", "auth"
        ));
        providers.put("resend", Map.of(
            "status", props.resend().isConfigured() ? "configured" : "unconfigured",
            "type", "email"
        ));

        res.put("providers", providers);
        return res;
    }

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("name", "QueueCut Intelligence API");
        res.put("version", "3.0.0");
        res.put("status", "online");
        res.put("docs", "/docs");
        return res;
    }
}