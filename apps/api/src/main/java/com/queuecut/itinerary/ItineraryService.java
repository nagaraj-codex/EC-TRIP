package com.queuecut.itinerary;

import com.queuecut.ai.GeminiClient;
import com.queuecut.ai.ItineraryValidator;
import com.queuecut.ai.PromptBuilder;
import com.queuecut.ai.RuleBasedPlanner;
import com.queuecut.itinerary.dto.ItineraryResponse;
import com.queuecut.park.ParkCatalogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class ItineraryService {
    private static final Logger log = LoggerFactory.getLogger(ItineraryService.class);
    
    private final GeminiClient geminiClient;
    private final PromptBuilder promptBuilder;
    private final ItineraryValidator validator;
    private final RuleBasedPlanner fallbackPlanner;
    private final ParkCatalogService catalog;

    public ItineraryService(GeminiClient geminiClient, PromptBuilder promptBuilder,
                            ItineraryValidator validator, RuleBasedPlanner fallbackPlanner,
                            ParkCatalogService catalog) {
        this.geminiClient = geminiClient;
        this.promptBuilder = promptBuilder;
        this.validator = validator;
        this.fallbackPlanner = fallbackPlanner;
        this.catalog = catalog;
    }

    public ItineraryResponse generate(String parkId, Map<String, Object> requestDetails) {
        Map<String, Object> parkData = Map.of();
        try {
            parkData = catalog.getParkData(parkId);
            String prompt = promptBuilder.buildPrompt(parkData, requestDetails);
            
            ItineraryResponse res = geminiClient.generateItinerary(prompt);
            
            if (!validator.isValid(res)) {
                log.warn("Generated itinerary invalid. Attempting repair...");
                res = validator.repair(res);
                if (!validator.isValid(res)) {
                    log.warn("Repair failed. Using fallback planner.");
                    return fallbackPlanner.plan(parkId, parkData, requestDetails);
                }
            }
            return res;
        } catch (Exception e) {
            log.error("Gemini flow failed, using fallback planner", e);
            try {
                return fallbackPlanner.plan(parkId, parkData, requestDetails);
            } catch (Exception ex) {
                throw new RuntimeException("Fallback planner also failed", ex);
            }
        }
    }
}
