package com.queuecut.mail;

public interface MailService {
    void sendVerificationEmail(String toEmail, String token);
    void sendPasswordResetEmail(String toEmail, String token);
    void sendItineraryEmail(String toEmail, String parkName, String visitDate, double visitScore);
}
