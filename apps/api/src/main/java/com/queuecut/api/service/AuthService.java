package com.queuecut.api.service;

import com.queuecut.api.config.AppProperties;
import com.queuecut.api.entity.*;
import com.queuecut.api.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AuthService {
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    private final UserRepository users;
    private final SessionRepository sessions;
    private final AppProperties props;

    public AuthService(UserRepository users, SessionRepository sessions, AppProperties props) {
        this.users    = users;
        this.sessions = sessions;
        this.props    = props;
    }

    // ---------- password hashing ----------
    public String hashPassword(String password) {
        return encoder.encode(password);
    }

    public boolean verifyPassword(String password, String encoded) {
        return encoder.matches(password, encoded);
    }

    // ---------- user management ----------

    @Transactional
    public User createUser(String name, String email, String password) {
        String normalizedEmail = email.toLowerCase().strip();
        if (users.findByEmail(normalizedEmail).isPresent()) {
            throw new DataIntegrityViolationException("email_exists");
        }
        User u = new User();
        u.setId("usr_" + randomToken(12));
        u.setName(name.strip());
        u.setEmail(normalizedEmail);
        u.setPasswordHash(hashPassword(password));
        u.setCreatedAt(utcNow());
        return users.save(u);
    }

    @Transactional
    public void updateEmailVerification(String userId, boolean verified) {
        users.findById(userId).ifPresent(u -> {
            u.setEmailVerified(verified);
            u.setVerificationTokenHash(null);
            u.setVerificationTokenExpiresAt(null);
            users.save(u);
        });
    }
    
    @Transactional
    public void updatePassword(String userId, String password) {
        users.findById(userId).ifPresent(u -> {
            u.setPasswordHash(hashPassword(password));
            u.setResetTokenHash(null);
            u.setResetTokenExpiresAt(null);
            users.save(u);
            // invalidate sessions
            sessions.deleteByUserId(userId);
        });
    }

    @Transactional
    public String generateVerificationToken(User u) {
        String token = randomToken(32);
        u.setVerificationTokenHash(sha256(token));
        u.setVerificationTokenExpiresAt(expiresAtHours(24));
        users.save(u);
        return token;
    }

    @Transactional
    public String generateResetToken(User u) {
        String token = randomToken(32);
        u.setResetTokenHash(sha256(token));
        u.setResetTokenExpiresAt(expiresAtHours(1));
        users.save(u);
        return token;
    }

    public Optional<User> findByVerificationToken(String token) {
        return users.findByVerificationTokenHash(sha256(token));
    }

    public Optional<User> findByResetToken(String token) {
        return users.findByResetTokenHash(sha256(token));
    }
    
    public Optional<User> findByEmail(String email) {
        return users.findByEmail(email.toLowerCase().strip());
    }

    public Optional<User> authenticate(String email, String password) {
        return users.findByEmail(email.toLowerCase().strip())
                .filter(u -> verifyPassword(password, u.getPasswordHash()));
    }

    @Transactional
    public User getOrCreateExternalUser(String name, String email, String provider) {
        String normalizedEmail = email.toLowerCase().strip();
        return users.findByEmail(normalizedEmail).orElseGet(() -> {
            User u = new User();
            u.setId("usr_" + randomToken(12));
            String displayName = (name != null && !name.isBlank()) ? name.strip()
                    : normalizedEmail.split("@")[0];
            u.setName(displayName);
            u.setEmail(normalizedEmail);
            u.setPasswordHash(hashPassword(randomToken(32)));
            u.setCreatedAt(utcNow());
            return users.save(u);
        });
    }

    // ---------- session management ----------

    @Transactional
    public String createSession(String userId) {
        String token     = randomToken(32);
        String tokenHash = sha256(token);
        Session s = new Session();
        s.setTokenHash(tokenHash);
        s.setUserId(userId);
        s.setExpiresAt(expiresAt(props.auth().sessionDays()));
        sessions.save(s);
        return token;
    }

    public Optional<User> getUserForSession(@org.springframework.lang.NonNull String token) {
        String tokenHash = sha256(token);
        return sessions.findValidSession(tokenHash, utcNow())
                .flatMap(s -> users.findById(s.getUserId()));
    }

    @Transactional
    public void revokeSession(@org.springframework.lang.NonNull String token) {
        sessions.deleteByTokenHash(sha256(token));
    }

    // ---------- helpers ----------

    public static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public static String randomToken(int bytes) {
        byte[] raw = new byte[bytes];
        new SecureRandom().nextBytes(raw);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
    }

    private static String utcNow() {
        return OffsetDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    private static String expiresAtHours(int hours) {
        return OffsetDateTime.now(ZoneOffset.UTC).plusHours(hours)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    private static String expiresAt(int days) {
        return OffsetDateTime.now(ZoneOffset.UTC).plusDays(days)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
}