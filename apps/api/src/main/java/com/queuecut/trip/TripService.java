package com.queuecut.trip;

import com.queuecut.auth.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TripService {
    private final TripRepository repo;
    private final ObjectMapper mapper;

    public TripService(TripRepository repo, ObjectMapper mapper) {
        this.repo   = repo;
        this.mapper = mapper;
    }

    public List<Map<String, Object>> listTrips(String userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(t -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",         t.getId());
                    m.put("park_id",    t.getParkId());
                    m.put("visit_date", t.getVisitDate());
                    try { m.put("payload", mapper.readValue(t.getPayload(), Object.class)); }
                    catch (Exception e) { m.put("payload", Map.of()); }
                    m.put("created_at", t.getCreatedAt());
                    return m;
                }).toList();
    }

    @Transactional
    public Map<String, Object> createTrip(String userId, String parkId, String visitDate, Object payload) {
        String tripId = "trip_" + AuthService.randomToken(12);
        String now    = OffsetDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        Trip t = new Trip();
        t.setId(tripId);
        t.setUserId(userId);
        t.setParkId(parkId);
        t.setVisitDate(visitDate);
        try { t.setPayload(mapper.writeValueAsString(payload)); }
        catch (Exception e) { t.setPayload("{}"); }
        t.setCreatedAt(now);
        repo.save(t);
        return Map.of("id", tripId, "user_id", userId, "park_id", parkId, "visit_date", visitDate, "payload", payload);
    }

    @Transactional
    public boolean deleteTrip(String userId, String tripId) {
        return repo.findByIdAndUserId(tripId, userId).map(t -> { repo.delete(t); return true; }).orElse(false);
    }
}