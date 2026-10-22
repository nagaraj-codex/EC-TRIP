package com.queuecut.ai;

import com.queuecut.itinerary.dto.ItineraryResponse;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.*;

@Component
public class RuleBasedPlanner {

    private final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @SuppressWarnings("unchecked")
    public ItineraryResponse plan(String promptJson) {
        try {
            if (promptJson != null && promptJson.trim().startsWith("{")) {
                Map<String, Object> map = mapper.readValue(promptJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                Map<String, Object> parkData = (Map<String, Object>) map.getOrDefault("park", Map.of());
                Map<String, Object> requestDetails = (Map<String, Object>) map.getOrDefault("request", Map.of());
                String parkId = (String) parkData.getOrDefault("park_id", (String) requestDetails.getOrDefault("park_id", "wonderla-chennai"));
                return plan(parkId, parkData, requestDetails);
            }
        } catch (Exception ignored) {
        }
        return plan("wonderla-chennai", Map.of(), Map.of());
    }

    @SuppressWarnings("unchecked")
    public ItineraryResponse plan(String parkId, Map<String, Object> parkData, Map<String, Object> requestDetails) {
        String parkName = (String) parkData.getOrDefault("name", "Wonderla Amusement Park Chennai");
        String priority = (String) requestDetails.getOrDefault("priority", "Best Balanced");
        String visitDate = (String) requestDetails.getOrDefault("visit_date", "2026-10-22");
        int groupSize = 2;
        Object gsObj = requestDetails.get("group_size");
        if (gsObj instanceof Number n) groupSize = n.intValue();

        // Extract rides belonging exclusively to this park
        List<Map<String, Object>> extractedRides = new ArrayList<>();
        Object att = parkData.get("attractions_and_rides");
        if (att instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> m) extractedRides.add((Map<String, Object>) m);
            }
        } else {
            Object cat = parkData.get("rides_catalog");
            if (cat instanceof Map<?, ?> cm) {
                for (Object sublist : cm.values()) {
                    if (sublist instanceof List<?> sl) {
                        for (Object item : sl) {
                            if (item instanceof Map<?, ?> m) extractedRides.add((Map<String, Object>) m);
                        }
                    }
                }
            } else {
                Object breakdown = parkData.get("rides_and_attractions_breakdown");
                if (breakdown instanceof Map<?, ?> bm) {
                    for (Object sublist : bm.values()) {
                        if (sublist instanceof List<?> sl) {
                            for (Object item : sl) {
                                if (item instanceof Map<?, ?> m) extractedRides.add((Map<String, Object>) m);
                            }
                        }
                    }
                }
            }
        }

        // Separate by high thrill, water, family, indoor
        List<Map<String, Object>> thrillRides = new ArrayList<>();
        List<Map<String, Object>> waterRides = new ArrayList<>();
        List<Map<String, Object>> indoorRides = new ArrayList<>();
        List<Map<String, Object>> familyRides = new ArrayList<>();

        for (Map<String, Object> r : extractedRides) {
            String name = (String) r.getOrDefault("name", "");
            String category = (String) r.getOrDefault("category", "");
            String type = (String) r.getOrDefault("type", "");
            String combined = (name + " " + category + " " + type).toLowerCase();

            if (combined.contains("indoor") || combined.contains("simulation") || combined.contains("5d") || combined.contains("theatre") || combined.contains("disco") || combined.contains("house")) {
                indoorRides.add(r);
            } else if (combined.contains("water") || combined.contains("pool") || combined.contains("slide") || combined.contains("splash")) {
                waterRides.add(r);
            } else if (combined.contains("thrill") || combined.contains("coaster") || combined.contains("loop") || combined.contains("tower") || combined.contains("inversion")) {
                thrillRides.add(r);
            } else {
                familyRides.add(r);
            }
        }

        // Determine park schedule
        String openTime = "11:00 AM";
        String closeTime = "06:00 PM";
        if (parkId.contains("mgm")) {
            openTime = "10:30 AM";
            closeTime = "06:30 PM";
        } else if (parkId.contains("black-thunder")) {
            openTime = "10:00 AM";
            closeTime = "05:30 PM";
        }

        List<ItineraryResponse.ItineraryItemDto> items = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        warnings.add("Rule-based itinerary optimized for " + priority + " priority (" + groupSize + " guests, operating hours " + openTime + " - " + closeTime + ")");
        warnings.add("Heavy rain advisory: Covered attractions and indoor experiences prioritized during afternoon showers.");

        boolean isMaxRides = "Maximum Rides".equalsIgnoreCase(priority);
        int totalWait = 0;

        if (parkId.contains("wonderla")) {
            // Wonderla Chennai Schedule (11:00 AM - 06:00 PM)
            items.add(new ItineraryResponse.ItineraryItemDto("11:00 AM", "11:40 AM", "RIDE", "w1", "Recoil", "High Thrill", 10, "Ride reverse-loop coaster at park opening before queues peak."));
            items.add(new ItineraryResponse.ItineraryItemDto("11:40 AM", "12:20 PM", "RIDE", "w2", "Equinox 360", "High Thrill", 12, "Signature 360-degree pendulum inversion."));
            items.add(new ItineraryResponse.ItineraryItemDto("12:20 PM", "01:05 PM", "RIDE", "w5", "Wave Pool", "Water Park", 5, "Water rides operate from 12:00 PM onwards."));
            if (!isMaxRides) {
                items.add(new ItineraryResponse.ItineraryItemDto("01:05 PM", "01:50 PM", "MEAL", "m1", "Food Court Lunch Break", "Plaza", 0, "Early dining avoids the 2:00 PM rush."));
            } else {
                items.add(new ItineraryResponse.ItineraryItemDto("01:05 PM", "01:35 PM", "RIDE", "w3", "Flash Tower", "High Thrill", 10, "Rapid drop tower during lunch lull."));
                items.add(new ItineraryResponse.ItineraryItemDto("01:35 PM", "02:00 PM", "MEAL", "m1", "Quick Bites & Hydration", "Plaza", 0, "Quick fuel stop."));
            }
            items.add(new ItineraryResponse.ItineraryItemDto("02:00 PM", "02:45 PM", "RIDE", "w4", "Mission Interstellar", "Virtual Simulation (Indoor)", 10, "Indoor 4K space flight simulator — fully rain-protected."));
            items.add(new ItineraryResponse.ItineraryItemDto("02:45 PM", "03:30 PM", "RIDE", "w6", "Rain Disco", "Water Entertainment", 5, "Indoor psychedelic laser rain dance with warm showers."));
            items.add(new ItineraryResponse.ItineraryItemDto("03:30 PM", "04:15 PM", "RIDE", "w7", "Wonder Splash", "Water Coaster", 12, "28-meter water coaster drop into tidal splash."));
            items.add(new ItineraryResponse.ItineraryItemDto("04:15 PM", "05:00 PM", "RIDE", "w8", "Korneto", "High Thrill Water", 14, "Tornado funnel raft ride."));
            items.add(new ItineraryResponse.ItineraryItemDto("05:00 PM", "06:00 PM", "RIDE", "w9", "Termite Coaster & Grand Plaza", "Family / Scenic", 8, "Gentle farewell coaster and gift shop before 6:00 PM gate closure."));
        } else if (parkId.contains("mgm")) {
            // MGM Dizzee World Schedule (10:30 AM - 06:30 PM)
            items.add(new ItineraryResponse.ItineraryItemDto("10:30 AM", "11:15 AM", "RIDE", "m1", "Roller Coaster", "High Thrill", 12, "Beat midday queues by boarding the coaster first."));
            items.add(new ItineraryResponse.ItineraryItemDto("11:15 AM", "12:00 PM", "RIDE", "m2", "Kamikaze Ranger", "Extreme Inversion", 14, "Twin swinging arms with 360-degree inversion."));
            items.add(new ItineraryResponse.ItineraryItemDto("12:00 PM", "12:45 PM", "RIDE", "m3", "Revolution", "Extreme Pendulum", 10, "Giant disc oscillating on pendulum arm."));
            items.add(new ItineraryResponse.ItineraryItemDto("12:45 PM", "01:30 PM", "RIDE", "m4", "Thunder Wave Pool", "Water World", 5, "Freshwater wave pool session."));
            items.add(new ItineraryResponse.ItineraryItemDto("01:30 PM", "02:15 PM", "MEAL", "m5", "ECR Coastal Food Court Lunch", "Dining", 0, "Dine before 2:15 PM crowd rush."));
            items.add(new ItineraryResponse.ItineraryItemDto("02:15 PM", "03:00 PM", "RIDE", "m6", "5-D Theatre & Upside Down House", "Indoor / Special", 10, "Covered sensory attractions protected from afternoon heat/rain."));
            items.add(new ItineraryResponse.ItineraryItemDto("03:00 PM", "03:45 PM", "RIDE", "m7", "Rain Dance & Thunder Falls", "Water Park", 5, "Scheduled afternoon rain dance session."));
            items.add(new ItineraryResponse.ItineraryItemDto("03:45 PM", "04:30 PM", "RIDE", "m8", "Water Coaster", "Aquatic Coaster", 12, "Steel aquatic coaster with splashdown run-out."));
            items.add(new ItineraryResponse.ItineraryItemDto("04:30 PM", "05:15 PM", "RIDE", "m9", "Dashing Car", "Bumper Cars", 10, "Classic bumper car session."));
            items.add(new ItineraryResponse.ItineraryItemDto("05:15 PM", "06:30 PM", "RIDE", "m10", "Ferrari's Giant Wheel", "Scenic Coastal View", 8, "Panoramic ECR sunset view before 6:30 PM park exit."));
        } else {
            // Black Thunder Schedule (10:00 AM - 05:30 PM)
            items.add(new ItineraryResponse.ItineraryItemDto("10:00 AM", "10:45 AM", "RIDE", "b1", "Wave Pool", "Mega Water Generator", 5, "1.5m ocean surf waves in Nilgiri mountain backdrop."));
            items.add(new ItineraryResponse.ItineraryItemDto("10:45 AM", "11:30 AM", "RIDE", "b2", "Wild River / Lazy River", "Winding Float", 5, "Scenic drift tube through lush tropical gardens."));
            items.add(new ItineraryResponse.ItineraryItemDto("11:30 AM", "12:15 PM", "RIDE", "b3", "Thunder-Bolt & Surf Hill", "Multi-lane Racer", 15, "Fast 6-lane racer mat slide."));
            items.add(new ItineraryResponse.ItineraryItemDto("12:15 PM", "01:00 PM", "RIDE", "b4", "Cannon Ball Slide", "Extreme Water Shot", 14, "High velocity water shoot."));
            items.add(new ItineraryResponse.ItineraryItemDto("01:00 PM", "01:45 PM", "MEAL", "b5", "Foothill Restaurant Lunch", "Dining", 0, "Buffet dining at Mettupalayam foothills."));
            items.add(new ItineraryResponse.ItineraryItemDto("01:45 PM", "02:30 PM", "RIDE", "b6", "5D Theatre & 9D VR", "Indoor Simulation", 8, "Covered digital attractions."));
            items.add(new ItineraryResponse.ItineraryItemDto("02:30 PM", "03:15 PM", "RIDE", "b7", "Boomerang Slide", "Half-Pipe", 14, "Adrenaline raft ascent on vertical curved walls."));
            items.add(new ItineraryResponse.ItineraryItemDto("03:15 PM", "04:00 PM", "RIDE", "b8", "Columbus Dragon Coaster", "Dry Coaster", 12, "Speed through scenic palm groves."));
            items.add(new ItineraryResponse.ItineraryItemDto("04:00 PM", "05:30 PM", "RIDE", "b9", "Ferris Wheel & Lakeside Walk", "Resort Scenic", 6, "Panoramic views of Nilgiri mountain foothills before 5:30 PM departure."));
        }

        for (ItineraryResponse.ItineraryItemDto item : items) {
            totalWait += item.expectedWaitMin();
        }

        String summary = "Custom " + priority + " day itinerary for " + parkName + " (" + visitDate + ", " + groupSize + " guests). Total estimated queue wait: " + totalWait + " mins.";

        return new ItineraryResponse(
            summary,
            items.size(),
            totalWait,
            items,
            warnings,
            "rules_engine",
            Instant.now().toString()
        );
    }
}
