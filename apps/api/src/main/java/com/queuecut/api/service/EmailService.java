package com.queuecut.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queuecut.api.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final AppProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public EmailService(AppProperties props) { this.props = props; }

    @Async
    public void sendItineraryEmail(String toEmail, String parkName, String visitDate, double visitScore) {
        if (!props.getResend().isConfigured()) {
            log.info("[FALLBACK MAILER] Sending to {}: Best day for {} is {} (Score: {})", toEmail, parkName, visitDate, visitScore);
            return;
        }
        try {
            String html = "<h2>Your QueueCut Itinerary</h2><p>Park: " + parkName +
                "</p><p>Optimal Date: " + visitDate + "</p><p>Visit Score: " + visitScore + "</p>";
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("from",    "QueueCut <noreply@queuecut.com>");
            payload.put("to",      List.of(toEmail));
            payload.put("subject", "Your QueueCut Itinerary for " + parkName);
            payload.put("html",    html);

            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .timeout(Duration.ofSeconds(5))
                .header("Authorization", "Bearer " + props.getResend().getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload)))
                .build();
            http.send(req, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            log.warn("Failed to send email: {}", e.getMessage());
        }
    }
}