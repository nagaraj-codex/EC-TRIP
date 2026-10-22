package com.queuecut.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("prod")
public class SmtpMailService implements MailService {
    private static final Logger log = LoggerFactory.getLogger(SmtpMailService.class);
    @Override
    public void sendVerificationEmail(String to, String token) { log.info("SMTP Verify: {}", to); }
    @Override
    public void sendPasswordResetEmail(String to, String token) { log.info("SMTP Reset: {}", to); }
    @Override
    public void sendItineraryEmail(String to, String park, String date, double score) { log.info("SMTP Itinerary: {}", to); }
}
