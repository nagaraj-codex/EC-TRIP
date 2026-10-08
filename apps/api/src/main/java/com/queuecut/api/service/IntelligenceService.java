package com.queuecut.api.service;

import com.queuecut.api.config.ParksConfig;

import org.springframework.stereotype.Service;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class IntelligenceService {

    private final WeatherService weather;
    private final HolidayService holidays;
    private final FeedbackService feedback;
    @SuppressWarnings("unused")
    private final ParksConfig parks;

    // Priority -> (time_weight, money_weight, weather_weight)
    private static final Map<String, double[]> PRIORITY_WEIGHTS = Map.of(
        "Cheapest",      new double[]{0.15, 0.70, 0.15},
        "Least Crowded", new double[]{0.70, 0.15, 0.15},
        "Best Balanced", new double[]{0.34, 0.33, 0.33},
        "Maximum Rides", new double[]{0.60, 0.20, 0.20}
    );
    private static final Map<String, Double> WEATHER_FIT = Map.of(
        "sunny", 1.0, "cloudy", 0.8, "light_rain", 0.4, "heavy_rain", 0.1
    );

    public IntelligenceService(WeatherService weather, HolidayService holidays,
                                FeedbackService feedback, ParksConfig parks) {
        this.weather  = weather;
        this.holidays = holidays;
        this.feedback = feedback;
        this.parks    = parks;
    }

    public Map<String, Object> evaluateCandidateDate(String parkId, double lat, double lon,
            String dateStr, String priority, double maxPrice, double currentPrice) {

        // Fetch weather and holidays concurrently
        CompletableFuture<Map<String, Object>> wxFuture =
            CompletableFuture.supplyAsync(() -> weather.forecast(lat, lon, dateStr));

        LocalDate date   = LocalDate.parse(dateStr);
        boolean isWeekend = date.getDayOfWeek().getValue() >= 6;
        Object[] holiday = holidays.checkHoliday(date.getYear(), dateStr);
        boolean isHoliday = holiday[0] instanceof Boolean b && b;

        Map<String, Object> wx;
        try { wx = wxFuture.get(5, TimeUnit.SECONDS); }
        catch (Exception e) { wx = Map.of("condition", "unavailable", "data_status", "UNAVAILABLE"); }

        // Rules-based crowd score (crowd_points 0-100)
        int crowdPoints = 25;
        if (isWeekend)  crowdPoints += 40;
        if (isHoliday)  crowdPoints += 35;
        if ("heavy_rain".equals(wx.get("condition"))) crowdPoints -= 30;
        crowdPoints = Math.max(10, Math.min(100, crowdPoints));

        // Crowdsourced feedback blend (verified on-site reports only)
        List<Map<String, Object>> reports = feedback.getRecentObservations(parkId, dateStr)
                .stream().filter(r -> Boolean.TRUE.equals(r.get("verified_on_site"))).toList();
        if (!reports.isEmpty()) {
            Map<String, Integer> crowdMap = Map.of("low",25,"medium",55,"high",80,"very_high",95);
            double avgObs = reports.stream()
                .mapToInt(r -> crowdMap.getOrDefault((String)r.get("observed_crowd"), 50))
                .average().orElse(crowdPoints);
            crowdPoints = (int)(0.6 * crowdPoints + 0.4 * avgObs);
        }

        // Visit score
        double timeSaving   = 1.0 - (crowdPoints / 100.0);
        double moneySaving  = maxPrice > 0 ? (maxPrice - currentPrice) / maxPrice : 0.0;
        String condition    = (String) wx.getOrDefault("condition", "unavailable");
        double visitScore   = calculateVisitScore(priority, timeSaving, moneySaving, condition);

        int waitMins = (int)((crowdPoints / 100.0) * 90);
        String crowdLevel = crowdPoints > 70 ? "high" : (crowdPoints > 40 ? "medium" : "low");

        String dataStatus  = (String) wx.getOrDefault("data_status", "UNAVAILABLE");
        String weatherSource = "Open-Meteo";
        Double tempMax     = wx.get("temp_max") instanceof Number n ? n.doubleValue() : null;
        Double rainProb    = wx.get("rain_prob") instanceof Number n ? n.doubleValue() : null;

        String reasoning = "Provisional calendar-based crowd and wait estimates, not park-reported queue data. " +
            "Factors: weekend=" + isWeekend + "; public-holiday=" + isHoliday +
            "; weather=" + condition + (rainProb != null ? " (" + rainProb + "% rain prob)" : "") +
            ". Location-checked reports used: " + reports.size() + ".";

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("date",                             dateStr);
        result.put("visit_score",                      visitScore);
        result.put("crowd_level",                      crowdLevel);
        result.put("predicted_wait_top_ride_minutes",  waitMins);
        result.put("crowd_status",                     "ESTIMATED");
        result.put("crowd_source",                     "calendar_heuristic_with_location_checked_reports");
        result.put("wait_estimate_status",             "ESTIMATED_RULE_BASED");
        result.put("ticket_price",                     currentPrice);
        result.put("weather_condition",                condition);
        result.put("temp_max",                         tempMax);
        result.put("fasttrack_verdict",                "UNAVAILABLE");
        result.put("cost_per_minute_saved",            null);
        result.put("confidence",                       "Low");
        result.put("reasoning",                        reasoning);
        result.put("source",                           weatherSource);
        result.put("data_status",                      dataStatus);
        return result;
    }

    private double calculateVisitScore(String priority, double timeSaving, double moneySaving, String condition) {
        double[] w = PRIORITY_WEIGHTS.getOrDefault(priority, new double[]{0.34, 0.33, 0.33});
        double wTime = w[0], wMoney = w[1], wWeather = w[2];
        timeSaving  = Math.min(1.0, Math.max(0.0, timeSaving));
        moneySaving = Math.min(1.0, Math.max(0.0, moneySaving));
        Double fit  = WEATHER_FIT.get(condition.toLowerCase());
        double score;
        if (fit == null) {
            double avail = wTime + wMoney;
            score = avail > 0 ? (wTime * timeSaving + wMoney * moneySaving) / avail : 0;
        } else {
            score = wTime * timeSaving + wMoney * moneySaving + wWeather * fit;
        }
        return Math.round(score * 1000.0) / 10.0; // 1 decimal
    }
}