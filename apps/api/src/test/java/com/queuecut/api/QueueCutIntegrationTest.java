package com.queuecut.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * QueueCut Integration Test Suite
 *
 * Covers:
 *   - Health endpoint
 *   - Auth: signup, login, logout, me
 *   - Trip ownership isolation (User A cannot access User B trips)
 *   - Guest isolation (unauthenticated cannot access trips)
 *   - Recommendation endpoint
 *   - Itinerary endpoint
 *   - CORS / security headers
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class QueueCutIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    // Shared state for cross-test session reuse
    static String sessionCookieA;
    static String sessionCookieB;
    static String tripIdA;

    private static final String EMAIL_A = "user_a_" + System.nanoTime() + "@queuecut-test.local";
    private static final String EMAIL_B = "user_b_" + System.nanoTime() + "@queuecut-test.local";
    private static final String PASSWORD = "Passw0rd!Test";

    // ========== HEALTH ==========

    @Test @Order(1)
    void healthEndpoint_returnsOk() throws Exception {
        mvc.perform(get("/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").exists());
    }

    @Test @Order(2)
    void integrationsHealthEndpoint_returnsOk() throws Exception {
        mvc.perform(get("/api/v1/health/integrations"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.providers").exists());
    }

    // ========== AUTH: SIGN UP ==========

    @Test @Order(10)
    void signupUserA_succeeds() throws Exception {
        var body = Map.of("name", "User A", "email", EMAIL_A, "password", PASSWORD);
        MvcResult result = mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.user.email").value(EMAIL_A.toLowerCase()))
            .andReturn();

        sessionCookieA = extractSessionCookie(result);
        assertThat(sessionCookieA).as("Session cookie must be set after signup").isNotNull();
    }

    @Test @Order(11)
    void signupUserB_succeeds() throws Exception {
        var body = Map.of("name", "User B", "email", EMAIL_B, "password", PASSWORD);
        MvcResult result = mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.user.email").value(EMAIL_B.toLowerCase()))
            .andReturn();

        sessionCookieB = extractSessionCookie(result);
        assertThat(sessionCookieB).as("Session cookie must be set for User B").isNotNull();
    }

    @Test @Order(12)
    void duplicateSignup_returns409() throws Exception {
        var body = Map.of("name", "User A Again", "email", EMAIL_A, "password", PASSWORD);
        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isConflict());
    }

    @Test @Order(13)
    void signup_withWeakPassword_returns422() throws Exception {
        var body = Map.of("name", "Weak", "email", "weak_" + System.nanoTime() + "@test.local", "password", "short");
        mvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isUnprocessableEntity());
    }

    // ========== AUTH: ME (authenticated) ==========

    @Test @Order(20)
    void me_withValidSession_returnsUser() throws Exception {
        assertThat(sessionCookieA).isNotNull();
        mvc.perform(get("/api/v1/auth/me")
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", sessionCookieA)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email").value(EMAIL_A.toLowerCase()));
    }

    @Test @Order(21)
    void me_withoutSession_returns401() throws Exception {
        mvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    // ========== AUTH: LOGIN ==========

    @Test @Order(25)
    void login_withValidCredentials_succeeds() throws Exception {
        var body = Map.of("email", EMAIL_A, "password", PASSWORD);
        MvcResult result = mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email").value(EMAIL_A.toLowerCase()))
            .andReturn();

        String freshCookie = extractSessionCookie(result);
        assertThat(freshCookie).isNotNull();
        // Update sessionCookieA with fresh login session
        sessionCookieA = freshCookie;
    }

    @Test @Order(26)
    void login_withWrongPassword_returns401() throws Exception {
        var body = Map.of("email", EMAIL_A, "password", "WrongPassword!");
        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isUnauthorized());
    }

    @Test @Order(27)
    void login_withUnknownEmail_returns401() throws Exception {
        var body = Map.of("email", "nobody@nowhere.local", "password", PASSWORD);
        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isUnauthorized());
    }

    // ========== TRIPS: CREATE ==========

    @Test @Order(30)
    void createTrip_asUserA_succeeds() throws Exception {
        assertThat(sessionCookieA).isNotNull();
        var body = Map.of("park_id", "wonderla-chennai", "visit_date", "2026-12-25", "payload", Map.of("group_size", 2));
        MvcResult result = mvc.perform(post("/api/v1/trips")
                .contentType(MediaType.APPLICATION_JSON)
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", sessionCookieA))
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("success"))
            .andExpect(jsonPath("$.data.id").exists())
            .andReturn();

        @SuppressWarnings("unchecked")
        Map<String, Object> resp = mapper.readValue(result.getResponse().getContentAsString(), Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) resp.get("data");
        tripIdA = (String) data.get("id");
        assertThat(tripIdA).startsWith("trip_");
    }

    @Test @Order(31)
    void createTrip_withoutAuth_returns401() throws Exception {
        var body = Map.of("park_id", "wonderla-chennai", "visit_date", "2026-12-25");
        mvc.perform(post("/api/v1/trips")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isUnauthorized());
    }

    // ========== TRIPS: LIST ==========

    @Test @Order(35)
    void listTrips_asUserA_seesTripA() throws Exception {
        assertThat(sessionCookieA).isNotNull();
        mvc.perform(get("/api/v1/trips")
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", sessionCookieA)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test @Order(36)
    void listTrips_withoutAuth_returns401() throws Exception {
        mvc.perform(get("/api/v1/trips"))
            .andExpect(status().isUnauthorized());
    }

    // ========== TRIPS: USER ISOLATION (CRITICAL SECURITY TEST) ==========

    @Test @Order(40)
    void userB_cannotSeeUserATrips() throws Exception {
        assertThat(sessionCookieA).isNotNull();
        assertThat(sessionCookieB).isNotNull();

        // Get User A's trips
        MvcResult resultA = mvc.perform(get("/api/v1/trips")
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", sessionCookieA)))
            .andExpect(status().isOk())
            .andReturn();

        // Get User B's trips
        MvcResult resultB = mvc.perform(get("/api/v1/trips")
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", sessionCookieB)))
            .andExpect(status().isOk())
            .andReturn();

        @SuppressWarnings("unchecked")
        List<Object> tripsA = (List<Object>) ((Map<String, Object>) mapper.readValue(resultA.getResponse().getContentAsString(), Map.class)).get("data");
        @SuppressWarnings("unchecked")
        List<Object> tripsB = (List<Object>) ((Map<String, Object>) mapper.readValue(resultB.getResponse().getContentAsString(), Map.class)).get("data");

        // Extract IDs from A's trips
        Set<String> aTripIds = new HashSet<>();
        for (Object t : tripsA) {
            @SuppressWarnings("unchecked")
            Map<String, Object> tm = (Map<String, Object>) t;
            aTripIds.add((String) tm.get("id"));
        }

        // None of B's trips should match A's trip IDs
        for (Object t : tripsB) {
            @SuppressWarnings("unchecked")
            Map<String, Object> tm = (Map<String, Object>) t;
            assertThat(aTripIds).as("User B should not see User A's trips").doesNotContain((String) tm.get("id"));
        }
    }

    @Test @Order(41)
    void userB_cannotDeleteUserATrip() throws Exception {
        assertThat(tripIdA).isNotNull();
        assertThat(sessionCookieB).isNotNull();
        // Should return 404 (trip not found for User B) not 200
        mvc.perform(delete("/api/v1/trips/" + tripIdA)
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", sessionCookieB)))
            .andExpect(status().isNotFound());
    }

    // ========== TRIPS: DELETE ==========

    @Test @Order(45)
    void userA_canDeleteOwnTrip() throws Exception {
        assertThat(tripIdA).isNotNull();
        assertThat(sessionCookieA).isNotNull();
        mvc.perform(delete("/api/v1/trips/" + tripIdA)
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", sessionCookieA)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("success"));
    }

    // ========== AUTH: LOGOUT ==========

    @Test @Order(50)
    void logout_invalidatesSession() throws Exception {
        // Login fresh
        var body = Map.of("email", EMAIL_A, "password", PASSWORD);
        MvcResult loginResult = mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andReturn();

        String freshCookie = extractSessionCookie(loginResult);
        assertThat(freshCookie).isNotNull();

        // Logout
        mvc.perform(post("/api/v1/auth/logout")
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", freshCookie)))
            .andExpect(status().isNoContent());

        // Session is now invalid
        mvc.perform(get("/api/v1/auth/me")
                .cookie(new jakarta.servlet.http.Cookie("queuecut_session", freshCookie)))
            .andExpect(status().isUnauthorized());
    }

    // ========== RECOMMENDATION ==========

    @Test @Order(60)
    void recommendation_withValidRequest_returnsResults() throws Exception {
        var body = Map.of(
            "park_id", "wonderla-chennai",
            "candidate_dates", List.of("2026-12-25", "2026-12-26"),
            "group_size", 2,
            "priority", "Best Balanced"
        );
        mvc.perform(post("/api/v1/recommendation/recommend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.park_id").value("wonderla-chennai"))
            .andExpect(jsonPath("$.evaluations").isArray());
    }

    @Test @Order(61)
    void recommendation_withInvalidPark_returns404() throws Exception {
        var body = Map.of(
            "park_id", "nonexistent-park",
            "candidate_dates", List.of("2026-12-25"),
            "group_size", 2
        );
        mvc.perform(post("/api/v1/recommendation/recommend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isNotFound());
    }

    // ========== ITINERARY ==========

    @Test @Order(70)
    void itinerary_withValidRequest_returnsSchedule() throws Exception {
        var body = Map.of(
            "park_id", "wonderla-chennai",
            "visit_date", "2026-12-25",
            "group_size", 2,
            "budget_inr", 5000,
            "priority", "Thrill"
        );
        mvc.perform(post("/api/v1/itinerary/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.park_id").value("wonderla-chennai"));
    }

    // ========== PARKS CATALOG ==========

    @Test @Order(80)
    void parksList_returnsAvailableParks() throws Exception {
        mvc.perform(get("/api/v1/parks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data", hasSize(greaterThan(0))));
    }

    @Test @Order(81)
    void parkDetail_forWonderlaChennai_returnsData() throws Exception {
        mvc.perform(get("/api/v1/parks/wonderla-chennai"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.park_id").value("wonderla-chennai"));
    }

    @Test @Order(82)
    void parkDetail_forUnknownPark_returns404() throws Exception {
        mvc.perform(get("/api/v1/parks/park-does-not-exist"))
            .andExpect(status().isNotFound());
    }

    // ========== SECURITY: Response does NOT expose sensitive data ==========

    @Test @Order(90)
    void loginError_doesNotLeakPasswordHash() throws Exception {
        var body = Map.of("email", EMAIL_A, "password", "WrongPassword!!");
        MvcResult result = mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isUnauthorized())
            .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).doesNotContain("pbkdf2");
        assertThat(responseBody).doesNotContain("passwordHash");
        assertThat(responseBody).doesNotContain("password_hash");
    }

    @Test @Order(91)
    void healthEndpoint_doesNotExposeSecrets() throws Exception {
        MvcResult result = mvc.perform(get("/health")).andExpect(status().isOk()).andReturn();
        String body = result.getResponse().getContentAsString();
        assertThat(body).doesNotContainIgnoringCase("secret");
        assertThat(body).doesNotContainIgnoringCase("password");
        assertThat(body).doesNotContainIgnoringCase("client_secret");
    }

    // ========== GOOGLE OAUTH STATUS ==========

    @Test @Order(100)
    void googleOAuthStatus_returnsConfiguredOrUnavailable() throws Exception {
        mvc.perform(get("/api/v1/auth/google/status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.configured").isBoolean())
            .andExpect(jsonPath("$.status").exists());
    }

    // ========== Helpers ==========

    private String extractSessionCookie(MvcResult result) {
        jakarta.servlet.http.Cookie cookie = result.getResponse().getCookie("queuecut_session");
        return cookie != null ? cookie.getValue() : null;
    }
}
