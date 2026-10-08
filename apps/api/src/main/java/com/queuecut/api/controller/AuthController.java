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
    private final AppProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    public AuthController(AuthService auth, AppProperties props) {
        this.auth  = auth;
        this.props = props;
    }

    // DTOs
    public record RegisterRequest(@NotBlank String name, @Email @NotBlank String email, @NotBlank @Size(min=8) String password) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    private Map<String, Object> userMap(User u, String provider) {
        return Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(), "provider", provider);
    }

    private void setSessionCookie(HttpServletResponse resp, String token) {
        Cookie cookie = new Cookie(SESSION_COOKIE, token);
        cookie.setMaxAge(props.getAuth().getSessionDays() * 24 * 3600);
        cookie.setHttpOnly(true);
        cookie.setSecure(props.getAuth().isCookieSecure() || "none".equals(props.getAuth().getCookieSamesite()));
        cookie.setPath("/");
        cookie.setAttribute("SameSite", props.getAuth().getCookieSamesite());
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
        String token = auth.createSession(u.getId());
        setSessionCookie(resp, token);
        return Map.of("user", userMap(u, "email"));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest body, HttpServletResponse resp) {
        User u = auth.authenticate(body.email(), body.password())
            .orElseThrow(() -> new ApiException(401, "Invalid email or password"));
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
        boolean configured = props.getGoogle().isConfigured();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("configured", configured);
        m.put("status", configured ? "AVAILABLE" : "UNAVAILABLE");
        m.put("prompt", configured ? "select_account" : null);
        m.put("redirect_uri", configured ? props.getGoogle().getRedirectUri() : null);
        return m;
    }

    @GetMapping("/google/login")
    public ResponseEntity<Void> googleLogin(HttpServletRequest req, HttpServletResponse resp) {
        if (!props.getGoogle().isConfigured()) {
            String accept = req.getHeader("Accept");
            if (accept != null && accept.contains("text/html")) {
                String frontendUrl = props.getFrontendUrl();
                String target = (frontendUrl != null && !frontendUrl.isBlank())
                    ? (frontendUrl + "/login?error=google_not_configured")
                    : "/login?error=google_not_configured";
                return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, target)
                    .build();
            }
            throw new ApiException(503, "Google sign-in is not configured");
        }
        String state = AuthService.randomToken(32);
        String query = "client_id="   + encode(props.getGoogle().getClientId()) +
            "&redirect_uri=" + encode(props.getGoogle().getRedirectUri()) +
            "&response_type=code&scope=openid+email+profile" +
            "&state=" + encode(state) + "&prompt=select_account";
        // Set state cookie
        Cookie stateCookie = new Cookie(OAUTH_STATE_COOKIE, state);
        stateCookie.setMaxAge(600); stateCookie.setHttpOnly(true); stateCookie.setPath("/");
        stateCookie.setSecure(props.getAuth().isCookieSecure());
        stateCookie.setAttribute("SameSite", props.getAuth().getCookieSamesite());
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
        String frontendUrl = props.getFrontendUrl();
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
        if (!props.getGoogle().isConfigured()) {
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
                "&client_id=" + encode(props.getGoogle().getClientId()) +
                "&client_secret=" + encode(props.getGoogle().getClientSecret()) +
                "&redirect_uri=" + encode(props.getGoogle().getRedirectUri()) +
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
            if (!props.getGoogle().getClientId().equals(identity.get("aud")))
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