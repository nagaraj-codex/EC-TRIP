package com.queuecut.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queuecut.api.config.AppProperties;
import com.queuecut.api.entity.User;
import com.queuecut.api.exception.ApiException;
import com.queuecut.api.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String SESSION_COOKIE = "queuecut_session";
    private static final String OAUTH_STATE_COOKIE = "queuecut_google_oauth_state";

    private final AuthService auth;
    private final com.queuecut.api.service.MailService mail;
    private final Environment env;
    private final AppProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    public AuthController(AuthService auth, com.queuecut.api.service.MailService mail, AppProperties props, Environment env) {
        this.env = env;
        this.mail = mail;
        this.auth  = auth;
        this.props = props;
    }

    // DTOs
    public record RegisterRequest(@NotBlank String name, @Email @NotBlank String email, @NotBlank @Size(min=10) String password) {}
    public record VerifyEmailRequest(@NotBlank String token) {}
    public record ResendVerificationRequest(@Email @NotBlank String email) {}
    public record ForgotPasswordRequest(@Email @NotBlank String email) {}
    public record ResetPasswordRequest(@NotBlank String token, @NotBlank @Size(min=10) String password) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    private Map<String, Object> userMap(User u, String provider) {
        return Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(), "provider", provider);
    }

    private void setSessionCookie(HttpServletResponse resp, String token) {
        Cookie cookie = new Cookie(SESSION_COOKIE, token);
        cookie.setMaxAge(props.auth().sessionDays() * 24 * 3600);
        cookie.setHttpOnly(true);
        cookie.setSecure(props.auth().cookieSecure() || "none".equals(props.auth().cookieSamesite()));
        cookie.setPath("/");
        cookie.setAttribute("SameSite", props.auth().cookieSamesite());
        resp.addCookie(cookie);
    }

    private String getSessionToken(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) if (SESSION_COOKIE.equals(c.getName())) return c.getValue();
        return null;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest body, HttpServletResponse resp) {
        User u;
        try { u = auth.createUser(body.name(), body.email(), body.password()); }
        catch (DataIntegrityViolationException e) { throw new ApiException(409, "An account with that email already exists"); }
        
        boolean verifyRequired = "true".equalsIgnoreCase(System.getenv("EMAIL_VERIFICATION_REQUIRED"));
        if (verifyRequired) {
            String verifyToken = auth.generateVerificationToken(u);
            mail.sendVerificationEmail(u.getEmail(), verifyToken);
            // DO NOT create session if verification required
            return Map.of("user", userMap(u, "email"), "message", "Verification email sent");
        } else {
            auth.updateEmailVerification(u.getId(), true);
            u.setEmailVerified(true);
        }
        String token = auth.createSession(u.getId());
        setSessionCookie(resp, token);
        return Map.of("user", userMap(u, "email"));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest body, HttpServletResponse resp) {
        User u = auth.authenticate(body.email(), body.password())
            .orElseThrow(() -> new ApiException(401, "Invalid email or password"));
        
        boolean verifyRequired = "true".equalsIgnoreCase(System.getenv("EMAIL_VERIFICATION_REQUIRED"));
        if (verifyRequired && !u.isEmailVerified()) {
            throw new ApiException(403, "Please verify your email before logging in");
        }

        String token = auth.createSession(u.getId());
        setSessionCookie(resp, token);
        return Map.of("user", userMap(u, "email"));
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest req) {
        String token = getSessionToken(req);
        if (token == null) throw new ApiException(401, "Authentication required");
        User u = auth.getUserForSession(token).orElseThrow(() -> new ApiException(401, "Session expired or invalid"));
        return Map.of("user", userMap(u, "email"));
    }
    
    @PostMapping("/verify-email")
    public Map<String, Object> verifyEmail(@Valid @RequestBody VerifyEmailRequest body) {
        User u = auth.findByVerificationToken(body.token())
            .orElseThrow(() -> new ApiException(400, "Invalid or expired verification token"));
        if (u.getVerificationTokenExpiresAt() != null && java.time.OffsetDateTime.parse(u.getVerificationTokenExpiresAt()).isBefore(java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC))) {
            throw new ApiException(400, "Verification token has expired");
        }
        auth.updateEmailVerification(u.getId(), true);
        return Map.of("message", "Email verified successfully");
    }

    @PostMapping("/resend-verification")
    public Map<String, Object> resendVerification(@Valid @RequestBody ResendVerificationRequest body) {
        auth.findByEmail(body.email()).ifPresent(u -> {
            if (!u.isEmailVerified()) {
                String token = auth.generateVerificationToken(u);
                mail.sendVerificationEmail(u.getEmail(), token);
            }
        });
        return Map.of("message", "If the account exists and is unverified, a new link has been sent.");
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@Valid @RequestBody ForgotPasswordRequest body) {
        auth.findByEmail(body.email()).ifPresent(u -> {
            String token = auth.generateResetToken(u);
            mail.sendPasswordResetEmail(u.getEmail(), token);
        });
        return Map.of("message", "If an account exists with this email, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@Valid @RequestBody ResetPasswordRequest body) {
        User u = auth.findByResetToken(body.token())
            .orElseThrow(() -> new ApiException(400, "Invalid or expired reset token"));
        if (u.getResetTokenExpiresAt() != null && java.time.OffsetDateTime.parse(u.getResetTokenExpiresAt()).isBefore(java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC))) {
            throw new ApiException(400, "Reset token has expired");
        }
        auth.updatePassword(u.getId(), body.password());
        return Map.of("message", "Password reset successfully");
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest req, HttpServletResponse resp) {
        String token = getSessionToken(req);
        if (token != null) auth.revokeSession(token);
        Cookie del = new Cookie(SESSION_COOKIE, "");
        del.setMaxAge(0); del.setPath("/"); del.setHttpOnly(true);
        resp.addCookie(del);
    }

    @GetMapping("/google/status")
    public Map<String, Object> googleStatus() {
        boolean configured = props.google().isConfigured();
        boolean isDev = !env.acceptsProfiles(Profiles.of("prod"));
        boolean mockEnabled = !configured && isDev;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("configured", configured);
        m.put("status", configured ? "AVAILABLE" : (mockEnabled ? "AVAILABLE_MOCK" : "UNAVAILABLE"));
        m.put("prompt", configured ? "select_account" : null);
        m.put("redirect_uri", configured ? props.google().redirectUri() : null);
        return m;
    }

    @GetMapping("/google/login")
    public ResponseEntity<Void> googleLogin(HttpServletRequest req, HttpServletResponse resp) {
        String frontendUrl = props.frontendUrl();
        String loginBase = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl : "";

        if (!props.google().isConfigured()) {
            if (env.acceptsProfiles(Profiles.of("prod"))) {
                throw new IllegalStateException("Mock Google Auth cannot be used in prod profile!");
            }
            // Mock Auth flow
            User u = auth.getOrCreateExternalUser("Mock User", "test.user@queuecut.local", "google");
            String sessionToken = auth.createSession(u.getId());
            setSessionCookie(resp, sessionToken);
            return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, loginBase + "/login?oauth=success")
                .build();
        }
        String state = AuthService.randomToken(32);
        String query = "client_id="   + encode(props.google().clientId()) +
            "&redirect_uri=" + encode(props.google().redirectUri()) +
            "&response_type=code&scope=openid+email+profile" +
            "&state=" + encode(state) + "&prompt=select_account";
        // Set state cookie
        Cookie stateCookie = new Cookie(OAUTH_STATE_COOKIE, state);
        stateCookie.setMaxAge(600); stateCookie.setHttpOnly(true); stateCookie.setPath("/");
        stateCookie.setSecure(props.auth().cookieSecure());
        stateCookie.setAttribute("SameSite", props.auth().cookieSamesite());
        resp.addCookie(stateCookie);
        return ResponseEntity.status(HttpStatus.FOUND)
            .header(HttpHeaders.LOCATION, "https://accounts.google.com/o/oauth2/v2/auth?" + query)
            .build();
    }

    @GetMapping("/google/callback")
    public ResponseEntity<?> googleCallback(
            @RequestParam(required=false) String code,
            @RequestParam(required=false) String state,
            HttpServletRequest req, HttpServletResponse resp) {
        String frontendUrl = props.frontendUrl();
        String loginBase = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl : "";
        String accept = req.getHeader("Accept");
        boolean isBrowser = (accept == null || accept.contains("text/html") || !accept.contains("application/json"));

        String expectedState = getCookie(req, OAUTH_STATE_COOKIE);
        if (code == null || state == null || expectedState == null || !state.equals(expectedState)) {
            if (isBrowser) {
                return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, loginBase + "/login?error=google_oauth_state_invalid")
                    .build();
            }
            throw new ApiException(400, "Invalid or expired Google OAuth state");
        }
        if (!props.google().isConfigured()) {
            if (isBrowser) {
                return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, loginBase + "/login?error=google_not_configured")
                    .build();
            }
            throw new ApiException(503, "Google sign-in is not configured");
        }
        try {
            // Exchange code for token
            String tokenBody = "code=" + encode(code) +
                "&client_id=" + encode(props.google().clientId()) +
                "&client_secret=" + encode(props.google().clientSecret()) +
                "&redirect_uri=" + encode(props.google().redirectUri()) +
                "&grant_type=authorization_code";
            HttpRequest tokenReq = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .timeout(Duration.ofSeconds(8))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(tokenBody)).build();
            HttpResponse<String> tokenResp = http.send(tokenReq, HttpResponse.BodyHandlers.ofString());
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenJson = mapper.readValue(tokenResp.body(), Map.class);
            String idToken = (String) tokenJson.get("id_token");
            if (idToken == null) throw new RuntimeException("No ID token returned by Google");

            // Validate ID token
            HttpRequest infoReq = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
                .timeout(Duration.ofSeconds(8)).GET().build();
            HttpResponse<String> infoResp = http.send(infoReq, HttpResponse.BodyHandlers.ofString());
            @SuppressWarnings("unchecked")
            Map<String, Object> identity = mapper.readValue(infoResp.body(), Map.class);
            if (!props.google().clientId().equals(identity.get("aud")))
                throw new RuntimeException("Audience mismatch");
            Object emailVerified = identity.get("email_verified");
            if (!"true".equals(emailVerified) && !Boolean.TRUE.equals(emailVerified))
                throw new RuntimeException("Email not verified");
            User u = auth.getOrCreateExternalUser(
                (String) identity.getOrDefault("name", ""),
                (String) identity.get("email"), "google");
            String sessionToken = auth.createSession(u.getId());
            setSessionCookie(resp, sessionToken);
            // Clear state cookie
            Cookie delState = new Cookie(OAUTH_STATE_COOKIE, "");
            delState.setMaxAge(0); delState.setPath("/"); resp.addCookie(delState);

            if (isBrowser) {
                return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, loginBase + "/login?oauth=success")
                    .build();
            }
            return ResponseEntity.ok(Map.of("user", userMap(u, "google")));
        } catch (ApiException e) {
            if (isBrowser) {
                return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, loginBase + "/login?error=google_oauth_failed")
                    .build();
            }
            throw e;
        } catch (Exception e) {
            if (isBrowser) {
                return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, loginBase + "/login?error=google_oauth_failed")
                    .build();
            }
            throw new ApiException(502, "Google sign-in could not be verified: " + e.getMessage());
        }
    }

    private String encode(String v) {
        try { return java.net.URLEncoder.encode(v, "UTF-8"); } catch (Exception e) { return v; }
    }

    private String getCookie(HttpServletRequest req, String name) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) if (name.equals(c.getName())) return c.getValue();
        return null;
    }
}