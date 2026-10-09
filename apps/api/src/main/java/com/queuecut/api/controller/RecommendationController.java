package com.queuecut.api.controller;

import com.queuecut.api.config.ParksConfig;
import com.queuecut.api.exception.ApiException;
import com.queuecut.api.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/v1/recommendation")
public class RecommendationController {

    private final IntelligenceService intelligence;
    private final ParksConfig parks;
    private final MailService email;

    public RecommendationController(IntelligenceService intelligence, ParksConfig parks, MailService email) {
        this.intelligence = intelligence;
        this.parks        = parks;
        this.email        = email;
    }

    public record RecommendationRequest(
        @NotBlank String park_id,
        @NotNull @Size(min=1) List<@NotBlank String> candidate_dates,
        String priority,
        Double budget_limit,
        String email
    ) {}

    @PostMapping("/recommend")
    public Map<String, Object> recommend(@Valid @RequestBody RecommendationRequest req) {
        if (!parks.haspark(req.park_id()))
            throw new ApiException(404, "Park " + req.park_id() + " not configured.");
        ParksConfig.ParkMeta meta = parks.getPark(req.park_id());
        ParksConfig.ParkPricing pricing = parks.getPrice(req.park_id());
        String priority = req.priority() != null ? req.priority() : "Best Balanced";

        List<Double> prices = new ArrayList<>();
        for (String ds : req.candidate_dates()) {
            LocalDate d = LocalDate.parse(ds);
            prices.add(d.getDayOfWeek().getValue() >= 6 ? pricing.weekend() : pricing.weekday());
        }
        double maxPrice = prices.stream().mapToDouble(d -> d == null ? 1.0 : d).max().orElse(1.0);

        // Evaluate all dates concurrently
        List<CompletableFuture<Map<String, Object>>> futures = new ArrayList<>();
        for (int i = 0; i < req.candidate_dates().size(); i++) {
            final String dateStr = req.candidate_dates().get(i);
            final double curPrice = prices.get(i);
            futures.add(CompletableFuture.supplyAsync(() ->
                intelligence.evaluateCandidateDate(req.park_id(), meta.lat(), meta.lon(),
                    dateStr, priority, maxPrice, curPrice)));
        }
        List<Map<String, Object>> evaluations = futures.stream()
            .map(f -> { try { return f.get(10, TimeUnit.SECONDS); } catch (Exception e) { return Collections.<String, Object>emptyMap(); } })
            .filter(m -> !m.isEmpty()).toList();

        Map<String, Object> best = evaluations.stream()
            .max(Comparator.comparingDouble(m -> ((Number) m.get("visit_score")).doubleValue()))
            .orElseThrow(() -> new ApiException(500, "No evaluations produced"));

        if (req.email() != null && !req.email().isBlank()) {
            email.sendItineraryEmail(req.email(), meta.name(),
                (String) best.get("date"), ((Number) best.get("visit_score")).doubleValue());
        }

        return Map.of(
            "park_id",          req.park_id(),
            "park_name",        meta.name(),
            "recommended_date", best.get("date"),
            "summary",          "Optimal visit day is " + best.get("date") + " with Visit Score " +
                                best.get("visit_score") + "/100. Expected crowd: " + best.get("crowd_level") + ".",
            "evaluations",      evaluations
        );
    }
}