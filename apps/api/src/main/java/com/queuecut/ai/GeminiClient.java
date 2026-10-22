package com.queuecut.ai;
import com.queuecut.itinerary.dto.ItineraryResponse;

public interface GeminiClient {
    ItineraryResponse generateItinerary(String promptJson) throws Exception;
}
