package com.queuecut.api.service;

import com.queuecut.api.entity.CrowdObservation;
import com.queuecut.api.repository.CrowdObservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class FeedbackService {

    private final CrowdObservationRepository repo;

    // Rate limiter: IP -> sliding window timestamps
    private final Map<String, List<Long>> rateLimits = new ConcurrentHashMap<>();
    private static final int MAX_REPORTS      = 5;
    private static final long WINDOW_MS       = 60_000L;
    private static final int MAX_CLIENTS      = 10_000;

    public FeedbackService(CrowdObservationRepository repo) { this.repo = repo; }

    public boolean checkRateLimit(String ip) {
        long now = System.currentTimeMillis();
        List<Long> timestamps = rateLimits.computeIfAbsent(ip, k -> new ArrayList<>());
        synchronized (timestamps) {
            timestamps.removeIf(t -> now - t >= WINDOW_MS);
            if (timestamps.size() >= MAX_REPORTS) return false;
            timestamps.add(now);
            // Evict oldest entry if too many clients
            if (rateLimits.size() > MAX_CLIENTS) {
                rateLimits.keySet().stream().findFirst().ifPresent(rateLimits::remove);
            }
            return true;
        }
    }

    @Transactional
    public Map<String, Object> recordObservation(String parkId, String visitDate,
            String observedCrowd, int waitMinutes, boolean fasttrackPurchased, boolean verifiedOnSite) {
        purgeExpired();
        String id  = "obs_" + AuthService.randomToken(12);
        String now = OffsetDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        CrowdObservation obs = new CrowdObservation();
        obs.setId(id);
        obs.setParkId(parkId);
        obs.setVisitDate(visitDate);
        obs.setObservedCrowd(observedCrowd);
        obs.setObservedWaitTopRideMinutes(waitMinutes);
        obs.setFasttrackPurchased(fasttrackPurchased ? 1 : 0);
        obs.setLocationProximityChecked(verifiedOnSite ? 1 : 0);
        obs.setCreatedAt(now);
        repo.save(obs);
        return Map.of(
            "id", id, "park_id", parkId, "visit_date", visitDate,
            "observed_crowd", observedCrowd,
            "fasttrack_purchased", fasttrackPurchased,
            "verified_on_site", verifiedOnSite, "created_at", now
        );
    }

    public List<Map<String, Object>> getRecentObservations(String parkId, String visitDate) {
        return repo.findByParkIdAndVisitDateOrderByCreatedAtDesc(parkId, visitDate)
                .stream().map(o -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",            o.getId());
                    m.put("park_id",       o.getParkId());
                    m.put("visit_date",    o.getVisitDate());
                    m.put("observed_crowd", o.getObservedCrowd());
                    m.put("observed_wait_top_ride_minutes", o.getObservedWaitTopRideMinutes());
                    m.put("fasttrack_purchased", o.isFasttrackPurchased());
                    m.put("verified_on_site",    o.isLocationProximityChecked());
                    m.put("created_at",    o.getCreatedAt());
                    return m;
                }).toList();
    }

    @Transactional
    public void purgeExpired() {
        String cutoff = OffsetDateTime.now(ZoneOffset.UTC).minusDays(365)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        repo.deleteOlderThan(cutoff);
    }
}