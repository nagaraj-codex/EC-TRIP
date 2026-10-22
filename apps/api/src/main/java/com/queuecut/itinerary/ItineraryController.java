package com.queuecut.itinerary;

import com.queuecut.config.ParksConfig;
import com.queuecut.common.ApiException;
import com.queuecut.mail.MailService;
import com.queuecut.itinerary.dto.ItineraryResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/itinerary", "/api/v1/trips/{tripId}/itinerary"})
public class ItineraryController {

    private final ParksConfig parks;
    private final MailService email;
    private final ItineraryService itineraryService;

    public ItineraryController(ParksConfig parks, MailService email, ItineraryService itineraryService) {
        this.parks = parks;
        this.email = email;
        this.itineraryService = itineraryService;
    }

    public record ItineraryRequest(
        @NotBlank String park_id,
        String visit_date,
        String priority,
        String email,
        @Min(1) Integer group_size
    ) {}

    @PostMapping({"", "/generate"})
    public Map<String, Object> generate(@PathVariable(required = false) String tripId, @Valid @RequestBody ItineraryRequest req) {
        String parkId = req.park_id();
        if (!parks.haspark(parkId)) throw new ApiException(404, "Park '" + parkId + "' not configured.");
        ParksConfig.ParkMeta meta = parks.getPark(parkId);
        String visitDate = req.visit_date() != null ? req.visit_date() : LocalDate.now().toString();

        Map<String, Object> reqDetails = Map.of(
            "park_id", parkId,
            "visit_date", visitDate,
            "priority", req.priority() != null ? req.priority() : "BALANCED",
            "group_size", req.group_size() != null ? req.group_size() : 1
        );

        ItineraryResponse generated = itineraryService.generate(parkId, reqDetails);

        String emailStatus = null;
        if (req.email() != null && !req.email().isBlank()) {
            email.sendItineraryEmail(req.email(), meta.name(), visitDate, 88.0);
            emailStatus = "Itinerary queued for delivery to " + req.email();
        }

        List<Map<String, Object>> timeline = new ArrayList<>();
        if (generated.items() != null) {
            for (ItineraryResponse.ItineraryItemDto item : generated.items()) {
                Map<String, Object> t = new LinkedHashMap<>();
                String start = item.start() != null ? item.start() : "10:00";
                String end = item.end() != null ? item.end() : "11:00";
                t.put("time_slot", start + " - " + end);
                t.put("start", start);
                t.put("end", end);
                t.put("activity", item.title() != null ? item.title() : "Activity");
                t.put("title", item.title() != null ? item.title() : "Activity");
                t.put("category", item.type() != null ? item.type() : "Thrill Ride");
                t.put("type", item.type() != null ? item.type() : "Thrill Ride");
                t.put("estimated_wait_minutes", item.expectedWaitMin());
                t.put("expectedWaitMin", item.expectedWaitMin());
                t.put("tip", item.tip() != null ? item.tip() : "Plan ahead");
                t.put("uv_exposure", "Low");
                t.put("zone", item.zone() != null ? item.zone() : "Main");
                t.put("rideId", item.rideId());
                timeline.add(t);
            }
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("park_id", parkId);
        resp.put("park_name", meta.name());
        resp.put("visit_date", visitDate);
        resp.put("total_estimated_wait_minutes", generated.estimatedWaitMinutes());
        resp.put("uv_shield_applied", false);
        resp.put("uv_data_status", "UNAVAILABLE");
        resp.put("timeline", timeline);
        resp.put("warnings", generated.warnings());
        resp.put("source", generated.source());
        resp.put("email_status", emailStatus != null ? emailStatus : "none");
        return resp;
    }
}
