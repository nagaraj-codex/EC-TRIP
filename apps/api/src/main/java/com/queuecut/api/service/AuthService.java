package com.queuecut.api.service;

import com.queuecut.api.config.AppProperties;
import com.queuecut.api.entity.*;
import com.queuecut.api.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository users;
    private final SessionRepository sessions;
    private final AppProperties props;

    public AuthService(UserRepository users, SessionRepository sessions, AppProperties props) {
        this.users    = users;
        this.sessions = sessions;
        this.props    = props;
    }

    // ---------- password hashing (PBKDF2-SHA256) ----------

    private static final int ITERATIONS  = 210_000;
    private static final int KEY_LENGTH  = 256;
    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";

    public String hashPassword(String password) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        String hash = pbkdf2(password, salt);
        return "pbkdf2$" + HexFormat.of().formatHex(salt) + "$" + hash;
    }

    public boolean verifyPassword(String password, String encoded) {
        try {
            String[] parts = encoded.split("\\$", 3);
            if (parts.length != 3 || !"pbkdf2".equals(parts[0])) {
                return false;
            }
            byte[] salt    = HexFormat.of().parseHex(parts[1]);
            String expected = parts[2];
            String candidate = pbkdf2(password, salt);
            return MessageDigest.isEqual(
                candidate.getBytes(StandardCharsets.UTF_8),
                expected.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    private String pbkdf2(String password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITHM);
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Password hashing failed", e);
        }
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
        s.setExpiresAt(expiresAt(props.getAuth().getSessionDays()));
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

    private static String expiresAt(int days) {
        return OffsetDateTime.now(ZoneOffset.UTC).plusDays(days)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
}