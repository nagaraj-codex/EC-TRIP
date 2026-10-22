package com.queuecut.ai;

import com.queuecut.itinerary.dto.ItineraryResponse;
import org.springframework.stereotype.Component;

@Component
public class ItineraryValidator {
    public boolean isValid(ItineraryResponse response) {
        if (response == null || response.items() == null || response.items().isEmpty()) return false;
        // Check wait estimates
        for (var item : response.items()) {
            if (item.expectedWaitMin() < 0 || item.expectedWaitMin() > 300) return false;
        }
        return true;
    }

    public ItineraryResponse repair(ItineraryResponse response) {
        // Simple repair logic
        return response;
    }
}
