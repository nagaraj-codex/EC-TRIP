package com.queuecut.ai;

import com.queuecut.itinerary.dto.ItineraryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import java.time.Instant;

@Component
@ConditionalOnProperty(name = "queuecut.gemini.mode", havingValue = "mock")
public class MockGeminiClient implements GeminiClient {
    private static final Logger log = LoggerFactory.getLogger(MockGeminiClient.class);
    private final RuleBasedPlanner fallbackPlanner;

    public MockGeminiClient(RuleBasedPlanner fallbackPlanner) {
        this.fallbackPlanner = fallbackPlanner;
    }

    @Override
    public ItineraryResponse generateItinerary(String promptJson) throws Exception {
        log.info("MockGeminiClient generating itinerary (simulated delay)");
        Thread.sleep(800); // simulated delay
        ItineraryResponse res = fallbackPlanner.plan(promptJson);
        return new ItineraryResponse(
            res.summary(), res.totalRides(), res.estimatedWaitMinutes(),
            res.items(), res.warnings(), "mock", Instant.now().toString()
        );
    }
}
