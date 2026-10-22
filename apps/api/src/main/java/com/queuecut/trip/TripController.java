package com.queuecut.trip;

import com.queuecut.auth.AuthService;
import com.queuecut.common.ApiException;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripService trips;
    private final AuthService auth;

    public TripController(TripService trips, AuthService auth) { this.trips = trips; this.auth = auth; }

    private String requireUserId(HttpServletRequest req) {
        String token = getSessionToken(req);
        if (token == null) throw new ApiException(401, "Authentication required");
        return auth.getUserForSession(token)
            .orElseThrow(() -> new ApiException(401, "Session expired or invalid")).getId();
    }

    private String getSessionToken(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) if ("queuecut_session".equals(c.getName())) return c.getValue();
        return null;
    }

    public record SaveTripRequest(@NotBlank String park_id, @NotBlank String visit_date, Object payload) {}

    @GetMapping
    public Map<String, Object> getTrips(HttpServletRequest req) {
        return Map.of("status", "success", "data", trips.listTrips(requireUserId(req)));
    }

    @PostMapping
    public Map<String, Object> saveTrip(@Valid @RequestBody SaveTripRequest body, HttpServletRequest req) {
        String userId = requireUserId(req);
        Object payload = body.payload() != null ? body.payload() : Map.of();
        Map<String, Object> saved = trips.createTrip(userId, body.park_id(), body.visit_date(), payload);
        return Map.of("status", "success", "data", saved);
    }

    @DeleteMapping("/{tripId}")
    public Map<String, Object> deleteTrip(@PathVariable String tripId, HttpServletRequest req) {
        String userId = requireUserId(req);
        boolean deleted = trips.deleteTrip(userId, tripId);
        if (!deleted) throw new ApiException(404, "Trip " + tripId + " not found.");
        return Map.of("status", "success", "trip_id", tripId);
    }
}