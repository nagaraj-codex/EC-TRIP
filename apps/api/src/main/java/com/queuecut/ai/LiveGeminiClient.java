package com.queuecut.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.queuecut.config.AppProperties;
import com.queuecut.itinerary.dto.ItineraryResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;

@Component
@ConditionalOnProperty(name = "queuecut.gemini.mode", havingValue = "live", matchIfMissing = true)
public class LiveGeminiClient implements GeminiClient {
    private final AppProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

    public LiveGeminiClient(AppProperties props) {
        this.props = props;
    }

    @Override
    @CircuitBreaker(name = "geminiCircuitBreaker")
    @Retry(name = "geminiRetry")
    @Bulkhead(name = "geminiBulkhead")
    public ItineraryResponse generateItinerary(String promptJson) throws Exception {
        if (!props.gemini().isConfigured()) {
            throw new IllegalStateException("Gemini API key is missing");
        }

        String model = props.gemini().model().replace("models/", "");
        String apiKey = props.gemini().apiKey();
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

        Map<String, Object> payload = new LinkedHashMap<>();
        
        payload.put("systemInstruction", Map.of("parts", List.of(Map.of("text", 
            "You are the QueueCut Park Advisor. Output must be strictly JSON matching the response schema. " +
            "Do not invent rides, hours, prices, or wait times. Output strictly JSON."
        ))));
        payload.put("contents", List.of(Map.of(
            "role", "user",
            "parts", List.of(Map.of("text", promptJson))
        )));
        
        Map<String, Object> genConfig = new LinkedHashMap<>();
        genConfig.put("maxOutputTokens", 2048);
        genConfig.put("temperature", 0.4);
        genConfig.put("responseMimeType", "application/json");
        // We could also set responseSchema here if using Gemini 1.5 Pro
        payload.put("generationConfig", genConfig);

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(30))
            .header("Content-Type", "application/json")
            .header("x-goog-api-key", apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload)))
            .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            throw new RuntimeException("Gemini HTTP " + resp.statusCode() + ": " + resp.body());
        }

        JsonNode root = mapper.readTree(resp.body());
        String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText(null);
        if (text == null || text.isBlank()) {
            throw new RuntimeException("No text returned from Gemini");
        }
        
        // Sometimes Gemini wraps JSON in markdown blocks
        if (text.startsWith("```json")) {
            text = text.substring(7);
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
        }
        text = text.trim();

        ItineraryResponse parsed = mapper.readValue(text, ItineraryResponse.class);
        return new ItineraryResponse(
            parsed.summary(), parsed.totalRides(), parsed.estimatedWaitMinutes(),
            parsed.items(), parsed.warnings(), "gemini", Instant.now().toString()
        );
    }
}
