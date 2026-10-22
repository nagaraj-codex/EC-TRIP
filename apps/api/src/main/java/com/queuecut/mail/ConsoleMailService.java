package com.queuecut.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;

@Service
@Profile("!prod")
public class ConsoleMailService implements MailService {
    private static final Logger log = LoggerFactory.getLogger(ConsoleMailService.class);
    private static final Path LOG_FILE = Path.of("logs/dev-mail.log");

    public ConsoleMailService() {
        try { Files.createDirectories(LOG_FILE.getParent()); } catch (Exception e) { throw new RuntimeException("Failed to create mail log dir", e); }
    }

    private void logMail(String to, String subject, String body) {
        String msg = String.format("[%s] TO: %s | SUBJECT: %s | BODY: %s%n", Instant.now(), to, subject, body);
        log.info("[DEV MAIL] {}", msg.trim());
        try {
            Files.writeString(LOG_FILE, msg, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException e) { log.warn("Could not write dev-mail.log", e); }
    }

    @Override
    public void sendVerificationEmail(String to, String token) {
        logMail(to, "Verify your email", "Link: http://localhost:5173/verify-email?token=" + token);
    }
    @Override
    public void sendPasswordResetEmail(String to, String token) {
        logMail(to, "Reset your password", "Link: http://localhost:5173/reset-password?token=" + token);
    }
    @Override
    public void sendItineraryEmail(String to, String park, String date, double score) {
        logMail(to, "Itinerary for " + park, "Date: " + date + ", Score: " + score);
    }
}
