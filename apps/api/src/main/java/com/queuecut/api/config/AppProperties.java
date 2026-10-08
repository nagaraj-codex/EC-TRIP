package com.queuecut.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app")
@SuppressWarnings("null")
public class AppProperties {

    private String frontendUrl = "http://localhost:5173";
    private Cors cors = new Cors();
    private Auth auth = new Auth();
    private Google google = new Google();
    private Gemini gemini = new Gemini();
    private Resend resend = new Resend();
    private OpenMeteo openMeteo = new OpenMeteo();
    private String osrmUrl = "https://router.project-osrm.org/route/v1/driving/";
    private String nagerUrl = "https://date.nager.at/api/v3/PublicHolidays";
    private String sunriseSunsetUrl = "https://api.sunrise-sunset.org/v2";
    private String catalogPath = "./data/parks_database/unified_parks_catalog.json";

    public static class Cors {
        private String origins = "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173";
        public List<String> getOriginList() {
            return Arrays.stream(origins.split(","))
                    .map(s -> s.trim()).filter(s -> !s.isBlank()).toList();
        }
        public String getOrigins() { return origins; }
        public void setOrigins(String origins) { this.origins = origins; }
    }

    public static class Auth {
        private boolean cookieSecure = false;
        private String cookieSamesite = "lax";
        private int sessionDays = 7;
        public boolean isCookieSecure() { return cookieSecure; }
        public void setCookieSecure(boolean v) { this.cookieSecure = v; }
        public String getCookieSamesite() { return cookieSamesite; }
        public void setCookieSamesite(String v) { this.cookieSamesite = v; }
        public int getSessionDays() { return sessionDays; }
        public void setSessionDays(int v) { this.sessionDays = v; }
    }

    public static class Google {
        private String clientId = "";
        private String clientSecret = "";
        private String redirectUri = "http://localhost:8000/api/v1/auth/google/callback";
        public boolean isConfigured() { return !clientId.isBlank() && !clientSecret.isBlank(); }
        public String getClientId() { return clientId; }
        public void setClientId(String v) { this.clientId = v; }
        public String getClientSecret() { return clientSecret; }
        public void setClientSecret(String v) { this.clientSecret = v; }
        public String getRedirectUri() { return redirectUri; }
        public void setRedirectUri(String v) { this.redirectUri = v; }
    }

    public static class Gemini {
        private String apiKey = "";
        private String model = "gemini-2.5-flash";
        public boolean isConfigured() { return !apiKey.isBlank(); }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String v) { this.apiKey = v; }
        public String getModel() { return model; }
        public void setModel(String v) { this.model = v; }
    }

    public static class Resend {
        private String apiKey = "";
        public boolean isConfigured() { return !apiKey.isBlank(); }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String v) { this.apiKey = v; }
    }

    public static class OpenMeteo {
        private String forecastUrl = "https://api.open-meteo.com/v1/forecast";
        private String airQualityUrl = "https://air-quality-api.open-meteo.com/v1/air-quality";
        public String getForecastUrl() { return forecastUrl; }
        public void setForecastUrl(String v) { this.forecastUrl = v; }
        public String getAirQualityUrl() { return airQualityUrl; }
        public void setAirQualityUrl(String v) { this.airQualityUrl = v; }
    }

    public String getFrontendUrl() { return frontendUrl; }
    public void setFrontendUrl(String frontendUrl) { this.frontendUrl = frontendUrl; }
    public Cors getCors() { return cors; }
    public void setCors(Cors cors) { this.cors = cors; }
    public Auth getAuth() { return auth; }
    public void setAuth(Auth auth) { this.auth = auth; }
    public Google getGoogle() { return google; }
    public void setGoogle(Google google) { this.google = google; }
    public Gemini getGemini() { return gemini; }
    public void setGemini(Gemini gemini) { this.gemini = gemini; }
    public Resend getResend() { return resend; }
    public void setResend(Resend resend) { this.resend = resend; }
    public OpenMeteo getOpenMeteo() { return openMeteo; }
    public void setOpenMeteo(OpenMeteo openMeteo) { this.openMeteo = openMeteo; }
    public String getOsrmUrl() { return osrmUrl; }
    public void setOsrmUrl(String osrmUrl) { this.osrmUrl = osrmUrl; }
    public String getNagerUrl() { return nagerUrl; }
    public void setNagerUrl(String nagerUrl) { this.nagerUrl = nagerUrl; }
    public String getSunriseSunsetUrl() { return sunriseSunsetUrl; }
    public void setSunriseSunsetUrl(String sunriseSunsetUrl) { this.sunriseSunsetUrl = sunriseSunsetUrl; }
    public String getCatalogPath() { return catalogPath; }
    public void setCatalogPath(String catalogPath) { this.catalogPath = catalogPath; }
}