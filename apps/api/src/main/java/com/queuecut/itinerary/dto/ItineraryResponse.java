package com.queuecut.itinerary.dto;

import java.util.List;

public record ItineraryResponse(
    String summary,
    int totalRides,
    int estimatedWaitMinutes,
    List<ItineraryItemDto> items,
    List<String> warnings,
    String source,
    String generatedAt
) {
    public record ItineraryItemDto(
        String start,
        String end,
        String type, // RIDE, MEAL, BREAK, SHOW, WALK
        String rideId,
        String title,
        String zone,
        int expectedWaitMin,
        String tip
    ) {}
}
