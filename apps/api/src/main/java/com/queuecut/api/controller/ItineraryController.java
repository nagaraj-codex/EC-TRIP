package com.queuecut.api.controller;

import com.queuecut.api.config.ParksConfig;
import com.queuecut.api.exception.ApiException;
import com.queuecut.api.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/itinerary")
public class ItineraryController {

    private final ParksConfig parks;
    private final WeatherService weather;
    private final MailService email;

    public ItineraryController(ParksConfig parks, WeatherService weather, MailService email) {
        this.parks   = parks;
        this.weather = weather;
        this.email   = email;
    }

    public record ItineraryRequest(
        @NotBlank String park_id,
        String visit_date,
        String priority,
        String email,
        @Min(1) Integer group_size
    ) {}

    @PostMapping("/generate")
    public Map<String, Object> generate(@Valid @RequestBody ItineraryRequest req) {
        String parkId = req.park_id();
        if (!parks.haspark(parkId)) throw new ApiException(404, "Park '" + parkId + "' not configured.");
        ParksConfig.ParkMeta meta = parks.getPark(parkId);
        String visitDate = req.visit_date() != null ? req.visit_date() : LocalDate.now().toString();

        Map<String, Object> uvInfo = weather.fetchSolarUv(meta.lat(), meta.lon(), visitDate);
        Object peakUvObj = uvInfo.get("peak_uv");
        double peakUv = peakUvObj instanceof Number n ? n.doubleValue() : -1.0;
        boolean uvShield = peakUv > 6.0;
        String uvStatus = (String) uvInfo.getOrDefault("data_status", "UNAVAILABLE");

        List<Map<String, Object>> timeline = buildTimeline(parkId);
        int totalWait = timeline.stream().mapToInt(t -> ((Number) t.get("estimated_wait_minutes")).intValue()).sum();

        String emailStatus = null;
        if (req.email() != null && !req.email().isBlank()) {
            email.sendItineraryEmail(req.email(), meta.name(), visitDate, 88.0);
            emailStatus = "Itinerary queued for delivery to " + req.email();
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("park_id", parkId);
        result.put("park_name", meta.name());
        result.put("visit_date", visitDate);
        result.put("total_estimated_wait_minutes", totalWait);
        result.put("uv_shield_applied", uvShield);
        result.put("uv_data_status", uvStatus);
        result.put("timeline", timeline);
        result.put("email_status", emailStatus);
        return result;
    }

    private List<Map<String, Object>> buildTimeline(String parkId) {
        return switch (parkId) {
            case "mgm-dizzee-chennai" -> List.of(
                slot("10:30 AM - 12:00 PM","Roller Coaster & Karnakasi","Thrill Ride",15,"Take advantage of early coastal breeze.","Moderate"),
                slot("12:00 PM - 01:30 PM","Caribbean Wave & Water Slides","Water Ride",14,"Synthetic costume required on slides.","Moderate"),
                slot("01:30 PM - 02:30 PM","Lunch & Indoor 5D Cinema","Dining",5,"Enjoy multi-sensory cinema in air-conditioned hall.","Low"),
                slot("02:30 PM - 05:30 PM","Big Wheel, Revolution & Water Chute","Scenic/Family",10,"Scenic panoramic views of the Bay of Bengal coast.","Low")
            );
            case "black-thunder-mettupalayam" -> List.of(
                slot("10:00 AM - 12:00 PM","Mega Wave Pool & Wild River","Water Ride",12,"Largest wave pool in Nilgiri foothills.","Moderate"),
                slot("12:00 PM - 01:30 PM","Zipline Cycle & Suspension Rope Course","Thrill Ride",20,"Glide across park canopy on suspended tandem bicycles.","High / Caution"),
                slot("01:30 PM - 02:30 PM","Lakeside Restaurant Dining","Dining",10,"Relax next to natural scenic lake.","Low"),
                slot("02:30 PM - 05:30 PM","Speed Slides, Thunder Spin & Pedal Boating","Scenic/Family",14,"Wrap up day with calm pedal boating.","Low")
            );
            default -> List.of(
                slot("11:00 AM - 12:00 PM","Recoil & Maverick (Outdoor Rollercoasters)","Thrill Ride",18,"Hit signature high-speed coasters first at rope-drop.","Moderate"),
                slot("12:00 PM - 01:00 PM","Equinox & Space Gun (High Inversion Thrills)","Thrill Ride",22,"Secure all loose items in RFID lockers beforehand.","High / Caution"),
                slot("01:00 PM - 02:00 PM","Park Restaurant / Air-Conditioned Food Court","Dining",10,"Refuel during midday sun peak to avoid direct heat exposure.","Low"),
                slot("02:00 PM - 04:30 PM","Wave Pool & Wonder Splash (Water Rides Zone)","Water Ride",15,"100% synthetic swimwear mandatory.","Moderate"),
                slot("04:30 PM - 06:00 PM","Drop Tower, Termite Coaster & Grand Carousel","Scenic/Family",12,"Winding down as sunset approaches.","Low")
            );
        };
    }

    private Map<String, Object> slot(String time, String activity, String category, int wait, String tip, String uv) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("time_slot", time); m.put("activity", activity); m.put("category", category);
        m.put("estimated_wait_minutes", wait); m.put("tip", tip); m.put("uv_exposure", uv);
        return m;
    }
}